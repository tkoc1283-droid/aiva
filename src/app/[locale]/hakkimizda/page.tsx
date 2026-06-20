import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Reveal from "../../../components/Reveal";
import { siteConfig } from "../../../config/site";
import { Link } from "../../../i18n/navigation";

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-20">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <Reveal delay={0.1}>
          <span className="eyebrow text-stone">{tNav("about")}</span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {tAbout("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-lg text-brass italic font-display font-medium">
            {tAbout("subtitle")}
          </p>
        </Reveal>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Story */}
        <div className="lg:col-span-7 space-y-6">
          <Reveal delay={0.2}>
            <p className="text-base text-ink leading-relaxed">
              {tAbout("p1")}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-base text-ink-soft leading-relaxed">
              {tAbout("p2")}
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
            {[
              {
                title: locale === "tr" ? "Hız & Verimlilik" : "Speed & Efficiency",
                desc: locale === "tr" ? "Çekim günleri ve hazırlık haftalarını birkaç güne indiriyoruz." : "We reduce shooting days and preparation weeks into just a few days."
              },
              {
                title: locale === "tr" ? "Yenilikçilik" : "Innovation",
                desc: locale === "tr" ? "Yapay zekâ teknolojilerini estetik moda tasarımıyla entegre ediyoruz." : "We integrate AI technologies with high-end fashion design aesthetics."
              },
              {
                title: locale === "tr" ? "Erişilebilirlik" : "Accessibility",
                desc: locale === "tr" ? "Büyük bütçeli prodüksiyonları her ölçekteki marka için ulaşılabilir kılıyoruz." : "We make high-budget productions accessible for brands of all sizes."
              }
            ].map((val, idx) => (
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
