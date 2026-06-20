import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getDisplaySector } from "../../../../lib/content";
import { getStore } from "../../../../lib/overrides";
import { baseSectors } from "../../../../data/sectors";
import { Link } from "../../../../i18n/navigation";
import { siteConfig } from "../../../../config/site";
import MediaGrid from "../../../../components/MediaGrid";
import Reveal from "../../../../components/Reveal";
import { ArrowLeft } from "lucide-react";

interface SectorDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  // Read base slugs
  const baseSlugs = baseSectors.map((s) => s.slug);
  
  // Try to load store custom slugs
  let customSlugs: string[] = [];
  try {
    const store = await getStore();
    customSlugs = store.custom.map((cs) => cs.slug);
  } catch (e) {
    // ignore
  }

  const allSlugs = Array.from(new Set([...baseSlugs, ...customSlugs]));
  
  const params: { locale: string; slug: string }[] = [];
  ["tr", "en"].forEach((locale) => {
    allSlugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });
  
  return params;
}

export async function generateMetadata({ params }: SectorDetailPageProps) {
  const { locale, slug } = await params;
  const sector = await getDisplaySector(slug);
  if (!sector) return {};

  const sectorName = sector.name[locale as "tr" | "en"] || "";
  const tagline = sector.tagline[locale as "tr" | "en"] || "";

  return {
    title: `${sectorName} Prodüksiyonları`,
    description: tagline,
  };
}

export default async function SectorDetailPage({ params }: SectorDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const sector = await getDisplaySector(slug);
  if (!sector) {
    notFound();
  }

  const tSectorPage = await getTranslations("SectorPage");

  const sectorName = sector.name[locale as "tr" | "en"] || "";
  const tagline = sector.tagline[locale as "tr" | "en"] || "";

  const labels = {
    videos: tSectorPage("videos"),
    images: tSectorPage("images"),
    empty: tSectorPage("empty"),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-16">
      {/* Back Link */}
      <Reveal delay={0.05}>
        <Link
          href="/calismalar"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone hover:text-ink transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {tSectorPage("back")}
        </Link>
      </Reveal>

      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <Reveal delay={0.1}>
          <span
            className="eyebrow"
            style={{ color: sector.accent || "var(--color-clay)" }}
          >
            AIVA / {sectorName.toUpperCase()}
          </span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
            {sectorName}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-lg text-ink-soft leading-relaxed">
            {tagline}
          </p>
        </Reveal>
      </div>

      {/* Media Grid */}
      <Reveal delay={0.4}>
        <div className="pt-8">
          <MediaGrid
            media={sector.media}
            locale={locale}
            labels={labels}
          />
        </div>
      </Reveal>

      {/* CTA Box */}
      <Reveal delay={0.5}>
        <div className="border-t border-line pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h3 className="font-display text-2xl font-bold text-ink">
              {tSectorPage("ctaTitle")}
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              {tSectorPage("ctaDesc")}
            </p>
          </div>
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-clay hover:bg-clay-deep text-cream px-8 py-4 text-sm font-bold shadow-kx transition-all hover:shadow-kx-lg flex items-center justify-center gap-2 active:scale-95 duration-200"
          >
            {tSectorPage("ctaButton")}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
