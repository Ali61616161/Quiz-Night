# Quizhane (çalışma adı)

Mekanlar için Türkçe, web tabanlı quiz gecesi platformu. Host paneli, TV ekranı ve oyuncu telefonu. Uygulama indirmek ve hesap açmak yok.

## Kurulum
```bash
npm install
cp .env.example .env.local   # yerel demo için boş bırakılabilir
npm run dev                  # http://localhost:3000
```
Ana sayfada **Demo gece başlat** → host paneli açılır. Panelden TV bağlantısını ve oyuncu QR bağlantısını al.

## Komutlar
| Komut | Ne yapar |
|---|---|
| `npm test` | Birim testleri (normalizasyon, durum makinesi, puanlama, kaptan devri, plan kapıları) |
| `npm run build && npm run start:e2e` ardından `npm run e2e` | Playwright: host + TV + 2 takım (4 telefon), kaptan düşmesi ve devir |
| `npm run typecheck`, `npm run lint` | Statik kontrol |

## Durum
Bkz. `DECISIONS.md` (kararlar), `DESIGN.md` (tasarım planı), `KNOWN_LIMITS.md` (bilinen sınırlar).
