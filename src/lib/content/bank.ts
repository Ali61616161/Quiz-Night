import { createHash } from "node:crypto";
import { normalizeTr } from "@/lib/engine/normalize";
import type { Question, RoundType } from "@/lib/engine/types";
import { ESTIMATES, ORDERINGS, TABLES } from "./facts";

/** Deterministik sözde-rastgele: aynı tohum aynı sonuç, testler kararlı. */
function rng(seed: string) {
  let h = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
}
function sample<T>(arr: T[], n: number, r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const fmt = (n: number) => String(n);

function numericDistractors(v: number, r: () => number): string[] {
  const out = new Set<number>();
  const big = v > 100;
  let guard = 0;
  while (out.size < 3 && guard++ < 50) {
    const d = big ? (Math.floor(r() * 8) + 1) * (v > 1000 ? 7 : 3) * (r() < 0.5 ? -1 : 1) : Math.floor(r() * 9 + 1) * (r() < 0.5 ? -1 : 1);
    const c = v + d;
    if (c > 0 && c !== v) out.add(c);
  }
  return [...out].map(fmt);
}

function build(): Question[] {
  const out: Question[] = [];
  for (const t of TABLES) {
    const parsed = t.rows.map((row) => { const [a, b, alt] = row.split("|"); return { a, b, alt: alt ? alt.split(";").concat(alt) : [] }; });
    const answers = [...new Set(parsed.map((p) => p.b))];
    parsed.forEach((p, i) => {
      const r = rng(`${t.key}:${i}`);
      const choice = i % 2 === 1 && answers.length >= 5;
      const accepted = [...new Set(p.alt)];
      const base: Omit<Question, "kind"> = {
        id: `${t.key}-${i}`, category: t.category, subtopic: t.subtopic, difficulty: t.difficulty, text: t.ask(p.a),
        correct: p.b, accepted, status: "approved", reports: 0,
      };
      if (choice) {
        const num = t.numeric && /^\d+$/.test(p.b);
        const pool = answers.filter((x) => x !== p.b && !accepted.includes(x));
        const wrong = num && t.key !== "plate" ? numericDistractors(Number(p.b), r) : sample(pool, 3, r);
        out.push({ ...base, kind: "choice", options: sample([p.b, ...wrong], 4, r) });
      } else out.push({ ...base, kind: "open" });
    });
  }
  ORDERINGS.forEach((o, i) => out.push({
    id: `ord-${i}`, category: o.cat, difficulty: o.diff, kind: "ordering", text: o.text, items: o.items,
    correct: JSON.stringify(o.items), accepted: [], status: "approved", reports: 0,
  }));
  ESTIMATES.forEach((e, i) => out.push({
    id: `est-${i}`, category: e.cat, difficulty: e.diff, kind: "estimate", text: e.text, correct: fmt(e.answer), accepted: [],
    explanation: e.explain ?? `Doğru cevap yaklaşık ${e.answer.toLocaleString("tr-TR")}.`, status: "approved", reports: 0,
  }));
  // Eşleştirme setleri: tablolardan 4'lü çiftler
  const matchSrc: { key: string; label: string; cat: string; text: string }[] = [
    { key: "capital", label: "Ülke ve başkent", cat: "Coğrafya", text: "Ülkeleri başkentleriyle eşleştir." },
    { key: "book", label: "Eser ve yazar", cat: "Genel Kültür", text: "Eserleri yazarlarıyla eşleştir." },
    { key: "element", label: "Element", cat: "Bilim", text: "Elementleri simgeleriyle eşleştir." },
    { key: "place", label: "Yer", cat: "Yerel", text: "Yerleri bulundukları illerle eşleştir." },
    { key: "dish", label: "Lezzet", cat: "Yemek", text: "Yöresel lezzetleri şehirleriyle eşleştir." },
    { key: "uni", label: "Üniversite", cat: "Üniversite/Kampüs", text: "Üniversiteleri şehirleriyle eşleştir." },
    { key: "song", label: "Şarkı", cat: "Müzik", text: "Şarkıları sanatçılarıyla eşleştir." },
    { key: "game", label: "Oyun", cat: "Oyun", text: "Soruları cevaplarıyla eşleştir." },
  ];
  for (const m of matchSrc) {
    const t = TABLES.find((x) => x.key === m.key)!;
    if (m.key === "game") continue;
    const rows = t.rows.map((r) => r.split("|"));
    for (let k = 0; k < 4; k++) {
      const r = rng(`match:${m.key}:${k}`);
      const chosen: string[][] = [];
      const seenR = new Set<string>(), seenL = new Set<string>();
      for (const row of sample(rows, rows.length, r)) {
        if (seenR.has(normalizeTr(row[1])) || seenL.has(row[0])) continue; // sağ sütun benzersiz olmalı
        seenR.add(normalizeTr(row[1])); seenL.add(row[0]); chosen.push(row);
        if (chosen.length === 4) break;
      }
      if (chosen.length < 4) continue;
      const pairs = chosen.map((c) => [c[0], c[1]] as [string, string]);
      out.push({
        id: `match-${m.key}-${k}`, category: m.cat, difficulty: 2, kind: "matching", text: m.text, pairs,
        correct: JSON.stringify(pairs.map((p) => p[1])), accepted: [], status: "approved", reports: 0,
      });
    }
  }
  return out;
}

export const BANK: Question[] = build();
export const bankById = new Map(BANK.map((q) => [q.id, q]));

export type TemplateId = "classic" | "themed" | "quick" | "bilbakalim";

interface Slot { round: RoundType; label: string; kinds: Question["kind"][]; n: number }
const R = (label: string, n: number, kinds: Question["kind"][], round: RoundType = "all"): Slot => ({ label, n, kinds, round });

export const TEMPLATES: Record<TemplateId, { name: string; description: string; durationSec: number; slots: Slot[]; themed?: boolean }> = {
  classic: {
    name: "Klasik gece", description: "5 tur karışık konu, resim turu yoksa tahmin turu, final bahis sorusu.", durationSec: 30,
    slots: [
      R("Genel kültür", 8, ["open", "choice"]), R("Spor ve müzik", 8, ["open", "choice"]), R("Coğrafya ve tarih", 8, ["open", "choice"]),
      R("Sıralama ve eşleştirme", 6, ["ordering", "matching"]), R("Tahmin turu", 4, ["estimate"]), R("Final", 1, ["choice", "open"], "final"),
    ],
  },
  themed: {
    name: "Tematik gece", description: "Tek konu üzerine 3 tur ve final.", durationSec: 30, themed: true,
    slots: [R("Tur 1", 8, ["open", "choice"]), R("Tur 2", 8, ["open", "choice"]), R("Tur 3", 6, ["ordering", "matching", "estimate"]), R("Final", 1, ["choice"], "final")],
  },
  quick: {
    name: "Hızlı gece (45 dk)", description: "3 tur: Hız ve Herkes cevaplar.", durationSec: 20,
    slots: [R("Isınma", 6, ["choice", "open"]), R("Hız turu", 6, ["choice"], "speed"), R("Son tur", 6, ["open", "choice"])],
  },
  bilbakalim: {
    name: "Bil Bakalım turu", description: "Kısa ve hızlı tek tur, aralara eklenir.", durationSec: 15,
    slots: [R("Bil Bakalım", 10, ["choice"], "speed")],
  },
};

export const THEMES: Record<string, { name: string; categories: string[] }> = {
  futbol: { name: "Futbol", categories: ["Futbol"] },
  dizifilm: { name: "Dizi/Film nostaljisi", categories: ["Dizi/Film"] },
  muzik: { name: "Müzik", categories: ["Müzik"] },
  oyun: { name: "Oyun", categories: ["Oyun"] },
  kampus: { name: "Üniversite hayatı", categories: ["Üniversite/Kampüs"] },
  yerel: { name: "Yerel (şehre özel)", categories: ["Yerel"] },
  yemek: { name: "Yemek", categories: ["Yemek"] },
  "2000ler": { name: "2000'ler", categories: ["Dizi/Film", "Müzik", "Futbol"] },
};

export interface Pool { all: Question[]; seen: Set<string> }

/**
 * Şablondan soru listesi kurar. Mekanın daha önce gördüğü sorular atlanır; havuz yetmezse `low` döner.
 * `allowedKinds` plan kapısıdır.
 */
export function buildNight(opts: {
  template: TemplateId; theme?: string; seen: Set<string>; allowed: { kinds: Set<Question["kind"]>; rounds: Set<RoundType>; image: boolean };
  extra?: Question[]; seed?: string;
}): { questions: Question[]; low: boolean } {
  const tpl = TEMPLATES[opts.template];
  const r = rng(opts.seed ?? String(Math.random()));
  const cats = opts.theme ? THEMES[opts.theme]?.categories : undefined;
  const pool = [...BANK, ...(opts.extra ?? [])].filter((q) => (q.status ?? "approved") === "approved" && (opts.allowed.image || !q.image) && opts.allowed.kinds.has(q.kind));
  const used = new Set<string>();
  const questions: Question[] = [];
  let low = false;
  tpl.slots.forEach((slot, si) => {
    const round: RoundType = opts.allowed.rounds.has(slot.round) ? slot.round : "all";
    const kinds = slot.kinds.filter((k) => opts.allowed.kinds.has(k));
    for (let i = 0; i < slot.n; i++) {
      const kind = kinds.length ? kinds[i % kinds.length] : "choice";
      const pick = (respectSeen: boolean, respectCat: boolean) => sample(pool.filter((q) =>
        q.kind === kind && !used.has(q.id) && (!respectSeen || !opts.seen.has(q.id)) && (!respectCat || !cats || cats.includes(q.category)) &&
        (round !== "speed" || q.kind === "choice")), 1, r)[0];
      let q = pick(true, true) ?? (low = true, pick(false, true)) ?? pick(true, false) ?? pick(false, false);
      if (!q) continue;
      if (round === "speed" && q.kind !== "choice") continue;
      used.add(q.id);
      questions.push({ ...q, round, roundNo: si + 1, roundLabel: slot.label });
    }
  });
  const unseenLeft = pool.filter((q) => !opts.seen.has(q.id) && !used.has(q.id)).length;
  if (unseenLeft < 40) low = true;
  return { questions, low };
}
