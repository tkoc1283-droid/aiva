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

export interface ServiceItem {
  id: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
}

export interface TestimonialItem {
  id: string;
  authorTr: string;
  authorEn: string;
  textTr: string;
  textEn: string;
}

export interface FaqItem {
  id: string;
  questionTr: string;
  questionEn: string;
  answerTr: string;
  answerEn: string;
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
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
  faqs?: FaqItem[];
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
    logoUrl: "/logo.jpg",
    heroTitleTr: "Yaratıcı Vizyon ve Estetiğin Zirvesi",
    heroTitleEn: "The Pinnacle of Creative Vision and Aesthetics",
    heroSubtitleTr: "Aiva Stüdyo, yüksek bütçeli moda markaları ve kreatif ajanslar için dünya standartlarında reklam, görsel ve video prodüksiyonu sunar.",
    heroSubtitleEn: "Aiva Studio delivers world-class advertising, visual, and video production for high-end fashion brands and creative agencies.",
    heroBannerUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
  };

  const defaultServices: ServiceItem[] = [
    {
      id: "s1",
      titleTr: "Yapay Zekâ Görsel Üretimi",
      titleEn: "AI Visual Generation",
      descTr: "Modellerinizi stüdyo ortamına ihtiyaç duymadan, dilediğiniz arka plan ve konseptte profesyonelce sunuyoruz.",
      descEn: "We professionally present your models in any background and concept without the need for a studio environment."
    },
    {
      id: "s2",
      titleTr: "Kreatif Video Prodüksiyon",
      titleEn: "Creative Video Production",
      descTr: "Sosyal medya, reklam ve e-ticaret siteleri için dinamik, yüksek çözünürlüklü ve hikaye odaklı videolar üretiyoruz.",
      descEn: "We produce dynamic, high-resolution, and story-driven videos for social media, ads, and e-commerce websites."
    },
    {
      id: "s3",
      titleTr: "Koleksiyon Kampanyaları",
      titleEn: "Collection Campaigns",
      descTr: "Sezonluk koleksiyonlarınızı, markanızın estetik diline uygun temalar ve yapay zekâ modelleriyle hızlıca yayına hazırlıyoruz.",
      descEn: "We quickly prepare your seasonal collections for launch with themes and AI models matching your brand's aesthetic language."
    },
    {
      id: "s4",
      titleTr: "B2B Katalog & E-Ticaret",
      titleEn: "B2B Catalogs & E-Commerce",
      descTr: "E-ticaret siteleri ve B2B sipariş platformları için yüksek standartlı ve tutarlı ürün katalogları oluşturuyoruz.",
      descEn: "We build high-standard and consistent product catalogs for e-commerce sites and B2B ordering platforms."
    }
  ];

  const defaultTestimonials: TestimonialItem[] = [
    {
      id: "t1",
      authorTr: "Merve K. — Moda Tasarımcısı",
      authorEn: "Merve K. — Fashion Designer",
      textTr: "Aiva Stüdyo ile çalışmak koleksiyonumuzun hazırlık sürecini inanılmaz kısalttı. Yapay zekâ ile ürettikleri görseller stüdyo çekimlerinden farksızdı.",
      textEn: "Working with Aiva Studio dramatically shortened our collection prep phase. The visuals they generated with AI were identical to actual studio shoots."
    },
    {
      id: "t2",
      authorTr: "Ahmet T. — E-Ticaret Direktörü",
      authorEn: "Ahmet T. — E-Commerce Director",
      textTr: "Katalog çekimlerindeki maliyetlerimizi %70 oranında düşürdük. Hız ve kalite gerçekten kusursuz.",
      textEn: "We cut our catalog shooting costs by 70%. The speed and quality are truly impeccable."
    },
    {
      id: "t3",
      authorTr: "Canan D. — Pazarlama Müdürü",
      authorEn: "Canan D. — Marketing Manager",
      textTr: "Sosyal medya kampanyalarımız için hazırladıkları videolar harika dönüşümler getirdi. Çok profesyonel bir ekip.",
      textEn: "The videos they produced for our social media campaigns brought great conversion rates. A very professional team."
    }
  ];

  const defaultFaqs: FaqItem[] = [
    {
      id: "q1",
      questionTr: "Yapay zekâ destekli görsel üretimi nasıl çalışır?",
      questionEn: "How does AI-powered visual generation work?",
      answerTr: "Ürünlerinizin temel fotoğraflarını alarak, bunları gelişmiş yapay zekâ modellerimiz ve istediğiniz arka plan/konseptlerle birleştirip profesyonel kampanya görsellerine dönüştürüyoruz.",
      answerEn: "Taking basic photos of your products, we merge them with our advanced AI models and your desired background/concept to transform them into professional campaign visuals."
    },
    {
      id: "q2",
      questionTr: "Teslimat süreleriniz ne kadardır?",
      questionEn: "What are your delivery times?",
      answerTr: "Klasik stüdyo çekimlerine kıyasla çok daha hızlıyız. Talebin büyüklüğüne göre genellikle 3 ila 7 iş günü içerisinde tüm teslimatları yapıyoruz.",
      answerEn: "We are much faster compared to classic studio shoots. Depending on the request scale, we typically deliver all assets within 3 to 7 business days."
    },
    {
      id: "q3",
      questionTr: "Fiyatlandırma modeliniz nasıl?",
      questionEn: "What is your pricing model?",
      answerTr: "Proje bazlı veya aylık paketler halinde çalışıyoruz. İhtiyaçlarınıza en uygun teklifi almak için bizimle iletişime geçebilirsiniz.",
      answerEn: "We work on a project basis or monthly packages. You can contact us to get the most suitable offer for your needs."
    }
  ];

  return {
    overrides: store.overrides || {},
    custom: store.custom || [],
    settings: {
      ...defaultSettings,
      ...(store.settings || {}),
    },
    services: store.services || defaultServices,
    testimonials: store.testimonials || defaultTestimonials,
    faqs: store.faqs || defaultFaqs,
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
