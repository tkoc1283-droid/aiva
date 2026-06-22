import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Reveal from "../../../components/Reveal";
import ContactForm from "../../../components/ContactForm";
import { siteConfig } from "../../../config/site";
import { getStore } from "../../../lib/overrides";
import { Mail, MessageSquare, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const isTr = locale === "tr";
  return {
    title: isTr ? "İletişim" : "Contact Us",
    description: isTr
      ? "Aiva Stüdyo ile iletişime geçin. Fotoğraf ve video prodüksiyon projelerinizi konuşalım."
      : "Get in touch with Aiva Studio. Let's talk about your photo and video production projects.",
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations("Nav");
  const tContact = await getTranslations("Contact");

  // Load store settings overrides
  const store = await getStore();
  const settings = store.settings || {};

  const email = settings.email || siteConfig.email;
  const whatsapp = settings.whatsapp || siteConfig.whatsapp;

  // Filter translation keys for form component
  const formTranslations = {
    name: tContact("name"),
    email: tContact("email"),
    phone: tContact("phone"),
    message: tContact("message"),
    submit: tContact("submit"),
    sending: tContact("sending"),
    success: tContact("success"),
    error: tContact("error"),
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 space-y-16">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <Reveal delay={0.1}>
          <span className="eyebrow text-stone">{tNav("contact")}</span>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {tContact("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-base text-ink-soft leading-relaxed">
            {tContact("subtitle")}
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8 bg-cream border border-line rounded-2xl p-8 shadow-kx">
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-ink">{tContact("infoTitle")}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{tContact("infoText")}</p>
          </div>

          <div className="space-y-6 pt-4">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-clay/10 text-clay shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone">Email</h4>
                <a href={`mailto:${email}`} className="text-base text-ink font-semibold hover:text-clay hover:underline">
                  {email}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-clay/10 text-clay shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone">WhatsApp</h4>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-base text-ink font-semibold hover:text-clay hover:underline block">
                  {tContact("whatsappInfo")}
                </a>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-clay/10 text-clay shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone">{tContact("workingHoursTitle")}</h4>
                <p className="text-base text-ink font-semibold">
                  {tContact("workingHoursVal")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-cream border border-line rounded-2xl p-8 shadow-kx space-y-6">
          <h3 className="font-display text-2xl font-bold text-ink border-b border-line pb-4">
            {tContact("formTitle")}
          </h3>
          <ContactForm translations={formTranslations} />
        </div>
      </div>
    </div>
  );
}
