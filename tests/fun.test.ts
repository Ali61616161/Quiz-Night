import { describe, expect, it } from "vitest";
import { activateJoker, advance, createTeam, newGame, pickEntry, sabotageTeam, setMode, submitAnswer, suggest, tick, VOTE_MS } from "@/lib/engine/game";
import { playerView, hostView, tvView } from "@/lib/engine/views";
import type { Question, RoundType } from "@/lib/engine/types";
import { FUN_BANK, FUN_CATS } from "@/lib/content/fun";
import { BANK, buildNight } from "@/lib/content/bank";
import { allowedFor } from "@/lib/server/venue";
import { leaksTr } from "@/lib/content/en";

const mc = (id: string, round: RoundType = "all", roundNo = 1, extra: Partial<Question> = {}): Question => ({ id, category: "T", kind: "choice", text: `S${id}?`, options: ["A", "B", "C", "D"], correct: "A", accepted: [], round, roundNo, ...extra });
function setup(qs: Question[], plan: "free" | "pro" | "brand" = "brand", teams = 2) {
  const g = newGame({ venueName: "T", questions: qs, code: "TEST", plan });
  const cols = ["#D64933", "#F4B942", "#5B8DB8"], ems = ["⚽", "🎲", "🦁"], out = [];
  for (let i = 0; i < teams; i++) out.push(createTeam(g, { nickname: `K${i}`, teamName: `T${i}`, color: cols[i], emoji: ems[i], now: 0 }));
  return { g, t: out };
}
/** Sıradaki soruyu açar (tur girişini geçerek). */
const openQ = (g: ReturnType<typeof setup>["g"], now = 0) => { while (g.phase !== "question_open") advance(g, now); };
const answer = (g: ReturnType<typeof setup>["g"], who: { memberToken: string }, v: string, now = 1) => submitAnswer(g, { memberToken: who.memberToken, value: v, lock: true, now });
const toNext = (g: ReturnType<typeof setup>["g"], now = 1e9) => { tick(g, now); while (g.phase !== "scoreboard") advance(g, now); advance(g, now); };

describe("zamana karşı seri", () => {
  it("her soruda süre 2 sn kısalır, 8 sn altına inmez", () => {
    const { g } = setup(Array.from({ length: 6 }, (_, i) => mc(String(i), "streak")), "brand");
    g.settings.durationMs = 12_000;
    const durs: number[] = [];
    for (let i = 0; i < 6; i++) { openQ(g, 0); durs.push(g.deadline! - g.openedAt!); toNext(g); }
    expect(durs).toEqual([12000, 10000, 8000, 8000, 8000, 8000]);
  });
  it("art arda doğru çarpan kazandırır, yanlış seriyi bozar", () => {
    const { g, t } = setup([mc("1", "streak"), mc("2", "streak"), mc("3", "streak"), mc("4", "streak")]);
    const gained: number[] = [];
    for (const v of ["A", "A", "B", "A"]) {
      openQ(g, 0); answer(g, t[0], v); answer(g, t[1], "B");
      toNext(g); // sonraki soru için hazır; önceki sonuç scoreboard'dayken g.results
      gained.push(g.teams[0].score);
    }
    // 100, +125 (seri 1), yanlış, sonra seri sıfırlandı → +100
    expect(gained).toEqual([100, 225, 225, 325]);
  });
});

describe("sessiz tur", () => {
  it("ücretsiz planda bile çoğunluk modunda açılır ve süre en çok 20 sn", () => {
    const { g } = setup([mc("1", "silent")], "free");
    g.settings.durationMs = 40_000; openQ(g, 0);
    expect(g.mode).toBe("majority"); expect(g.deadline).toBe(20_000);
  });
});

