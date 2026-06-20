import fs from "fs/promises";
import path from "path";

export interface AddedMedia {
  id: string;
  type: "video" | "image";
  src: string;
  ratio?: "9:16" | "1:1" | "4:5" | "3:4" | "16:9";
  title: string; // single string for input, fallback in TR/EN
}

export interface GlobalSettings {
  brandNameTr?: string;
  brandNameEn?: string;
  brandTaglineTr?: string;
  brandTaglineEn?: string;
  logoUrl?: string;
  heroTitleTr?: string;
  heroTitleEn?: string;
  heroSubtitleTr?: string;
  heroSubtitleEn?: string;
  heroBannerUrl?: string;
}

export interface SectorOverride {
  order: string[];
  hidden: string[];
  titles?: Record<string, string>; // mediaId -> title text
  added?: AddedMedia[];
}

export interface CustomSector {
  slug: string;
  name: string;
  tagline: string;
  cover: string;
  accent: string;
}

export interface Store {
  overrides: Record<string, SectorOverride>;
  custom: CustomSector[];
  settings?: GlobalSettings;
}

const STORE_FILE = path.join(process.cwd(), "src/data/store.json");
const KV_KEY = "aiva:store";

function normalize(store: any): Store {
  if (!store) store = {};
  
  const defaultSettings: GlobalSettings = {
    brandNameTr: "AIVA",
    brandNameEn: "AIVA",
    brandTaglineTr: "Kreatif Prodüksiyon & Reklam Stüdyosu",
    brandTaglineEn: "Creative Production & Advertising Studio",
    logoUrl: "",
    heroTitleTr: "Yaratıcı Vizyon ve Estetiğin Zirvesi",
    heroTitleEn: "The Pinnacle of Creative Vision and Aesthetics",
    heroSubtitleTr: "Aiva Stüdyo, yüksek bütçeli moda markaları ve kreatif ajanslar için dünya standartlarında reklam, görsel ve video prodüksiyonu sunar.",
    heroSubtitleEn: "Aiva Studio delivers world-class advertising, visual, and video production for high-end fashion brands and creative agencies.",
    heroBannerUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
  };

  return {
    overrides: store.overrides || {},
    custom: store.custom || [],
    settings: {
      ...defaultSettings,
      ...(store.settings || {}),
    },
  };
}

export async function getStore(): Promise<Store> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/${KV_KEY}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
        return normalize(parsed);
      }
    } catch (err) {
      console.error("KV store read error, falling back:", err);
    }
  }

  // Fallback to local file
  try {
    const data = await fs.readFile(STORE_FILE, "utf-8");
    return normalize(JSON.parse(data));
  } catch (err) {
    return { overrides: {}, custom: [] };
  }
}

export async function saveStore(store: Store): Promise<void> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  const normalized = normalize(store);

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/set/${KV_KEY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized),
      });
      if (res.ok) return;
    } catch (err) {
      console.error("KV store write error, falling back:", err);
    }
  }

  // Write to local file
  await fs.writeFile(STORE_FILE, JSON.stringify(normalized, null, 2), "utf-8");
}

/**
 * Filters out hidden items and sorts items according to the order array.
 * Items not in the order array are placed at the end.
 */
export function applyOrderAndHidden<T extends { id: string }>(
  items: T[],
  ov?: SectorOverride
): T[] {
  if (!ov) return items;

  const hiddenSet = new Set(ov.hidden || []);
  const orderList = ov.order || [];

  // Filter out hidden
  const visible = items.filter((item) => !hiddenSet.has(item.id));

  // Sort by order list
  return [...visible].sort((a, b) => {
    const indexA = orderList.indexOf(a.id);
    const indexB = orderList.indexOf(b.id);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0; // maintain stability
  });
}
