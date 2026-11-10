import { createHash } from "node:crypto";
import { normalizeTr } from "@/lib/engine/normalize";
import type { Question } from "@/lib/engine/types";

/** Soru metni cevabı (ya da gövdesini) içeriyorsa soru üretilmez: cevabı sızdırır. */
export function leaks(text: string, correct: string): boolean {
  const n = normalizeTr(correct);
  if (n.length < 4) return false;
  return normalizeTr(text).includes(n.slice(0, Math.max(4, n.length - 2)));
}

/**
 * Olgu kümeleri → sorular.
 * Satır: "alan0|alan1|alan2". Bir alan "a;b" yazılırsa ilk değer ana cevap, kalanlar kabul edilen alternatiflerdir.
 * Boş ya da "-" alan o satır için o soruyu atlar.
 *
 * Doğruluk güvenceleri (testlerle denetlenir):
 *  - Sorunun sorulduğu alan (`by`) sütununda benzersiz olmalı, yoksa soru üretilmez (tek net cevap).
 *  - Yanlış şıklar aynı cevap sütunundan gelir ve doğru cevap/alternatifleriyle çakışmaz.
 *  - Soru metni cevabı içermez.
 */
export interface Ask {
  /** {0},{1}.. alan yer tutucuları */
  t: string;
  /** cevap alanı */
  a: number;
  /** soruda kullanılan alanlar (hepsi sütununda benzersiz olmalı) */
  by: number[];
  /** sayısal cevap (yakın sayılarla şık üretilir) */
  num?: boolean;
  /** her zaman şıklı */
  choice?: boolean;
  explain?: string;
  /** Yanlış şıklar bu sütunda aynı değere sahip satırlardan öncelikli seçilir (örn. aynı kıta/bölge): kafa karıştıran yakın şıklar */
  near?: number;
  /** Yanlış şıklar, bu sütunda doğru satırla aynı değere sahip satırlardan seçilmez (örn. aynı yıl: o yıl da gerçekleşmiş olabilir) */
  exSame?: number;
  /** İngilizce soru şablonu (yoksa İngilizce havuza girmez) */
  en?: string;
}
export interface FactSet { id: string; cat: string; sub: string; diff: 1 | 2 | 3; rows: string[]; asks: Ask[] }
export interface Single { q: string; a: string; alts?: string[]; wrong?: string[]; explain?: string }
export interface SingleSet { id: string; cat: string; sub: string; diff: 1 | 2 | 3; rows: string[] } // "soru|cevap|alt1;alt2|yanlış1;yanlış2;yanlış3"

export function rng(seed: string) {
  let h = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
}
export function sample<T>(arr: T[], n: number, r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const hid = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 10);
const valid = (v: string | undefined) => v !== undefined && v.trim() !== "" && v.trim() !== "-";

function simScore(a: string, b: string): number {
  const na = normalizeTr(a), nb = normalizeTr(b);
  let sc = 0;
  if (na[0] === nb[0]) sc += 2;
  if (na.split(" ").length === nb.split(" ").length) sc += 1.5;
  const lr = Math.min(na.length, nb.length) / Math.max(na.length, nb.length); sc += lr * 2;
  const ta = new Set(na.split(" ")); for (const w of nb.split(" ")) if (w.length > 2 && ta.has(w)) sc += 1.5;
  if (na.slice(-3) === nb.slice(-3)) sc += 1;
  if (/\d/.test(na) === /\d/.test(nb)) sc += 0.5;
  return sc;
}

function nearNumbers(v: number, r: () => number): string[] {
  const out = new Set<number>();
  const step = v >= 10000 ? 500 : v >= 1700 && v < 2100 ? 3 : v >= 1000 ? 25 : v >= 100 ? 7 : v >= 20 ? 4 : 2;
  let guard = 0;
  while (out.size < 3 && guard++ < 80) {
    const c = v + (Math.floor(r() * 4) + 1) * step * (r() < 0.5 ? -1 : 1);
    if (c > 0 && c !== v && !(v >= 1700 && v <= 2026 && c > 2026)) out.add(c); // gelecek yıl şıkkı olmaz
  }
  return [...out].map(String);
}

