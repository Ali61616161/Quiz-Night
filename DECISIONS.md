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