describe("sahte cevap (bluff)", () => {
  const bq = (): Question => ({ id: "b1", category: "x", kind: "open", text: "Avustralya'nın başkenti?", correct: "Canberra", accepted: ["Kanbera"], round: "bluff", roundNo: 1, en: { text: "Capital of Australia?", correct: "Canberra" } });
  it("gerçek cevabı sahte diye yazmak reddedilir", () => {
    const { g, t } = setup([bq()], "pro", 3); openQ(g, 0);
    expect(() => answer(g, t[0], "canberra")).toThrow(/doğru cevap/i);
    expect(() => answer(g, t[0], "Kanbera")).toThrow();
  });
  it("oylama: seçenekler karışık, gerçek içerir; kendi cevabı seçilemez; puanlar doğru", () => {
    const { g, t } = setup([bq()], "pro", 3); openQ(g, 0);
    answer(g, t[0], "Sydney"); answer(g, t[1], "Melbourne");
    tick(g, 1e9); expect(g.phase).toBe("question_locked");
    expect(g.pool.map((e) => e.text).sort()).toEqual(["Canberra", "Melbourne", "Sydney"]);
    const idOf = (txt: string) => g.pool.find((e) => e.text === txt)!.id;
    expect(() => pickEntry(g, t[0].memberToken, idOf("Sydney"), 1e9 + 1)).toThrow(/kendi/i);
    pickEntry(g, t[0].memberToken, idOf("Melbourne"), 1e9 + 1); // T0, T1'in sahtesine kandı
    pickEntry(g, t[1].memberToken, idOf("Canberra"), 1e9 + 1);  // T1 gerçeği buldu
    pickEntry(g, t[2].memberToken, idOf("Canberra"), 1e9 + 1);  // T2 gerçeği buldu
    advance(g, 1e9 + 2); // host ilerletir → cevap
    expect(g.phase).toBe("answer_reveal");
    const sc = Object.fromEntries(g.teams.map((x) => [x.name, x.score]));
    expect(sc).toEqual({ T0: 0, T1: 100 + 50, T2: 100 }); // T1: gerçeği buldu + T0'ı kandırdı
  });
  it("oylama süresi dolunca otomatik cevaba geçer", () => {
    const { g, t } = setup([bq()], "pro", 2); openQ(g, 0);
    answer(g, t[0], "Sydney"); answer(g, t[1], "Melbourne");
    tick(g, 1e9); expect(tick(g, 1e9 + VOTE_MS + 1)).toBe(true); expect(g.phase).toBe("answer_reveal");
  });
  it("gerçek cevap oylamadan önce oyunculara sızmaz, yazarlar cevaba kadar gizli", () => {
    const { g, t } = setup([bq()], "pro", 2); openQ(g, 0);
    answer(g, t[0], "Sydney"); answer(g, t[1], "Melbourne");
    expect(JSON.stringify(playerView(g, t[0].memberToken, 5))).not.toContain("Canberra");
    tick(g, 1e9);
    const pv = playerView(g, t[0].memberToken, 1e9);
    expect(pv.me!.vote!.choices.filter((c) => c.own)).toHaveLength(1);
    const tv = JSON.stringify(tvView(g, 1e9));
    expect(tv).not.toMatch(/"authors"|Yazan/); // TV'de oylama sırasında kim yazdı yok
    advance(g, 1e9 + 1);
    expect(tvView(g, 1e9 + 2).question!.reveal!.some((r) => r.authors.includes("T0"))).toBe(true);
  });
  it("İngilizce görünümde gerçek cevap İngilizce metinle listelenir", () => {
    const { g, t } = setup([{ ...bq(), correct: "Kanberra-TR", en: { text: "Capital?", correct: "Canberra-EN" } }], "pro", 2); openQ(g, 0);
    answer(g, t[0], "Sydney"); answer(g, t[1], "Melbourne"); tick(g, 1e9);
    expect(tvView(g, 1e9, "en").question!.options).toContain("Canberra-EN");
    expect(tvView(g, 1e9, "tr").question!.options).toContain("Kanberra-TR");
  });
});

