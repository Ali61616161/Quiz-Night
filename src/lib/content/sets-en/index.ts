import type { Question } from "@/lib/engine/types";
import overlay from "./overlay.json";

export const SINGLES_EN: Record<string, string[]> = {};
type Ov = { t: string; o?: string[]; c?: string; a?: string[]; i?: string[]; p?: [string, string][]; x?: string };
const OV = overlay as unknown as Record<string, Ov>;
const key = (q: Question) => q.text + "||" + JSON.stringify(q.items ?? q.pairs ?? []);

/** Elle/aracıyla çevrilmiş İngilizce karşılıkları (Türkçe metne göre) sorulara işler. */
export function applyOverlay(qs: Question[]): Question[] {
  for (const q of qs) {
    const v = OV[key(q)]; if (!v) continue;
    if (q.kind === "choice" && q.options && !v.o && q.options.every((o) => /^[\d.,\s-]+$/.test(o))) {
      q.en = { text: v.t, options: [...q.options], correct: q.correct, explanation: v.x ?? q.en?.explanation }; // sayısal şıklar dilden bağımsız
    } else if (q.kind === "choice" && q.options && v.o?.length === q.options.length) {
      const idx = q.options.indexOf(q.correct);
      q.en = { text: v.t, options: v.o, correct: v.o[idx], explanation: v.x ?? q.en?.explanation };
    } else if (q.kind === "open") {
      q.en = { text: v.t, correct: v.c ?? "", accepted: v.a ?? [], explanation: v.x ?? q.en?.explanation };
    } else if (q.kind === "ordering" && v.i?.length === q.items?.length) {
      q.en = { text: v.t, items: v.i, correct: JSON.stringify(v.i) };
    } else if (q.kind === "matching" && v.p?.length === q.pairs?.length) {
      q.en = { text: v.t, pairs: v.p, correct: JSON.stringify(v.p) };
    } else if (q.kind === "estimate") {
      q.en = { text: v.t, correct: q.correct, explanation: v.x ?? q.en?.explanation };
    }
  }
  return qs;
}
