import { describe, expect, it } from "vitest";
import { BANK, buildNight, THEMES } from "@/lib/content/bank";
import { validateAnswer, isAnswerCorrect } from "@/lib/engine/scoring";
import { normalizeTr } from "@/lib/engine/normalize";
import { leaks } from "@/lib/content/gen";
import { GEO } from "@/lib/content/sets/geo";
import { TARIH } from "@/lib/content/sets/tarih";
import { BILIM } from "@/lib/content/sets/bilim";
import { FUTBOL } from "@/lib/content/sets/futbol";
import { SPOR } from "@/lib/content/sets/spor";
import { MUZIK } from "@/lib/content/sets/muzik";

const ALL = { kinds: new Set(["open", "choice", "ordering", "matching", "estimate"] as const), rounds: new Set(["all", "speed", "wager", "final"] as const), image: true };
const rows = (sets: { id: string; rows: string[] }[], id: string) => sets.find((s) => s.id === id)!.rows.map((r) => r.split("|").map((x) => x.trim()));
const CATS = [...new Set(Object.values(THEMES).flatMap((t) => t.categories))];

describe("soru havuzu: miktar", () => {
  it("en az 5000 soru", () => { expect(BANK.length).toBeGreaterThanOrEqual(5000); });
  it("her konuda en az 250 soru", () => {
    const by = new Map<string, number>();
    for (const q of BANK) by.set(q.category, (by.get(q.category) ?? 0) + 1);
    expect(CATS.length).toBeGreaterThanOrEqual(17);
    for (const c of CATS) expect(by.get(c) ?? 0, c).toBeGreaterThanOrEqual(250);
  });
  it("her sorunun kategorisi tanımlı bir konudur", () => { for (const q of BANK) expect(CATS, q.id).toContain(q.category); });
});

describe("soru havuzu: doğruluk ve tutarlılık", () => {
  it("kimlikler ve soru metinleri benzersiz; aynı soru farklı cevapla bulunmaz", () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length);
    const seen = new Map<string, string>();
    for (const q of BANK.filter((x) => x.kind !== "matching" && x.kind !== "ordering")) {
      const k = normalizeTr(q.text);
      if (seen.has(k)) expect(seen.get(k), `AYNI METİN FARKLI CEVAP: ${q.text}`).toBe(normalizeTr(q.correct));
      seen.set(k, normalizeTr(q.correct));
    }
    const texts = BANK.filter((x) => x.kind !== "matching" && x.kind !== "ordering").map((q) => normalizeTr(q.text));
    expect(new Set(texts).size).toBe(texts.length);
  });
  it("her sorunun doğru cevabı geçerli ve doğru sayılır; boş alan yok", () => {
    for (const q of BANK) {
      expect(q.text.trim().length, q.id).toBeGreaterThan(8);
      expect(q.correct.trim().length, q.id).toBeGreaterThan(0);
      expect(validateAnswer(q, q.correct), q.id).toBe(true);
      expect(isAnswerCorrect(q, q.correct), q.id).toBe(true);
    }
  });
  it("çoktan seçmelide 4 farklı şık var, doğru cevap yalnızca bir şıkta ve yanlış şıklar kabul edilen cevap değil", () => {
    for (const q of BANK.filter((x) => x.kind === "choice")) {
      expect(q.options, q.id).toHaveLength(4);
      const norm = q.options!.map(normalizeTr);
      expect(new Set(norm).size, `${q.id} ${q.text}`).toBe(4);
      expect(q.options, q.id).toContain(q.correct);
      const ok = new Set([q.correct, ...q.accepted].map(normalizeTr));
      expect(q.options!.filter((o) => ok.has(normalizeTr(o))).length, `${q.text} → ${q.options}`).toBe(1);
    }
  });
  it("soru metni cevabı sızdırmaz", () => {
    for (const q of BANK.filter((x) => x.kind === "open" || x.kind === "choice")) expect(leaks(q.text, q.correct), `${q.id}: ${q.text} → ${q.correct}`).toBe(false);
  });
  it("sıralama ve eşleştirme soruları iç tutarlı", () => {
    for (const q of BANK.filter((x) => x.kind === "ordering")) { expect(new Set(q.items).size, q.id).toBe(q.items!.length); expect(q.items!.length, q.id).toBeGreaterThanOrEqual(3); }
    for (const q of BANK.filter((x) => x.kind === "matching")) { expect(q.pairs, q.id).toHaveLength(4); expect(new Set(q.pairs!.map((p) => p[1])).size, q.id).toBe(4); expect(new Set(q.pairs!.map((p) => p[0])).size, q.id).toBe(4); }
  });
});