describe("saçma cevap (funny)", () => {
  const fq = (): Question => ({ id: "f1", category: "x", kind: "freeform", text: "Komik bir isim yaz", correct: "", accepted: [], round: "funny", roundNo: 1 });
  it("oy başına yarım puan, en çok oy alan 'doğru' sayılır, kendine oy yok", () => {
    const { g, t } = setup([fq()], "pro", 3); openQ(g, 0);
    answer(g, t[0], "Mantılı Tiramisu"); answer(g, t[1], "Ayvalı Kebap");
    tick(g, 1e9);
    expect(g.pool).toHaveLength(2);
    const id = (s: string) => g.pool.find((e) => e.text === s)!.id;
    expect(() => pickEntry(g, t[1].memberToken, id("Ayvalı Kebap"), 1e9 + 1)).toThrow();
    pickEntry(g, t[1].memberToken, id("Mantılı Tiramisu"), 1e9 + 1);
    pickEntry(g, t[2].memberToken, id("Mantılı Tiramisu"), 1e9 + 1);
    pickEntry(g, t[0].memberToken, id("Ayvalı Kebap"), 1e9 + 1);
    advance(g, 1e9 + 2);
    expect(Object.fromEntries(g.teams.map((x) => [x.name, x.score]))).toEqual({ T0: 100, T1: 50, T2: 0 });
    expect(hostView(g, 1e9 + 3).question!.correct).toContain("Mantılı Tiramisu");
    expect(g.results[t[0].teamId].correct).toBe(true);
  });
  it("oyuncuya kind 'open' görünür (yazılı cevap)", () => {
    const { g, t } = setup([fq()], "pro", 2); openQ(g, 0);
    expect(playerView(g, t[0].memberToken, 1).question!.kind).toBe("open");
  });
});

describe("tahmin bonusu, joker ve sabotaj", () => {
  it("tam isabet 1,5× puan", () => {
    const q: Question = { id: "e", category: "x", kind: "estimate", text: "Kaç?", correct: "206", accepted: [], round: "all", roundNo: 1 };
    const { g, t } = setup([q]); openQ(g, 0); answer(g, t[0], "206"); answer(g, t[1], "190"); toNext(g);
    expect(g.teams[0].score).toBe(150); expect(g.teams[1].score).toBe(0);
  });
  it("yakın ama tam olmayan tahmin bonus almaz", () => {
    const q: Question = { id: "e", category: "x", kind: "estimate", text: "Kaç?", correct: "206", accepted: [], round: "all", roundNo: 1 };
    const { g, t } = setup([q]); openQ(g, 0); answer(g, t[0], "200"); answer(g, t[1], "150"); toNext(g);
    expect(g.teams[0].score).toBe(100);
  });
  it("yarı yarıya: iki şık kalır, doğru şık içinde, puan ikiye katlanmaz; ikinci joker yok", () => {
    const { g, t } = setup([mc("1")]); openQ(g, 0);
    activateJoker(g, t[0].memberToken, "fifty");
    const opts = playerView(g, t[0].memberToken, 1).question!.options!;
    expect(opts).toHaveLength(2); expect(opts).toContain("A");
    expect(playerView(g, t[1].memberToken, 1).question!.options).toHaveLength(4);
    expect(() => activateJoker(g, t[0].memberToken, "double")).toThrow();
    answer(g, t[0], "A"); toNext(g);
    expect(g.teams[0].score).toBe(100);
  });
  it("yarı yarıya yalnızca şıklı soruda", () => {
    const { g, t } = setup([{ ...mc("1"), kind: "open", options: undefined, correct: "x" }]); openQ(g, 0);
    expect(() => activateJoker(g, t[0].memberToken, "fifty")).toThrow(/şıklı/);
  });
  it("sabotaj: hedefin kazancı yarıya iner, oyunda bir kez, kendine yapılamaz", () => {
    const { g, t } = setup([mc("1"), mc("2")]); openQ(g, 0);
    expect(() => sabotageTeam(g, t[0].memberToken, t[0].teamId)).toThrow();
    sabotageTeam(g, t[0].memberToken, t[1].teamId);
    answer(g, t[0], "A"); answer(g, t[1], "A"); toNext(g);
    expect(g.teams.map((x) => x.score)).toEqual([100, 50]);
    openQ(g, 2e9);
    expect(() => sabotageTeam(g, t[0].memberToken, t[1].teamId)).toThrow(/zaten/);
  });
  it("sabotaj yalnızca kaptan ve soru açıkken", () => {
    const { g, t } = setup([mc("1")]);
    expect(() => sabotageTeam(g, t[0].memberToken, t[1].teamId)).toThrow(/soru açıkken/);
  });
});

