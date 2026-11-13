# Quizhane (çalışma adı)

Mekanlar için Türkçe, web tabanlı quiz gecesi platformu: host paneli, TV ekranı ve oyuncu telefonu. Uygulama indirmek ve oyuncu hesabı yok. Ürün adı `config/brand.ts` / `NEXT_PUBLIC_APP_NAME` ile değişir.

## Hızlı başlangıç
```bash
npm install
npm run demo          # örnek mekan + geçmiş geceler + kuponla http://localhost:3000
```
- Mekan paneli: `demo@quizhane.local` / `demo-sifre-123` (Marka planı, admin yetkili) → `/panel`, `/admin`
- Kayıt olmadan: ana sayfada **Demo gece başlat** (ücretsiz plan, hızlı gece) ya da `/demo` (tarayıcıda 5 soru)
- Host panelinden TV bağlantısını aç, telefonla QR'ı okut.

Sıfırdan: `cp .env.example .env.local` ve değerleri doldur. Yalnızca `npm run dev` ile de çalışır (e-posta gönderilmez, bağlantılar geliştirmede yanıtta görünür).

## Komutlar
| Komut | Ne yapar |
|---|---|
| `npm test` | 52 birim testi: normalizasyon, durum makinesi, puanlama, modlar, bahis/joker/hız/tahmin, kaptan devri, plan kapıları, ödeme, kupon, AI ayrıştırma, SVG, hız sınırı, hesap |
| `npm run typecheck` / `npm run lint` | Statik kontrol |
| `npm run build && DB_MEMORY=1 EXPOSE_DEV_LINKS=1 NEXT_PUBLIC_APP_URL=http://localhost:3100 npx next start -p 3100` | E2E için sunucu |
| `npm run e2e` | Playwright: host + TV + 2 takım (4 telefon), kaptan düşmesi/devri, itiraz, plan kapısı |
| `npm run e2e:i18n` | İngilizce arayüz taraması: tüm ekranlar + ekran görüntüleri, kalan Türkçe metin = hata |
| `node e2e/a11y.mjs` | axe-core erişilebilirlik taraması |
| `npm run e2e:security` | 25 kontrollü güvenlik ve işlev denetimi (canlı sunucuya) |
| `npm run loadtest` | 40 takım / 200 oyuncu / TV / host yük testi |

## Mimari (kısa)
- Next.js 16 (App Router), TypeScript, Tailwind 4. Fontlar `@fontsource-variable` ile self-host (Big Shoulders Display + Hanken Grotesk).
- **Sunucu otoriter** oyun motoru `src/lib/engine` (saf TS, testli). Süre/kilit sunucu saatiyle; istemci saat farkını ölçer. Cevap hiçbir istemciye kilitten önce gitmez.
- Gerçek zamanlı: SSE (`/api/games/[id]/events`), yayınlar 120 ms'de toplanır.
- Canlı oyunlar **bellek içi**; hesaplar/içerik/geçmiş `DATA_DIR/db.json` (tek süreç). Bkz. KNOWN_LIMITS.md → Ölçekleme.
- Plan kapıları: `config/plans.ts` + `can()`; sunucuda uygulanır.

Belgeler: `SUNUM.md` (mekanlara nasıl sunulur), `DESIGN.md`, `DECISIONS.md`, `DEPLOY.md`, `KNOWN_LIMITS.md`, `TEST_REPORT.md`.

## Eğlence turları
Gece şablonlarında (Eğlence gecesi, Zamana karşı seri, Sessiz gece, Saçma cevap, Sahte cevap, Tahmin yarışı, Emoji tahmini) ve aralara eklenebilen turlar:
- **Zamana karşı seri:** her soruda süre 2 sn kısalır (en az 8 sn); art arda doğru bilen takım ×1,25 / ×1,5 / ×1,75 / ×2 çarpan kazanır.
- **Sessiz tur:** konuşmak yasak; çoğunluk modu zorlanır, süre en çok 20 sn.
- **Sahte cevap (Pro+):** takımlar gerçeğe benzeyen yalan cevap yazar; karışık listeden gerçeği bulana puan, cevabına kananlar yazara yarım puan.
- **Saçma cevap (Başlangıç+):** doğru cevap yok; takımlar komik cevap yazar, birbirlerinin cevabına oy verir (oy başına yarım puan).
- **Tahmin yarışı:** en yakın tahmin kazanır, tam isabet ×1,5.
- **Emoji tahmini:** film, animasyon, dizi, ülke.
- **Joker ve sabotaj:** her takım oyun başına bir joker (×2 ya da yarı yarıya) ve bir sabotaj (rakibin o soruda kazancı yarıya iner) kullanır.
İçerik `src/lib/content/fun.ts` içindedir (ana havuzdan ayrıdır, klasik gecelerde çıkmaz); hepsinin İngilizcesi vardır.

## Dil (Türkçe / English)
Sağ üstteki **TR | EN** düğmesi tüm arayüzü değiştirir (kayıtlı tercih; oyun İngilizce açıldıysa TV ve telefonlar otomatik İngilizceye geçer). Soru havuzu tektir ve iki dillidir: her sorunun, şıklarıyla birlikte birebir İngilizce karşılığı vardır; oyuncu, host ve TV kendi dilini ayrı seçebilir, sorular aynı sıra ve aynı doğru cevapla o dile döner (cevaplar sunucuda tek dile çevrilerek değerlendirilir).

## Docker
`docker compose up -d --build` (`.env` gerekir; veri `quizhane-data` birimindedir).
