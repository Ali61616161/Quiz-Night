# Kararlar

- Ürün adı `config/brand.ts` + `NEXT_PUBLIC_APP_NAME`; varsayılan "Quizhane".
- Next.js 16 + TS + Tailwind 4; fontlar `@fontsource-variable` ile self-host (`next/font/google` build'de ağ ister).
- **Gerçek zamanlı:** Supabase Realtime yerine SSE. Her görünüm role göre süzülür. Yayınlar 120 ms'de toplanır (yük testinde cevap p50 2,6 sn → 0,2 sn).
- **Depo:** Supabase uygulamaya bağlanmadı. Canlı oyunlar bellek içi; hesaplar/içerik/geçmiş JSON dosyasında (atomik yazım). Supabase şeması ve RLS `supabase/migrations/0001_init.sql`'de taslak olarak duruyor (kod tarafından kullanılmıyor).
- **Kimlik:** e-posta + şifre (scrypt), e-posta doğrulaması zorunlu, HttpOnly/SameSite=Lax oturum çerezi, bellek içi oturum. Şifre sıfırlama ve hesap silme var. Ekip üyeleri/davet yok (tek sahip).
- **Host/TV/oyuncu yetkisi:** oyun başına rastgele token. TV token'ı host'tan yenilenebilir (eski akış kapanır).
- **Takım modları:** Kaptan (varsayılan), Çoğunluk (beraberlikte kaptan, sonra ilk oy), Bireysel (ortalama ya da toplam). Mod soru açılırken kilitlenir. Tek üyeli takım kaptan gibi çalışır.
- **Kaptan devri:** 15 sn görünmezlik (SSE bağlantısı = varlık) ya da kaptanın isteğiyle.
- **Puanlama:** doğru 100; hız turunda sıraya göre %100→%30 (−%10/sıra); bahis ± bahis tutarı (en çok max(puan, 50)); joker doğru cevabı ×2; tahminde en yakın (beraberlik paylaşır); bireyselde ortalama. Host düzeltmesi ve "hatalı soru" puanı anında yeniden hesaplar.
- **Soru havuzu:** `src/lib/content/facts.ts` olgu tablolarından üretilir (açık uçlu, çoktan seçmeli, sıralama, eşleştirme, tahmin); testler cevap sızıntısını, tekrarları ve geçerliliği doğrular. Şarkı sözü/telifli metin yok. Seçenekler tohumlu rastgele, deterministik.
- **Mekan başına görülmüş soru:** reveal'da kaydedilir; havuz azalınca host'a uyarı.
- **Plan kapıları** oyun kurulurken (`createVenueGame`) ve eylem anında sunucuda; oyun, kurulduğu plana göre yaşar. Plan düşünce özellikler kapanır, veri silinmez.
- **Lig:** takım kimliği normalize takım adı (kalıcı takım kodu yerine). Puan: 10/7/5/3/2/1.
- **Afiş:** tarayıcı yazdırma → PDF (sunucuda PDF üretimi yok).
- **Ödeme:** `BillingProvider` arayüzü, sahte sağlayıcı (token "fail" ile biterse reddeder), iyzico yalnızca iskelet. KDV %20.
- **AI:** Anthropic Messages API (sunucu), Zod şeması, mükerrer kontrolü, taslak→mekan onayı. Anahtar yoksa temiz hata.
- **Retention:** 30 gün sonra (ayarlanabilir) oyun geçmişindeki takım adları anonimleşir.
- **i18n:** `messages/tr.json` + `en.json` ve `t()` altyapısı var; metinlerin çoğu henüz bileşenlerde sabit.

## Soru havuzu v2
- `src/lib/content/gen.ts` + `sets/*.ts`: olgu tablosu → soru üretici. Soruda kullanılan alan sütununda benzersiz değilse soru üretilmez (tek net cevap). Yanlış şıklar aynı cevap sütunundan; sayısal cevapta yakın sayılar.
- Soru metni cevabı içeriyorsa üretilmez (`leaks`). Soru kimliği içerik özetidir (veri düzenlense de görülmüş-soru kaydı bozulmaz).
- 14 konu: Coğrafya, Tarih, Bilim, Futbol, Spor, Dizi/Film, Müzik, Edebiyat, Sanat, Yemek, Oyun, Üniversite/Kampüs, Yerel, Genel Kültür. Her biri ≥250 (test).
- **Karışık gece:** her soruda konular arasında eşit şans (en az kullanılan konu önce), konu içinde alt konu dengesi. **Tematik gece:** yalnızca seçilen konu; o konuda o biçimde soru bitince aynı konudan şıklı/açık soru.
- **Tekrar yok:** mekanın görülmüş soru kaydı (reveal'da) tüm gece türlerinde ortaktır; önce görülmemiş soru, başka konudan bile olsa; ancak havuz tamamen tükenince tekrar. Havuz azalınca host'a uyarı.

## Soru havuzu v3, dil, ekip
- 17 konu (Gündem 2000-2026, Teknoloji, Doğa ve Hayvanlar eklendi). Çoktan seçmelide yanlış şıklar benzerlik puanıyla seçilir (aynı harf/uzunluk/kelime, aynı grup: kıta, bölge, ülke); sayısal cevapta yakın sayılar, gelecek yıl yok. Gündem'de "o yıl yaşanan olay" sorusunda şıklar aynı yıldan seçilmez.
- Tek iki dilli havuz: ayrı İngilizce havuz yoktur. Her soru `en` bloğu taşır (şıklar/öğeler/çiftler Türkçeyle aynı sırada). İstemci SSE'de `lang` gönderir; sunucu gösterimi o dile çevirir, gelen cevabı Türkçeye indirger (`canonAnswer`), açık cevaplar iki dilde de kabul edilir. İngilizce karşılıklar tablo sözlüğü + `sets-en/overlay.json` (Türkçe metne anahtarlı, şık/öğe uyumu doğrulanarak) ile gelir; `tests/bank.test.ts` her soruda İngilizce karşılık ve Türkçe sızıntısı olmadığını denetler.
- Arayüz dili: `I18nBoot` + çalışma zamanı DOM çevirisi (`i18n/dict.ts`, ~700 satır + dinamik kalıplar). Varsayılan Türkçe; seçim `localStorage`'da; oyun İngilizce açıldıysa ve kullanıcı seçim yapmadıysa TV/telefonlar otomatik geçer. TV'de düğme yok.
- Ekip: sahip host davet edebilir (şifre belirleme bağlantısı e-postayla); host oyun açar, abonelik/marka/davet/lig kapatma yalnızca sahibe.
- Dağıtım: Dockerfile (standalone çıktı), docker-compose, SUNUM.md.
