"use client";

import React, { useState, useEffect } from "react";
import { logout, persistStore } from "./actions";
import { Store, AddedMedia, SectorOverride, CustomSector } from "../../lib/overrides";
import { baseSectors, Sector } from "../../data/sectors";
import { Eye, EyeOff, Trash2, ArrowUp, ArrowDown, LogOut, Save, Plus, Film, Image as ImageIcon, Loader2 } from "lucide-react";

interface AdminEditorProps {
  initialStore: Store;
}

export default function AdminEditor({ initialStore }: AdminEditorProps) {
  const [store, setStore] = useState<Store>(initialStore);
  const [selectedSlug, setSelectedSlug] = useState<string>("gelinlik-abiye");
  
  // Custom sector form state
  const [newSector, setNewSector] = useState({
    name: "",
    tagline: "",
    cover: "",
    accent: "#78523b",
  });
  
  // Loading & notification states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Turkish-safe slugify helper
  const slugify = (text: string): string => {
    const map: Record<string, string> = {
      ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I", ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U"
    };
    let formatted = text.toString();
    Object.keys(map).forEach((key) => {
      formatted = formatted.replace(new RegExp(key, "g"), map[key]);
    });
    return formatted
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  // Direct Cloudinary Upload for Global Settings (Logo / Banner)
  const handleUploadSettingFile = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "heroBannerUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanSlug = slugify(fileBaseName) + "-" + Math.random().toString(36).substring(2, 6);
      const publicId = `aiva/settings/${field}-${cleanSlug}`;

      const signRes = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!signRes.ok) {
        const errorData = await signRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Bulut imzalama servisi başarısız.");
      }

      const { timestamp, signature, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("public_id", publicId);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Medya buluta yüklenemedi.");
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      setStore((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          [field]: mediaUrl,
        },
      }));

      setToast({ message: "Görsel başarıyla yüklendi.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Yükleme hatası.", type: "error" });
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset file input
    }
  };

  // Get current active sector representation
  const activeBaseSector = baseSectors.find((s) => s.slug === selectedSlug);
  const activeCustomSector = store.custom.find((s) => s.slug === selectedSlug);

  const getActiveSectorMedia = (): { id: string; type: "video" | "image"; src: string; ratio?: string; title: string; isBase: boolean; isHidden: boolean }[] => {
    let mediaList: { id: string; type: "video" | "image"; src: string; ratio?: string; title: string; isBase: boolean; isHidden: boolean }[] = [];

    // 1. Gather original base items
    if (activeBaseSector) {
      mediaList = activeBaseSector.media.map((m) => {
        const customTitle = store.overrides[selectedSlug]?.titles?.[m.id];
        const customSrc = store.overrides[selectedSlug]?.sources?.[m.id];
        return {
          id: m.id,
          type: m.type,
          src: customSrc || m.src,
          ratio: m.ratio,
          title: customTitle || m.title?.tr || m.title?.en || "",
          isBase: true,
          isHidden: store.overrides[selectedSlug]?.hidden?.includes(m.id) || false,
        };
      });
    }

    // 2. Add dynamically added items
    const addedMedia = store.overrides[selectedSlug]?.added || [];
    const mappedAdded = addedMedia.map((m) => ({
      id: m.id,
      type: m.type,
      src: m.src,
      ratio: m.ratio,
      title: m.title,
      isBase: false,
      isHidden: store.overrides[selectedSlug]?.hidden?.includes(m.id) || false,
    }));

    const combined = [...mediaList, ...mappedAdded];

    // 3. Sort according to custom sorting order
    const orderList = store.overrides[selectedSlug]?.order || [];
    if (orderList.length > 0) {
      combined.sort((a, b) => {
        const indexA = orderList.indexOf(a.id);
        const indexB = orderList.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    return combined;
  };

  const currentMedia = getActiveSectorMedia();
  const currentVideos = currentMedia.filter((m) => m.type === "video");
  const currentImages = currentMedia.filter((m) => m.type === "image");

  // Direct Cloudinary Upload signature bypass
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, listType: "video" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const folderSlug = selectedSlug;
      const fileBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanSlug = slugify(fileBaseName) + "-" + Math.random().toString(36).substring(2, 6);
      const publicId = `aiva/${folderSlug}/${cleanSlug}`;

      // Call API to sign
      const signRes = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!signRes.ok) {
        const errorData = await signRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Bulut imzalama servisi başarısız.");
      }

      const { timestamp, signature, apiKey, cloudName } = await signRes.json();

      // Direct upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("public_id", publicId);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Medya buluta yüklenemedi.");
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      // Add to store configuration state
      const newItemId = "added-" + Math.random().toString(36).substring(2, 9);
      const newMediaItem: AddedMedia = {
        id: newItemId,
        type: listType,
        src: mediaUrl,
        ratio: listType === "video" ? "9:16" : "3:4",
        title: fileBaseName,
      };

      const currentSectorOverride = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {} };
      const updatedAdded = [...(currentSectorOverride.added || []), newMediaItem];
      const updatedOrder = [...(currentSectorOverride.order || currentMedia.map((m) => m.id)), newItemId];

      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: {
            ...currentSectorOverride,
            added: updatedAdded,
            order: updatedOrder,
          },
        },
      }));

      setToast({ message: "Dosya başarıyla yüklendi.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Yükleme hatası.", type: "error" });
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset file input
    }
  };

  // Modify title inline
  const handleTitleChange = (id: string, newTitle: string) => {
    const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {} };
    
    // Check if it is a dynamically added item or a base item
    const isAddedItem = override.added?.some((m) => m.id === id);

    if (isAddedItem) {
      const updatedAdded = override.added?.map((m) => (m.id === id ? { ...m, title: newTitle } : m)) || [];
      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: { ...override, added: updatedAdded },
        },
      }));
    } else {
      const updatedTitles = { ...(override.titles || {}), [id]: newTitle };
      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: { ...override, titles: updatedTitles },
        },
      }));
    }
  };

  // Modify image/video source URL inline
  const handleSourceChange = (id: string, newSrc: string) => {
    const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {}, sources: {} };
    
    // Check if it is a dynamically added item or a base item
    const isAddedItem = override.added?.some((m) => m.id === id);

    if (isAddedItem) {
      const updatedAdded = override.added?.map((m) => (m.id === id ? { ...m, src: newSrc } : m)) || [];
      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: { ...override, added: updatedAdded },
        },
      }));
    } else {
      const updatedSources = { ...(override.sources || {}), [id]: newSrc };
      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: { ...override, sources: updatedSources },
        },
      }));
    }
  };

  // Upload new file to Cloudinary and replace existing item source
  const handleReplaceMediaFile = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const folderSlug = selectedSlug;
      const fileBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanSlug = slugify(fileBaseName) + "-" + Math.random().toString(36).substring(2, 6);
      const publicId = `aiva/${folderSlug}/${cleanSlug}`;

      // Call API to sign
      const signRes = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!signRes.ok) {
        const errorData = await signRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Bulut imzalama servisi başarısız.");
      }

      const { timestamp, signature, apiKey, cloudName } = await signRes.json();

      // Direct upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("public_id", publicId);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Görsel buluta yüklenemedi.");
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      handleSourceChange(id, mediaUrl);
      setToast({ message: "Görsel başarıyla değiştirildi.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Yükleme hatası.", type: "error" });
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset file input
    }
  };

  // Change sector metadata (name, tagline, cover, accent) for both base & custom sectors
  const handleSectorMetaChange = (field: "name" | "tagline" | "cover" | "accent", val: string) => {
    if (activeCustomSector) {
      const updatedCustom = store.custom.map((cs) =>
        cs.slug === selectedSlug ? { ...cs, [field]: val } : cs
      );
      setStore((prev) => ({ ...prev, custom: updatedCustom }));
    } else if (activeBaseSector) {
      const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {}, sources: {} };
      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: {
            ...override,
            [field]: val,
          },
        },
      }));
    }
  };

  // Upload cover image to Cloudinary and set it as sector cover
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const folderSlug = selectedSlug;
      const fileBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanSlug = slugify(fileBaseName) + "-" + Math.random().toString(36).substring(2, 6);
      const publicId = `aiva/${folderSlug}/cover-${cleanSlug}`;

      const signRes = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!signRes.ok) {
        const errorData = await signRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Bulut imzalama servisi başarısız.");
      }

      const { timestamp, signature, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("public_id", publicId);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Kapak görseli buluta yüklenemedi.");
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      handleSectorMetaChange("cover", mediaUrl);
      setToast({ message: "Kapak görseli başarıyla güncellendi.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Yükleme hatası.", type: "error" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Toggle hide / show visibility status
  const handleToggleHide = (id: string) => {
    const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {} };
    const isHidden = override.hidden?.includes(id);

    const updatedHidden = isHidden
      ? override.hidden.filter((h) => h !== id)
      : [...(override.hidden || []), id];

    setStore((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [selectedSlug]: { ...override, hidden: updatedHidden },
      },
    }));
  };

  // Delete dynamic items before saving
  const handleRemoveItem = (id: string) => {
    const override = store.overrides[selectedSlug];
    if (!override) return;

    const updatedAdded = override.added?.filter((m) => m.id !== id) || [];
    const updatedOrder = override.order?.filter((o) => o !== id) || [];
    const updatedHidden = override.hidden?.filter((h) => h !== id) || [];

    setStore((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [selectedSlug]: {
          ...override,
          added: updatedAdded,
          order: updatedOrder,
          hidden: updatedHidden,
        },
      },
    }));
  };

  // Drag and drop sorting mechanics
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, listItems: typeof currentMedia) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text");
    if (sourceId === targetId) return;

    const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {} };
    const currentOrder = override.order.length > 0 ? [...override.order] : listItems.map((m) => m.id);

    const sourceIdx = currentOrder.indexOf(sourceId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      currentOrder.splice(sourceIdx, 1);
      currentOrder.splice(targetIdx, 0, sourceId);

      setStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [selectedSlug]: { ...override, order: currentOrder },
        },
      }));
    }
  };

  // Keyboard navigation helpers
  const handleMoveItem = (id: string, direction: "up" | "down", listItems: typeof currentMedia) => {
    const override = store.overrides[selectedSlug] || { order: [], hidden: [], added: [], titles: {} };
    const currentOrder = override.order.length > 0 ? [...override.order] : listItems.map((m) => m.id);

    const idx = currentOrder.indexOf(id);
    if (idx === -1) return;

    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;

    // Swap indexes
    const temp = currentOrder[idx];
    currentOrder[idx] = currentOrder[newIdx];
    currentOrder[newIdx] = temp;

    setStore((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [selectedSlug]: { ...override, order: currentOrder },
      },
    }));
  };

  // Create new custom sector
  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSector.name || !newSector.tagline) {
      setToast({ message: "Lütfen gerekli alanları doldurun.", type: "error" });
      return;
    }

    const slug = slugify(newSector.name);
    
    // Check duplication
    const existBase = baseSectors.some((s) => s.slug === slug);
    const existCustom = store.custom.some((s) => s.slug === slug);

    if (existBase || existCustom) {
      setToast({ message: "Bu isimde bir sektör zaten mevcut.", type: "error" });
      return;
    }

    const customSectorItem: CustomSector = {
      slug,
      name: newSector.name,
      tagline: newSector.tagline,
      cover: newSector.cover || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800",
      accent: newSector.accent,
    };

    setStore((prev) => ({
      ...prev,
      custom: [...prev.custom, customSectorItem],
      overrides: {
        ...prev.overrides,
        [slug]: { order: [], hidden: [], added: [], titles: {} },
      },
    }));

    setSelectedSlug(slug);
    setNewSector({ name: "", tagline: "", cover: "", accent: "#78523b" });
    setToast({ message: "Yeni sektör başarıyla eklendi.", type: "success" });
  };

  // Save changes to KV / store.json
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await persistStore(store);
      setToast({ message: "Değişiklikler başarıyla kaydedildi.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Kaydetme hatası.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone pb-24 text-ink">
      {/* Toast Alert popup */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-4 shadow-kx-lg flex items-center gap-3 border transition-transform duration-300 translate-y-0 ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
              : "bg-rose-500/10 border-rose-500/30 text-rose-900"
          }`}
        >
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-cream shadow-kx flex items-center justify-between px-8 py-5">
        <div className="flex flex-col select-none">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            AIVA
          </span>
          <span className="eyebrow text-[9px] -mt-1 text-stone-soft">Yönetici Paneli</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-clay text-cream px-5 py-2.5 text-sm font-bold shadow transition-all hover:bg-clay-deep active:scale-95 flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Değişiklikleri Kaydet
          </button>
          
          <button
            onClick={() => logout()}
            className="rounded-xl border border-line bg-cream text-stone hover:text-ink hover:bg-bone/40 p-2.5 transition-colors active:scale-95"
            aria-label="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Dashboard Main Grid */}
      <div className="mx-auto max-w-7xl px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left columns - Sectors Selector list */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-cream border border-line rounded-2xl p-6 shadow-kx space-y-4">
            <h3 className="eyebrow text-xs text-stone tracking-widest">Sektörler</h3>
            
            <div className="flex flex-col space-y-1.5">
              {/* Global settings button */}
              <button
                onClick={() => setSelectedSlug("settings")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  selectedSlug === "settings"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink hover:bg-bone/20 border-transparent"
                }`}
              >
                ⚙️ Genel Ayarlar
                <span className="block text-[10px] font-normal opacity-70">Marka, Logo & Banner</span>
              </button>

              <button
                onClick={() => setSelectedSlug("services")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  selectedSlug === "services"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink hover:bg-bone/20 border-transparent"
                }`}
              >
                🛠️ Hizmetler Yönetimi
                <span className="block text-[10px] font-normal opacity-70">4 Ana Hizmet Kartı</span>
              </button>

              <button
                onClick={() => setSelectedSlug("testimonials")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  selectedSlug === "testimonials"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink hover:bg-bone/20 border-transparent"
                }`}
              >
                💬 Referanslar Yönetimi
                <span className="block text-[10px] font-normal opacity-70">Müşteri Yorumları CRUD</span>
              </button>

              <button
                onClick={() => setSelectedSlug("faqs")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  selectedSlug === "faqs"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink hover:bg-bone/20 border-transparent"
                }`}
              >
                ❓ SSS Yönetimi
                <span className="block text-[10px] font-normal opacity-70">Sıkça Sorulan Sorular</span>
              </button>

              <div className="border-t border-line/40 my-1" />

              {/* Static base sectors */}
              {baseSectors.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setSelectedSlug(s.slug)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                    selectedSlug === s.slug
                      ? "bg-ink text-cream border-ink"
                      : "bg-cream text-ink-soft hover:bg-bone/20 border-transparent"
                  }`}
                >
                  {s.name.tr}
                  <span className="block text-[10px] font-normal opacity-70">Varsayılan Sektör</span>
                </button>
              ))}

              {/* Dynamic custom sectors */}
              {store.custom.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setSelectedSlug(s.slug)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                    selectedSlug === s.slug
                      ? "bg-ink text-cream border-ink"
                      : "bg-cream text-ink-soft hover:bg-bone/20 border-transparent"
                  }`}
                >
                  {s.name}
                  <span className="block text-[10px] font-normal text-brass uppercase tracking-widest mt-0.5">Özel Sektör</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add custom sector form */}
          <div className="bg-cream border border-line rounded-2xl p-6 shadow-kx space-y-4">
            <h3 className="eyebrow text-xs text-stone tracking-widest">Yeni Sektör Ekle</h3>
            
            <form onSubmit={handleCreateSector} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone mb-1.5">Sektör Adı *</label>
                <input
                  type="text"
                  required
                  value={newSector.name}
                  onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                  placeholder="Örn. Deri Ceket"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone mb-1.5">Slogan / Açıklama *</label>
                <input
                  type="text"
                  required
                  value={newSector.tagline}
                  onChange={(e) => setNewSector({ ...newSector, tagline: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                  placeholder="Örn. Tarzın deriyle birleşimi..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone mb-1.5">Kapak Görseli URL</label>
                <input
                  type="text"
                  value={newSector.cover}
                  onChange={(e) => setNewSector({ ...newSector, cover: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                  placeholder="Boş bırakılırsa varsayılan atanır"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone mb-1.5">Vurgu Rengi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSector.accent}
                      onChange={(e) => setNewSector({ ...newSector, accent: e.target.value })}
                      className="h-9 w-9 rounded-lg border border-line cursor-pointer p-0.5 bg-bone"
                    />
                    <span className="text-xs uppercase font-mono text-stone">{newSector.accent}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-ink text-cream py-3 text-sm font-semibold tracking-wide shadow hover:bg-ink-soft active:scale-95 flex items-center justify-center gap-2 transition-transform"
              >
                <Plus className="h-4 w-4" />
                Sektör Oluştur
              </button>
            </form>
          </div>
        </div>

        {/* Right column - Media Management details for selected sector */}
        <div className="lg:col-span-8 space-y-8">
          {selectedSlug === "settings" ? (
            <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6 animate-rise text-ink">
              {/* Selected Sector Meta details */}
              <div className="border-b border-line pb-6 space-y-4">
                <span className="eyebrow text-brass">GENEL AYARLAR</span>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Stüdyo Kimliği & Tasarım Ayarları
                </h2>
                <p className="text-sm text-ink-soft">
                  Logo, marka isimleri, sloganlar ve ana sayfa banner alanını buradan düzenleyebilirsiniz.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">Marka Adı (TR)</label>
                    <input
                      type="text"
                      value={store.settings?.brandNameTr || ""}
                      onChange={(e) => setStore(prev => ({
                        ...prev,
                        settings: { ...(prev.settings || {}), brandNameTr: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">Marka Adı (EN)</label>
                    <input
                      type="text"
                      value={store.settings?.brandNameEn || ""}
                      onChange={(e) => setStore(prev => ({
                        ...prev,
                        settings: { ...(prev.settings || {}), brandNameEn: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">Slogan / Tagline (TR)</label>
                    <input
                      type="text"
                      value={store.settings?.brandTaglineTr || ""}
                      onChange={(e) => setStore(prev => ({
                        ...prev,
                        settings: { ...(prev.settings || {}), brandTaglineTr: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-2">Slogan / Tagline (EN)</label>
                    <input
                      type="text"
                      value={store.settings?.brandTaglineEn || ""}
                      onChange={(e) => setStore(prev => ({
                        ...prev,
                        settings: { ...(prev.settings || {}), brandTaglineEn: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                    />
                  </div>
                </div>

                {/* Logo Section */}
                <div className="border-t border-line/40 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone">Logo Yapılandırması</h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-semibold text-stone mb-1.5">Logo Görseli URL</label>
                      <input
                        type="text"
                        value={store.settings?.logoUrl || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), logoUrl: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                        placeholder="Örn. https://res.cloudinary.com/..."
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="flex flex-col items-center justify-center border border-dashed border-line bg-bone/35 hover:bg-bone/70 rounded-xl p-4 cursor-pointer transition-colors duration-250 text-center">
                        <ImageIcon className="h-5 w-5 text-stone" />
                        <span className="text-xs font-semibold text-ink mt-1.5">Logo Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadSettingFile(e, "logoUrl")}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {store.settings?.logoUrl && (
                    <div className="mt-2 bg-bone/30 border border-line p-4 rounded-xl flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={store.settings.logoUrl} alt="Logo Preview" className="h-10 w-auto object-contain bg-ink/10 p-1.5 rounded" />
                      <span className="text-xs text-stone-soft truncate">{store.settings.logoUrl}</span>
                    </div>
                  )}
                </div>

                {/* Hero / Banner Section */}
                <div className="border-t border-line/40 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone">Hero Başlıkları & Ana Banner</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Hero Başlık (TR)</label>
                      <input
                        type="text"
                        value={store.settings?.heroTitleTr || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), heroTitleTr: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Hero Başlık (EN)</label>
                      <input
                        type="text"
                        value={store.settings?.heroTitleEn || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), heroTitleEn: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Hero Alt Açıklama (TR)</label>
                      <textarea
                        rows={3}
                        value={store.settings?.heroSubtitleTr || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), heroSubtitleTr: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Hero Alt Açıklama (EN)</label>
                      <textarea
                        rows={3}
                        value={store.settings?.heroSubtitleEn || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), heroSubtitleEn: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-semibold text-stone mb-1.5">Hero Banner Görseli URL</label>
                      <input
                        type="text"
                        value={store.settings?.heroBannerUrl || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), heroBannerUrl: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                        placeholder="Örn. https://res.cloudinary.com/..."
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="flex flex-col items-center justify-center border border-dashed border-line bg-bone/35 hover:bg-bone/70 rounded-xl p-4 cursor-pointer transition-colors duration-250 text-center">
                        <ImageIcon className="h-5 w-5 text-stone" />
                        <span className="text-xs font-semibold text-ink mt-1.5">Banner Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadSettingFile(e, "heroBannerUrl")}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {store.settings?.heroBannerUrl && (
                    <div className="mt-2 bg-bone/30 border border-line p-4 rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={store.settings.heroBannerUrl} alt="Banner Preview" className="aspect-[16/9] w-full max-h-48 object-cover rounded-lg border border-line" />
                      <span className="text-[10px] text-stone-soft block mt-1.5 truncate">{store.settings.heroBannerUrl}</span>
                    </div>
                  )}
                </div>

                {/* Contact & Social Section */}
                <div className="border-t border-line/40 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone">İletişim & Sosyal Medya Ayarları</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">E-posta Adresi</label>
                      <input
                        type="email"
                        value={store.settings?.email || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), email: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="info@aivastudyo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">WhatsApp Linki</label>
                      <input
                        type="text"
                        value={store.settings?.whatsapp || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), whatsapp: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="https://wa.me/905358282246"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Telefon (Görünen)</label>
                      <input
                        type="text"
                        value={store.settings?.phone || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), phone: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="Boş bırakabilirsiniz veya örn. +90 (535) 828 22 46"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Telefon (Ham / Arama İçin)</label>
                      <input
                        type="text"
                        value={store.settings?.phoneRaw || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), phoneRaw: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="+905358282246"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">Instagram Linki</label>
                      <input
                        type="text"
                        value={store.settings?.instagram || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), instagram: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="https://instagram.com/aivastudyo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone mb-2">YouTube Linki</label>
                      <input
                        type="text"
                        value={store.settings?.youtube || ""}
                        onChange={(e) => setStore(prev => ({
                          ...prev,
                          settings: { ...(prev.settings || {}), youtube: e.target.value }
                        }))}
                        className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-sm text-ink focus:outline-none focus:border-clay"
                        placeholder="https://youtube.com/@aivastudyo"
                      />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-clay font-semibold bg-clay/5 border border-clay/10 p-3 rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Görsel yükleniyor, lütfen bekleyin...
                  </div>
                )}
              </div>
            </div>
          ) : selectedSlug === "services" ? (
            <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6 animate-rise text-ink">
              <div className="border-b border-line pb-6 space-y-4">
                <span className="eyebrow text-brass">HİZMETLER YÖNETİMİ</span>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Hizmet Alanları Düzenleme
                </h2>
                <p className="text-sm text-ink-soft">
                  Ana sayfada sergilenen 4 temel hizmetin başlıklarını ve açıklamalarını Türkçe / İngilizce olarak değiştirebilirsiniz.
                </p>
              </div>

              <div className="space-y-8">
                {(store.services || []).map((srv, idx) => (
                  <div key={srv.id} className="border border-line/60 bg-bone/20 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <h4 className="font-display font-bold text-lg text-ink">Hizmet #{idx + 1}</h4>
                      <span className="text-xs font-mono text-stone-soft">ID: {srv.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone mb-1.5">Başlık (TR)</label>
                        <input
                          type="text"
                          value={srv.titleTr}
                          onChange={(e) => {
                            const updated = [...(store.services || [])];
                            updated[idx] = { ...srv, titleTr: e.target.value };
                            setStore({ ...store, services: updated });
                          }}
                          className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone mb-1.5">Başlık (EN)</label>
                        <input
                          type="text"
                          value={srv.titleEn}
                          onChange={(e) => {
                            const updated = [...(store.services || [])];
                            updated[idx] = { ...srv, titleEn: e.target.value };
                            setStore({ ...store, services: updated });
                          }}
                          className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone mb-1.5">Açıklama (TR)</label>
                        <textarea
                          rows={2}
                          value={srv.descTr}
                          onChange={(e) => {
                            const updated = [...(store.services || [])];
                            updated[idx] = { ...srv, descTr: e.target.value };
                            setStore({ ...store, services: updated });
                          }}
                          className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone mb-1.5">Açıklama (EN)</label>
                        <textarea
                          rows={2}
                          value={srv.descEn}
                          onChange={(e) => {
                            const updated = [...(store.services || [])];
                            updated[idx] = { ...srv, descEn: e.target.value };
                            setStore({ ...store, services: updated });
                          }}
                          className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedSlug === "testimonials" ? (
            <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6 animate-rise text-ink">
              <div className="border-b border-line pb-6 space-y-4">
                <span className="eyebrow text-brass">REFERANSLAR YÖNETİMİ</span>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Müşteri Yorumları & Referanslar
                </h2>
                <p className="text-sm text-ink-soft">
                  Sitenizde yayınlanan müşteri referanslarını ekleyebilir, güncelleyebilir veya silebilirsiniz.
                </p>
              </div>

              {/* Add New Testimonial Form */}
              <div className="border border-line/60 bg-bone/35 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone border-b border-line pb-2">Yeni Referans Yorumu Ekle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Müşteri / Yazar Adı (TR)</label>
                    <input
                      id="new-testimonial-author-tr"
                      type="text"
                      placeholder="Örn. Merve K. — Moda Tasarımcısı"
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Müşteri / Yazar Adı (EN)</label>
                    <input
                      id="new-testimonial-author-en"
                      type="text"
                      placeholder="Örn. Merve K. — Fashion Designer"
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Yorum Metni (TR)</label>
                    <textarea
                      id="new-testimonial-text-tr"
                      rows={2}
                      placeholder="Türkçe yorum..."
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Yorum Metni (EN)</label>
                    <textarea
                      id="new-testimonial-text-en"
                      rows={2}
                      placeholder="English text..."
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const authTrInput = document.getElementById("new-testimonial-author-tr") as HTMLInputElement;
                    const authEnInput = document.getElementById("new-testimonial-author-en") as HTMLInputElement;
                    const textTrInput = document.getElementById("new-testimonial-text-tr") as HTMLTextAreaElement;
                    const textEnInput = document.getElementById("new-testimonial-text-en") as HTMLTextAreaElement;
                    
                    if (!authTrInput.value || !textTrInput.value) {
                      setToast({ message: "Lütfen en azından Türkçe Ad ve Yorum metnini doldurun.", type: "error" });
                      return;
                    }
                    const newItem = {
                      id: "t-" + Math.random().toString(36).substring(2, 9),
                      authorTr: authTrInput.value,
                      authorEn: authEnInput.value || authTrInput.value,
                      textTr: textTrInput.value,
                      textEn: textEnInput.value || textTrInput.value,
                    };
                    setStore({
                      ...store,
                      testimonials: [...(store.testimonials || []), newItem]
                    });
                    authTrInput.value = "";
                    authEnInput.value = "";
                    textTrInput.value = "";
                    textEnInput.value = "";
                    setToast({ message: "Yorum başarıyla listeye eklendi.", type: "success" });
                  }}
                  className="rounded-xl bg-ink text-cream px-4 py-2 text-xs font-semibold hover:bg-ink-soft transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Listeye Ekle
                </button>
              </div>

              {/* List of Testimonials */}
              <div className="space-y-4 pt-4">
                <h3 className="eyebrow text-stone border-b border-line pb-2">Mevcut Referanslar</h3>
                {(store.testimonials || []).length === 0 ? (
                  <p className="text-xs text-stone-soft italic">Henüz hiç referans eklenmemiş.</p>
                ) : (
                  <div className="space-y-4">
                    {(store.testimonials || []).map((item, idx) => (
                      <div key={item.id} className="border border-line bg-bone/10 p-4 rounded-xl flex flex-col space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (store.testimonials || []).filter((t) => t.id !== item.id);
                            setStore({ ...store, testimonials: filtered });
                            setToast({ message: "Yorum listeden kaldırıldı.", type: "success" });
                          }}
                          className="absolute top-4 right-4 p-2 rounded-lg border border-line bg-cream text-stone hover:text-rose-700 hover:border-rose-300/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="pr-12 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Müşteri (TR)</label>
                              <input
                                type="text"
                                value={item.authorTr}
                                onChange={(e) => {
                                  const updated = [...(store.testimonials || [])];
                                  updated[idx] = { ...item, authorTr: e.target.value };
                                  setStore({ ...store, testimonials: updated });
                                }}
                                className="w-full text-xs font-semibold text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Müşteri (EN)</label>
                              <input
                                type="text"
                                value={item.authorEn}
                                onChange={(e) => {
                                  const updated = [...(store.testimonials || [])];
                                  updated[idx] = { ...item, authorEn: e.target.value };
                                  setStore({ ...store, testimonials: updated });
                                }}
                                className="w-full text-xs font-semibold text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Yorum (TR)</label>
                              <textarea
                                value={item.textTr}
                                rows={2}
                                onChange={(e) => {
                                  const updated = [...(store.testimonials || [])];
                                  updated[idx] = { ...item, textTr: e.target.value };
                                  setStore({ ...store, testimonials: updated });
                                }}
                                className="w-full text-xs text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Yorum (EN)</label>
                              <textarea
                                value={item.textEn}
                                rows={2}
                                onChange={(e) => {
                                  const updated = [...(store.testimonials || [])];
                                  updated[idx] = { ...item, textEn: e.target.value };
                                  setStore({ ...store, testimonials: updated });
                                }}
                                className="w-full text-xs text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : selectedSlug === "faqs" ? (
            <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6 animate-rise text-ink">
              <div className="border-b border-line pb-6 space-y-4">
                <span className="eyebrow text-brass">SSS YÖNETİMİ</span>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Sıkça Sorulan Sorular (SSS)
                </h2>
                <p className="text-sm text-ink-soft">
                  Sitenizin SSS sayfa/bölümündeki soru ve cevapları yönetebilirsiniz.
                </p>
              </div>

              {/* Add New FAQ Form */}
              <div className="border border-line/60 bg-bone/35 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone border-b border-line pb-2">Yeni Soru & Cevap Ekle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Soru (TR)</label>
                    <input
                      id="new-faq-question-tr"
                      type="text"
                      placeholder="Örn. Teslimat süreleriniz ne kadardır?"
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Soru (EN)</label>
                    <input
                      id="new-faq-question-en"
                      type="text"
                      placeholder="Örn. What are your delivery times?"
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Cevap (TR)</label>
                    <textarea
                      id="new-faq-answer-tr"
                      rows={2}
                      placeholder="Cevap metni..."
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone mb-1.5">Cevap (EN)</label>
                    <textarea
                      id="new-faq-answer-en"
                      rows={2}
                      placeholder="Answer text..."
                      className="w-full rounded-xl border border-line bg-bone px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const qTrInput = document.getElementById("new-faq-question-tr") as HTMLInputElement;
                    const qEnInput = document.getElementById("new-faq-question-en") as HTMLInputElement;
                    const aTrInput = document.getElementById("new-faq-answer-tr") as HTMLTextAreaElement;
                    const aEnInput = document.getElementById("new-faq-answer-en") as HTMLTextAreaElement;
                    
                    if (!qTrInput.value || !aTrInput.value) {
                      setToast({ message: "Lütfen en azından Türkçe Soru ve Cevap metnini doldurun.", type: "error" });
                      return;
                    }
                    const newItem = {
                      id: "faq-" + Math.random().toString(36).substring(2, 9),
                      questionTr: qTrInput.value,
                      questionEn: qEnInput.value || qTrInput.value,
                      answerTr: aTrInput.value,
                      answerEn: aEnInput.value || aTrInput.value,
                    };
                    setStore({
                      ...store,
                      faqs: [...(store.faqs || []), newItem]
                    });
                    qTrInput.value = "";
                    qEnInput.value = "";
                    aTrInput.value = "";
                    aEnInput.value = "";
                    setToast({ message: "Soru & Cevap başarıyla listeye eklendi.", type: "success" });
                  }}
                  className="rounded-xl bg-ink text-cream px-4 py-2 text-xs font-semibold hover:bg-ink-soft transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Listeye Ekle
                </button>
              </div>

              {/* List of FAQs */}
              <div className="space-y-4 pt-4">
                <h3 className="eyebrow text-stone border-b border-line pb-2">Mevcut Soru & Cevaplar</h3>
                {(store.faqs || []).length === 0 ? (
                  <p className="text-xs text-stone-soft italic">Henüz hiç soru eklenmemiş.</p>
                ) : (
                  <div className="space-y-4">
                    {(store.faqs || []).map((item, idx) => (
                      <div key={item.id} className="border border-line bg-bone/10 p-4 rounded-xl flex flex-col space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (store.faqs || []).filter((f) => f.id !== item.id);
                            setStore({ ...store, faqs: filtered });
                            setToast({ message: "Soru & Cevap listeden kaldırıldı.", type: "success" });
                          }}
                          className="absolute top-4 right-4 p-2 rounded-lg border border-line bg-cream text-stone hover:text-rose-700 hover:border-rose-300/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="pr-12 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Soru (TR)</label>
                              <input
                                type="text"
                                value={item.questionTr}
                                onChange={(e) => {
                                  const updated = [...(store.faqs || [])];
                                  updated[idx] = { ...item, questionTr: e.target.value };
                                  setStore({ ...store, faqs: updated });
                                }}
                                className="w-full text-xs font-semibold text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Soru (EN)</label>
                              <input
                                type="text"
                                value={item.questionEn}
                                onChange={(e) => {
                                  const updated = [...(store.faqs || [])];
                                  updated[idx] = { ...item, questionEn: e.target.value };
                                  setStore({ ...store, faqs: updated });
                                }}
                                className="w-full text-xs font-semibold text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Cevap (TR)</label>
                              <textarea
                                value={item.answerTr}
                                rows={2}
                                onChange={(e) => {
                                  const updated = [...(store.faqs || [])];
                                  updated[idx] = { ...item, answerTr: e.target.value };
                                  setStore({ ...store, faqs: updated });
                                }}
                                className="w-full text-xs text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-stone uppercase">Cevap (EN)</label>
                              <textarea
                                value={item.answerEn}
                                rows={2}
                                onChange={(e) => {
                                  const updated = [...(store.faqs || [])];
                                  updated[idx] = { ...item, answerEn: e.target.value };
                                  setStore({ ...store, faqs: updated });
                                }}
                                className="w-full text-xs text-ink bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-1 focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6">
              {/* Selected Sector Meta details */}
              <div className="border-b border-line pb-6 space-y-4">
                <span className="eyebrow text-brass">DÜZENLENEN SEKTÖR</span>
                
                {(() => {
                  const currentSectorName = activeCustomSector
                    ? activeCustomSector.name
                    : (store.overrides[selectedSlug]?.name || activeBaseSector?.name.tr || "");

                  const currentSectorTagline = activeCustomSector
                    ? activeCustomSector.tagline
                    : (store.overrides[selectedSlug]?.tagline || activeBaseSector?.tagline.tr || "");

                  const currentSectorCover = activeCustomSector
                    ? activeCustomSector.cover
                    : (store.overrides[selectedSlug]?.cover || activeBaseSector?.cover || "");

                  const currentSectorAccent = activeCustomSector
                    ? activeCustomSector.accent
                    : (store.overrides[selectedSlug]?.accent || activeBaseSector?.accent || "#78523b");

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone mb-1.5">Sektör İsmi</label>
                          <input
                            type="text"
                            value={currentSectorName}
                            onChange={(e) => handleSectorMetaChange("name", e.target.value)}
                            className="text-lg font-display font-bold text-ink bg-bone border border-line rounded-xl px-3 py-2 w-full focus:outline-none focus:border-clay"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone mb-1.5">Slogan / Açıklama</label>
                          <input
                            type="text"
                            value={currentSectorTagline}
                            onChange={(e) => handleSectorMetaChange("tagline", e.target.value)}
                            className="text-sm text-ink bg-bone border border-line rounded-xl px-3 py-2 w-full focus:outline-none focus:border-clay"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        <div className="sm:col-span-8">
                          <label className="block text-xs font-semibold text-stone mb-1.5">Sektör Kapak Görseli URL</label>
                          <input
                            type="text"
                            value={currentSectorCover}
                            onChange={(e) => handleSectorMetaChange("cover", e.target.value)}
                            className="text-xs text-ink bg-bone border border-line rounded-xl px-3 py-2 w-full focus:outline-none focus:border-clay"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="flex flex-col items-center justify-center border border-dashed border-line bg-bone/35 hover:bg-bone/70 rounded-xl p-2 cursor-pointer transition-colors text-center">
                            <ImageIcon className="h-4 w-4 text-stone" />
                            <span className="text-[10px] font-semibold text-ink mt-1">Kapak Yükle</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadCoverFile}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-stone mb-1.5">Vurgu Rengi</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={currentSectorAccent}
                              onChange={(e) => handleSectorMetaChange("accent", e.target.value)}
                              className="h-8 w-8 rounded border border-line cursor-pointer p-0.5 bg-bone"
                            />
                            <span className="text-[10px] uppercase font-mono text-stone">{currentSectorAccent}</span>
                          </div>
                        </div>
                      </div>

                      {currentSectorCover && (
                        <div className="mt-2 bg-bone/30 border border-line p-3 rounded-xl max-w-sm flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={currentSectorCover} alt="Cover Preview" className="h-12 w-20 object-cover rounded border border-line" />
                          <span className="text-[10px] text-stone-soft truncate">{currentSectorCover}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Media Upload CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-line bg-bone/30 hover:bg-bone/60 rounded-xl p-6 cursor-pointer transition-colors duration-200 group">
                  <ImageIcon className="h-6 w-6 text-stone group-hover:text-clay transition-colors" />
                  <span className="text-sm font-semibold text-ink mt-2">Yeni Görsel Ekle</span>
                  <span className="text-xs text-stone-soft mt-1">Sürükleyin veya tıklayın</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFile(e, "image")}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-line bg-bone/30 hover:bg-bone/60 rounded-xl p-6 cursor-pointer transition-colors duration-200 group">
                  <Film className="h-6 w-6 text-stone group-hover:text-clay transition-colors" />
                  <span className="text-sm font-semibold text-ink mt-2">Yeni Video Ekle</span>
                  <span className="text-xs text-stone-soft mt-1">Sürükleyin veya tıklayın</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleUploadFile(e, "video")}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload indicator */}
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-clay font-semibold bg-clay/5 border border-clay/10 p-3 rounded-xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Medya Cloudinary sunucularına doğrudan yükleniyor, lütfen bekleyin...
                </div>
              )}

              {/* Render lists */}
              <div className="space-y-8 pt-4">
                {/* 1. VIDEOS LIST */}
                <div className="space-y-4">
                  <h3 className="eyebrow text-stone border-b border-line pb-2">Videolar</h3>
                  {currentVideos.length === 0 ? (
                    <p className="text-xs text-stone-soft italic">Bu sektörde video bulunmuyor.</p>
                  ) : (
                    <div className="space-y-3">
                      {currentVideos.map((m, idx) => (
                        <div
                          key={m.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, m.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, m.id, currentMedia)}
                          className="flex items-center justify-between border border-line bg-bone/20 hover:bg-bone/40 p-4 rounded-xl cursor-grab active:cursor-grabbing transition-colors group"
                        >
                          <div className="flex items-center space-x-4 flex-grow min-w-0 mr-4">
                            {/* Ordering keys indicator */}
                            <div className="flex flex-col space-y-1">
                              <button
                                type="button"
                                onClick={() => handleMoveItem(m.id, "up", currentMedia)}
                                disabled={idx === 0}
                                className="text-stone hover:text-ink disabled:opacity-30"
                                aria-label="Yukarı taşı"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(m.id, "down", currentMedia)}
                                disabled={idx === currentVideos.length - 1}
                                className="text-stone hover:text-ink disabled:opacity-30"
                                aria-label="Aşağı taşı"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            {/* Mini Poster preview */}
                            <div className="relative h-12 w-12 rounded-lg bg-ink/10 overflow-hidden shrink-0 border border-line">
                              <div className="absolute inset-0 flex items-center justify-center text-cream">
                                <Film className="h-5 w-5 fill-current opacity-60" />
                              </div>
                            </div>

                            <div className="flex-grow min-w-0 space-y-1">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-stone/80">Video Başlığı</label>
                                <input
                                  type="text"
                                  value={m.title}
                                  onChange={(e) => handleTitleChange(m.id, e.target.value)}
                                  className="text-sm font-semibold text-ink bg-bone border border-line rounded-xl px-3 py-1.5 w-full focus:bg-cream focus:border-clay focus:outline-none transition-all"
                                  placeholder="Video Başlığı"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={m.src}
                                  onChange={(e) => handleSourceChange(m.id, e.target.value)}
                                  className="text-[10px] text-stone-soft bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-0.5 w-full focus:outline-none"
                                  placeholder="Dosya URL'si"
                                />
                                <label className="shrink-0 flex items-center gap-1 border border-line bg-cream hover:bg-bone px-2 py-0.5 rounded cursor-pointer text-[9px] font-semibold text-stone hover:text-ink">
                                  <Plus className="h-2.5 w-2.5" />
                                  Değiştir
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleReplaceMediaFile(e, m.id)}
                                    disabled={isUploading}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleHide(m.id)}
                              className={`p-2 rounded-lg border transition-colors ${
                                m.isHidden
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                                  : "bg-cream border-line text-stone hover:text-ink"
                              }`}
                              title={m.isHidden ? "Göster" : "Gizle"}
                            >
                              {m.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>

                            {!m.isBase && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(m.id)}
                                className="p-2 rounded-lg border border-line bg-cream text-stone hover:text-rose-700 hover:border-rose-300/40 transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. IMAGES LIST */}
                <div className="space-y-4">
                  <h3 className="eyebrow text-stone border-b border-line pb-2">Görseller</h3>
                  {currentImages.length === 0 ? (
                    <p className="text-xs text-stone-soft italic">Bu sektörde görsel bulunmuyor.</p>
                  ) : (
                    <div className="space-y-3">
                      {currentImages.map((m, idx) => (
                        <div
                          key={m.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, m.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, m.id, currentMedia)}
                          className="flex items-center justify-between border border-line bg-bone/20 hover:bg-bone/40 p-4 rounded-xl cursor-grab active:cursor-grabbing transition-colors group"
                        >
                          <div className="flex items-center space-x-4 flex-grow min-w-0 mr-4">
                            {/* Ordering keys indicator */}
                            <div className="flex flex-col space-y-1">
                              <button
                                type="button"
                                onClick={() => handleMoveItem(m.id, "up", currentMedia)}
                                disabled={idx === 0}
                                className="text-stone hover:text-ink disabled:opacity-30"
                                aria-label="Yukarı taşı"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(m.id, "down", currentMedia)}
                                disabled={idx === currentImages.length - 1}
                                className="text-stone hover:text-ink disabled:opacity-30"
                                aria-label="Aşağı taşı"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            {/* Mini Image preview */}
                            <div className="relative h-12 w-12 rounded-lg bg-ink/10 overflow-hidden shrink-0 border border-line">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.src}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>

                            <div className="flex-grow min-w-0 space-y-1">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-stone/80">Görsel Başlığı</label>
                                <input
                                  type="text"
                                  value={m.title}
                                  onChange={(e) => handleTitleChange(m.id, e.target.value)}
                                  className="text-sm font-semibold text-ink bg-bone border border-line rounded-xl px-3 py-1.5 w-full focus:bg-cream focus:border-clay focus:outline-none transition-all"
                                  placeholder="Görsel Başlığı"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={m.src}
                                  onChange={(e) => handleSourceChange(m.id, e.target.value)}
                                  className="text-[10px] text-stone-soft bg-transparent focus:bg-cream border border-transparent focus:border-line rounded px-2 py-0.5 w-full focus:outline-none"
                                  placeholder="Dosya URL'si"
                                />
                                <label className="shrink-0 flex items-center gap-1 border border-line bg-cream hover:bg-bone px-2 py-0.5 rounded cursor-pointer text-[9px] font-semibold text-stone hover:text-ink">
                                  <Plus className="h-2.5 w-2.5" />
                                  Değiştir
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleReplaceMediaFile(e, m.id)}
                                    disabled={isUploading}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleHide(m.id)}
                              className={`p-2 rounded-lg border transition-colors ${
                                m.isHidden
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                                  : "bg-cream border-line text-stone hover:text-ink"
                              }`}
                              title={m.isHidden ? "Göster" : "Gizle"}
                            >
                              {m.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>

                            {!m.isBase && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(m.id)}
                                className="p-2 rounded-lg border border-line bg-cream text-stone hover:text-rose-700 hover:border-rose-300/40 transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