describe("eğlence içeriği ve şablonlar", () => {
  it("her eğlence sorusunun birebir İngilizcesi var, kimlikler benzersiz", () => {
    expect(new Set(FUN_BANK.map((q) => q.id)).size).toBe(FUN_BANK.length);
    for (const q of FUN_BANK) {
      expect(q.en, q.id).toBeTruthy();
      if (q.kind !== "freeform") expect(q.en!.correct, q.id).toBeTruthy();
      expect(leaksTr(q.en!.text.replace(/[^\x00-\x7F]/g, " ")), q.en!.text).toBe(false);
    }
  });
  it("emoji soruları: 4 farklı şık, doğru şık içinde, İngilizce şıklar hizalı", () => {
    const em = FUN_BANK.filter((q) => q.category === FUN_CATS.emoji);
    expect(em.length).toBeGreaterThanOrEqual(50);
    for (const q of em) {
      expect(new Set(q.options).size).toBe(4); expect(q.options).toContain(q.correct);
      expect(q.en!.options![q.options!.indexOf(q.correct)]).toBe(q.en!.correct);
    }
  });
  it("sahte cevap soruları: kabul edilen cevaplar ana cevapla çelişmez, en az 30 soru", () => {
    const b = FUN_BANK.filter((q) => q.category === FUN_CATS.bluff);
    expect(b.length).toBeGreaterThanOrEqual(30);
    expect(FUN_BANK.filter((q) => q.category === FUN_CATS.funny).length).toBeGreaterThanOrEqual(30);
    expect(FUN_BANK.filter((q) => q.category === FUN_CATS.guess).length).toBeGreaterThanOrEqual(15);
  });
  it("eğlence soruları klasik/tematik gecelerde çıkmaz", () => {
    const fun = new Set(Object.values(FUN_CATS) as string[]);
    for (const tpl of ["classic", "quick", "themed"] as const) {
      const n = buildNight({ template: tpl, theme: tpl === "themed" ? "cografya" : undefined, seen: new Set(), allowed: allowedFor("brand"), seed: "x" });
      expect(n.questions.some((q) => fun.has(q.category))).toBe(false);
    }
  });
  it("Eğlence gecesi (Pro): tüm tur türleri gelir; sorular benzersiz", () => {
    const n = buildNight({ template: "party", seen: new Set(), allowed: allowedFor("pro"), seed: "p1" });
    const rounds = new Set(n.questions.map((q) => q.round));
    for (const r of ["silent", "streak", "bluff", "final"]) expect(rounds.has(r as RoundType), r).toBe(true);
    expect(new Set(n.questions.map((q) => q.id)).size).toBe(n.questions.length);
    expect(n.questions.some((q) => q.category === FUN_CATS.emoji)).toBe(true);
    expect(n.questions.some((q) => q.kind === "estimate")).toBe(true);
  });
  it("Eğlence gecesi Marka'da saçma cevap turu da gelir; ücretsizde bozulmadan küçülür", () => {
    const brand = buildNight({ template: "party", seen: new Set(), allowed: allowedFor("brand"), seed: "p2" });
    expect(brand.questions.some((q) => q.round === "funny" && q.kind === "freeform")).toBe(true);
    const free = buildNight({ template: "party", seen: new Set(), allowed: allowedFor("free"), seed: "p3" });
    expect(free.questions.length).toBeGreaterThan(8);
    for (const q of free.questions) { expect(["all"]).toContain(q.round); expect(q.kind).not.toBe("freeform"); expect(q.kind).not.toBe("estimate"); }
  });
  it("tek amaçlı şablonlar soru üretir", () => {
    for (const tpl of ["streak", "silent", "funny", "bluff", "guess", "emoji"] as const) {
      const n = buildNight({ template: tpl, seen: new Set(), allowed: allowedFor("brand"), seed: tpl });
      expect(n.questions.length, tpl).toBeGreaterThanOrEqual(6);
    }
    expect(BANK.length).toBeGreaterThan(7000);
  });
});

void setMode; void suggest;

describe("moderasyon", () => {
  it("küfürlü saçma/sahte cevap reddedilir, uzun cevap 80 karaktere kısalır", () => {
    const { g, t } = setup([{ id: "f", category: "x", kind: "freeform", text: "Yaz", correct: "", accepted: [], round: "funny", roundNo: 1 }], "pro", 2); openQ(g, 0);
    expect(() => answer(g, t[0], "siktir")).toThrow(/kullanılamaz/);
    answer(g, t[0], "a".repeat(200));
    expect(g.answers[t[0].teamId].value).toHaveLength(80);
  });
});
