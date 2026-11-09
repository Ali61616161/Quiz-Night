# Bilinen sınırlar ve eksikler

## Canlıya almadan önce şart
- **Gerçek ödeme yok.** iyzico yalnızca iskelet; ücretli plana "sahte" ödemeyle geçilir. Canlıda bu kapatılmalı (`BILLING_PROVIDER=iyzico` + entegrasyon) ya da planlar elle (admin `set_plan`) verilmeli.
- **E-posta sağlayıcısı gerekir** (`RESEND_API_KEY`); yoksa kayıt doğrulama ve şifre sıfırlama çalışmaz.
- **Hukuki metinler taslaktır**, avukat incelemesi ve şirket bilgileri gerekir.
- **Tek süreç / dosya veritabanı.** Canlı oyunlar bellekte: sunucu yeniden başlarsa devam eden oyunlar kaybolur. Birden çok instance desteklenmez. Hesaplar `db.json`'da (oturumlar bellekte; yeniden başlatmada herkes yeniden giriş yapar).
- Supabase şeması yazıldı ama uygulama ona bağlı değil.

## Güvenlik notları
- Oyuncu/host/TV token'ları SSE için URL sorgusunda taşınır (EventSource başlık desteklemez); sunucu/proxy erişim günlüklerinde sorgu dizesi tutulmamalı. TV bağlantısı host'tan yenilenebilir.
- IP tabanlı hız sınırları `X-Forwarded-For`'a güvenir; proxy başlığı ezmelidir (bkz. DEPLOY.md). Hız sınırlayıcı bellek içi.
- Takım adı küfür filtresi kaba bir listedir, atlatılabilir; host "takımı at" ile tamamlar.
- Sekme gizleme sayacı yalnızca bilgi amaçlıdır; hile engeli değildir.
- Aynı hesaba çoklu panel oturumu engellenmez (yalnızca çok-IP girişi `abuse_flags`'e yazılır); host cihaz sınırı oyun başına uygulanır (Marka: 2).
- Takım içi öneri ekranında ordering/matching önerileri kaptana yalnızca "sıralama" etiketiyle görünür (uygula düğmesi yok).

## Eksik / kısmi özellikler
- Ekip üyeleri/davet/yetki (owner/host rolü veri modelinde var, arayüz yok).
- Marka: arka plan "mekan görseli (bulanık)" seçeneği uygulanmadı; renk ve yazı tipi, logo çalışır.
- Resim turu: soru modeli ve plan kapısı hazır, ancak havuzda görsel soru yok; görsel yükleme arayüzü yok.
- Süper admin: AI taslak onay kuyruğu mekan düzeyinde (admin yalnızca sayı ve bildirimleri görür); kalibrasyon önerileri listelenir ama tek tıkla uygulanmaz.
- Güncel (haber) kategorisinde soru yok (bilgi eskir); Müzik/ses turu bilerek yok (lisans).
- Skor tablosu flip animasyonu ve pul düşmesi vardır; sıralama sorusu için "sürükle" yerine dokun-sırala kullanıldı.
- i18n: `en.json` iskelet; çoğu metin bileşenlerde sabit Türkçe.
- Seçim ekranı/erişilebilirlik: manuel kontrol yapıldı; otomatik axe taraması yapılmadı.
- Havuz 600+ soru; üretim hedefi 2.000+ için AI hattı ve CSV kullanılmalı.
- Gerçek cihaz (eski akıllı TV tarayıcısı, iOS Safari) testi yapılmadı; yalnızca Chromium.
