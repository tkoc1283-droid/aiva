import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Reveal from "../../../components/Reveal";
import { siteConfig } from "../../../config/site";
import { Link } from "../../../i18n/navigation";
import { getStore } from "../../../lib/overrides";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const isTr = locale === "tr";
  return {
    title: isTr ? "Hakkımızda" : "About Us",
    description: isTr
      ? "Aiva Stüdyo, yapay zekâ teknolojileriyle görsel prodüksiyonun geleceğini şekillendiriyor."
      : "Aiva Studio is shaping the future of visual production with AI technologies.",
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tAbout = await getTranslations("About");
  const tNav = await getTranslations("Nav");
  const tHero = await getTranslations("Hero");

  // Load from store settings
  const store = await getStore();
  const settings = store.settings || {};

  const title = locale === "tr" ? (settings.aboutTitleTr || tAbout("title")) : (settings.aboutTitleEn || tAbout("title"));
  const subtitle = locale === "tr" ? (settings.aboutSubtitleTr || tAbout("subtitle")) : (settings.aboutSubtitleEn || tAbout("subtitle"));
  const p1 = locale === "tr" ? (settings.aboutP1Tr || tAbout("p1")) : (settings.aboutP1En || tAbout("p1"));
  const p2 = locale === "tr" ? (settings.aboutP2Tr || tAbout("p2")) : (settings.aboutP2En || tAbout("p2"));

  const values = [
    {
      title: locale === "tr" 
        ? (settings.aboutVal1TitleTr || "Hız & Verimlilik") 
        : (settings.aboutVal1TitleEn || "Speed & Efficiency"),
      desc: locale === "tr" 
        ? (settings.aboutVal1DescTr || "Çekim günleri ve hazırlık haftalarını birkaç güne indiriyoruz.") 
        : (settings.aboutVal1DescEn || "We reduce shooting days and preparation weeks into just a few days.")
    },
    {
      title: locale === "tr" 
        ? (settings.aboutVal2TitleTr || "Yenilikçilik") 
        : (settings.aboutVal2TitleEn || "Innovation"),
      desc: locale === "tr" 
        ? (settings.aboutVal2DescTr || "Yapay zekâ teknolojilerini estetik moda tasarımıyla entegre ediyoruz.") 
        : (settings.aboutVal2DescEn || "We integrate AI technologies with high-end fashion design aesthetics.")
    },
    {
      title: locale === "tr" 
        ? (settings.aboutVal3TitleTr || "Erişilebilirlik") 
        : (settings.aboutVal3TitleEn || "Accessibility"),
      desc: locale === "tr" 
        ? (settings.aboutVal3DescTr || "Büyük bütçeli prodüksiyonları her ölçekteki marka için ulaşılabilir kılıyoruz.") 
        : (settings.aboutVal3DescEn || "We make high-budget productions accessible for brands of all sizes.")
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-20">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <Reveal delay={0.1}>
          <span className="eyebrow text-stone">{tNav("about")}</span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-lg text-brass italic font-display font-medium">
            {subtitle}
          </p>
        </Reveal>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Story */}
        <div className="lg:col-span-7 space-y-6">
          <Reveal delay={0.2}>
            <p className="text-base text-ink leading-relaxed">
              {p1}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-base text-ink-soft leading-relaxed">
              {p2}
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="pt-6">
              <Link
                href="/iletisim"
                className="rounded-xl bg-clay text-cream px-6 py-3.5 text-sm font-semibold hover:bg-clay-deep transition-all shadow-kx hover:shadow-kx-lg inline-block"
              >
                {tHero("ctaContact")}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Brand Values / Sidebar */}
        <div className="lg:col-span-5 bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-8">
          <h3 className="eyebrow text-stone text-xs tracking-widest">
            {locale === "tr" ? "DEĞERLERİMİZ" : "OUR VALUES"}
          </h3>
          
          <div className="space-y-6">
            {values.map((val, idx) => (
              <div key={idx} className="space-y-2 border-b border-line/40 pb-4 last:border-0 last:pb-0">
                <h4 className="font-display text-lg font-bold text-ink">{val.title}</h4>
                <p className="text-xs text-ink-soft leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
