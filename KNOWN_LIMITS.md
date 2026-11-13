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
- **İngilizce karşılıklar büyük ölçüde makine/yapay zekâ çevirisidir** ve her soruda mevcuttur (parite testi), ancak ana dili İngilizce olan biri tarafından dilsel olarak gözden geçirilmemiştir; ayrıca olgusal doğruluk İngilizce metne ayrıca bakılmadan Türkçe kaynaktan taşınır. Çeviri, Türkçe soru metnine anahtarlıdır: soru metni değişirse parite testi yeni çeviri ister.
- Seçim ekranı/erişilebilirlik: manuel kontrol yapıldı; otomatik axe taraması yapılmadı.
- **Soru havuzu (7.500+ soru, 17 konu) yapısal olarak denetlenir; olgusal doğrulama kısmidir.** Futbol, spor, tarih, kültür, genel/coğrafya ve 2025–2026 gündemi için ayrı doğrulama turlarında web kaynaklarıyla çapraz kontrol yapılıp hatalar düzeltildi (ör. Süper Lig 2005-06, Hepsiburada 2000, Orhan Gazi 1324, Euro/Bulgaristan 2026). Kalan satırlar bilgi birikimine dayanır ve her satır tek tek bağımsız kaynakla doğrulanmadı; yayın öncesi örneklem denetimi önerilir.
- Çoktan seçmelide yanlış şıklar aynı sütundaki başka satırlardan gelir; bazı sorularda şıklar fazla kolay (alakasız) olabilir. Sayısal cevaplarda yakın sayılar kullanılır.
- "Güncel" kategorisi yoktur (bilgi hızla eskir). Seçim sonuçları, 2024 sonrası spor/ödül sonuçları havuzda yoktur.
- Gerçek cihaz (eski akıllı TV tarayıcısı, iOS Safari) testi yapılmadı; yalnızca Chromium.

- "Gündem" konusu 2000–2026 (Kasım 2026) arasıdır; 2026 satırları internetten iki kaynakla teyit edilmiştir, ancak son aylardaki olaylar için her yıl gözden geçirin. 2026 Nobel sonuçları ve belirsiz haberler bilerek eklenmemiştir.
- Marka planında "mekan görseli" arka planı hâlâ yok.
- Resim turu için havuzda görsel soru yok.

## Eğlence turları ile ilgili
- Saçma/sahte cevaplarda küfür filtresi kaba bir listedir (takım adlarıyla aynı); host TV'de uygunsuz cevabı görürse soruyu "hatalı say" ile iptal edebilir. Tek tek cevap gizleme yok.
- Sahte cevap sorularının doğru cevabı kısa ve tek biçimlidir; oyuncu gerçeğe çok yakın yazım farkıyla (ör. "Kanbera") yazarsa kabul edilen yazımlar listesinde olanlar reddedilir, listede olmayan yakın yazımlar kabul edilir (oylamada ayrı seçenek olur).
- Eğlence içeriği hacmi küçüktür (≈70 emoji, 40 saçma, 35 sahte cevap, 20 tahmin); mekan aynı içeriği tekrar görürse görülmüş sorular yeniden kullanılır.
- Oylama sırasında host cevap yazarlarını panelde görür (adalet için host'un söylememesi gerekir).
- Hukuki metinlerin İngilizcesi kolaylık çevirisidir; Türkçe metin esastır.
- Yeni kayıtlarda koşul kabulü kaydedilir; ekip davetiyle oluşturulan host hesapları için ayrı kabul adımı yoktur (hesap sahibi sorumludur).
