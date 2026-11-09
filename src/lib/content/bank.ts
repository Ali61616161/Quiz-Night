import { createHash } from "node:crypto";
import { normalizeTr } from "@/lib/engine/normalize";
import type { Question, RoundType } from "@/lib/engine/types";

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

import { ESTIMATES, ORDERINGS } from "./facts";
import { ASK_EN, hasTurkish, toEn } from "./en";
import { estimates, expand, expandSingles, matchings, orderings } from "./gen";
import { BILIM, BILIM_SINGLES } from "./sets/bilim";
import { DIZIFILM, DIZIFILM_SINGLES } from "./sets/dizifilm";
import { EDEBIYAT, EDEBIYAT_SINGLES } from "./sets/edebiyat";
import { FUTBOL, FUTBOL_SINGLES } from "./sets/futbol";
import { GENEL, GENEL_SINGLES } from "./sets/genel";
import { GEO, GEO_SINGLES } from "./sets/geo";
import { KAMPUS, KAMPUS_SINGLES } from "./sets/kampus";
import { MUZIK, MUZIK_SINGLES } from "./sets/muzik";
import { OYUN, OYUN_SINGLES } from "./sets/oyun";
import { SANAT, SANAT_SINGLES } from "./sets/sanat";
import { SPOR, SPOR_SINGLES } from "./sets/spor";
import { TARIH, TARIH_SINGLES } from "./sets/tarih";
import { YEMEK, YEMEK_SINGLES } from "./sets/yemek";
import { YEREL, YEREL_SINGLES } from "./sets/yerel";
import { DOGA, DOGA_SINGLES } from "./sets/doga";
import { GUNDEM, GUNDEM_SINGLES } from "./sets/gundem";
import { TEKNOLOJI, TEKNOLOJI_SINGLES } from "./sets/teknoloji";

export const ALL_SETS = [...GEO, ...TARIH, ...BILIM, ...FUTBOL, ...SPOR, ...DIZIFILM, ...MUZIK, ...EDEBIYAT, ...SANAT, ...YEMEK, ...OYUN, ...KAMPUS, ...YEREL, ...GENEL, ...GUNDEM, ...TEKNOLOJI, ...DOGA];
const ALL_SINGLES = [...GEO_SINGLES, ...TARIH_SINGLES, ...BILIM_SINGLES, ...FUTBOL_SINGLES, ...SPOR_SINGLES, ...DIZIFILM_SINGLES, ...MUZIK_SINGLES, ...EDEBIYAT_SINGLES, ...SANAT_SINGLES, ...YEMEK_SINGLES, ...OYUN_SINGLES, ...KAMPUS_SINGLES, ...YEREL_SINGLES, ...GENEL_SINGLES, ...GUNDEM_SINGLES, ...TEKNOLOJI_SINGLES, ...DOGA_SINGLES];

