import uploadsDataRaw from "./uploads.json";

export type I18nText = { tr: string; en: string };
export type MediaType = "video" | "image";

export interface MediaItem {
  id: string;
  type: MediaType;
  src: string;
  poster?: string;
  ratio?: "9:16" | "1:1" | "4:5" | "3:4" | "16:9";
  title?: I18nText;
}

export interface Sector {
  slug: string;
  name: I18nText;
  tagline: I18nText;
  cover: string;
  accent: string;
  media: MediaItem[];
}

const uploadsData = uploadsDataRaw as Record<string, MediaItem[]>;

export const baseSectors: Sector[] = [
  {
    slug: "gelinlik-abiye",
    name: { tr: "Gelinlik & Abiye", en: "Bridal & Evening Wear" },
    tagline: {
      tr: "Zarafetin yapay zekâ estetiği ile buluşması.",
      en: "Elegance meets artificial intelligence aesthetics.",
    },
    cover: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800&auto=format&fit=crop",
    accent: "#78523b",
    media: [
      {
        id: "ga-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=1200&auto=format&fit=crop",
        ratio: "3:4",
        title: { tr: "Dantel Detaylı Gelinlik", en: "Lace Detailed Bridal" },
      },
      {
        id: "ga-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1200&auto=format&fit=crop",
        ratio: "4:5",
        title: { tr: "Klasik Saten Gelinlik", en: "Classic Satin Gown" },
      },
    ],
  },
  {
    slug: "taki-aksesuar",
    name: { tr: "Takı & Aksesuar", en: "Jewelry & Accessories" },
    tagline: {
      tr: "Işıltıyı yapay zekâ hassasiyeti ile sergiliyoruz.",
      en: "Showcasing shine with artificial intelligence precision.",
    },
    cover: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    accent: "#b89775",
    media: [
      {
        id: "ta-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop",
        ratio: "1:1",
        title: { tr: "Pırlanta Taşlı Altın Küpe", en: "Diamond Studded Gold Earrings" },
      },
      {
        id: "ta-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop",
        ratio: "3:4",
        title: { tr: "Minimalist Zümrüt Yüzük", en: "Minimalist Emerald Ring" },
      },
    ],
  },
  {
    slug: "cocuk-giyim",
    name: { tr: "Çocuk Giyim", en: "Kids Wear" },
    tagline: {
      tr: "En sevimli tasarımları en yenilikçi görsellerle sunun.",
      en: "Present the cutest designs with the most innovative visuals.",
    },
    cover: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop",
    accent: "#7c6a5d",
    media: [
      {
        id: "cg-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200&auto=format&fit=crop",
        ratio: "4:5",
        title: { tr: "Renkli Örgü Kazak", en: "Colorful Knitted Sweater" },
      },
      {
        id: "cg-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1200&auto=format&fit=crop",
        ratio: "1:1",
        title: { tr: "Keten Çocuk Takımı", en: "Linen Kids Suit" },
      },
    ],
  },
  {
    slug: "ic-giyim",
    name: { tr: "İç Giyim", en: "Lingerie" },
    tagline: {
      tr: "Minimalist ve çarpıcı kompozisyonlar.",
      en: "Minimalist and striking compositions.",
    },
    cover: "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?q=80&w=800&auto=format&fit=crop",
    accent: "#593b29",
    media: [
      {
        id: "ig-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?q=80&w=1200&auto=format&fit=crop",
        ratio: "3:4",
        title: { tr: "Küpür Dantelli Bralet", en: "Lace Detail Bralette" },
      },
      {
        id: "ig-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=1200&auto=format&fit=crop",
        ratio: "4:5",
        title: { tr: "Saten Gecelik Takımı", en: "Satin Nightwear Set" },
      },
    ],
  },
];

export function getSectors(): Sector[] {
  return baseSectors.map((sector) => {
    const uploadedMedia = uploadsData[sector.slug] || [];
    return {
      ...sector,
      media: [...sector.media, ...uploadedMedia],
    };
  });
}

export function getSector(slug: string): Sector | undefined {
  const sectors = getSectors();
  return sectors.find((s) => s.slug === slug);
}

export function sectorSlugs(): string[] {
  return baseSectors.map((s) => s.slug);
}
