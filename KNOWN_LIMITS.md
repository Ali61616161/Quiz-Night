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
- Marka: arka plan "mekan görseli (bulanık)" seçeneği uygulanmadı; renk ve yazı tipi, logo çalışır.
- Resim turu: soru modeli ve plan kapısı hazır, ancak havuzda görsel soru yok; görsel yükleme arayüzü yok.
- (Kapatıldı) Süper admin AI taslaklarını genel havuza ekleyebilir; kalibrasyon önerileri tek tıkla uygulanır.
- Güncel (haber) kategorisinde soru yok (bilgi eskir); Müzik/ses turu bilerek yok (lisans).
- Skor tablosu flip animasyonu ve pul düşmesi vardır; sıralama sorusu için "sürükle" yerine dokun-sırala kullanıldı.
- **Arayüz İngilizcesi çalışma zamanında çevrilir** (DOM metin düğümleri, `src/lib/i18n`). Tarayıcı ilk yüklemede kısa süre Türkçe gösterebilir; ekran okuyucular çeviri sonrası metni okur. Sözlükte olmayan yeni bir metin Türkçe kalır; `tests/i18n.test.ts` ve `e2e/i18n.mjs` bunu yakalar. Kullanıcı girdileri (takım adı, mekan sorusu) çevrilmez.
- **İngilizce soru havuzu daha küçüktür** (2.600+ soru; coğrafya, bilim, futbol, spor, film/dizi, müzik, oyun, edebiyat, teknoloji). Tarih, yerel, yemek, sanat, gündem, doğa konuları yalnızca Türkçe; İngilizce oyunda bu konular seçilirse karışık havuza geçilir ve host'a düşük havuz uyarısı gider. Mekanın kendi soruları dil seçilmeden her iki dilde de eklenir.
- Seçim ekranı/erişilebilirlik: manuel kontrol yapıldı; otomatik axe taraması yapılmadı.
- **Soru havuzu (7.400+ soru, 17 konu) yapısal olarak denetlenir ama olgusal doğruluğu bağımsız bir kaynakla doğrulanmadı.** Sorular tek bir yazardan (yapay zekâ bilgisi) olgu tablolarına yazıldı; testler tutarlılığı, benzersizliği, sızıntıyı ve bilinen sabit olguları denetler, ancak her olgunun gerçek dünyadaki doğruluğunu kanıtlamaz. Yayın öncesi `npm run bank:verify` (Claude ile bağımsız çapraz kontrol) çalıştırılmalı ve `wrong`/`uncertain` çıkanlar kaynakla elle doğrulanmalı; kritik konularda (tarih, spor sonuçları, yıllar) bir insan örneklem incelemesi şarttır.
- Çoktan seçmelide yanlış şıklar aynı sütundaki başka satırlardan gelir; bazı sorularda şıklar fazla kolay (alakasız) olabilir. Sayısal cevaplarda yakın sayılar kullanılır.
- "Güncel" kategorisi yoktur (bilgi hızla eskir). Seçim sonuçları, 2024 sonrası spor/ödül sonuçları havuzda yoktur.
- Gerçek cihaz (eski akıllı TV tarayıcısı, iOS Safari) testi yapılmadı; yalnızca Chromium.

- "Gündem" konusu 2000–2026 (Kasım 2026) arasıdır; 2026 satırları internetten iki kaynakla teyit edilmiştir, ancak son aylardaki olaylar için her yıl gözden geçirin. 2026 Nobel sonuçları ve belirsiz haberler bilerek eklenmemiştir.
- Marka planında "mekan görseli" arka planı hâlâ yok.
- Resim turu için havuzda görsel soru yok.
