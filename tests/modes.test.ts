import { describe, expect, it } from "vitest";
import { advance, appeal, createTeam, joinTeam, newGame, overrideTeam, placeWager, setMode, submitAnswer, suggest, tick, useJoker, voidQuestion, GameError } from "@/lib/engine/game";
import { playerView, hostView, tvView } from "@/lib/engine/views";
import type { Question } from "@/lib/engine/types";

const mc = (id: string, extra: Partial<Question> = {}): Question => ({ id, category: "T", kind: "choice", text: "S?", options: ["A", "B", "C", "D"], correct: "A", accepted: [], roundNo: 1, ...extra });

function setup(qs: Question[], plan: "free" | "pro" | "brand" = "brand") {
  const g = newGame({ venueName: "T", questions: qs, code: "TEST", plan });
  const a = createTeam(g, { nickname: "Ali", teamName: "Kırmızı", color: "#D64933", emoji: "⚽", now: 0 });
  const b = createTeam(g, { nickname: "Ayşe", teamName: "Sarı", color: "#F4B942", emoji: "🎲", now: 0 });
  return { g, a, b };
}
const open = (g: ReturnType<typeof setup>["g"]) => { advance(g, 0); if (g.phase === "round_intro") advance(g, 0); };

describe("takım modları", () => {
  it("çoğunluk: en çok oy alan cevap takımın cevabı olur", () => {
    const { g, a } = setup([mc("1")]);
    const m2 = joinTeam(g, { nickname: "B", teamRef: a.teamCode, now: 0 });
    const m3 = joinTeam(g, { nickname: "C", teamRef: a.teamCode, now: 0 });
    setMode(g, "majority"); open(g);
    suggest(g, a.memberToken, "B", 1); suggest(g, m2.memberToken, "A", 2); suggest(g, m3.memberToken, "A", 3);
    tick(g, 1e9); advance(g, 1e9);
    expect(g.teams[0].score).toBe(100);
  });
  it("çoğunluk beraberliğinde kaptanın oyu kazanır", () => {
    const { g, a } = setup([mc("1")]);
    const m2 = joinTeam(g, { nickname: "B", teamRef: a.teamCode, now: 0 });
    setMode(g, "majority"); open(g);
    suggest(g, m2.memberToken, "B", 1); suggest(g, a.memberToken, "A", 5);
    tick(g, 1e9); expect(g.answers[a.teamId].value).toBe("A");
  });
  it("çoğunluk modunda kaptan doğrudan cevap gönderemez", () => {
    const { g, a } = setup([mc("1")]); setMode(g, "majority"); open(g);
    expect(() => submitAnswer(g, { memberToken: a.memberToken, value: "A", lock: true, now: 1 })).toThrow(/öneri\/oy/);
  });
  it("bireysel: takım puanı üyelerin ortalaması, toplam ayarı toplar", () => {
    const { g, a } = setup([mc("1"), mc("2")]);
    const m2 = joinTeam(g, { nickname: "B", teamRef: a.teamCode, now: 0 });
    setMode(g, "individual"); open(g);
    suggest(g, a.memberToken, "A", 1); suggest(g, m2.memberToken, "B", 2);
    advance(g, 5); advance(g, 5);
    expect(g.teams[0].score).toBe(50);
  });
  it("ücretsiz planda bireysel/çoğunluk modu kapalı", () => {
    const { g } = setup([mc("1")], "free");
    expect(() => setMode(g, "majority")).toThrow(/planında yok/);
    expect(() => setMode(g, "individual")).toThrow(GameError);
  });
});

