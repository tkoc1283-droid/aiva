import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "../../../i18n/navigation";
import { getDisplaySectors } from "../../../lib/content";
import Reveal from "../../../components/Reveal";
import { ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const isTr = locale === "tr";
  return {
    title: isTr ? "Çalışmalarımız" : "Our Works",
    description: isTr
      ? "Yapay zekâ destekli model çekimleri, katalog çekimleri ve video prodüksiyon çalışmalarımız."
      : "Our AI-powered model shoots, catalog campaigns, and video production works.",
  };
}

export default async function WorksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations("Nav");
  const tWorks = await getTranslations("WorkIndex");
  const displaySectors = await getDisplaySectors();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-16">
      {/* Page Header */}
      <div className="max-w-2xl space-y-4">
        <Reveal delay={0.1}>
          <span className="eyebrow text-stone">{tNav("works")}</span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {tWorks("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-base text-ink-soft leading-relaxed">
            {tWorks("subtitle")}
          </p>
        </Reveal>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displaySectors.map((sector, idx) => {
          const isMiddle = idx % 3 === 1;
          const translateClass = isMiddle ? "lg:translate-y-8" : "";
          const sectorName = sector.name[locale as "tr" | "en"] || "";

          return (
            <Reveal key={sector.slug} delay={0.1 * idx} className={`${translateClass}`}>
              <Link
                href={`/calismalar/${sector.slug}`}
                className="group block relative overflow-hidden bg-cream border border-line rounded-2xl p-4 shadow-kx hover:shadow-kx-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink/5">
                  <Image
                    src={sector.cover}
                    alt={sectorName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="rounded-full bg-cream/90 px-4 py-2 text-xs font-semibold tracking-wider text-ink backdrop-blur-sm shadow flex items-center gap-1.5 active:scale-95 duration-150">
                      {locale === "tr" ? "İncele" : "Explore"} <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-clay transition-colors">
                      {sectorName}
                    </h3>
                    <p className="text-xs text-stone mt-0.5">
                      {sector.media.length} {locale === "tr" ? "Çalışma" : "Items"}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-line flex items-center justify-center text-stone group-hover:text-clay group-hover:border-clay transition-all duration-300">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
