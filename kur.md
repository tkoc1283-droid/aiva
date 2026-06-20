# KUR.md — KURIXA sitesini sıfırdan kurma talimatı

Bu dosya, bir AI'a (Claude/Antigravity) **"bunu kur"** dendiğinde bu sitenin **aynısını** kurmak için izlenecek adımları verir. İçerik/özellik tarifi için yanındaki **`portfolyo.md`**'yi oku.

> **Bu iki dosya (`kur.md` + `portfolyo.md`) kendi kendine yeter** — başka hiçbir dosyaya, repoya veya önceki sohbete gerek yoktur. Çalışma zamanı & hata ayıklama kuralları bu dosyanın sonundaki **"Ek A"** bölümündedir. Marka metinleri/görselleri/iletişim bilgileri **kendi bilgilerinle** doldurulur; yapı ve tasarım birebir aynı kalır.

> **Önce oku:** Bu Next.js sürümü (16) eğitim verinden farklı olabilir. Kod yazmadan önce `node_modules/next/dist/docs/01-app/` içindeki ilgili rehbere bak (route handler, server actions, `cookies()`, i18n).

---

## 0. Ön koşullar
- Node.js 20+
- Cloudinary hesabı (ücretsiz yeterli) — görsel/video barındırma
- (Canlı için) Vercel hesabı + Upstash KV (ücretsiz) — panel kalıcılığı

## 1. Projeyi oluştur
```bash
npx create-next-app@latest kurixa --typescript --app --tailwind --eslint --src-dir --turbopack
cd kurixa
```
Sürümleri sabitle (`package.json`): `next@16.2.6`, `react@19.2.4`, `react-dom@19.2.4`.

## 2. Bağımlılıklar
```bash
npm i next-intl@^4.12 cloudinary@^2.10 motion@^12 lucide-react
npm i -D @tailwindcss/postcss tailwindcss playwright
```
`package.json > scripts`:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "shot": "node scripts/screenshot.mjs",
  "upload": "node --env-file=.env.local scripts/upload-cloudinary.mjs"
}
```

## 3. Ortam değişkenleri — `.env.local`
```bash
# Cloudinary (yükleme + URL üretimi için ZORUNLU)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Admin paneli parolası (canlıda MUTLAKA tanımla; yoksa geçici "kurixa-admin")
ADMIN_PASSWORD=guclu-bir-parola