function build(): Question[] {
  const out: Question[] = [...expand(ALL_SETS), ...expandSingles(ALL_SINGLES)];
  const byId = (id: string) => ALL_SETS.find((x) => x.id === id)!;
  out.push(
    ...orderings(byId("olay"), { label: () => "Olayları eskiden yeniye doğru sırala.", item: 0, num: 1, k: 40, gap: 15 }),
    ...orderings(byId("padisah"), { label: () => "Osmanlı padişahlarını tahta çıkış sırasına göre diz.", item: 1, num: 0, k: 10, gap: 3 }),
    ...orderings(byId("dk"), { label: () => "Dünya Kupası şampiyonlarını (turnuva yılına göre) eskiden yeniye diz.", item: 1, num: 0, k: 8, gap: 8, fmt: (r) => `${r[1].split(";")[0]} (${r[0]})` }),
    ...orderings(byId("oy"), { label: () => "Yaz Olimpiyatlarının düzenlendiği şehirleri eskiden yeniye diz.", item: 1, num: 0, k: 8, gap: 8, fmt: (r) => `${r[1]} (${r[0]})` }),
    ...orderings(byId("konsol"), { label: () => "Konsolları çıkış yılına göre eskiden yeniye diz.", item: 0, num: 2, k: 6, gap: 4 }),
    ...orderings(byId("oyun"), { label: () => "Oyunları çıkış yılına göre eskiden yeniye diz.", item: 0, num: 2, k: 10, gap: 6 }),
    ...orderings(byId("film"), { label: () => "Filmleri vizyon yılına göre eskiden yeniye diz.", item: 0, num: 2, k: 10, gap: 6 }),
    ...orderings(byId("dizi"), { label: () => "Dizileri ilk yayın yılına göre eskiden yeniye diz.", item: 0, num: 1, k: 6, gap: 5 }),
    ...orderings(byId("element"), { label: () => "Elementleri atom numarasına göre küçükten büyüğe diz.", item: 0, num: 2, k: 10, gap: 4 }),
    ...orderings(byId("il"), { label: () => "İlleri plaka kodlarına göre küçükten büyüğe diz.", item: 0, num: 1, k: 10, gap: 5 }),
    ...matchings(byId("cap"), { text: "Ülkeleri başkentleriyle eşleştir.", left: 0, right: 1, k: 14 }),
    ...matchings(byId("il"), { text: "Bu illeri plaka kodlarıyla eşleştir.", left: 0, right: 1, k: 8 }),
    ...matchings(byId("abd"), { text: "ABD eyaletlerini başkentleriyle eşleştir.", left: 0, right: 1, k: 8 }),
    ...matchings(byId("element"), { text: "Elementleri simgeleriyle eşleştir.", left: 0, right: 1, k: 10 }),
    ...matchings(byId("kitap"), { text: "Eserleri yazarlarıyla eşleştir.", left: 0, right: 1, k: 10 }),
    ...matchings(byId("sarki"), { text: "Şarkıları sanatçılarıyla eşleştir.", left: 0, right: 1, k: 10 }),
    ...matchings(byId("film"), { text: "Filmleri yönetmenleriyle eşleştir.", left: 0, right: 1, k: 8 }),
    ...matchings(byId("marka"), { text: "Markaları ülkeleriyle eşleştir.", left: 0, right: 1, k: 8 }),
    ...matchings(byId("yore"), { text: "Yöresel lezzetleri illeriyle eşleştir.", left: 0, right: 1, k: 6 }),
    ...matchings(byId("tru"), { text: "Üniversiteleri şehirleriyle eşleştir.", left: 0, right: 1, k: 6 }),
    ...matchings(byId("kulup"), { text: "Kulüpleri ülkeleriyle eşleştir.", left: 0, right: 1, k: 6 }),
    ...matchings(byId("sporcu"), { text: "Sporcuları spor dallarıyla eşleştir.", left: 0, right: 1, k: 6 }),
    ...matchings(byId("muze"), { text: "Müzeleri şehirleriyle eşleştir.", left: 0, right: 1, k: 6 }),
    ...orderings(byId("gundem"), { label: () => "Olayları eskiden yeniye doğru sırala.", item: 0, num: 1, k: 24, gap: 2 }),
    ...orderings(byId("sirket"), { label: () => "Şirketleri kuruluş yılına göre eskiden yeniye diz.", item: 0, num: 1, k: 6, gap: 4 }),
    ...orderings(byId("lansman"), { label: () => "Teknolojileri ortaya çıkış yılına göre eskiden yeniye diz.", item: 0, num: 1, k: 8, gap: 4 }),
    ...matchings(byId("sirket"), { text: "Şirketleri kurucularıyla eşleştir.", left: 0, right: 2, k: 4 }),
    ...matchings(byId("kisaltma"), { text: "Kısaltmaları açılımlarıyla eşleştir.", left: 0, right: 1, k: 6 }),
    ...matchings(byId("progdil"), { text: "Programlama dillerini geliştiricileriyle eşleştir.", left: 0, right: 1, k: 3 }),
    ...matchings(byId("bulus"), { text: "Buluşları mucitleriyle eşleştir.", left: 0, right: 1, k: 4 }),
  );
  out.push(
    ...estimates(byId("olay"), { t: (x) => `${x} hangi yıl gerçekleşmiştir? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 60 }),
    ...estimates(byId("film"), { t: (x) => `“${x}” filmi hangi yıl vizyona girmiştir? (En yakın tahmin kazanır)`, item: 0, num: 2, k: 25 }),
    ...estimates(byId("oyun"), { t: (x) => `${x} oyunu hangi yıl çıkmıştır? (En yakın tahmin kazanır)`, item: 0, num: 2, k: 25 }),
    ...estimates(byId("dizi"), { t: (x) => `“${x}” dizisi hangi yıl yayına başlamıştır? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 15 }),
    ...estimates(byId("konsol"), { t: (x) => `${x} hangi yıl piyasaya çıkmıştır? (En yakın tahmin kazanır)`, item: 0, num: 2, k: 10 }),
    ...estimates(byId("dogum"), { t: (x) => `${x} hangi yıl doğmuştur? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 15 }),
    ...estimates(byId("kdn"), { t: (x) => `${x} hangi yıl kurulmuştur? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 15 }),
    ...estimates(byId("gundem"), { t: (x) => `${x} hangi yıl gerçekleşmiştir? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 40 }),
    ...estimates(byId("sirket"), { t: (x) => `${x} hangi yıl kurulmuştur? (En yakın tahmin kazanır)`, item: 0, num: 1, k: 15 }),
    ...estimates(byId("element"), { t: (x) => `${x} elementinin atom numarası kaçtır? (En yakın tahmin kazanır)`, item: 0, num: 2, k: 20 }),
  );
  // Elle yazılmış sıralama/tahmin soruları
  ORDERINGS.forEach((o, i) => out.push({ id: `ord-${i}`, category: o.cat, difficulty: o.diff, kind: "ordering", text: o.text, items: o.items, correct: JSON.stringify(o.items), accepted: [], status: "approved", reports: 0 }));
  ESTIMATES.forEach((e, i) => out.push({ id: `est-${i}`, category: e.cat, difficulty: e.diff, kind: "estimate", text: e.text, correct: String(e.answer), accepted: [], explanation: e.explain ?? `Doğru cevap yaklaşık ${e.answer.toLocaleString("tr-TR")}.`, status: "approved", reports: 0 }));
  // Aynı metin iki kez üretildiyse ilkini tut (eşleştirme setleri hariç: metin ortak, kimlik farklı)
  const seen = new Set<string>(); const uniq: Question[] = [];
  for (const q of out) {
    if (q.kind === "ordering" && q.items!.length < 3) continue;
    const key = q.kind === "matching" || q.kind === "ordering" ? q.id : normalizeTr(q.text);
    if (seen.has(key)) continue; seen.add(key); uniq.push(q);
  }
  return uniq.filter((q, i, arr) => arr.findIndex((x) => x.id === q.id) === i);
}

export const BANK: Question[] = build();

/** İngilizce havuz: aynı olgu tablolarından İngilizce şablon ve sözlükle üretilir; güvenilir çevirisi olmayan satırlar atlanır. */
function buildEn(): Question[] {
  const out = expand(ALL_SETS, "en", { ask: ASK_EN, toEn });
  const seen = new Set<string>();
  return out.filter((q) => { if (hasTurkish(q.text) || hasTurkish(q.correct) || (q.options ?? []).some(hasTurkish)) return false; const k = normalizeTr(q.text); if (seen.has(k)) return false; seen.add(k); return true; });
}
export const BANK_EN: Question[] = buildEn();

/** Kalıcı zorluk düzeltmeleri (süper admin onayı) açılışta uygulanır. */
export function applyDifficultyOverrides(o: Record<string, 1 | 2 | 3>) { for (const q of BANK) if (o[q.id]) q.difficulty = o[q.id]; }
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
  cografya: { name: "Coğrafya", categories: ["Coğrafya"] },
  tarih: { name: "Tarih", categories: ["Tarih"] },
  bilim: { name: "Bilim", categories: ["Bilim"] },
  futbol: { name: "Futbol", categories: ["Futbol"] },
  spor: { name: "Spor", categories: ["Spor"] },
  dizifilm: { name: "Dizi/Film", categories: ["Dizi/Film"] },
  muzik: { name: "Müzik", categories: ["Müzik"] },
  edebiyat: { name: "Edebiyat", categories: ["Edebiyat"] },
  sanat: { name: "Sanat", categories: ["Sanat"] },
  yemek: { name: "Yemek", categories: ["Yemek"] },
  oyun: { name: "Oyun", categories: ["Oyun"] },
  kampus: { name: "Üniversite hayatı", categories: ["Üniversite/Kampüs"] },
  yerel: { name: "Yerel (şehir ve İstanbul)", categories: ["Yerel"] },
  genel: { name: "Genel kültür", categories: ["Genel Kültür"] },
  gundem: { name: "Gündem (2000-2026)", categories: ["Gündem"] },
  teknoloji: { name: "Teknoloji", categories: ["Teknoloji"] },
  doga: { name: "Doğa ve hayvanlar", categories: ["Doğa ve Hayvanlar"] },
  "2000ler": { name: "Eğlence karması (dizi, film, müzik, futbol)", categories: ["Dizi/Film", "Müzik", "Futbol"] },
};

export interface Pool { all: Question[]; seen: Set<string> }

/**
 * Şablondan soru listesi kurar. Mekanın daha önce gördüğü sorular atlanır; havuz yetmezse `low` döner.
 * `allowedKinds` plan kapısıdır.
 */
export function buildNight(opts: {
  template: TemplateId; theme?: string; seen: Set<string>; allowed: { kinds: Set<Question["kind"]>; rounds: Set<RoundType>; image: boolean };
  extra?: Question[]; seed?: string; lang?: "tr" | "en";
}): { questions: Question[]; low: boolean } {
  const tpl = TEMPLATES[opts.template];
  const r = rng(opts.seed ?? String(Math.random()));
  const base = opts.lang === "en" ? BANK_EN : BANK;
  let cats = opts.theme ? THEMES[opts.theme]?.categories : undefined;
  // İngilizce havuzda bir konu yeterince soru içermiyorsa karışık havuza geçilir (host'a düşük havuz uyarısı gider)
  const thin = Boolean(cats && base.filter((q) => cats!.includes(q.category)).length < 60);
  if (thin) cats = undefined;
  const pool = [...base, ...(opts.extra ?? [])].filter((q) => (q.status ?? "approved") === "approved" && (opts.allowed.image || !q.image) && opts.allowed.kinds.has(q.kind));
  const used = new Set<string>();
  const questions: Question[] = [];
  let low = thin;
  tpl.slots.forEach((slot, si) => {
    const round: RoundType = opts.allowed.rounds.has(slot.round) ? slot.round : "all";
    const kinds = slot.kinds.filter((k) => opts.allowed.kinds.has(k));
    for (let i = 0; i < slot.n; i++) {
      const kind = kinds.length ? kinds[i % kinds.length] : "choice";
      const usage = new Map<string, number>();
      for (const x of questions) usage.set(x.category, (usage.get(x.category) ?? 0) + 1);
      let kindOk = (k: Question["kind"]) => k === kind;
      const pick = (respectSeen: boolean, respectCat: boolean) => {
        const cand = pool.filter((q) => (kindOk(q.kind)) && !used.has(q.id) && (!respectSeen || !opts.seen.has(q.id)) && (!respectCat || !cats || cats.includes(q.category)) && (round !== "speed" || q.kind === "choice"));
        if (!cand.length) return undefined;
        const subPick = (arr: Question[]) => {
          const bySub = new Map<string, Question[]>();
          for (const q of arr) (bySub.get(q.subtopic ?? "-") ?? bySub.set(q.subtopic ?? "-", []).get(q.subtopic ?? "-")!).push(q);
          const su = (k: string) => questions.filter((x) => (x.subtopic ?? "-") === k).length;
          const m = Math.min(...[...bySub.keys()].map(su));
          return sample(bySub.get(sample([...bySub.keys()].filter((k) => su(k) === m), 1, r)[0])!, 1, r)[0];
        };
        if (cats && respectCat) return subPick(cand);
        // Karışık gece: konulara eşit şans (havuzda çok soru olan konu baskın çıkmasın), en az kullanılan konu önce
        const byCat = new Map<string, Question[]>();
        for (const q of cand) (byCat.get(q.category) ?? byCat.set(q.category, []).get(q.category)!).push(q);
        const min = Math.min(...[...byCat.keys()].map((c) => usage.get(c) ?? 0));
        const open = [...byCat.keys()].filter((c) => (usage.get(c) ?? 0) === min);
        return subPick(byCat.get(sample(open, 1, r)[0])!);
      };
      // Görülmemiş soru her zaman önceliklidir: önce konuda, sonra başka konularda; ancak tükenince görülmüş soru tekrar kullanılır.
      const fallbackKind = (k: Question["kind"]) => k === "choice" || (round !== "speed" && k === "open");
      const withKind = (f: (k: Question["kind"]) => boolean, seen: boolean, cat: boolean) => { kindOk = f; return pick(seen, cat); };
      const same = (k: Question["kind"]) => k === kind;
      // Sıra: görülmemiş + konu + biçim → görülmemiş + konu + şıklı/açık → görülmemiş + başka konu → ancak tükenince tekrar
      let q = withKind(same, true, true) ?? withKind(fallbackKind, true, true) ?? withKind(same, true, false) ?? withKind(fallbackKind, true, false);
      if (!q) { low = true; q = withKind(same, false, true) ?? withKind(fallbackKind, false, true) ?? withKind(same, false, false); }
      if (!q) continue;
      if (round === "speed" && q.kind !== "choice") continue;
      used.add(q.id);
      questions.push({ ...q, round, roundNo: si + 1, roundLabel: slot.label });
    }
  });
  const scope = cats ? pool.filter((q) => cats.includes(q.category)) : pool;
  const unseenLeft = scope.filter((q) => !opts.seen.has(q.id) && !used.has(q.id)).length;
  if (unseenLeft < (cats ? 60 : 300)) low = true; // havuz azalıyor: host'a uyarı
  return { questions, low };
}