const PLACEHOLDER = /\{(\d)\}/g;

/**
 * Olgu kümelerinden iki dilli sorular üretir: Türkçe soru + `en` (İngilizce karşılığı).
 * İngilizce şablon (ASK_EN) ve alan sözlüğü (toEn) tam değilse `en` boş kalır; test bunu hata sayar.
 */
export function expand(sets: FactSet[], en?: { ask: Record<string, string>; toEn: (f: string) => string | null }): Question[] {
  const out: Question[] = [];
  for (const s of sets) {
    const parsed = s.rows.map((row) => row.split("|").map((f) => f.trim()));
    const parsedEn = parsed.map((p) => p.map((f) => (f === "-" || f === "" ? "-" : en?.toEn(f) ?? "-")));
    const width = Math.max(...parsed.map((p) => p.length));
    const colCount: Map<string, number>[] = Array.from({ length: width }, () => new Map());
    for (const p of parsed) p.forEach((f, i) => { if (valid(f)) { const k = f.split(";")[0]; colCount[i].set(k, (colCount[i].get(k) ?? 0) + 1); } });
    s.asks.forEach((ask, ai) => {
      const answers = [...new Set(parsed.filter((p) => valid(p[ask.a])).map((p) => p[ask.a].split(";")[0]))];
      // Türkçe cevap → İngilizce cevap eşlemesi (şıkları İngilizceye aynı sırayla çevirmek için)
      const ansEn = new Map<string, string>();
      parsed.forEach((p, i) => { const t = p[ask.a]?.split(";")[0], e = parsedEn[i][ask.a]?.split(";")[0]; if (valid(t) && valid(e)) ansEn.set(t, e); });
      parsed.forEach((p, ri) => {
        if (!valid(p[ask.a]) || !ask.by.every((b) => valid(p[b]) && colCount[b].get(p[b].split(";")[0]) === 1)) return;
        const [correct, ...alts] = p[ask.a].split(";");
        const text = ask.t.replace(PLACEHOLDER, (_, d) => p[Number(d)].split(";")[0]);
        if (leaks(text, correct)) return;
        const r = rng(`${s.id}:${ai}:${ri}`);
        const numeric = ask.num && /^\d+$/.test(correct);
        const wrongPool = answers.filter((x) => x !== correct && !alts.includes(x));
        const sameGroup = new Set(ask.near !== undefined ? parsed.filter((q) => q !== p && valid(q[ask.a]) && q[ask.near!] === p[ask.near!]).map((q) => q[ask.a].split(";")[0]) : []);
        const blockedYear = new Set(ask.exSame !== undefined ? parsed.filter((q) => q[ask.exSame!] === p[ask.exSame!]).map((q) => q[ask.a].split(";")[0]) : []);
        const candidates = wrongPool.filter((x) => !blockedYear.has(x));
        const ranked = [...candidates].map((x) => ({ x, sc: simScore(correct, x) + (sameGroup.has(x) ? 4 : 0) + r() * 1.2 })).sort((a, b) => b.sc - a.sc).slice(0, 3).map((o) => o.x);
        const useChoice = ask.choice || (candidates.length >= 3 && r() < 0.6);
        const base = { id: `${s.id}-${hid(text + "=" + correct)}`, category: s.cat, subtopic: s.sub, difficulty: s.diff, text, correct, accepted: alts, explanation: ask.explain, status: "approved" as const, reports: 0 };
        let q: Question;
        if (useChoice) {
          const wrong = numeric ? nearNumbers(Number(correct), r) : ranked;
          if (wrong.length < 3) q = { ...base, kind: numeric ? "estimate" : "open" };
          else q = { ...base, kind: "choice", options: sample([correct, ...wrong], 4, r) };
        } else q = { ...base, kind: "open" };
        // İngilizce karşılık
        const tmpl = en?.ask[`${s.id}:${ai}`];
        if (tmpl) {
          const pe = parsedEn[ri];
          const phs = [...tmpl.matchAll(PLACEHOLDER)].map((m) => Number(m[1]));
          if (phs.every((d) => valid(pe[d])) && valid(pe[ask.a])) {
            const [cEn, ...aEn] = pe[ask.a].split(";");
            const optsEn = q.options ? q.options.map((o) => (numeric || /^\d+$/.test(o) ? o : ansEn.get(o) ?? null)) : undefined;
            if (!optsEn || optsEn.every((o) => o !== null)) {
              q.en = { text: tmpl.replace(PLACEHOLDER, (_, d) => pe[Number(d)].split(";")[0]), correct: cEn, accepted: aEn, ...(optsEn ? { options: optsEn as string[] } : {}), ...(ask.explain ? {} : {}) };
            }
          }
        }
        out.push(q);
      });
    });
  }
  return out;
}