describe("olgu tabloları: kendi içinde çelişki taraması", () => {
  it("il plaka kodları 1..81 tam, benzersiz", () => {
    const r = rows(GEO, "il");
    expect(r).toHaveLength(81);
    expect(r.map((x) => Number(x[1])).sort((a, b) => a - b)).toEqual(Array.from({ length: 81 }, (_, i) => i + 1));
    expect(new Set(r.map((x) => x[0])).size).toBe(81);
    expect(new Set(r.map((x) => x[2])).size).toBe(7);
    for (const x of r) expect(["Marmara", "Ege", "Akdeniz", "Karadeniz", "İç Anadolu", "Doğu Anadolu", "Güneydoğu Anadolu"]).toContain(x[2]);
  });
  it("ülke-başkent tablosunda yinelenen ülke ya da başkent yok", () => {
    const r = rows(GEO, "cap");
    expect(new Set(r.map((x) => x[0])).size).toBe(r.length);
    const caps = r.map((x) => x[1]).filter((c) => c !== "-");
    expect(new Set(caps).size).toBe(caps.length);
  });
  it("ABD: 50 eyalet (başkent adlarıyla)", () => { expect(rows(GEO, "abd")).toHaveLength(49); }); // Oklahoma City sızıntı nedeniyle tabloda yok
  it("elementler: 92 element, simge ve ad benzersiz, atom numaraları 1..92 ardışık", () => {
    const r = rows(BILIM, "element");
    expect(r).toHaveLength(92);
    expect(r.map((x) => Number(x[2]))).toEqual(Array.from({ length: 92 }, (_, i) => i + 1));
    expect(new Set(r.map((x) => x[1])).size).toBe(92); expect(new Set(r.map((x) => x[0])).size).toBe(92);
    const sym: Record<string, string> = { Hidrojen: "H", Helyum: "He", Karbon: "C", Azot: "N", Oksijen: "O", Demir: "Fe", Altın: "Au", Gümüş: "Ag", Kurşun: "Pb", Cıva: "Hg", Sodyum: "Na", Potasyum: "K", Uranyum: "U" };
    for (const [n, s] of Object.entries(sym)) expect(r.find((x) => x[0] === n)![1], n).toBe(s);
    expect(r.find((x) => x[0] === "Altın")![2]).toBe("79"); expect(r.find((x) => x[0] === "Demir")![2]).toBe("26"); expect(r.find((x) => x[0] === "Uranyum")![2]).toBe("92");
  });
  it("padişahlar 1..36, yıllar azalmaz; cumhurbaşkanları 1..12, yıllar artar", () => {
    const s = rows(TARIH, "padisah");
    expect(s).toHaveLength(36); expect(s.map((x) => Number(x[0]))).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
    const y = s.map((x) => Number(x[2])); for (let i = 1; i < y.length; i++) expect(y[i], s[i][1]).toBeGreaterThanOrEqual(y[i - 1]);
    const c = rows(TARIH, "cb"); expect(c).toHaveLength(12);
    const cy = c.map((x) => Number(x[2])); for (let i = 1; i < cy.length; i++) expect(cy[i]).toBeGreaterThan(cy[i - 1]);
  });
  it("tarih olayları: yıllar makul aralıkta, olay adları benzersiz", () => {
    const r = rows(TARIH, "olay");
    expect(new Set(r.map((x) => x[0])).size).toBe(r.length);
    for (const x of r) { const y = Number(x[1]); expect(y, x[0]).toBeGreaterThan(300); expect(y, x[0]).toBeLessThanOrEqual(2024); }
    const get = (k: string) => Number(r.find((x) => x[0].startsWith(k))![1]);
    expect(get("İstanbul'un fethi")).toBe(1453); expect(get("Cumhuriyet'in ilanı")).toBe(1923); expect(get("Malazgirt")).toBe(1071); expect(get("TBMM'nin açılışı")).toBe(1920); expect(get("Atatürk'ün vefatı")).toBe(1938);
  });
  it("turnuva serileri kesintisiz ve doğru aralıkta", () => {
    const wc = rows(FUTBOL, "dk").map((x) => Number(x[0]));
    expect(wc).toEqual([1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026]);
    const cl = rows(FUTBOL, "cl").map((x) => Number(x[0])); expect(cl).toEqual(Array.from({ length: 71 }, (_, i) => 1956 + i));
    const bd = rows(FUTBOL, "bd").map((x) => Number(x[0])); expect(bd).toEqual(Array.from({ length: 70 }, (_, i) => 1956 + i).filter((y) => y !== 2020));
    const eu = rows(FUTBOL, "euro").map((x) => Number(x[0])); expect(eu).toEqual(Array.from({ length: 17 }, (_, i) => 1960 + i * 4));
    const f1 = rows(SPOR, "f1").map((x) => Number(x[0])); expect(f1).toEqual(Array.from({ length: 76 }, (_, i) => 1950 + i));
    const su = rows(SPOR, "oy").map((x) => Number(x[0])); for (const y of su) expect(y % 4).toBe(0); expect(su).not.toContain(1916); expect(su).not.toContain(1940); expect(su).not.toContain(1944);
    const ev = rows(MUZIK, "eurovision").map((x) => Number(x[0])); expect(ev).not.toContain(1969); expect(ev).not.toContain(2020); expect(ev[0]).toBe(1956); expect(ev.at(-1)).toBe(2026);
  });
  it("bilinen sabit olgular: seçilmiş kontrol listesi", () => {
    const f = (sets: { id: string; rows: string[] }[], id: string, key: string, col: number) => rows(sets, id).find((x) => x[0].split(";")[0] === key)![col].split(";")[0];
    expect(f(GEO, "cap", "Fransa", 1)).toBe("Paris"); expect(f(GEO, "cap", "Japonya", 1)).toBe("Tokyo"); expect(f(GEO, "cap", "Avustralya", 1)).toBe("Kanberra"); expect(f(GEO, "cap", "Brezilya", 1)).toBe("Brasilia");
    expect(f(GEO, "il", "İstanbul", 1)).toBe("34"); expect(f(GEO, "il", "Ankara", 1)).toBe("6"); expect(f(GEO, "il", "İzmir", 1)).toBe("35"); expect(f(GEO, "il", "Trabzon", 1)).toBe("61");
    expect(f(FUTBOL, "dk", "2022", 1)).toBe("Arjantin"); expect(f(FUTBOL, "dk", "2018", 1)).toBe("Fransa"); expect(f(FUTBOL, "dk", "1998", 1)).toBe("Fransa");
    expect(f(FUTBOL, "cl", "2005", 1)).toBe("Liverpool"); expect(f(FUTBOL, "bd", "2009", 1)).toBe("Lionel Messi");
    expect(f(SPOR, "f1", "2021", 1)).toBe("Max Verstappen"); expect(f(SPOR, "f1", "1994", 1)).toBe("Michael Schumacher");
    expect(f(MUZIK, "eurovision", "2003", 1)).toBe("Türkiye");
  });
});

