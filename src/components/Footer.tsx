import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "../i18n/navigation";
import { siteConfig } from "../config/site";
import { GlobalSettings } from "../lib/overrides";

interface FooterProps {
  settings?: GlobalSettings;
}

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const brandName = locale === "tr" ? (settings?.brandNameTr || "AIVA") : (settings?.brandNameEn || "AIVA");
  const brandTagline = locale === "tr" ? (settings?.brandTaglineTr || "stüdyo") : (settings?.brandTaglineEn || "studio");

  return (
    <footer className="w-full bg-ink text-bone border-t border-line/20 py-16 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Block */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3.5 group select-none">
            {settings?.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="h-10 w-auto object-contain max-h-12 brightness-0 invert"
              />
            )}
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold tracking-tight text-cream transition-colors group-hover:text-brass">
                {brandName}
              </span>
              <span className="eyebrow text-[10px] -mt-1 text-stone-soft transition-colors group-hover:text-brass/80">
                {brandTagline}
              </span>
            </div>
          </Link>
          <p className="text-sm text-stone-soft max-w-xs leading-relaxed">
            {t("slogan")}
          </p>
        </div>

        {/* Links Block */}
        <div className="space-y-4">
          <h4 className="eyebrow text-xs text-brass tracking-widest">{nav("works")}</h4>
          <nav className="flex flex-col space-y-2.5">
            <Link href="/calismalar" className="text-sm text-stone-soft hover:text-cream transition-colors">
              {nav("works")}
            </Link>
            <Link href="/hizmetler" className="text-sm text-stone-soft hover:text-cream transition-colors">
              {nav("services")}
            </Link>
            <Link href="/hakkimizda" className="text-sm text-stone-soft hover:text-cream transition-colors">
              {nav("about")}
            </Link>
            <Link href="/iletisim" className="text-sm text-stone-soft hover:text-cream transition-colors">
              {nav("contact")}
            </Link>
          </nav>
        </div>

        {/* Contact details */}
        <div className="space-y-4">
          <h4 className="eyebrow text-xs text-brass tracking-widest">{nav("contact")}</h4>
          <div className="text-sm text-stone-soft space-y-2">
            <p>
              Email:{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-cream hover:underline">
                {siteConfig.email}
              </a>
            </p>
            <p>
              WhatsApp:{" "}
              <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-cream hover:underline">
                {locale === "tr" ? "Bize Yazın" : "Message Us"}
              </a>
            </p>
            <div className="flex space-x-4 pt-3">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs eyebrow tracking-widest text-stone-soft hover:text-cream transition-colors"
              >
                INSTAGRAM
              </a>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs eyebrow tracking-widest text-stone-soft hover:text-cream transition-colors"
              >
                YOUTUBE
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-16 pt-8 border-t border-line/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-soft">
        <p>© {currentYear} {brandName}. {t("rights")}</p>
        <div className="flex space-x-6">
          <Link href="/admin" className="hover:text-cream transition-colors">
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
