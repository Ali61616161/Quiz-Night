import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { BANK } from "@/lib/content/bank";

// Yalnızca EXPORT_BANK=dosya.json verildiğinde çalışır: havuzu dışa aktarır (bağımsız doğrulama için).
it.skipIf(!process.env.EXPORT_BANK)("havuzu JSON olarak dışa aktar", () => {
  writeFileSync(process.env.EXPORT_BANK!, JSON.stringify(BANK.filter((q) => q.kind === "open" || q.kind === "choice" || q.kind === "estimate").map((q) => ({ id: q.id, category: q.category, text: q.text, correct: q.correct, options: q.options })), null, 0));
});