export function expandSingles(sets: SingleSet[], enRows: Record<string, string[]> = {}): Question[] {
  const out: Question[] = [];
  for (const s of sets) s.rows.forEach((row, ri) => {
    const [q, a, alt, wrong] = row.split("|").map((x) => x?.trim() ?? "");
    if (leaks(q, a)) return;
    const r = rng(`${s.id}:${q}`);
    const base = { id: `${s.id}-${hid(q + "=" + a)}`, category: s.cat, subtopic: s.sub, difficulty: s.diff, text: q, correct: a, accepted: alt ? alt.split(";") : [], status: "approved" as const, reports: 0 };
    const w = wrong ? wrong.split(";") : [];
    const er = enRows[s.id]?.[ri];
    const [eq, ea, ealt, ewrong] = er ? er.split("|").map((x) => x?.trim() ?? "") : ["", "", "", ""];
    const ew = ewrong ? ewrong.split(";") : [];
    if (w.length >= 3) {
      const trArr = [a, ...w.slice(0, 3)], enArr = [ea, ...ew.slice(0, 3)];
      const perm = sample([0, 1, 2, 3], 4, r);
      const qu: Question = { ...base, kind: "choice", options: perm.map((i) => trArr[i]) };
      if (er && eq && ea && ew.length >= 3) qu.en = { text: eq, correct: ea, accepted: ealt ? ealt.split(";") : [], options: perm.map((i) => enArr[i]) };
      out.push(qu);
    } else {
      const qu: Question = { ...base, kind: "open" };
      if (er && eq && ea) qu.en = { text: eq, correct: ea, accepted: ealt ? ealt.split(";") : [] };
      out.push(qu);
    }
  });
  return out;
}

export interface EnHelper { label: string; toEn: (f: string) => string | null }
const pairRows = (set: FactSet, en?: EnHelper) => set.rows.map((x) => { const t = x.split("|").map((f) => f.trim()); return { t, e: t.map((f) => (f === "-" || f === "" ? "-" : en?.toEn(f) ?? "-")) }; });

/** Sayısal alanı olan kümeden sıralama soruları: n öğe, aralarında en az `gap` fark. */
export function orderings(set: FactSet, o: { label: (n: number) => string; item: number; num: number; k: number; n?: number; gap: number; asc?: boolean; fmt?: (row: string[]) => string }, en?: EnHelper): Question[] {
  const rows = pairRows(set, en).filter((p) => valid(p.t[o.item]) && /^-?\d+$/.test(p.t[o.num] ?? ""));
  const out: Question[] = [];
  for (let k = 0; k < o.k; k++) {
    const r = rng(`${set.id}:ord:${k}`);
    const pick = sample(rows, rows.length, r);
    const chosen: typeof rows = [];
    for (const row of pick) {
      if (chosen.every((c) => Math.abs(Number(c.t[o.num]) - Number(row.t[o.num])) >= o.gap)) chosen.push(row);
      if (chosen.length === (o.n ?? 4)) break;
    }
    if (chosen.length < (o.n ?? 4)) continue;
    chosen.sort((a, b) => (Number(a.t[o.num]) - Number(b.t[o.num])) * (o.asc === false ? -1 : 1));
    const items = chosen.map((c) => (o.fmt ? o.fmt(c.t) : c.t[o.item].split(";")[0]));
    if (new Set(items).size !== items.length) continue;
    const q: Question = { id: `${set.id}-ord-${hid(items.join())}`, category: set.cat, subtopic: set.sub, difficulty: 2, kind: "ordering", text: o.label(k), items, correct: JSON.stringify(items), accepted: [], status: "approved", reports: 0 };
    if (en && chosen.every((c) => valid(c.e[o.item]))) {
      const itemsEn = chosen.map((c) => (o.fmt ? o.fmt(c.e) : c.e[o.item].split(";")[0]));
      if (new Set(itemsEn).size === itemsEn.length && !itemsEn.some((x) => x.includes("-") && x.startsWith("-"))) q.en = { text: en.label, items: itemsEn, correct: JSON.stringify(itemsEn) };
    }
    out.push(q);
  }
  return out;
}