# Panel kalıcılığı — canlıda (Vercel) ZORUNLU; lokalde boş bırakılırsa store.json kullanılır
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# İletişim formu e-postası (opsiyonel; yoksa loga yazar)
RESEND_API_KEY=...
CONTACT_TO=sana@ulasacak.com
```
`.gitignore`: `.env*`, `/media-upload/*` (`!OKU.md`), `next-env.d.ts`.

## 4. Yapılandırma dosyaları

**`next.config.ts`** — next-intl plugin + Cloudinary/Unsplash görsel host'ları + Turbopack root:
```ts
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  images: { remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ] },
};
export default withNextIntl(nextConfig);
```

**`AGENTS.md`** (kök) — Next.js 16 uyarısı (birebir bu içerik):
```
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
node_modules/next/dist/docs/ before writing any code. Heed deprecation notices.
```
**`CLAUDE.md`** (kök) — ilk satırı `@AGENTS.md`, ardından bu dosyanın sonundaki **"Ek A"** bölümünü (mimari değişmezler + debugging kuralları) olduğu gibi yapıştır. Böylece kuracak AI aynı korkuluklara sahip olur.

## 5. i18n iskeleti (`src/i18n/`)
- `routing.ts` — `defineRouting({ locales:["tr","en"], defaultLocale:"tr", localePrefix:"always" })`.
- `navigation.ts` — `createNavigation(routing)` → `Link`, `redirect`, `usePathname`, `useRouter`.
- `request.ts` — `getRequestConfig` → `messages/${locale}.json` import et.
- `src/proxy.ts` — **Next 16 proxy konvansiyonu** (dosya adı `proxy.ts`, eski `middleware` değil):
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
export default createMiddleware(routing);
export const config = { matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"] };
```
- `messages/tr.json` & `messages/en.json` — namespace'ler: `Brand, Nav, Hero, SocialProof, WorkIndex, SectorPage, Services, Testimonials, Faq, FinalCta, About, Contact, Footer, Common`. (`SectorPage` içinde `videos`, `images`, `empty`, `back`, `cta*` anahtarları gerekir.)

## 6. Tasarım sistemi (`src/app/globals.css`)
`@import "tailwindcss";` ardından `@theme { … }` ile `portfolyo.md §3`'teki renk/gölge/radius değişkenlerini, `@theme inline` ile font değişkenlerini tanımla. Ek sınıflar: `.font-display`, `.eyebrow`, `.grain::before` (SVG grain), `.link-underline`, `.animate-marquee` (+ `@keyframes kx-marquee`, `kx-rise`), `:focus-visible`, `a/button:active` spring, `prefers-reduced-motion`, `video:fullscreen`.

## 7. Layout & fontlar (`src/app/[locale]/layout.tsx`)
`next/font/google`'dan **Fraunces** (display, italic+axes), **Archivo** (sans), **JetBrains_Mono** (mono) yükle → CSS değişkenleri. `NextIntlClientProvider` + `Navbar` + `main` + `Footer` + `WhatsAppButton`. `generateStaticParams` ile locale'leri üret; `hasLocale` kontrolü + `setRequestLocale`. Metadata (title template, description, OG, icons).

## 8. İçerik katmanı (sıra önemli)
`portfolyo.md §8`'deki tipleri birebir uygula:
1. `src/data/sectors.ts` — tipler + `baseSectors` (4 sektör) + `uploads.json` birleştirme + `getSector`/`sectorSlugs`.
2. `src/data/uploads.json` — `{}` ile başla (script doldurur).
3. `src/lib/media.ts` — `imageUrl/videoUrl/videoPoster` (Cloudinary dönüşümleri).
4. `src/lib/overrides.ts` — `AddedMedia, SectorOverride, CustomSector, Store`; `getStore/saveStore` (KV **veya** `store.json`, `normalize`); `applyOrderAndHidden`.
5. `src/lib/content.ts` — `getDisplaySectors`/`getDisplaySector` (taban + store birleştirme; tek başlık → `{tr,en}`).
6. `src/lib/auth.ts` — `ADMIN_COOKIE`, `sessionToken` (SHA-256), `checkPassword`, `isAuthed`.
7. `src/lib/cloudinary.ts` — `server-only`; `cloudinaryReady`, `slugify`, `uploadFile` (data-URI, `resource_type:auto`).

## 9. Public sayfalar & bileşenler
- Bileşenler: `portfolyo.md §5` listesi. **MediaGrid satır-bazlı grid** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start`), Videolar + Görseller **ayrı bölümler**, "Tümü" sekmesi YOK.
- Sayfalar: `portfolyo.md §4`. **Sektör verisi her zaman `getDisplaySectors`/`getDisplaySector` ile** (asla doğrudan `sectors`).

## 10. Admin paneli (`src/app/admin/`)
- `layout.tsx` — kendi `<html lang="tr">` root layout'u (Navbar/Footer yok), `robots: noindex`.
- `page.tsx` — `force-dynamic`; `isAuthed()` değilse `LoginForm`, değilse store'dan editör verisi kur (taban + custom sektörler, eklenenler dâhil; gizliler işaretli) → `AdminEditor`.
- `LoginForm.tsx` — `useActionState(login)` parola formu.
- `actions.ts` — `"use server"`; `login`, `logout`, `persistStore` (authed → `saveStore` → `revalidatePath("/", "layout")`).
- `AdminEditor.tsx` — `"use client"`; özellikler `portfolyo.md §7`: video/görsel **ayrı sürükle-bırak listeleri** (native HTML5 DnD + ok tuşları), satır içi **yeniden adlandırma**, **gizle/göster**, sürükle-bırak/**dosya seç ile yükleme**, **yeni sektör formu** (ad/açıklama/renk/kapak), custom sektör adı/açıklaması düzenleme, tek **Kaydet** → `persistStore` + **toast popup**. `order` = `[...video id, ...görsel id]`. **Yükleme: `uploadToCloudinary(file, folder)`** → `/api/admin/sign`'dan imza al → dosyayı **doğrudan** Cloudinary'ye yükle (Vercel 4.5 MB limitini bypass).
- `src/app/api/admin/sign/route.ts` — `runtime="nodejs"`, authed; `{publicId}` → `signUpload({public_id, timestamp})` ile imza döner. Dosya buradan GEÇMEZ.

## 11. İletişim API
`src/app/api/contact/route.ts` — JSON al, doğrula, `RESEND_API_KEY` varsa Resend, yoksa loga yaz.

## 12. Toplu medya yükleme (opsiyonel)
`scripts/upload-cloudinary.mjs` — `media-upload/<klasör>/...` → Cloudinary + `uploads.json`. `FOLDER_TO_SECTOR` ile klasör→sektör eşle. Çalıştır: `npm run upload`.

## 13. Marka uyarlaması
`src/config/site.ts` (`siteConfig`: ad, url, email, whatsapp, phone, socials, stats) ve `messages/*.json` metinlerini markaya göre düzenle.

## 14. Doğrula
```bash
npx tsc --noEmit                 # tip
npm run build                    # tüm sayfalar üretilmeli; /admin + /api/admin/* dinamik (ƒ)
npm run dev                      # http://localhost:3000
# curl ile durum: /admin → 200 (login), /tr/calismalar → 200
```
**Not:** `Navbar.tsx`/`VideoPlayer.tsx` lint uyarıları bu projede bilinen/zararsızdır.

## 15. Deploy (Vercel)
1. Repoyu Vercel'e bağla.
2. Ortam değişkenlerini ekle (§3) — **canlıda `ADMIN_PASSWORD` ve KV zorunlu** (dosya sistemi salt-okunur).
3. Vercel'den Upstash KV (Marketplace) ekle → `KV_REST_API_URL` + `KV_REST_API_TOKEN` otomatik gelir.
4. Deploy. `/admin` → parolayla gir → içerik yönet. Panel kaydı `revalidatePath` ile siteyi tazeler.

---

## Ek A — Çalışma zamanı değişmezleri & debugging kuralları
> Bu bölümü kurulan projenin `CLAUDE.md`'sine (`@AGENTS.md` satırının altına) yapıştır.

### Mimari — içerik katmanı
İçerik iki kaynaktan birleşir, bu ayrımı bozma:
1. **Kod içi taban** — `src/data/sectors.ts` (+ `uploads.json`). Çalışma zamanında ASLA değişmez.
2. **Panel store** — `src/lib/overrides.ts`: `order`, `hidden`, `titles`, `added` (panelden yüklenen) ve `custom` (yeni sektörler). Saklama: KV varsa Upstash REST, yoksa `src/data/store.json`. **Vercel'de dosya salt-okunur → canlıda KV şart.**
3. **Birleştirme** — `src/lib/content.ts`: `getDisplaySectors()` / `getDisplaySector(slug)`.

**Kural:** Public sayfalar sektör verisini **mutlaka `getDisplaySectors`/`getDisplaySector`** ile alır — `sectors`/`getSector`'ı doğrudan kullanma, yoksa panel düzenlemeleri siteye yansımaz.

### Değişmezler
- **Medya URL'leri** her zaman `src/lib/media.ts` üzerinden → Cloudinary `f_auto,q_auto,w_,c_limit` ile **küçültülmüş** sürüm. Orijinal tam boy asla doğrudan gösterilmez. Kart `w_1000`, panel önizleme `w_400`.
- **Video ve görseller her yerde AYRI** gösterilir/sıralanır. Sektör sayfasında "Tümü" sekmesi YOK; önce **Videolar** sonra **Görseller** bölümü. Panelde iki ayrı sürükle-bırak listesi. `order` = `[...video id, ...görsel id]`.
- **Medya ızgarası satır-bazlı grid** (`grid grid-cols-… items-start`), masonry/`columns` değil — sıra 1 sol üstte, sıra 2 sağında (soldan sağa).
- **Başlık tek alan**: panelde bir isim → public'te hem `tr` hem `en`.
- **Silme = gizleme**: Cloudinary'den hiçbir şey silinmez, sadece `hidden`'a eklenir.
- **Admin auth**: parola + imzalı `httpOnly` çerez (SHA-256). Parola `ADMIN_PASSWORD` env. Yazma işlemleri server-side `isAuthed()` ile korunur (server action + upload route).
- **Tek "Kaydet"**: `AdminEditor` → `persistStore(store)` → `saveStore` + `revalidatePath("/", "layout")`; sonrasında toast (popup).
- **Admin locale dışı** (`/admin`); `src/proxy.ts` matcher'ı `admin`'i hariç tutar; admin kendi root layout'una sahip (Navbar/Footer yok).

### Debugging kuralları
1. **Next.js 16 farklıdır.** API kullanmadan önce `node_modules/next/dist/docs/01-app/` rehberini oku (route handler, server action, `cookies()`, `revalidatePath`, i18n).
2. **Değişiklikten sonra:** `npx tsc --noEmit` → gerekirse `npm run lint`.
3. **Doğrulama:** `npm run dev` → `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<yol>`. `/admin` 200 (login), public sayfalar 200 dönmeli.
4. **Public sayfalar SSG'dir.** Panel kaydından sonra `revalidatePath` tazeler ama **açık tarayıcı sekmesi elle yenilenmeli**. Yeni custom sektör slug'ı `dynamicParams` ile talep anında render olur.
5. **Yükleme/kapak** için `.env.local`'de Cloudinary üç değişkeni dolu olmalı, yoksa "Cloudinary yapılandırılmamış" döner.
6. **`store.json` yereldir**; canlıda KV kullan.
7. **Build kanıtı:** Büyük değişiklikte `npm run build` → tüm sayfalar üretilmeli, `/admin` + `/api/admin/*` dinamik (ƒ) olmalı.
