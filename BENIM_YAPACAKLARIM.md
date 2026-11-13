# Yayın öncesi benim (sahibin) yapacaklarım

Kod tarafı hazır; aşağıdakiler kod dışı ve senin yapman gereken işler. Sıra, önem sırasıdır.
Hukuki notlar bir hukuk görüşü değil, kontrol listesidir; avukatına bu dosyayı ve `src/lib/legal.ts` içindeki güncel metinleri ver.

## A. Olmazsa yayın yapma (engelleyiciler)
1. **Sunucu + alan adı + HTTPS.** `DEPLOY.md` adımları; `NEXT_PUBLIC_APP_URL` https adresin olmalı. Kalıcı disk (`DATA_DIR`).
2. **Gerçek ödeme.** iyzico başvurusu (şahıs: vergi levhası + IBAN), sandbox'ta entegrasyon, canlıda 1 TL deneme + iade. Kod tarafında iyzico hâlâ iskelet (`src/lib/server/billing.ts`); sahte ödeme sağlayıcısıyla yayına çıkma. (Bunu yazmamı istersen anahtarlar geldiğinde yapılır.)
3. **E-posta sağlayıcısı.** Resend (ya da benzeri), kendi alan adın, SPF/DKIM/DMARC; `RESEND_API_KEY`, `MAIL_FROM`. Olmazsa kayıt doğrulama ve şifre sıfırlama çalışmaz.
4. **Zamanlanmış işler.** Dış cron ile günde bir: `/api/cron/billing`, `/api/cron/purge`, `/api/cron/reminders` (`CRON_SECRET` ile). `purge` çalışmazsa KVKK metnindeki 30 günlük anonimleştirme ve 24 saatlik bellek temizliği **uygulanmaz**.
5. **Yasal kimlik.** `NEXT_PUBLIC_COMPANY_NAME` (ad-soyad/işletme adı), `_ADDRESS`, `_EMAIL`, `_KEP` (varsa), `_VERBIS` (varsa). Boşsa hukuki sayfalarda "avukat incelemeli" uyarısı görünür.
6. **Vergi/ticari statü.** Düzenli abonelik geliri için şahıs işletmesi mükellefiyeti ve fatura düzeni (mali müşavir). E-arşiv/e-fatura entegratörü.
7. **Avukat onayı.** Metinler: kullanım koşulları, KVKK aydınlatma, gizlilik, çerez, veri işleme sözleşmesi (`/sozlesme`), ön bilgilendirme/iade (`/satis`). Onaydan sonra `LEGAL_VERSION` değerini güncelle (kayıtta kabul edilen sürüm saklanır).
8. **Yedekleme.** `db.json` için günlük yedek (şifreli, erişim kontrollü), geri yükleme denemesi.

## B. Hukuk ve uyum (avukatla netleştir)
- **VERBİS:** şahıs veri sorumlusu olarak kayıt yükümlülüğü eşiklerine girip girmediğin (muafiyet). Muaf olsan da aydınlatma ve veri işleme sözleşmesi gerekir.
- **Yurt dışı aktarım (KVKK m.9):** Resend, barındırma, (kullanırsan) Anthropic için standart sözleşme + Kurum bildirimi süreci. Alt işleyen listesini hazırla (veri işleme sözleşmesinde "talep üzerine" vaat edildi).
- **Veri ihlali prosedürü:** sözleşmede mekana 48 saat içinde bildirim vaat edildi. Kendin için kısa bir olay müdahale notu hazırla (kim, nasıl, hangi e-posta).
- **Fatura saklama:** hesap silinince faturalar `retainedInvoices` altında tutulur; yasal süre (vergi/ticaret mevzuatı) için yedeklerde de saklanmalı.
- **Ödül/çekiliş/bahis:** platform ödül dağıtmaz; mekanlara "şansa dayalı çekiliş izne tabi olabilir" uyarısı koşullarda var. Mekan başına ödül kuralı sorarlarsa avukatın hazır cevabı olsun.
- **Marka:** "Quizhane" adını TÜRKPATENT'te ve alan adı olarak kontrol et; değiştirmek istersen `NEXT_PUBLIC_APP_NAME`.
- **Soru/telif:** film, şarkı, kitap adları olgu olarak kullanılır; logo, afiş, albüm kapağı, ses/video eklemiyoruz. Emoji turu yalnız emoji kullanır. Mekanların kendi yükledikleri içerik sorumluluğu koşullarda mekana verilmiştir.
- **Çerez:** yalnız zorunlu oturum çerezi; analitik/reklam eklersen banner ve yeni onay gerekir.
- **Ticari ileti:** pazarlama e-postası göndereceksen İYS kaydı ve ayrı onay (şu an kod pazarlama e-postası göndermiyor).
- **Ekip davetleri:** davetle oluşturulan host hesapları için ayrı koşul kabul adımı yok; hesap sahibi sorumluluğu koşullarda var, avukat yeterli bulmazsa ek adım isteyebilir.

## C. Operasyon
- **Tek süreç:** iki örnek çalıştırma; dağıtım/yeniden başlatmada devam eden oyunlar ve açık oturumlar kaybolur. Etkinlik saatleri dışında dağıt. (Kapasite: 40 takım/200 oyuncuda p95 yayın gecikmesi ≈ 0,5 sn.)
- **Dosya veritabanı:** büyüyünce Postgres'e geçiş (`YAYIN_REHBERI.md`).
- **İzleme:** uptime kontrolü (`/api/health`), bellek, 5xx; hata bildirimi (ör. Sentry) isteğe bağlı.
- **Destek kutusu:** `NEXT_PUBLIC_SUPPORT_EMAIL` gerçek ve izlenen bir adres olsun (KVKK başvuruları 30 gün).
- **Gerçek cihaz testi:** eski akıllı TV tarayıcıları ve iOS Safari'de bir deneme gecesi yap (otomasyon yalnız Chromium).
- **Deneme gecesi:** ilk gerçek geceden önce bir arkadaş mekanda "Eğlence gecesi" şablonuyla prova; özellikle sahte/saçma cevap oylamasını 6+ takımla dene.
- **Moderasyon:** saçma/sahte cevaplarda küfür filtresi kabadır; uygunsuz cevap çıkarsa host soruyu "hatalı say" ile iptal eder.

## D. İçerik
- **Soru doğruluğu:** ana havuzun büyük kısmı bilgi birikimine dayanır; futbol, spor, tarih, kültür, genel ve 2025–2026 gündemi ayrı turlarda web kaynaklarıyla çapraz kontrol edildi. Yine de her yılsonunda Gündem satırlarını güncelle ve kullanıcılardan gelen "hatalı soru" bildirimlerini (`/admin`) düzenli işle.
- **İngilizce metinler:** yapay zekâ çevirisi; anadili İngilizce olan biri bir kez okusun (özellikle şıklar ve özel adlar). Hukuki metinlerin İngilizcesi kolaylık çevirisidir.
- **2026 Nobel sonuçları** bilerek eklenmedi; doğrulayınca `sets/gundem.ts` ve `sets/edebiyat.ts` içine eklenebilir.

## E. Sonra (istersen)
- iyzico/Stripe canlı entegrasyonu (anahtarlar gelince), Postgres geçişi, mekan görseli arka planı, resim turu içeriği, Android/iOS gerçek cihaz testi, eğlence içeriğini (emoji/saçma/sahte cevap) birkaç yüz soruya çıkarma.
