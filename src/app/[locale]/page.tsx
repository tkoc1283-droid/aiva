import React from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { getDisplaySectors } from "../../lib/content";
import { getStore } from "../../lib/overrides";
import { siteConfig } from "../../config/site";
import Reveal from "../../components/Reveal";
import { ChevronRight, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Translations
  const tHero = await getTranslations("Hero");
  const tNav = await getTranslations("Nav");
  const tServices = await getTranslations("Services");
  const tTestimonials = await getTranslations("Testimonials");
  const tFaq = await getTranslations("Faq");
  const tFinalCta = await getTranslations("FinalCta");
  const tCommon = await getTranslations("Common");

  const displaySectors = await getDisplaySectors();
  
  // Load store config settings
  const store = await getStore();
  const settings = store.settings || {};

  const brandTagline = locale === "tr" ? (settings.brandTaglineTr || siteConfig.tagline.tr) : (settings.brandTaglineEn || siteConfig.tagline.en);
  const heroTitle = locale === "tr" ? (settings.heroTitleTr || tHero("title")) : (settings.heroTitleEn || tHero("title"));
  const heroSubtitle = locale === "tr" ? (settings.heroSubtitleTr || tHero("subtitle")) : (settings.heroSubtitleEn || tHero("subtitle"));
  const heroBannerUrl = settings.heroBannerUrl || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop";

  // Mock brands for horizontal marquee
  const brands = [
    "VOGUE", "ELLE", "ZARA", "MANGO", "PRADA", "GUCCI", 
    "VALENTINO", "CHANEL", "BALENCIAGA", "DIOR", "HERMES"
  ];

  // How it works steps
  const steps = locale === "tr" ? [
    { num: "01", title: "Ürün Teslimi", desc: "Ürünlerinizin temel fotoğraflarını çekip dijital olarak stüdyomuza gönderin." },
    { num: "02", title: "Yapay Zekâ Konsepti", desc: "Markanızın estetiğine uygun arka plan, model ve aydınlatma konseptlerini seçelim." },
    { num: "03", title: "Prodüksiyon & Rötuş", desc: "Gelişmiş AI modellerimiz ile yüksek çözünürlüklü sanatsal görselleri hazırlayalım." },
    { num: "04", title: "Hızlı Teslimat", desc: "E-ticaret ve sosyal medya kanallarınız için hazır görselleri birkaç günde teslim edelim." }
  ] : [
    { num: "01", title: "Product Delivery", desc: "Shoot basic photos of your products and send them digitally to our studio." },
    { num: "02", title: "AI Concept Design", desc: "We select background, model, and lighting concepts matching your brand aesthetic." },
    { num: "03", title: "Production & Retouching", desc: "We generate high-resolution artistic visuals using our advanced AI models." },
    { num: "04", title: "Fast Delivery", desc: "We deliver campaign-ready assets for your channels within a few business days." }
  ];

  return (
    <div className="space-y-48 pb-24">
      {/* 1. Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 overflow-hidden bg-ink">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBannerUrl}
            alt="Studio Banner"
            fill
            priority
            className="object-cover object-center transition-transform duration-[10s]"
            sizes="100vw"
          />
          {/* Sinematik Koyu Overlay degrade maske */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/75 pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl w-full relative z-10 flex flex-col justify-between min-h-[75vh] py-16 gap-12">
          {/* Space filler to push content down slightly on large screens */}
          <div className="hidden lg:block" />

          {/* Hero Top Content: Rebranding to premium creative studio */}
          <div className="max-w-4xl space-y-8 text-cream">
            <Reveal delay={0.1}>
              <span className="eyebrow text-brass tracking-[0.35em] block">{brandTagline}</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight leading-[1.05] tracking-tight text-cream">
                {heroTitle}
              </h1>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-lg sm:text-xl text-bone/85 max-w-3xl font-light leading-relaxed">
                {heroSubtitle}
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/calismalar"
                  className="rounded-xl bg-cream px-8 py-4.5 text-center text-sm font-semibold tracking-wider text-ink shadow-kx hover:bg-bone transition-all hover:shadow-kx-lg flex items-center justify-center gap-2 group"
                >
                  {tHero("cta")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/iletisim"
                  className="rounded-xl bg-transparent border border-cream/35 px-8 py-4.5 text-center text-sm font-semibold tracking-wider text-cream hover:bg-cream/10 transition-colors flex items-center justify-center"
                >
                  {tHero("ctaContact")}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Secondary stats section - smaller and editorial at the bottom of hero */}
          <Reveal delay={0.5} className="w-full border-t border-cream/20 pt-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {siteConfig.stats.map((stat, i) => (
                <div key={i} className="flex flex-col space-y-2 border-l border-cream/15 pl-6 first:border-0 first:pl-0">
                  <span className="font-display text-3xl font-light text-cream">{stat.num}</span>
                  <span className="text-xs uppercase font-mono tracking-widest text-brass">{stat.label[locale as "tr" | "en"]}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Social Proof Marquee */}
      <section className="w-full border-y border-line bg-cream/40 py-8 overflow-hidden select-none">
        <div className="flex w-[200%] animate-marquee">
          <div className="flex justify-around w-1/2 items-center">
            {brands.map((brand, i) => (
              <span key={i} className="font-display text-lg font-bold tracking-[0.2em] text-stone-soft opacity-70">
                {brand}
              </span>
            ))}
          </div>
          <div className="flex justify-around w-1/2 items-center">
            {brands.map((brand, i) => (
              <span key={i} className="font-display text-lg font-bold tracking-[0.2em] text-stone-soft opacity-70">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-4">
          <Reveal delay={0.1}>
            <span className="eyebrow text-stone">{tServices("title")}</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-ink leading-tight">
              {tServices("subtitle")}
            </h2>
          </Reveal>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {(store.services || []).map((srv, idx) => {
            const title = locale === "tr" ? srv.titleTr : srv.titleEn;
            const desc = locale === "tr" ? srv.descTr : srv.descEn;
            return (
              <Reveal key={srv.id || idx} delay={0.1 * idx}>
                <div className="bg-cream border border-line rounded-2xl p-8 hover:shadow-kx transition-all duration-300 h-full flex flex-col justify-between space-y-6 group">
                  <div className="space-y-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-clay/10 text-clay font-mono text-sm font-bold">
                      0{idx + 1}
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink group-hover:text-clay transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works (Koyu Bölüm) */}
      <section className="w-full bg-ink text-bone py-24 px-6 border-y border-line/10 relative">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <Reveal delay={0.1}>
              <span className="eyebrow text-brass">PROSES</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                {locale === "tr" ? "Nasıl Çalışıyoruz?" : "How It Works"}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <Reveal key={idx} delay={0.1 * idx}>
                <div className="space-y-4 relative group">
                  <div className="text-4xl font-light font-display text-brass/40 group-hover:text-brass transition-colors">
                    {step.num}
                  </div>
                  <h3 className="font-display text-lg font-bold text-cream">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-soft leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Sectors / Gallery */}
      <section className="mx-auto max-w-7xl px-6 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Reveal delay={0.1}>
            <span className="eyebrow text-stone">{tNav("works")}</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              {locale === "tr" ? "Hizmet Verdiğimiz Sektörler" : "Sectors We Serve"}
            </h2>
          </Reveal>
        </div>

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
      </section>

      {/* 6. Testimonials Section */}
      <section className="mx-auto max-w-7xl px-6 space-y-16 pt-16">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <Reveal delay={0.1}>
            <span className="eyebrow text-stone">{tTestimonials("title")}</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              {tTestimonials("subtitle")}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(store.testimonials || []).map((item, idx) => {
            const text = locale === "tr" ? item.textTr : item.textEn;
            const auth = locale === "tr" ? item.authorTr : item.authorEn;
            return (
              <Reveal key={item.id || idx} delay={0.1 * idx}>
                <div className="bg-cream border border-line rounded-2xl p-8 shadow-kx h-full flex flex-col justify-between space-y-6 relative">
                  <span className="absolute -top-5 left-6 text-6xl font-serif text-brass/20 pointer-events-none">“</span>
                  <p className="text-sm text-ink-soft italic leading-relaxed z-10">
                    {text}
                  </p>
                  <div className="border-t border-line/40 pt-4 text-xs font-semibold text-stone uppercase tracking-wider">
                    {auth}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 space-y-12">
        <div className="text-center space-y-4">
          <Reveal delay={0.1}>
            <span className="eyebrow text-stone">{tFaq("title")}</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              {tFaq("subtitle")}
            </h2>
          </Reveal>
        </div>

        <div className="space-y-6">
          {(store.faqs || []).map((faq, idx) => {
            const q = locale === "tr" ? faq.questionTr : faq.questionEn;
            const a = locale === "tr" ? faq.answerTr : faq.answerEn;
            return (
              <Reveal key={faq.id || idx} delay={0.1 * idx}>
                <div className="bg-cream border border-line rounded-xl p-6 space-y-2">
                  <h4 className="font-display text-lg font-bold text-ink">
                    {q}
                  </h4>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {a}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <div className="bg-clay text-cream rounded-xl2 p-12 lg:p-16 text-center space-y-8 relative overflow-hidden shadow-kx-lg">
            {/* Background geometric flare */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,151,117,0.15),transparent_60%)] pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream leading-tight">
                {tFinalCta("title")}
              </h2>
              <p className="text-sm sm:text-base text-cream/80 leading-relaxed">
                {tFinalCta("subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/iletisim"
                className="rounded-xl bg-cream px-8 py-4 text-sm font-bold text-clay hover:bg-cream/90 transition-colors shadow-kx flex items-center justify-center gap-2"
              >
                {tFinalCta("button")}
              </Link>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-cream/30 hover:border-cream bg-ink-soft/20 px-8 py-4 text-sm font-bold text-cream hover:bg-cream/10 transition-all flex items-center justify-center gap-2"
              >
                {tFinalCta("whatsapp")}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
