# Mekanlara nasıl sunulur?

**Bir dosya değil, bir web hizmeti olarak.** Mekan hiçbir şey indirmez ya da kurmaz: bir adres (ör. `https://uygulamaadiniz.com`), bir hesap ve bir ekran yeterlidir. Oyuncular da uygulama indirmez; QR kodu okutur.

## Mekanın gördüğü akış
1. **Kayıt:** `/giris` → mekan adı + e-posta + şifre → e-posta doğrulama.
2. **Panel (`/panel`):** gece şablonu seç (klasik, tematik, hızlı), dil seç (Türkçe/English), "Geceyi başlat".
3. **Host (telefon ya da laptop):** host paneli açılır; TV bağlantısı ve oyuncu QR'ı burada.
4. **TV:** "TV ekranını aç" bağlantısını TV tarayıcısında (ya da laptopu HDMI ile TV'ye bağlayarak, Chromecast/Apple TV ile yansıtarak, mini PC ile) açın. Zayıf TV tarayıcısı için **Basit TV modu**.
5. **Oyuncular:** TV'deki QR'ı okutur → takım kurar/katılır → telefondan oynar.
6. **Afiş ve masa kartı:** panelden yazdırılabilir PDF (`/panel/afis`), mekan renkleriyle (Marka planı).

## Teslim biçimleri
| Biçim | Kime | Nasıl |
|---|---|---|
| **Barındırılan hizmet (SaaS)** — önerilen | Tüm mekanlar | Sizin sunucunuzda tek kurulum; mekanlar hesap açar, aylık abonelik öder. Güncellemeler otomatik. |
| **Ana ekrana ekle (PWA)** | Host ve oyuncular | Tarayıcıdan "Ana ekrana ekle"; mağaza uygulaması gerekmez. |
| **Kendi sunucusunda (Docker)** | Zincirler/kurumsal | `Dockerfile` + `docker-compose.yml` hazır; kendi alan adı ve verisiyle çalışır (bkz. DEPLOY.md). |
| ~~.exe / .apk~~ | — | Yok. Web olduğu için gerekmez; internet bağlantısı şarttır. |

## Mekanın gereksinimleri
- Mekanda Wi-Fi ya da güçlü mobil veri (200 oyuncu için hafif trafik; JS ilk yüklemesi küçük).
- TV'de modern bir tarayıcı (Chrome/Edge/Safari/Samsung/LG tarayıcısı) ya da HDMI ile bağlı bir laptop.
- Host için bir telefon ya da laptop.

## Pilot paketi önerisi
Ücretsiz plan (10 oyuncu, günde 2 oyun) ile deneme → pilot kuponu (`PILOT50`: ilk 3 ay %50) → Başlangıç/Pro/Marka. Yüz yüze kurulum 15 dakikadır: hesap, TV bağlantısı, afiş çıktısı, deneme oyunu.

## Ürünle verilecek materyaller
Afiş ve masa kartı (panelden), "Host'a ilk gece" kontrol listesi (Host Coach ekranda zaten yönlendirir), KVKK metinleri (avukat incelemesinden sonra), destek e-postası.
