import { describe, expect, it } from "vitest";
import { isCorrectOpen, normalizeTr } from "@/lib/engine/normalize";
import { nextPhase } from "@/lib/engine/machine";
import { advance, claimCaptain, createTeam, joinTeam, newGame, overrideTeam, submitAnswer, suggest, tick, GameError } from "@/lib/engine/game";
import { can } from "@config/plans";
import type { Question } from "@/lib/engine/types";

const Q: Question[] = [
  { id: "1", category: "Coğrafya", kind: "choice", text: "Başkent?", options: ["İzmir", "Ankara"], correct: "Ankara", accepted: [] },
  { id: "2", category: "Tarih", kind: "open", text: "Fatih İstanbul'u kaçta aldı?", correct: "1453", accepted: [] },
];

function setup() {
  const g = newGame({ venueName: "Test", questions: Q, code: "ABCD" });
  const a = createTeam(g, { nickname: "Ali", teamName: "Kırmızılar", color: "#D64933", emoji: "⚽", now: 0 });
  const b = createTeam(g, { nickname: "Ayşe", teamName: "Sarılar", color: "#F4B942", emoji: "🎲", now: 0 });
  return { g, a, b };
}

describe("normalizeTr", () => {
  it("Türkçe karakterleri ve büyük harfleri düzler", () => {
    expect(normalizeTr("ISPARTA")).toBe("isparta");
    expect(normalizeTr("İstanbul")).toBe("istanbul");
    expect(normalizeTr("  Çiğ  Köfte! ")).toBe("cig kofte");
    expect(normalizeTr("ŞÜKRÜ Ğ")).toBe("sukru g");
  });
  it("bulanık eşleşme kısa cevaplarda kapalı", () => {
    expect(isCorrectOpen("Ankra", ["Ankara"])).toBe(true);
    expect(isCorrectOpen("Roma", ["Rome"])).toBe(false);
    expect(isCorrectOpen("1454", ["1453"])).toBe(false);
  });
});

describe("durum makinesi", () => {
  it("sırayı izler ve finalde kalır", () => {
    expect(nextPhase("lobby", true)).toBe("round_intro");
    expect(nextPhase("scoreboard", true)).toBe("question_open");
    expect(nextPhase("scoreboard", false)).toBe("final");
    expect(nextPhase("final", false)).toBe("final");
  });
});

describe("oyun", () => {
  it("baştan sona oynanır ve puanlanır", () => {
    const { g, a, b } = setup();
    advance(g, 1000); advance(g, 1000); // intro, soru açık
    expect(g.phase).toBe("question_open");
    submitAnswer(g, { memberToken: a.memberToken, value: "Ankara", lock: true, now: 2000 });
    submitAnswer(g, { memberToken: b.memberToken, value: "İzmir", lock: true, now: 2000 });
    advance(g, 3000); // kilit
    advance(g, 3000); // reveal
    expect(g.teams.find((t) => t.id === a.teamId)!.score).toBe(100);
    expect(g.teams.find((t) => t.id === b.teamId)!.score).toBe(0);
    advance(g, 4000); advance(g, 4000); // scoreboard -> soru 2
    expect(g.qIndex).toBe(1);
    expect(g.answers).toEqual({});
  });

  it("süre sunucu saatine göre kilitlenir", () => {
    const { g, a } = setup();
    advance(g, 0); advance(g, 0);
    expect(tick(g, 29_999)).toBe(false);
    expect(tick(g, 30_000)).toBe(true);
    expect(() => submitAnswer(g, { memberToken: a.memberToken, value: "Ankara", lock: true, now: 30_001 })).toThrow(GameError);
  });

  it("kilitli cevap değişmez, üye cevap gönderemez", () => {
    const { g, a } = setup();
    const m = joinTeam(g, { nickname: "Can", teamRef: a.teamCode, now: 0 });
    advance(g, 0); advance(g, 0);
    expect(() => submitAnswer(g, { memberToken: m.memberToken, value: "Ankara", lock: true, now: 1 })).toThrow(/kaptan/);
    submitAnswer(g, { memberToken: a.memberToken, value: "İzmir", lock: false, now: 1 });
    submitAnswer(g, { memberToken: a.memberToken, value: "Ankara", lock: true, now: 2 });
    expect(() => submitAnswer(g, { memberToken: a.memberToken, value: "İzmir", lock: true, now: 3 })).toThrow(/kilitlendi/);
  });

  it("kaptan 15 sn kopunca takımdan biri devralır", () => {
    const { g, a } = setup();
    const m = joinTeam(g, { nickname: "Can", teamRef: a.teamCode, now: 0 });
    expect(() => claimCaptain(g, m.memberToken, 5_000)).toThrow(/Kaptan bağlı/);
    g.teams[0].members[1].lastSeen = 20_000; // üye bağlı, kaptan değil
    claimCaptain(g, m.memberToken, 20_000);
    expect(g.teams[0].captainId).toBe(m.memberId);
  });

  it("öneri sadece soru açıkken", () => {
    const { g, a } = setup();
    expect(() => suggest(g, a.memberToken, "x")).toThrow();
    advance(g, 0); advance(g, 0);
    suggest(g, a.memberToken, "Ankara");
    expect(g.suggestions[a.teamId][a.memberId]).toBe("Ankara");
  });

  it("host düzeltmesi puanı anında yansıtır", () => {
    const { g, a } = setup();
    advance(g, 0); advance(g, 0);
    submitAnswer(g, { memberToken: a.memberToken, value: "İzmir", lock: true, now: 1 });
    advance(g, 2); advance(g, 2);
    expect(g.teams[0].score).toBe(0);
    overrideTeam(g, a.teamId, true);
    expect(g.teams[0].score).toBe(100);
    overrideTeam(g, a.teamId, false);
    expect(g.teams[0].score).toBe(0);
  });

  it("aynı renk+rozet ve uygunsuz isim reddedilir", () => {
    const { g } = setup();
    expect(() => createTeam(g, { nickname: "X", teamName: "Y", color: "#D64933", emoji: "⚽", now: 0 })).toThrow(/kullanımda/);
    expect(() => createTeam(g, { nickname: "X", teamName: "amk", color: "#5B8DB8", emoji: "🔥", now: 0 })).toThrow(/kullanılamaz/);
  });
});

describe("plan kapıları", () => {
  it("özellikler plana göre açılır", () => {
    expect(can("free", "branding")).toBe(false);
    expect(can("pro", "stats")).toBe(true);
    expect(can("starter", "stats")).toBe(false);
    expect(can("brand", "league")).toBe(true);
  });
});
