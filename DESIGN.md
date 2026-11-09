# Tasarım planı: "Masa ve tabela"

**Renk (token):** çuha `#17483B` zemin, fildişi `#EDE4D0` soru fişi/okunacak yüzey, lamba sarısı `#F4B942` aktif/süre, kırmızı `#D64933` hata/az süre, çelik mavisi `#5B8DB8` ikincil, mürekkep `#10201A` fildişi üstü metin. Gradient yok, zeminde %4 SVG gren.

**Tipografi:** Big Shoulders Display (başlık, skor; tabular rakam) + Hanken Grotesk (metin), `@fontsource-variable` ile self-host, latin-ext alt kümesi Türkçe için. `text-transform: uppercase` yok.

**Yerleşim:** TV'de solda fildişi soru fişi, sağda skor tabelası; telefonda cevap alanı alt yarıda (başparmak). Sola hizalı, kart yığını yok.

**Hareket:** yalnızca iki imza an: skorda flip rakam, cevap kilitlenince pulun masaya düşmesi. `prefers-reduced-motion` ve "Basit TV modu"nda ikisi de kapalı.

## Öz eleştiri: "genel SaaS kalıbına benziyor mu?"
- İlk taslakta landing sayfası klasik "hero + 3 özellik kartı" idi. **Değişti:** landing, canlı çalışan mini skor tabelasıyla açılıyor; özellik kartı ızgarası yok, düz metin ve fiyat tablosu var.
- Takım listesi "yuvarlak köşeli kart yığını" oluyordu. **Değişti:** takımlar tavla pulu (tam daire) + tabela satırı; yüzeyler fildişi fiş ya da çuha üstü düz alan, köşe yuvarlaklığı hiyerarşiye göre (fiş 6px, düğme 10px, pul %50).
- Renk tek başına anlam taşımıyor: her takımda rozet emoji ve ad var; süre azalınca renk + "kalan sn" metni.
