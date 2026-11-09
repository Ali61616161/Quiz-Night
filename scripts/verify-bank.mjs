// Bağımsız doğrulama: her sorunun "verilen doğru cevap gerçekten doğru mu" kontrolünü Claude'a yaptırır.
// Kullanım: EXPORT_BANK=/tmp/bank.json npx vitest run tests/export.test.ts && ANTHROPIC_API_KEY=... node scripts/verify-bank.mjs /tmp/bank.json
// Çıktı: bank-verification.json (ok / wrong / uncertain). "wrong" ve "uncertain" olanları elle inceleyip kaynaktan doğrula.
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
const key = process.env.ANTHROPIC_API_KEY;
if (!file || !key) { console.error("Kullanım: ANTHROPIC_API_KEY=... node scripts/verify-bank.mjs bank.json"); process.exit(2); }
const bank = JSON.parse(readFileSync(file, "utf8"));
const BATCH = 40, results = [];
for (let i = 0; i < bank.length; i += BATCH) {
  const batch = bank.slice(i, i + BATCH);
  const prompt = `Aşağıdaki quiz sorularının "doğru cevap" alanı gerçekten doğru mu? Her soru için yalnızca emin olduğunda "ok" de; hatalı görüyorsan "wrong", emin değilsen ya da soru birden fazla doğru cevap içeriyorsa/tartışmalıysa "uncertain" yaz. Uydurma. Yalnızca JSON dizisi döndür: [{"id":"...","verdict":"ok|wrong|uncertain","note":"kısa gerekçe"}]\n\n` +
    JSON.stringify(batch.map((q) => ({ id: q.id, soru: q.text, dogru_cevap: q.correct, siklar: q.options })));
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) { console.error("API hatası", r.status); process.exit(1); }
  const j = await r.json();
  const text = (j.content ?? []).map((c) => c.text ?? "").join("");
  try { results.push(...JSON.parse(text.match(/\[[\s\S]*\]/)[0])); } catch { console.error("Ayrıştırılamadı, parti", i); }
  process.stdout.write(`\r${Math.min(i + BATCH, bank.length)}/${bank.length}`);
}
writeFileSync("bank-verification.json", JSON.stringify(results, null, 1));
const c = (v) => results.filter((x) => x.verdict === v).length;
console.log(`\nok: ${c("ok")}  wrong: ${c("wrong")}  uncertain: ${c("uncertain")}`);
