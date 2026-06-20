# PORTFOLYO.md — KURIXA sitesinin tam tarifi (blueprint)

Bu dosya, sitenin **ne olduğunu** (özellikler, tasarım, sayfalar, veri modeli) anlatır. Adım adım **kurulum** için yanındaki **`kur.md`**'ye bak (çalışma zamanı & hata ayıklama kuralları da kur.md'nin sonundaki **"Ek A"** bölümündedir).

> **Bu iki dosya (`portfolyo.md` + `kur.md`) kendi kendine yeter.** Başka hiçbir dosyaya, bu repoya veya önceki sohbete ihtiyaç olmadan, bir AI (Claude/Antigravity) bunlarla sitenin **aynısını** sıfırdan kurabilir. Marka metinleri, görseller ve iletişim bilgileri **kendi bilgilerinle** doldurulur — yapı, tasarım ve özellikler birebir aynı kalır.

---

## 1. Ürün özeti

**KURIXA**, moda ve perakende markalarına yönelik **yapay zekâ destekli görsel & video prodüksiyon stüdyosu** için portfolyo + B2B tanıtım sitesi. İki dilli (Türkçe varsayılan + İngilizce). Çalışmalar sektörlere ayrılır; her sektörde video ve görseller sergilenir. Sahibi, kod bilmeden içeriği yönetebilsin diye **parola korumalı bir admin paneli** vardır.

## 2. Teknoloji yığını (kesin sürümler)

