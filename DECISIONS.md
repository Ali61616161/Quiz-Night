# Kararlar

- Ürün adı `config/brand.ts` + `NEXT_PUBLIC_APP_NAME`; varsayılan "Quizhane".
- Next.js 16 (App Router) + TS + Tailwind 4. Fontlar `@fontsource-variable` ile self-host (next/font/google build sırasında ağ ister).
- **Gerçek zamanlı:** Faz 1'de Supabase Realtime yerine SSE (`/api/games/[id]/events`). Sunucu otoriter, her görünüm role göre süzülür; doğru cevap kilitten önce hiçbir istemciye gitmez (host hariç, host cevabı okur).
- **Depo:** Faz 1'de bellek içi (`src/lib/server/store.ts`, tek süreç). Supabase şeması + RLS `supabase/migrations/0001_init.sql` içinde; depo arayüzünün Supabase uyarlaması Faz 7 öncesi yapılacak. Sunucu yeniden başlarsa oyunlar kaybolur.
- **Kimlik:** Faz 1'de oyun oluşturma hesapsız (dev). Host/TV/oyuncu yetkisi rastgele token. Kayıt/giriş ve plan kapısı Supabase Auth ile bağlanacak.
- Süre kilidi: sunucu zamanlayıcısı + her okumada lazy `tick`. İstemci, SSE'deki `serverNow` ile saat farkını ölçer.
- Cevap gönderimi idempotency anahtarlı. Takım renk+rozet çifti oyunda benzersiz.
- Kaptan devri: kaptan 15 sn görünmezse (SSE bağlantısı presence sayılır) takımdan biri alabilir (kısmen Faz 2 işi öne alındı).
- Puan: doğru 100, yanlış ceza varsayılan 0. Host "doğru say/yanlış say" reveal sonrası puanı anında yeniden hesaplar.