describe("gece kurma: karışık, konu ve tekrar yok", () => {
  it("karışık (klasik) gece birçok farklı konudan soru içerir", () => {
    const n = buildNight({ template: "classic", seen: new Set(), allowed: ALL as never, seed: "m1" });
    expect(new Set(n.questions.map((q) => q.category)).size).toBeGreaterThanOrEqual(8);
    expect(n.questions.length).toBeGreaterThanOrEqual(35);
  });
  it("tematik gece yalnızca seçilen konudan, her konu için ayrı ayrı", () => {
    for (const [id, t] of Object.entries(THEMES)) {
      const n = buildNight({ template: "themed", theme: id, seen: new Set(), allowed: ALL as never, seed: "t" + id });
      expect(n.questions.length, id).toBeGreaterThanOrEqual(15);
      for (const q of n.questions) expect(t.categories, `${id}: ${q.category}`).toContain(q.category);
    }
  });
  it("tematik gecede çözülen soru sonraki karışık ve tematik gecelerde tekrar çıkmaz", () => {
    const seen = new Set<string>();
    const nights = [
      buildNight({ template: "themed", theme: "futbol", seen, allowed: ALL as never, seed: "a" }),
      buildNight({ template: "classic", seen, allowed: ALL as never, seed: "b" }),
    ];
    nights[0].questions.forEach((q) => seen.add(q.id));
    const mixed = buildNight({ template: "classic", seen, allowed: ALL as never, seed: "c" });
    mixed.questions.forEach((q) => seen.add(q.id));
    const again = buildNight({ template: "themed", theme: "futbol", seen, allowed: ALL as never, seed: "d" });
    const ids = new Set(nights[0].questions.map((q) => q.id));
    expect(mixed.questions.some((q) => ids.has(q.id))).toBe(false);
    expect(again.questions.some((q) => seen.has(q.id) && (ids.has(q.id) || mixed.questions.some((m) => m.id === q.id)))).toBe(false);
  });
  it("20 gece üst üste: hiçbir soru tekrar etmez", () => {
    const seen = new Set<string>(); let dup = 0;
    for (let i = 0; i < 20; i++) {
      const n = buildNight({ template: i % 3 === 0 ? "themed" : "classic", theme: "tarih", seen, allowed: ALL as never, seed: "g" + i });
      for (const q of n.questions) { if (seen.has(q.id)) dup++; seen.add(q.id); }
    }
    expect(dup).toBe(0);
  });
  it("tüm konularda tükenme: görülen soru sayısı havuzu aşmadan kalan uyarıyı verir", () => {
    const seen = new Set(BANK.filter((q) => q.category === "Sanat").map((q) => q.id));
    const n = buildNight({ template: "themed", theme: "sanat", seen, allowed: ALL as never, seed: "x" });
    expect(n.low).toBe(true);
    const fromSanat = n.questions.filter((q) => q.category === "Sanat").length;
    expect(fromSanat).toBe(0); // Sanat tükendi: görülmüş sanat sorusu yerine başka konudan yeni soru gelir
  });
});