| Katman | Seçim |
|---|---|
| Framework | **Next.js 16.2.6** (App Router, Turbopack) |
| Dil | TypeScript 5, React 19.2 |
| Stil | **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme`), PostCSS |
| i18n | **next-intl 4.12** (TR/EN, `localePrefix: "always"`) |
| Medya | **Cloudinary** (`cloudinary` ^2.10 SDK + URL dönüşümleri) |
| Animasyon | **motion** ^12 (Framer Motion'ın yeni adı) |
| İkonlar | **lucide-react** |
| Kalıcı veri (panel) | Upstash KV (REST) **veya** yerel `store.json` |
| Test/araç | Playwright (screenshot scripti) |
| Deploy | Vercel |

## 3. Tasarım sistemi

Atmosfer: **editöryel moda** — sıcak "kemik" kağıt, mürekkep siyahı, kil (zeytin/terracotta) ve pirinç vurgular. **Jenerik AI gradyanı YOK**, flat gölge YOK.

**Renkler** (`globals.css` `@theme` değişkenleri):
```
--color-bone: #e3e1cf      (arka plan)
--color-cream: #eeecdd     (kart yüzeyi)
--color-ink: #1c1f14       (metin/koyu bloklar)
--color-ink-soft: #353a27
--color-stone: #75775e     (ikincil metin)
--color-stone-soft: #a2a288
--color-clay: #6f7a39      (vurgu / CTA)
--color-clay-deep: #50571f
--color-brass: #9a8b4e
--color-line: #cac6ad      (kenarlık)
--radius-xl2: 1.75rem
```
**Gölgeler:** katmanlı, mürekkep tonlu `--shadow-kx` ve `--shadow-kx-lg` (flat değil).
**Easing:** spring `cubic-bezier(0.34,1.56,0.64,1)`.

**Tipografi** (`next/font/google`):
- Başlık (`--font-display` / `.font-display`): **Fraunces** (italic + SOFT/WONK/opsz axes)
- Gövde (`--font-sans`): **Archivo** (400–700)
- Etiket/mono (`--font-mono`, `.eyebrow`): **JetBrains Mono** (uppercase, letter-spacing 0.28em)

**Özel sınıflar / efektler:**
- `.eyebrow` — küçük, harf aralıklı uppercase mono üst-etiket
- `.grain::before` — ince SVG film greni dokusu (`mix-blend-mode: multiply`)
- `.link-underline` — hover'da soldan dolan alt çizgi
- `.animate-marquee` — sonsuz yatay kayan şerit (32s)
- `a/button:active { transform: scale(0.97) }` — spring geri-bas
- `:focus-visible` — clay renkli belirgin focus halkası
- `prefers-reduced-motion` ve `video:fullscreen { object-fit: contain }` desteği

## 4. Sayfalar (App Router, `src/app/[locale]/`)

Tümü iki dilli, `setRequestLocale(locale)` ile. URL deseni `/tr/...` ve `/en/...`.

1. **Ana sayfa** (`page.tsx`) — bölümler sırasıyla:
   1. Hero (asimetrik, sıcak ışık gradyanları, başlık + alt blok + istatistikler)
   2. Social proof marquee (kayan marka şeridi)
   3. Hizmetler (yapışkan başlık + ızgara kartlar)
   4. "Nasıl çalışır" (koyu `bg-ink` bölüm, 4 adım)
   5. Galeri / sektörler (3'lü ızgara, ortadaki kart `translate-y-8` ile kademeli) — **`getDisplaySectors()` ile**
   6. Referanslar (`Testimonials`)
   7. SSS (`Faq`)
   8. Final CTA (`bg-clay`, iletişim + WhatsApp)
2. **Çalışmalar** (`calismalar/page.tsx`) — sektör kartları ızgarası, **`getDisplaySectors()` ile**.
3. **Sektör detay** (`calismalar/[slug]/page.tsx`) — başlık + tagline + **MediaGrid** (Videolar bölümü, Görseller bölümü) + alt CTA. **`getDisplaySector(slug)` ile**. `generateMetadata` de `getDisplaySector` kullanır (custom sektörler için).
4. **Hizmetler** (`hizmetler/page.tsx`)
5. **Hakkımızda** (`hakkimizda/page.tsx`)
6. **İletişim** (`iletisim/page.tsx`) — `ContactForm` → `POST /api/contact`.

**Admin** (`src/app/admin/`, locale dışı, kendi root layout'u): bkz. §7.

## 5. Bileşenler (`src/components/`)

`Navbar`, `Footer`, `LocaleSwitcher` (TR/EN geçiş), `WhatsAppButton` (sabit), `Reveal` (scroll-in animasyon), `SectionHeading`, `Marquee`, `Testimonials`, `Faq`, `SectorCard` (kapak + isim + sayım, `next/image` + `imageUrl`), `MediaCard` (görsel `next/image` `w_1000`, video `VideoPlayer`; hover'da başlık caption), `MediaGrid` (Videolar/Görseller ayrı satır-bazlı grid), `VideoPlayer`, `ContactForm`.

## 6. i18n

- `src/i18n/routing.ts` — `locales: ["tr","en"]`, `defaultLocale: "tr"`, `localePrefix: "always"`.
- `src/i18n/navigation.ts` — locale-farkında `Link`, `redirect` vb.
- `src/i18n/request.ts` — `messages/${locale}.json` yükler.
- `src/proxy.ts` — **Next.js 16 "proxy"** (eski middleware), `createMiddleware(routing)`. Matcher `api|admin|_next|_vercel|.*\..*`'i hariç tutar.
- Mesajlar: `messages/tr.json` & `messages/en.json`. Üst seviye namespace'ler: `Brand, Nav, Hero, SocialProof, WorkIndex, SectorPage, Services, Testimonials, Faq, FinalCta, About, Contact, Footer, Common`.

## 7. Admin paneli (`/admin`)

Sahibinin kod bilmeden içerik yönetmesi için. Tüm yetkiler:

- **Giriş:** parola formu (`LoginForm`) → `login` server action → imzalı `httpOnly` çerez (30 gün). Parola `ADMIN_PASSWORD` env, yoksa geçici `kurixa-admin`. Çerez değeri parolanın SHA-256 özetidir.
- **Yeni sektör ekle:** ad, kısa açıklama, vurgu rengi (color picker) + **kapak görseli yükleme**. Slug, addan Türkçe-güvenli üretilir, çakışmazsa benzersizleştirilir. Custom sektörün adı/açıklaması sonradan başlık satırından düzenlenebilir.
- **Medya yönetimi (sektör başına):**
  - **Videolar** ve **Görseller** iki ayrı liste; her biri kendi içinde **sürükle-bırak** (+ ok tuşları) ile sıralanır.
  - **Sürükle-bırak veya "dosya seç"** ile yeni görsel/video yükleme → `POST /api/admin/upload` → Cloudinary.
  - Her medyanın **başlığı satır içi düzenlenir**.
  - **Gizle/Göster** (göz ikonu) = siteden kaldırma (Cloudinary'de kalır).
  - Panelden yeni yüklenmiş, henüz kaydedilmemiş öğe için **listeden çıkar** (çöp) butonu.
- **Tek "Kaydet"** butonu → `persistStore` → tüm değişiklikler tek seferde kaydedilir, **toast (popup)** ile sonuç bildirilir, public sayfalar revalide edilir.

## 8. Veri modeli

**Kod içi taban** (`src/data/sectors.ts`):
```ts
type I18nText = { tr: string; en: string };
type MediaType = "video" | "image";
interface MediaItem { id; type; src; poster?; ratio?: "9:16"|"1:1"|"4:5"|"3:4"|"16:9"; title?: I18nText }
interface Sector { slug; name: I18nText; tagline: I18nText; cover; accent; media: MediaItem[] }
```
- `sectors` = `baseSectors` + `uploads.json` (otomatik birleşir, `src` ile tekilleştirme).
- Başlangıç 4 sektör: `gelinlik-abiye`, `taki-aksesuar`, `cocuk-giyim`, `ic-giyim`.

**Panel store** (`src/lib/overrides.ts`):
```ts
interface AddedMedia { id; type; src; ratio?; title: string }          // tek başlık
interface SectorOverride { order: string[]; hidden: string[]; titles?: Record<string,string>; added?: AddedMedia[] }
interface CustomSector { slug; name: string; tagline: string; cover: string; accent: string }  // tek başlık
interface Store { overrides: Record<string, SectorOverride>; custom: CustomSector[] }
```
- `getStore()/saveStore()` — KV (`kurixa:store`) ya da `src/data/store.json`. `normalize()` eski/eksik biçimi toparlar.
- `applyOrderAndHidden(items, ov)` — önce `hidden` çıkarır, sonra `order` sırasına göre **stabil** dizer (order'da olmayanlar sona).

**Birleştirme** (`src/lib/content.ts`): `applyOverride` = eklenenleri kat → başlıkları uygula → sırala/gizle. Custom sektör tek başlığı `{tr,en}`'e açılır.

**Medya URL** (`src/lib/media.ts`): `imageUrl(src,w)` → `f_auto,q_auto,w_{w},c_limit`; `videoUrl` → `f_auto,q_auto`; `videoPoster` → `so_0.jpg`. `src` tam URL veya `/public` yoluysa olduğu gibi kullanılır.

## 9. API & sunucu

- `POST /api/contact` — iletişim formu. `RESEND_API_KEY` varsa Resend ile e-posta, yoksa loga yazar (form yine çalışır). Alıcı `CONTACT_TO` veya `siteConfig.email`.
- `POST /api/admin/sign` — `runtime="nodejs"`, **authed**. Gövde `{ publicId }` → imzalı yükleme parametreleri döner: `{ timestamp, signature, apiKey, cloudName, publicId }`. **Dosya buradan geçmez.** Tarayıcı bu imzayla dosyayı **doğrudan** `https://api.cloudinary.com/v1_1/<cloud>/auto/upload`'a yükler (Vercel'in 4.5 MB istek gövdesi limitini bypass eder; büyük video/görseller yüklenebilir). public_id = `kurixa/<klasör-slug>/<dosya-slug>-<rastgele>`.
- Server actions (`src/app/admin/actions.ts`): `login`, `logout`, `persistStore`.
- `src/lib/cloudinary.ts` — `server-only`, SDK config + `signUpload` (`cloudinary.utils.api_sign_request`) + `cloudName`/`apiKey` + `slugify` + en-yakın oran. İmzalanan parametreler tarayıcının gönderdiğiyle birebir aynı olmalı (`public_id`, `timestamp`).