/** Eşleştirme: iki sütun, 4'lü; sağ sütun benzersiz olmalı. */
export function matchings(set: FactSet, o: { text: string; left: number; right: number; k: number }, en?: EnHelper): Question[] {
  const rows = pairRows(set, en).filter((p) => valid(p.t[o.left]) && valid(p.t[o.right]));
  const out: Question[] = [];
  for (let k = 0; k < o.k; k++) {
    const r = rng(`${set.id}:match:${k}`);
    const chosen: typeof rows = []; const seenR = new Set<string>(); const seenL = new Set<string>();
    for (const row of sample(rows, rows.length, r)) {
      const L = row.t[o.left].split(";")[0], R = row.t[o.right].split(";")[0];
      if (seenR.has(R) || seenL.has(L)) continue;
      seenR.add(R); seenL.add(L); chosen.push(row);
      if (chosen.length === 4) break;
    }
    if (chosen.length < 4) continue;
    const pairs = chosen.map((c) => [c.t[o.left].split(";")[0], c.t[o.right].split(";")[0]] as [string, string]);
    const q: Question = { id: `${set.id}-match-${hid(pairs.join("|"))}`, category: set.cat, subtopic: set.sub, difficulty: 2, kind: "matching", text: o.text, pairs, correct: JSON.stringify(pairs.map((p) => p[1])), accepted: [], status: "approved", reports: 0 };
    if (en && chosen.every((c) => valid(c.e[o.left]) && valid(c.e[o.right]))) {
      const pe = chosen.map((c) => [c.e[o.left].split(";")[0], c.e[o.right].split(";")[0]] as [string, string]);
      if (new Set(pe.map((x) => x[1])).size === 4 && new Set(pe.map((x) => x[0])).size === 4) q.en = { text: en.label, pairs: pe, correct: JSON.stringify(pe.map((x) => x[1])) };
    }
    out.push(q);
  }
  return out;
}

/** Yıl/sayı alanlarından "en yakın tahmin" soruları. */
export function estimates(set: FactSet, o: { t: (item: string) => string; item: number; num: number; k: number; unit?: string }, en?: EnHelper & { t: (item: string) => string }): Question[] {
  const rows = pairRows(set).filter((p) => valid(p.t[o.item]) && /^\d+$/.test(p.t[o.num] ?? ""));
  const encoded = en ? pairRows(set, en).filter((p) => valid(p.t[o.item]) && /^\d+$/.test(p.t[o.num] ?? "")) : [];
  const r = rng(`${set.id}:est`);
  const idx = sample(rows.map((_, i) => i), o.k, r);
  return idx.map((i) => {
    const row = rows[i].t;
    const q: Question = { id: `${set.id}-est-${hid(row[o.item] + row[o.num])}`, category: set.cat, subtopic: set.sub, difficulty: 3, kind: "estimate", text: o.t(row[o.item].split(";")[0]), correct: row[o.num], accepted: [], explanation: `Doğru cevap ${row[o.num]}.`, status: "approved", reports: 0 };
    const e = encoded[i]?.e;
    if (en && e && valid(e[o.item])) q.en = { text: en.t(e[o.item].split(";")[0]), correct: row[o.num], explanation: `The correct answer is ${row[o.num]}.` };
    return q;
  });
}
