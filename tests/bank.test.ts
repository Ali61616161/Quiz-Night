import { describe, expect, it } from "vitest";
import { BANK, buildNight } from "@/lib/content/bank";
import { validateAnswer, isAnswerCorrect } from "@/lib/engine/scoring";

describe("soru havuzu", () => {
  it("en az 400 onaylı soru içerir", () => { expect(BANK.length).toBeGreaterThanOrEqual(400); });
  it("kimlikler benzersiz, metinler yinelenmez", () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length);
    const nm = BANK.filter((q) => q.kind !== "matching");
    expect(new Set(nm.map((q) => q.text.trim())).size).toBe(nm.length);
  });
  it("her sorunun doğru cevabı kendi biçiminde geçerli ve doğru sayılır", () => {
    for (const q of BANK) {
      if (q.kind === "choice") { expect(q.options).toHaveLength(4); expect(q.options).toContain(q.correct); expect(new Set(q.options).size).toBe(4); }
      const v = q.kind === "ordering" || q.kind === "matching" ? q.correct : q.correct;
      expect(validateAnswer(q, v), q.id).toBe(true);
      expect(isAnswerCorrect(q, v), q.id).toBe(true);
    }
  });
  it("sorular cevabı sızdırmaz (cevap soru metninde geçmez)", () => {
    for (const q of BANK.filter((x) => x.kind === "open" || x.kind === "choice")) {
      if (q.correct.length < 4) continue;
      const stem = q.correct.toLocaleLowerCase("tr").slice(0, Math.max(4, q.correct.length - 2));
      expect(q.text.toLocaleLowerCase("tr").includes(stem), `${q.id}: ${q.text}`).toBe(false);
    }
  });
  it("eşleştirme sağ sütunu benzersiz", () => {
    for (const q of BANK.filter((x) => x.kind === "matching")) expect(new Set(q.pairs!.map((p) => p[1])).size).toBe(q.pairs!.length);
  });
  it("görülmüş sorular tekrarlanmaz", () => {
    const allowed = { kinds: new Set(["open", "choice", "ordering", "matching", "estimate"] as const), rounds: new Set(["all", "speed", "wager", "final"] as const), image: true };
    const a = buildNight({ template: "classic", seen: new Set(), allowed: allowed as never, seed: "a" });
    const seen = new Set(a.questions.map((q) => q.id));
    const b = buildNight({ template: "classic", seen, allowed: allowed as never, seed: "b" });
    expect(b.questions.some((q) => seen.has(q.id))).toBe(false);
    expect(a.questions.length).toBeGreaterThanOrEqual(35);
  });
});