## 10. Yapılandırma & toplu yükleme

- `src/config/site.ts` — `siteConfig` (ad, url, email, whatsapp, phone, socials, hero stats). Markaya göre değiştirilir.
- `next.config.ts` — `next-intl` plugin + `images.remotePatterns`: `res.cloudinary.com`, `images.unsplash.com`. Turbopack `root` sabitlenir.
- **Toplu yükleme** `scripts/upload-cloudinary.mjs` (`npm run upload`): `media-upload/<klasör>/...` → Cloudinary + `uploads.json`. `FOLDER_TO_SECTOR` eşlemesi klasörü sektöre bağlar. `media-upload/` git'e gitmez.

## 11. Dosya ağacı (özet)

```
src/
  app/
    [locale]/{page,layout}.tsx, calismalar/{page,[slug]/page}.tsx,
             hizmetler/, hakkimizda/, iletisim/ page.tsx
    admin/{layout,page,LoginForm,AdminEditor,actions}.tsx|ts
    api/contact/route.ts, api/admin/upload/route.ts
    globals.css, favicon.ico
  components/  (bkz. §5)
  config/site.ts
  data/sectors.ts, uploads.json, store.json(yerel)
  i18n/{routing,navigation,request}.ts
  lib/{auth,cloudinary,content,media,overrides}.ts
  proxy.ts
messages/{tr,en}.json
scripts/{upload-cloudinary,screenshot}.mjs
next.config.ts, postcss.config.mjs, eslint.config.mjs, tsconfig.json
```
