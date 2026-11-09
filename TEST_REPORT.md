# Test raporu

Ortam: Node 22, Next 16 üretim derlemesi, Chromium (Playwright 1.63). Tarih: 2026-11-09.

| Set | Sonuç |
|---|---|
| `npm test` (birim + entegrasyon) | 52/52 geçti |
| `npm run typecheck` | temiz |
| `npm run lint` | 0 hata (uyarılar: `<img>` kullanımı vb.) |
| `npm run e2e` (host + TV + 2 takım × 2 telefon) | geçti: öneri→kilit→puan, itiraz kuyruğu, kaptan düşmesi + devir, ücretsiz planda mod kilidi, cevap sızıntısı kontrolü |
| `npm run e2e:security` | 25/25 geçti |
| `npm audit --omit=dev` | 0 açık |

## Güvenlik denetimi kapsamı (e2e:security)
Başlıklar (CSP, nosniff, frame, referrer) · host/TV/oyuncu yetki ayrımı · başka oyunun token'ıyla erişim (IDOR) · TV/oyuncu akışında cevap sızıntısı · sunucu saatiyle süre kilidi · bozuk/aşırı büyük girdi · HTML içeren takım adı · küfür filtresi · 10 oyuncu sınırı · CSRF (Origin) · oturumsuz panel/admin/cron · kısa şifre · e-posta doğrulama zorunluluğu · kullanıcı sayımı engeli (aynı hata mesajı) · plan kapıları (402) · günlük oyun sınırı · reddedilen kart · geçersiz kupon · logo yükleme (script'li SVG, sahte dosya, 1 MB üstü, temiz SVG, sandbox CSP) · marka kontrast kontrolü · plan düşürünce veri korunması · mekanlar arası izolasyon · admin yetkisi · çıkışta oturum iptali · giriş hız sınırı.

## Yük testi (40 takım / 200 oyuncu / TV / host, 3 soru, yerel makine)
| Ölçüm | Toplu yayından önce | Sonra |
|---|---|---|
| Cevap isteği p50 / p95 | 2607 / 5021 ms | ~200 / ~400 ms |
| Durum yayını gecikmesi p50 / p95 | 2578 / 5046 ms | ~150 / ~460 ms |
| SSE mesajı | 125.240 | ~2.000 |
| Hata | 0 | 0 |

Son ölçüm: `{"takim":40,"oyuncu":200,"akis":202,"sorular":3,"hata":0,"ornekHatalar":[],"katilimMs":{"p50":15,"p95":319},"cevapMs":{"p50":220,"p95":406,"adet":600},"yayinGecikmeMs":{"p50":152,"p95":461,"adet":1600},"sseMesaj":2061,"istemciRssMB":151}`

Not: ölçüm istemci ve sunucu aynı makinede, gerçek mobil ağ gecikmesi dahil değil.

## Soru havuzu denetimi (tests/bank.test.ts)
Miktar (≥5000, 14 konu × ≥250) · kimlik/metin benzersizliği · aynı soru farklı cevapla bulunmaz · her cevap doğru sayılır · çoktan seçmelide 4 farklı şık ve tek doğru · cevap sızıntısı yok · sıralama/eşleştirme iç tutarlılık · tablo çelişki taraması (plaka 1–81 eksiksiz, 92 element atom numaraları ardışık, padişah/cumhurbaşkanı sırası, turnuva serilerinin kesintisizliği, seçilmiş sabit olgular) · karışık gecede ≥8 konu · her tematik gecede yalnızca o konu · tematik→karışık→tematik gecelerde tekrar yok · 20 gece üst üste tekrar yok · konu tükenince başka konudan yeni soru + düşük havuz uyarısı.
Son tam koşu: 67 birim testi geçti; e2e, 25 güvenlik kontrolü ve yük testi (40 takım/200 oyuncu, hata 0) yeni havuzla geçti.
