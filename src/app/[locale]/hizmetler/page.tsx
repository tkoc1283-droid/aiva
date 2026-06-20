import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Reveal from "../../../components/Reveal";
import { siteConfig } from "../../../config/site";
import { Link } from "../../../i18n/navigation";
import { ArrowRight, Sparkles, Video, Grid, Layers } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const isTr = locale === "tr";
  return {
    title: isTr ? "Hizmetlerimiz" : "Our Services",
    description: isTr
      ? "Yapay zekâ teknolojileriyle görsel ve video prodüksiyon çözümlerimiz."
      : "Our visual and video production solutions powered by AI technologies.",
  };
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tServices = await getTranslations("Services");
  const tFinalCta = await getTranslations("FinalCta");

  const servicesList = [
    {
      title: tServices("s1Title"),
      desc: tServices("s1Desc"),
      icon: Sparkles,
      details: locale === "tr" 
        ? ["Sanal model çekimleri", "Farklı mekan & arka plan tasarımı", "Renk & ışık harmonizasyonu"]
        : ["Virtual model photography", "Custom location & environment styling", "Color & light harmonization"]
    },
    {
      title: tServices("s2Title"),
      desc: tServices("s2Desc"),
      icon: Video,
      details: locale === "tr"
        ? ["Sosyal medya video reklamları", "E-ticaret ürün videoları", "AI destekli video kurgu"]
        : ["Social media video ads", "E-commerce product showcases", "AI-assisted video editing"]
    },
    {
      title: tServices("s3Title"),
      desc: tServices("s3Desc"),
      icon: Layers,
      details: locale === "tr"
        ? ["Sezonluk koleksiyon kampanyaları", "Kombin çekimleri", "Hızlı e-ticaret yayına hazırlık"]
        : ["Seasonal collection campaigns", "Outfit ensemble lookbooks", "Rapid e-commerce catalog integration"]
    },
    {
      title: tServices("s4Title"),
      desc: tServices("s4Desc"),
      icon: Grid,
      details: locale === "tr"
        ? ["B2B e-ticaret katalogları", "Beyaz arka plan ürün görselleştirme", "Tutarlı marka katalog standartları"]
        : ["B2B catalog creation", "Standardized white-background visuals", "Consistent brand guidelines"]
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-24">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <Reveal delay={0.1}>
          <span className="eyebrow text-stone">{tServices("title")}</span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {tServices("subtitle")}
          </h1>
        </Reveal>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {servicesList.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <Reveal key={idx} delay={0.1 * idx}>
              <div className="bg-cream border border-line rounded-2xl p-10 space-y-6 hover:shadow-kx transition-all duration-300 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-clay/10 text-clay">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl font-bold text-ink">
                      {srv.title}
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-4">
                    {srv.details.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-ink">
                        <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* CTA */}
      <Reveal delay={0.4}>
        <div className="bg-clay text-cream rounded-xl2 p-12 text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            {tFinalCta("title")}
          </h2>
          <p className="text-sm text-cream/80 max-w-xl mx-auto">
            {tFinalCta("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/iletisim"
              className="rounded-xl bg-cream px-8 py-3 text-sm font-semibold text-clay hover:bg-cream/90 transition-colors inline-block"
            >
              {tFinalCta("button")}
            </Link>
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-cream/30 hover:border-cream bg-ink-soft/20 px-8 py-3 text-sm font-semibold text-cream hover:bg-cream/10 transition-colors inline-block"
            >
              {tFinalCta("whatsapp")}
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
