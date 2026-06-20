@AGENTS.md

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
