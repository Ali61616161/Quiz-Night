# Deploy rehberi

Uygulama **tek Node süreci** olarak tasarlandı (canlı oyun durumu bellekte). Bir VPS/konteynerde (Fly.io, Railway, Hetzner, Render) tek instance çalıştır.

1. `npm ci && npm run build`
2. Ortam değişkenleri (`.env.example`): `NEXT_PUBLIC_APP_URL` (https adresin), `NEXT_PUBLIC_APP_NAME`, `DATA_DIR` (kalıcı disk), `ADMIN_EMAILS`, `CRON_SECRET` (uzun rastgele), `RESEND_API_KEY` + `MAIL_FROM`, `ANTHROPIC_API_KEY`. **`EXPOSE_DEV_LINKS` boş kalmalı.**
3. `npm run start` (port: `PORT`).
4. TLS ve proxy: Caddy/nginx arkasında çalıştır. Proxy `X-Forwarded-For` başlığını **kendisi yazmalı** (istemciden gelen değeri ezmeli); IP tabanlı hız sınırları buna dayanır. SSE için proxy tamponlamasını kapat (`X-Accel-Buffering: no` zaten gönderilir; nginx'te `proxy_buffering off`, okuma zaman aşımını artır).
5. Zamanlanmış işler (dış cron, ör. cron-job.org / sistem cron): her çağrıda `Authorization: Bearer $CRON_SECRET`
   - `POST /api/cron/reminders` günde 1 (takvim hatırlatma e-postası)
   - `POST /api/cron/billing` günde 1 (abonelik yenileme, başarısız ödeme)
   - `POST /api/cron/purge` günde 1 (eski oyunları temizler, 30 günü geçen oyuncu verisini anonimleştirir)
6. Yedek: `DATA_DIR/db.json` dosyasını düzenli yedekle.
7. Domain e-postası (SPF/DKIM) ayarlanmazsa doğrulama e-postaları spam'e düşer.

## Ödeme (iyzico)
`BILLING_PROVIDER=iyzico` ve anahtarlar tanımlanınca `src/lib/server/billing.ts` içindeki `iyzicoProvider.charge` iskeleti gerçek abonelik/3D Secure akışıyla doldurulmalı. Şu an yalnızca sahte sağlayıcı çalışır; canlıda **gerçek ödeme alınmaz**.

## Ölçekleme
Birden çok instance için canlı oyun durumu ve yayın (SSE) Redis/Supabase Realtime'a taşınmalı; hız sınırlayıcı da paylaşımlı olmalı. 200 oyuncu/oyun hedefi tek instance'ta yük testiyle doğrulandı (bkz. TEST_REPORT.md).
