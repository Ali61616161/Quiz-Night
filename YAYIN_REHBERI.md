# Yayın rehberi: ödeme, e-posta, tek süreç, dosya veritabanı, hukuk

Bu belge, kodda "henüz yok / sınırlı" olan dört iş kalemini ve yayın öncesi hukuk kontrolünü tek yerde toplar.
Avukatınızın incelediği metinlerle birlikte okuyun; buradaki hukuki notlar bir hukuk görüşü değildir, kontrol listesidir.

## 1. iyzico (ödeme)

Durum: `src/lib/server/billing.ts` içinde iyzico yalnızca iskelettir; `BILLING_PROVIDER=iyzico` yapılırsa
"entegrasyon tamamlanmadı" hatası döner. Varsayılan sağlayıcı sahte (fake) ve sadece geliştirme içindir.
**Sahte sağlayıcıyla canlıya çıkmayın** (`NODE_ENV=production` iken sahte sağlayıcı uyarı verir).

Yapılacaklar (sırayla):
1. iyzico ticari hesap başvurusu: şirket belgeleri, vergi levhası, IBAN, web sitesi (kullanım koşulları, gizlilik, iade/iptal, mesafeli satış sayfaları zorunlu bulunur). Onay günler sürebilir.
2. Sandbox anahtarlarıyla (`sandbox-api.iyzipay.com`) **Checkout Form** (kart verisi sunucunuza hiç uğramaz; PCI yükü düşer) akışını bağlayın: `initialize` → kullanıcıyı iyzico formuna yönlendir → `callbackUrl` → `retrieve` ile sonucu **sunucuda doğrula** (istemciye güvenme).
3. Abonelik için iyzico Abonelik (Subscription) API'si ya da kendi yenileme cron'unuz (`/api/cron/*`): ürün/plan oluştur, ödeme planı, kart saklama. Başarısız ödemede 3 deneme + bildirim + dönem sonunda plan düşürme (verileri silmeden).
4. Webhook/callback: imza doğrulama, idempotency (aynı olay iki kez gelirse tek işlem), ödeme kaydı `payments` tablosunda.
5. Testler: iyzico yanıtlarını taklit eden (mock-fetch) birim testleri; sandbox'ta uçtan uca bir deneme; canlıda 1 TL gerçek işlem + iade.
6. Fatura: e-Arşiv/e-Fatura için bir entegratör (Paraşüt, Logo, Foriba vb.) ya da mali müşavir süreci; KDV oranı ve "KDV dahil" gösterimi.
7. Alternatifler: PayTR, Param, Stripe (Türkiye'de şirket için sınırlı). Aynı `BillingProvider` arayüzü korunur.

Gizli anahtarlar yalnızca ortam değişkeninde (`IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`) tutulur; repoya girmez.

## 2. E-posta sağlayıcısı

Durum: `mail.ts`, `RESEND_API_KEY` ve `MAIL_FROM` varsa Resend HTTP API ile gönderir; yoksa konsola yazar (geliştirme).

Yapılacaklar:
1. Resend (ya da Amazon SES, Postmark, Brevo) hesabı; **kendi alan adınızı** doğrulayın.
2. DNS: SPF, DKIM (sağlayıcının verdiği kayıtlar), DMARC (`v=DMARC1; p=none` ile başlayıp `quarantine`'e yükseltin).
3. `MAIL_FROM="Marka <no-reply@alanadiniz.com>"`; yanıt adresi için `Reply-To` ayrı bir destek kutusu olsun.
4. Sıfırlama/doğrulama bağlantıları kısa ömürlüdür; bağlantı alan adı `NEXT_PUBLIC_APP_URL` ile uyumlu olmalı.
5. Hukuk: işlemsel e-postalar (şifre sıfırlama, fatura) ticari ileti değildir; **pazarlama e-postası** gönderecekseniz ayrı izin (İYS kaydı) ve çıkış bağlantısı gerekir. Şu an kod pazarlama e-postası göndermez.
6. Sağlayıcı yurt dışındaysa KVKK metnindeki "yurt dışına aktarım" bölümü geçerlidir (güncellendi).
7. Teslimat izleme: sağlayıcı panelinden bounce/spam oranı; başarısız gönderimlerde kullanıcıya "e-posta gelmedi" yolu.

## 3. Tek süreç (single-process) sınırı

Durum: canlı oyunlar **bellekte** tutulur ve SSE bağlantıları aynı Node sürecinde yaşar. Bu bilinçli bir tercihtir (basit, hızlı, 200 oyuncu/40 takım yük testinde p95 yayın gecikmesi < 0,5 sn).
Sonuçları:
- **Süreç yeniden başlarsa devam eden canlı oyunlar kaybolur** (yalnızca hesaplar, mekanlar, görülen sorular ve ödemeler `db.json` içinde kalıcıdır). Bu yüzden dağıtım/yeniden başlatmayı etkinlik saatleri dışında yapın; oyuncular "oyun bulunamadı" görür.
- **İki örnek (instance) çalıştırmayın**: aynı odaya farklı süreçlere giden istekler tutarsız olur. Yatay ölçekleme için yapılandırma `replicas: 1` kalmalı.
- Yük dengeleyici varsa tek örneğe sabitleyin.

Ölçekleme yolu (ihtiyaç olunca):
1. Dikey ölçek: tek makine 1.000+ eşzamanlı oyuncuyu taşır (CPU/RAM'i izleyin; `/api/health`).
2. Oda koduna göre sabit yönlendirme (sticky routing): `roomCode → instance` (ör. hash). Her oda tek süreçte kalır, ama toplam kapasite örnek sayısıyla artar.
3. Daha ileri: oyun durumunu Redis'e (olay günlüğü + anlık görüntü) taşıyıp herhangi bir örneğin odayı üstlenebilmesi. Motor saf TypeScript ve deterministik olduğu için bu geçiş mümkün; ama gerçek bir ihtiyaç doğmadan yapmayın.
4. Dağıtım sırasında (deploy) oyun yürüyorsa bekleyin ya da gece saatlerinde yapın; sıfır kesinti gerekiyorsa madde 2–3.

Önerilen izleme: çalışma süresi (uptime) kontrolü, bellek, açık SSE sayısı, 5xx oranı.

## 4. Dosya veritabanı (`DATA_DIR/db.json`)

Durum: tüm kalıcı veri (hesaplar, mekanlar, görülen sorular, ödemeler) tek JSON dosyasında; yazım atomik (geçici dosya + rename).
Sınırlar: tek yazar, dosya büyüdükçe yazma maliyeti artar, sorgu/indeks yok, birden çok süreç güvenli değil.

Canlıya çıkmadan:
1. `DATA_DIR` kalıcı bir **disk/volume** üzerinde olmalı (konteyner dosya sistemi değil). Disk dolu ve izin hataları izlenmeli.
2. **Yedek**: günlük anlık görüntü (cron ile `db.json` kopyası → nesne depolama), 14–30 gün saklama; haftalık geri yükleme denemesi. Yedeklerde kişisel veri vardır: şifreli ve erişim kontrollü tutun, KVKK saklama süresine uyun.
3. Boyut eşiği: dosya ~50–100 MB'ı veya günlük yazma gecikmesi belirgin artışı geçerse Postgres'e geçin.

Geçiş yolu: şema zaten Supabase/Postgres için hazır (`supabase/migrations`). `store.ts` arayüzü (get/put/transaction) korunarak Postgres uygulaması yazılır; veri taşıma betiği `db.json → tablolar`. Canlı oyun durumu bellekte kalmaya devam eder, yalnızca kalıcı kayıtlar taşınır.

## 5. Hukuki kontrol listesi (avukat incelemesinden sonra bile bakın)

Metinler `src/lib/legal.ts` içindedir; şirket kimliği `NEXT_PUBLIC_COMPANY_*` ile doldurulur (boşsa sayfada uyarı çıkar).

- **Veri sorumlusu/işleyen ayrımı**: oyuncu verisinde mekan sorumlu, platform işleyen; mekanlarla **veri işleme sözleşmesi** (DPA) şart. Mekan hesabı verisinde platform sorumlu → **VERBİS** kaydı (eşiklere göre muafiyet olabilir; muafiyeti avukatla netleştirin) ve kayıt numarasını sayfaya koyun.
- **Yurt dışı aktarım (KVKK m.9)**: Resend, barındırma, Anthropic (yalnızca mekanın yazdığı konu/istem gider, oyuncu verisi gitmez) gibi yurt dışı sağlayıcılar için güvence (standart sözleşme + Kurum'a bildirim) süreci.
- **Aydınlatma metni** oyuncuya ilk ekranda görünür; açık rıza **istemiyoruz**, çünkü asgari veri meşru menfaat/sözleşme dayanağıyla işleniyor — takma ad + takım adı dışında veri toplanmaması bunun şartı; yeni veri alanı eklerseniz yeniden değerlendirin.
- **18+ ve alkol**: metinde mekan sorumluluğu belirtildi; ürün içinde yaş doğrulaması yok (bilinçli).
- **Ödül/bahis**: platform ödül dağıtmaz. Mekanların "bahis", "para yatır", "çekiliş" benzeri akışlar kurmasını önlemek için arayüzde bu kelimeler kullanılmaz; kullanım koşullarında 7258 sayılı Kanun uyarısı var. Ödül verecek mekanlar için şans unsuru içeren çekilişin izne tabi olabileceğini hatırlatın.
- **Mesafeli satış**: mekanlar genellikle tacirdir (B2B); yine de bireysel girişimciler "tüketici" sayılabilir → ön bilgilendirme formu + mesafeli satış sözleşmesi sayfası (iyzico başvurusu da ister).
- **Çerez**: yalnızca zorunlu oturum çerezi; analitik/reklam eklerseniz çerez bannerı ve aydınlatma gerekir.
- **Ticari elektronik ileti**: pazarlama gönderecekseniz İYS ve ayrı onay.
- **Soru içeriği/telif**: soru metinleri özgündür; film/şarkı/kitap adları olgu olarak kullanılır. Logo, afiş, albüm kapağı, ses/video **eklemeyin** ya da lisanslayın.
- **Marka**: ürün adını (şimdilik "Quizhane") TÜRKPATENT'te ve alan adında kontrol edin; `NEXT_PUBLIC_APP_NAME` ile değiştirilebilir.
- **İnceleme turu**: avukat metni onayladıktan sonra `legal.ts` içeriğini onay tarihiyle sürümleyin; sonraki her değişiklik yeniden incelensin.

## 6. Şirket değil, bireysel (şahıs) yayıncı olarak yayınlamak

Hukuki sonuçlar (avukatınla teyit et; bu bir hukuk görüşü değildir):
- **Vergi/ticari kimlik:** düzenli ücret alacaksan (abonelik) şahıs işletmesi olarak vergi mükellefiyeti açman gerekir; "serbest meslek makbuzu/fatura" ya da basit usul hesabı mali müşavirle belirlenir. Gelir tek seferlik/denemelik değilse "sadece bireysel" kalmak mümkün olmayabilir.
- **iyzico:** bireysel/şahıs hesabı ile başvuru mümkündür (vergi levhası + IBAN); kart verisi sana uğramadığı için PCI yükün düşük kalır.
- **KVKK:** veri sorumlusu/işleyen sen olursun. Şirket unvanı yerine ad-soyad ve iletişim adresi (e-posta + KEP varsa) yazılır. VERBİS'e kayıt yükümlülüğü, çalışan sayısı ve ciro eşiklerine bağlı bir muafiyete girebilir; muafiyeti avukattan netleştir. Muaf olsan bile aydınlatma metni ve veri işleme sözleşmesi (mekanlarla) gerekir.
- **Adres:** ad-soyad ve tebligat adresi sitede görünür (e-ticaret mevzuatı satıcı bilgisini ister). Ev adresini göstermek istemezsen iş adresi/sanal ofis düşün.
- **Sorumluluk:** şirket gibi sınırlı sorumluluk yoktur; kişisel malvarlığınla sorumlusun. Kullanım koşullarındaki sorumluluk sınırlamaları ve sigorta (mesleki sorumluluk) bunu azaltır, ortadan kaldırmaz.
- **Ortam değişkenleri:** `NEXT_PUBLIC_COMPANY_NAME` alanına ad-soyadını (veya işletme adını), `NEXT_PUBLIC_COMPANY_ADDRESS` alanına tebligat adresini yaz; MERSİS boş kalabilir. Sayfalarda "Veri sorumlusu" olarak görünür.
- Büyüyünce limited şirkete geçiş mümkündür; hesap, mekan ve veri devri için kullanıcılara bildirim ve yeni sözleşme gerekir.
