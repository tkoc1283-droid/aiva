import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import { routing } from "../../i18n/routing";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WhatsAppButton from "../../components/WhatsAppButton";
import { getStore } from "../../lib/overrides";
import "../globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  // standard configurations for axes:
  axes: ["SOFT", "WONK", "opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Omit<LayoutProps, "children">) {
  const { locale } = await params;
  const isTr = locale === "tr";

  return {
    title: {
      template: "%s | Aiva Stüdyo",
      default: isTr
        ? "Aiva Stüdyo | Yapay Zekâ Destekli Prodüksiyon"
        : "Aiva Studio | AI-Powered Visual Production",
    },
    description: isTr
      ? "Moda ve perakende markaları için profesyonel yapay zekâ destekli fotoğraf ve video prodüksiyon stüdyosu."
      : "Professional AI-powered photo and video production studio for fashion and retail brands.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Set locale for static rendering
  setRequestLocale(locale);

  // Load translations
  const messages = await getMessages();

  // Load store settings
  const store = await getStore();
  const settings = store.settings;

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${fraunces.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="grain min-h-screen flex flex-col bg-bone selection:bg-clay/20 selection:text-ink">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Navbar settings={settings} />
          <main className="flex-grow">{children}</main>
          <Footer settings={settings} />
          <WhatsAppButton settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