describe("tur tipleri", () => {
  it("hız: ilk doğru en çok, sonraki azalan puan alır", () => {
    const { g, a, b } = setup([mc("1", { round: "speed" })]); open(g);
    submitAnswer(g, { memberToken: b.memberToken, value: "A", lock: true, now: 100 });
    submitAnswer(g, { memberToken: a.memberToken, value: "A", lock: true, now: 200 });
    advance(g, 300); advance(g, 300);
    expect(g.teams.find((t) => t.id === b.teamId)!.score).toBe(100);
    expect(g.teams.find((t) => t.id === a.teamId)!.score).toBe(90);
  });
  it("bahis: doğruysa kazanır, yanlışsa kaybeder; soru görünmeden bahis girilir", () => {
    const { g, a, b } = setup([mc("1", { round: "wager" })]);
    advance(g, 0);
    expect(g.phase).toBe("round_intro");
    expect(playerView(g, a.memberToken, 0).question?.text).toBeNull();
    placeWager(g, a.memberToken, 40); placeWager(g, b.memberToken, 30);
    expect(() => placeWager(g, a.memberToken, 999)).toThrow(/arasında/);
    advance(g, 0);
    submitAnswer(g, { memberToken: a.memberToken, value: "A", lock: true, now: 1 });
    submitAnswer(g, { memberToken: b.memberToken, value: "B", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams.find((t) => t.id === a.teamId)!.score).toBe(40);
    expect(g.teams.find((t) => t.id === b.teamId)!.score).toBe(-30);
  });
  it("joker puanı ikiye katlar, yalnızca bir kez", () => {
    const { g, a } = setup([mc("1"), mc("2")]); open(g);
    useJoker(g, a.memberToken);
    expect(() => useJoker(g, a.memberToken)).toThrow(/zaten/);
    submitAnswer(g, { memberToken: a.memberToken, value: "A", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams[0].score).toBe(200);
  });
  it("tahmin: en yakın takım kazanır", () => {
    const q: Question = { id: "e", category: "T", kind: "estimate", text: "?", correct: "81", accepted: [], roundNo: 1 };
    const { g, a, b } = setup([q]); open(g);
    submitAnswer(g, { memberToken: a.memberToken, value: "80", lock: true, now: 1 });
    submitAnswer(g, { memberToken: b.memberToken, value: "50", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams.find((t) => t.id === a.teamId)!.score).toBe(100);
    expect(g.teams.find((t) => t.id === b.teamId)!.score).toBe(0);
  });
  it("sıralama ve eşleştirme doğrulanır; geçersiz cevap reddedilir", () => {
    const o: Question = { id: "o", category: "T", kind: "ordering", text: "?", items: ["1", "2", "3"], correct: JSON.stringify(["1", "2", "3"]), accepted: [], roundNo: 1 };
    const { g, a } = setup([o]); open(g);
    expect(() => submitAnswer(g, { memberToken: a.memberToken, value: JSON.stringify(["1", "2"]), lock: true, now: 1 })).toThrow(/Geçersiz/);
    submitAnswer(g, { memberToken: a.memberToken, value: JSON.stringify(["1", "2", "3"]), lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams[0].score).toBe(100);
  });
  it("sıralama sorusu görünümü cevabı karışık verir ve sızdırmaz", () => {
    const o: Question = { id: "o", category: "T", kind: "ordering", text: "?", items: ["1", "2", "3", "4"], correct: "x", accepted: [], roundNo: 1 };
    const { g, a } = setup([o]); open(g);
    const v = playerView(g, a.memberToken, 0);
    expect(v.question?.items).not.toEqual(["1", "2", "3", "4"]);
    expect(JSON.stringify(v)).not.toContain('"correct"');
  });
});

describe("host", () => {
  it("hatalı soru puanları iptal eder", () => {
    const { g, a } = setup([mc("1")]); open(g);
    submitAnswer(g, { memberToken: a.memberToken, value: "A", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams[0].score).toBe(100);
    voidQuestion(g, false);
    expect(g.teams[0].score).toBe(0);
  });
  it("itiraz host kararıyla kapanır", () => {
    const { g, a } = setup([mc("1")]); open(g);
    submitAnswer(g, { memberToken: a.memberToken, value: "B", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    appeal(g, a.memberToken, "bence doğru");
    expect(hostView(g, 0).appeals).toHaveLength(1);
    overrideTeam(g, a.teamId, true);
    expect(hostView(g, 0).appeals).toHaveLength(0);
    expect(g.teams.find((t) => t.id === a.teamId)!.score).toBe(100);
  });
  it("ücretsiz planda 10 oyuncu sınırı", () => {
    const g = newGame({ venueName: "T", questions: [mc("1")], plan: "free" });
    const t = createTeam(g, { nickname: "A", teamName: "T1", color: "#D64933", emoji: "⚽", now: 0 });
    for (let i = 1; i < 6; i++) joinTeam(g, { nickname: "x" + i, teamRef: t.teamCode, now: 0 });
    const t2 = createTeam(g, { nickname: "B", teamName: "T2", color: "#F4B942", emoji: "🎲", now: 0 });
    for (let i = 1; i < 4; i++) joinTeam(g, { nickname: "y" + i, teamRef: t2.teamCode, now: 0 });
    expect(() => joinTeam(g, { nickname: "z", teamRef: t2.teamCode, now: 0 })).toThrow(/10 oyuncu/);
  });
});

describe("sızıntı (güvenlik)", () => {
  it("soru açıkken TV/oyuncu görünümü doğru cevabı içermez", () => {
    const { g, a } = setup([mc("1", { explanation: "SIRRI" })]); open(g);
    for (const v of [tvView(g, 0), playerView(g, a.memberToken, 0)]) {
      const s = JSON.stringify(v);
      expect(s).not.toContain("SIRRI"); expect(s).not.toContain('"correct"');
    }
  });
  it("başka takımın cevabı oyuncuya görünmez", () => {
    const { g, a, b } = setup([mc("1")]); open(g);
    submitAnswer(g, { memberToken: b.memberToken, value: "D", lock: true, now: 1 });
    expect(JSON.stringify(playerView(g, a.memberToken, 0))).not.toContain('"value":"D"');
  });
  it("host görünümünde cevap metni soru açıkken gizli", () => {
    const { g, b } = setup([mc("1")]); open(g);
    submitAnswer(g, { memberToken: b.memberToken, value: "D", lock: false, now: 1 });
    expect(hostView(g, 0).teamDetails.every((t) => t.answerValue === null)).toBe(true);
  });
});
