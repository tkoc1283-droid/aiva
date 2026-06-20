"use client";
 
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "../i18n/navigation";
import { Menu, X, Globe } from "lucide-react";
import { GlobalSettings } from "../lib/overrides";

interface NavbarProps {
  settings?: GlobalSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("Nav");
  const common = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/calismalar", label: t("works") },
    { href: "/hizmetler", label: t("services") },
    { href: "/hakkimizda", label: t("about") },
    { href: "/iletisim", label: t("contact") },
  ];

  const brandName = locale === "tr" ? (settings?.brandNameTr || "AIVA") : (settings?.brandNameEn || "AIVA");
  const brandTagline = locale === "tr" ? (settings?.brandTaglineTr || "stüdyo") : (settings?.brandTaglineEn || "studio");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-bone/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3.5 group select-none">
          {settings?.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt={brandName}
              className="h-10 w-auto object-contain max-h-12"
            />
          )}
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-clay">
              {brandName}
            </span>
            <span className="eyebrow text-[9px] -mt-1 text-stone-soft transition-colors group-hover:text-clay/80">
              {brandTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-clay link-underline ${
                pathname === link.href ? "text-clay font-semibold" : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center space-x-1 text-sm bg-cream border border-line rounded-lg p-1">
            <button
              onClick={() => handleLocaleChange("tr")}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                locale === "tr" ? "bg-clay text-cream shadow-kx" : "text-stone hover:text-ink"
              }`}
            >
              TR
            </button>
            <button
              onClick={() => handleLocaleChange("en")}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                locale === "en" ? "bg-clay text-cream shadow-kx" : "text-stone hover:text-ink"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-3 md:hidden">
          <div className="flex items-center space-x-1 text-xs bg-cream border border-line rounded-lg p-1">
            <button
              onClick={() => handleLocaleChange("tr")}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                locale === "tr" ? "bg-clay text-cream" : "text-stone"
              }`}
            >
              TR
            </button>
            <button
              onClick={() => handleLocaleChange("en")}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                locale === "en" ? "bg-clay text-cream" : "text-stone"
              }`}
            >
              EN
            </button>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-ink hover:text-clay active:scale-95 transition-transform"
            aria-label={common("menu")}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-line bg-bone px-6 py-6 space-y-4 animate-rise">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold py-1 border-b border-line/20 ${
                  pathname === link.href ? "text-clay" : "text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