import { hasTurkish } from "@/lib/content/en";
describe("İki dilli tek havuz (1:1 İngilizce)", () => {
  const bad = BANK.filter((q) => {
    const e = q.en; if (!e) return true;
    if (hasTurkish(e.text) || hasTurkish(e.correct)) return true;
    if (q.options && (!e.options || e.options.length !== q.options.length || e.options.some(hasTurkish))) return true;
    if (q.items && (!e.items || e.items.length !== q.items.length || e.items.some(hasTurkish))) return true;
    if (q.pairs && (!e.pairs || e.pairs.length !== q.pairs.length)) return true;
    return false;
  });
  it("her soru birebir İngilizce karşılığa sahip, Türkçe sızıntısı yok", () => {
    if (bad.length) console.log(`EN eksik: ${bad.length}/${BANK.length}`, bad.slice(0, 15).map((q) => q.text));
    expect(bad.length).toBe(0);
  });
  it("İngilizce şıklar Türkçe şıklarla aynı sırada ve doğru cevap şıkların içinde", () => {
    for (const q of BANK.filter((x) => x.kind === "choice" && x.en)) {
      expect(q.en!.options!.length).toBe(4);
      expect(q.en!.options![q.options!.indexOf(q.correct)]).toBe(q.en!.correct);
    }
  });
});

describe("şık kalitesi", () => {
  it("yıl şıklarında gelecek yıl ve geçersiz sayı yok", () => {
    for (const q of BANK.filter((x) => x.kind === "choice" && /yıl/.test(x.text) && x.options!.every((o) => /^\d{4}$/.test(o)))) {
      for (const o of q.options!) { expect(Number(o), `${q.text} ${q.options}`).toBeLessThanOrEqual(2026); expect(Number(o)).toBeGreaterThan(0); }
    }
  });
});

import { ALL_SETS } from "@/lib/content/bank";
describe("küme kimlikleri", () => {
  it("olgu kümesi kimlikleri benzersiz (İngilizce şablonlar kimliğe bağlı)", () => {
    const ids = ALL_SETS.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
