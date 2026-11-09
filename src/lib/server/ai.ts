import { z } from "zod";
import { BANK } from "@/lib/content/bank";
import { normalizeTr, levenshtein } from "@/lib/engine/normalize";
import type { Question } from "@/lib/engine/types";

export const CATEGORIES = ["Futbol", "Dizi/Film", "Müzik", "Genel Kültür", "Tarih", "Coğrafya", "Bilim", "Yemek", "Güncel", "Oyun", "Üniversite/Kampüs", "Yerel"] as const;

export const aiItemSchema = z.object({
  text: z.string().min(8).max(300),
  kind: z.enum(["open", "choice"]),
  options: z.array(z.string().min(1).max(80)).length(4).optional(),
  correct: z.string().min(1).max(100),
  accepted: z.array(z.string().max(100)).max(6).default([]),
  explanation: z.string().max(300).optional(),
  sourceNote: z.string().max(200).optional(),
});
export const aiOutputSchema = z.object({ questions: z.array(aiItemSchema).min(1).max(50) });

export const aiRequestSchema = z.object({
  category: z.enum(CATEGORIES), difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  count: z.number().int().min(1).max(25), theme: z.string().max(80).optional(),
});

const RULES = `Emin olmadığın bilgiyi uydurma. Her sorunun tek net, doğrulanabilir bir doğru cevabı olsun. Tartışmalı, güncel belirsiz ya da zamanla değişen bilgi yazma. Şarkı sözü ve telifli metin kullanma. Soru metni cevabı içermesin. Türkçe yaz.`;

export function buildPrompt(r: z.infer<typeof aiRequestSchema>) {
  return `Bir Türkçe bar/kafe quiz gecesi için ${r.count} adet "${r.category}" sorusu üret. Zorluk: ${r.difficulty} (1 kolay, 3 zor).${r.theme ? ` Tema: ${r.theme}.` : ""}\n${RULES}\nYalnızca şu JSON biçiminde yanıt ver, başka metin ekleme:\n{"questions":[{"text":"...","kind":"open|choice","options":["4 şık (yalnızca choice)"],"correct":"doğru cevap (choice ise şıklardan biri)","accepted":["kabul edilen alternatifler"],"explanation":"kısa açıklama","sourceNote":"doğrulama için kaynak notu"}]}`;
}

/** Model çıktısını güvenle ayrıştırır: JSON, Zod şeması ve choice tutarlılığı. */
export function parseAi(raw: string, r: z.infer<typeof aiRequestSchema>): { questions: Question[]; rejected: number } {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return { questions: [], rejected: 0 };
  let json: unknown;
  try { json = JSON.parse(m[0]); } catch { return { questions: [], rejected: 0 }; }
  const parsed = aiOutputSchema.safeParse(json);
  if (!parsed.success) return { questions: [], rejected: 0 };
  const out: Question[] = []; let rejected = 0;
  for (const it of parsed.data.questions) {
    if (it.kind === "choice" && (!it.options || !it.options.includes(it.correct) || new Set(it.options).size !== 4)) { rejected++; continue; }
    if (normalizeTr(it.text).includes(normalizeTr(it.correct)) && normalizeTr(it.correct).length >= 4) { rejected++; continue; }
    out.push({
      id: `ai-${Math.random().toString(36).slice(2, 10)}`, category: r.category, difficulty: r.difficulty, kind: it.kind, text: it.text.trim(),
      options: it.kind === "choice" ? it.options : undefined, correct: it.correct.trim(), accepted: it.accepted, explanation: it.explanation, sourceNote: it.sourceNote, status: "draft", reports: 0,
    });
  }
  return { questions: out, rejected };
}

/** Mükerrer tespiti: normalize edilmiş metinde küçük düzenleme mesafesi. */
export function isDuplicate(text: string, existing: { text: string }[]): boolean {
  const n = normalizeTr(text);
  return existing.some((e) => {
    const m = normalizeTr(e.text);
    if (m === n) return true;
    if (Math.abs(m.length - n.length) > 12) return false;
    return levenshtein(n, m) / Math.max(n.length, m.length) < 0.18;
  });
}

export async function generate(r: z.infer<typeof aiRequestSchema>, existing: { text: string }[], fetchImpl: typeof fetch = fetch) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("AI anahtarı yapılandırılmadı (ANTHROPIC_API_KEY).");
  const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 4000, messages: [{ role: "user", content: buildPrompt(r) }] }),
  });
  if (!res.ok) throw new Error(`AI servisi hata döndü (${res.status}).`);
  const j = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (j.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  const { questions, rejected } = parseAi(text, r);
  const all = [...BANK, ...existing];
  const fresh: Question[] = []; let dupes = 0;
  for (const q of questions) { if (isDuplicate(q.text, [...all, ...fresh])) dupes++; else fresh.push(q); }
  return { questions: fresh, rejected, dupes };
}
