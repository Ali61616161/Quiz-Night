import type { Question } from "@/lib/engine/types";
import overlay from "./overlay.json";

export const SINGLES_EN: Record<string, string[]> = {};
type Ov = { to?: string[]; ti?: string[]; tp?: [string, string][]; t: string; o?: string[]; c?: string; a?: string[]; i?: string[]; p?: [string, string][]; x?: string };
const OV = overlay as unknown as Record<string, Ov>;
const OPT = (OV as unknown as { __opt__: Record<string, string> }).__opt__ ?? {};
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const TXT = (OV as unknown as { __text__: Record<string, string> }).__text__ ?? {};
const key = (q: Question) => q.text + "||" + JSON.stringify(q.items ?? q.pairs ?? []);

/** Elle/aracıyla çevrilmiş İngilizce karşılıkları (Türkçe metne göre) sorulara işler. */
export function applyOverlay(qs: Question[]): Question[] {
  for (const q of qs) {
    const v = OV[key(q)];
    if (!v) { // aynı metin, farklı şık/öğe seçimi: metni ve öğeleri tek tek eşle
      const t = TXT[q.text];
      if (t && q.kind === "ordering" && q.items && q.items.every((o) => OPT[o] !== undefined)) { const ei = q.items.map((o) => OPT[o]); q.en = { text: t, items: ei, correct: JSON.stringify(ei) }; }
      else if (t && q.kind === "choice" && q.options && q.options.every((o) => OPT[o] !== undefined)) { const eo = q.options.map((o) => OPT[o]); q.en = { text: t, options: eo, correct: eo[q.options.indexOf(q.correct)] }; }
      else if (t && q.kind === "matching" && q.pairs && q.pairs.every((r) => r.every((c) => OPT[c] !== undefined))) { const ep = q.pairs.map((r) => [OPT[r[0]], OPT[r[1]]] as [string, string]); q.en = { text: t, pairs: ep, correct: JSON.stringify(ep) }; }
      continue;
    }
    if (q.kind === "choice" && q.options && !v.o && q.options.every((o) => /^[\d.,\s-]+$/.test(o))) {
      q.en = { text: v.t, options: [...q.options], correct: q.correct, explanation: v.x ?? q.en?.explanation }; // sayısal şıklar dilden bağımsız
    } else if (q.kind === "choice" && q.options && !same(v.to, q.options) && q.options.every((o) => OPT[o] !== undefined)) {
      const eo = q.options.map((o) => OPT[o]); // şıklar bu derlemede farklı seçilmiş: şık metinlerini tek tek eşle
      q.en = { text: v.t, options: eo, correct: eo[q.options.indexOf(q.correct)], explanation: v.x ?? q.en?.explanation };
    } else if (q.kind === "choice" && q.options && same(v.to, q.options)) {
      const idx = q.options.indexOf(q.correct);
      q.en = { text: v.t, options: v.o, correct: v.o![idx], explanation: v.x ?? q.en?.explanation };
    } else if (q.kind === "open") {
      q.en = { text: v.t, correct: v.c ?? "", accepted: v.a ?? [], explanation: v.x ?? q.en?.explanation };
    } else if (q.kind === "ordering" && q.items && !(v.i?.length === q.items.length) && q.items.every((o) => OPT[o] !== undefined)) {
      const ei = q.items.map((o) => OPT[o]);
      q.en = { text: v.t, items: ei, correct: JSON.stringify(ei) };
    } else if (q.kind === "ordering" && same(v.ti, q.items)) {
      q.en = { text: v.t, items: v.i, correct: JSON.stringify(v.i) };
    } else if (q.kind === "matching" && same(v.tp, q.pairs)) {
      q.en = { text: v.t, pairs: v.p, correct: JSON.stringify(v.p) };
    } else if (q.kind === "estimate") {
      q.en = { text: v.t, correct: q.correct, explanation: v.x ?? q.en?.explanation };
    }
  }
  return qs;
}
