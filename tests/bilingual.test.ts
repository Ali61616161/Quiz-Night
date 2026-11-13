import { describe, expect, it } from "vitest";
import { BANK, FUN_ALL, TEMPLATES, THEMES, buildNight, type TemplateId } from "@/lib/content/bank";
import { FUN_CATS } from "@/lib/content/fun";
import { leaksTr } from "@/lib/content/en";
import { activateJoker, advance, createTeam, newGame, pickEntry, placeWager, sabotageTeam, submitAnswer, suggest, tick } from "@/lib/engine/game";
import { localizeValue } from "@/lib/engine/scoring";
import { playerView, tvView, hostView } from "@/lib/engine/views";
import { allowedFor } from "@/lib/server/venue";
import type { Question } from "@/lib/engine/types";

const TPL = Object.keys(TEMPLATES) as TemplateId[];
const sizeOf = (t: TemplateId) => TEMPLATES[t].slots.reduce((a, s) => a + s.n, 0);

describe("soru havuzu derinliği (eklemeye gerek kalmasın)", () => {
  it("eğlence havuzları çok büyük", () => {
    const by: Record<string, number> = {};
    for (const q of FUN_ALL) by[q.category] = (by[q.category] ?? 0) + 1;
    expect(by[FUN_CATS.emoji]).toBeGreaterThanOrEqual(700);
    expect(by[FUN_CATS.funny]).toBeGreaterThanOrEqual(700);
    expect(by[FUN_CATS.bluff]).toBeGreaterThanOrEqual(3000);
    expect(by[FUN_CATS.guess]).toBeGreaterThanOrEqual(800);
    expect(BANK.length).toBeGreaterThanOrEqual(7000);
  });
  it("her türetilmiş eğlence sorusunun temiz İngilizcesi var", () => {
    for (const q of FUN_ALL) {
      expect(q.en, q.id).toBeTruthy();
      expect(q.en!.text.length, q.id).toBeGreaterThan(3);
      if (q.kind !== "freeform") expect(q.en!.correct, q.id).toBeTruthy();
      expect(leaksTr(q.en!.text), q.en!.text).toBe(false);
      if (q.kind === "choice") { expect(q.en!.options!.length).toBe(q.options!.length); expect(q.en!.options![q.options!.indexOf(q.correct)]).toBe(q.en!.correct); }
    }
  });
  for (const tpl of TPL) {
    it(`${tpl}: 30 ardışık gecede soru tükenmez, tekrar yok, her gece tam boyutta`, () => {
      const seen = new Set<string>(); const nights = 30;
      for (let n = 0; n < nights; n++) {
        const night = buildNight({ template: tpl, theme: tpl === "themed" ? "cografya" : undefined, seen, allowed: allowedFor("brand"), seed: `${tpl}-${n}` });
        expect(night.questions.length, `${tpl} gece ${n}`).toBe(sizeOf(tpl));
        expect(night.low, `${tpl} gece ${n} havuz uyarısı`).toBe(false);
        for (const q of night.questions) { expect(seen.has(q.id), `${tpl} tekrar: ${q.id}`).toBe(false); }
        for (const q of night.questions) seen.add(q.id);
      }
    });
  }
  it("her tematik gece 8 gece boyunca tükenmez", () => {
    for (const th of Object.keys(THEMES)) {
      const seen = new Set<string>();
      for (let n = 0; n < 8; n++) {
        const night = buildNight({ template: "themed", theme: th, seen, allowed: allowedFor("brand"), seed: `${th}-${n}` });
        expect(night.questions.length, `${th} ${n}`).toBe(sizeOf("themed"));
        for (const q of night.questions) { expect(seen.has(q.id), `${th} tekrar`).toBe(false); seen.add(q.id); }
      }
    }
  });
});

// ---- İki dilli uçtan uca oyun: Türkçe ve İngilizce istemci aynı puanları üretmeli ----
type G = ReturnType<typeof newGame>;
function playNight(qs: Question[], lang: "tr" | "en") {
  const g: G = newGame({ venueName: "T", questions: qs.map((q) => ({ ...q })), code: "BI", plan: "brand", lang });
  const cols = ["#D64933", "#F4B942", "#5B8DB8"], ems = ["⚽", "🎲", "🦁"];
  const T = [0, 1, 2].map((i) => createTeam(g, { nickname: `K${i}`, teamName: `T${i}`, color: cols[i], emoji: ems[i], now: 0 }));
  const loc = (q: Question, v: string) => (lang === "en" ? localizeValue(q, v, "en") : v);
  const leaks: string[] = [];
  const usedJoker = new Set<string>();
  let now = 1_000, guard = 0;
  while (g.phase !== "final" && guard++ < 5000) {
    const q = g.questions[g.qIndex];
    if (g.phase === "round_intro" && (q.round === "wager" || q.round === "final")) for (const t of T) placeWager(g, t.memberToken, 20);
    if (g.phase === "question_open") {
      // İngilizce görünümde Türkçe sızıntı denetimi
      const pv = playerView(g, T[0].memberToken, now, lang).question!;
      for (const s of [pv.text ?? "", ...(pv.options ?? []), ...(pv.items ?? [])]) if (lang === "en" && leaksTr(s)) leaks.push(`${q.id}: ${s}`);
      void tvView(g, now, lang); void hostView(g, now, {}, lang);
      if (q.round === "streak" && !usedJoker.has(q.kind)) { usedJoker.add(q.kind); if (!g.jokersUsed.includes(T[1].teamId)) activateJoker(g, T[1].memberToken, q.kind === "choice" ? "fifty" : "double"); }
      if (q.round === "silent" && !g.sabotageUsed.includes(T[2].teamId)) sabotageTeam(g, T[2].memberToken, T[0].teamId);
      const vals: string[] = [];
      for (let i = 0; i < 3; i++) {
        let v: string;
        if (q.round === "bluff" || q.round === "funny") v = `Uydurma ${i} ${q.id}`;
        else if (q.kind === "choice") v = i === 1 ? q.options!.find((o) => o !== q.correct)! : q.correct;
        else if (q.kind === "ordering") v = JSON.stringify(i === 1 ? [...q.items!].reverse() : q.items);
        else if (q.kind === "matching") v = JSON.stringify(i === 1 ? [...q.pairs!.map((p) => p[1])].reverse() : q.pairs!.map((p) => p[1]));
        else if (q.kind === "estimate") v = String(Number(q.correct) + (i === 1 ? 7 : i === 2 ? 0 : 0));
        else v = i === 1 ? "zzz" : q.correct;
        vals.push(q.round === "bluff" || q.round === "funny" ? v : loc(q, v));
        if (q.kind === "open" && lang === "en" && i !== 1 && q.round !== "bluff") vals[i] = q.en!.correct;
      }
      for (let i = 0; i < 3; i++) {
        if (g.mode === "captain") submitAnswer(g, { memberToken: T[i].memberToken, value: vals[i], lock: true, now });
        else suggest(g, T[i].memberToken, vals[i], now);
      }
      now += 1000;
      tick(g, now + 1e6); now += 1e6;
      if ((g.phase as string) === "question_locked" && (q.round === "bluff" || q.round === "funny")) {
        for (let i = 0; i < 3; i++) { const cand = g.pool.filter((x) => !x.teamIds.includes(T[i].teamId)).sort((a, b) => a.text.localeCompare(b.text)); pickEntry(g, T[i].memberToken, cand[i % cand.length].id, now); }
      }
      advance(g, now); continue;
    }
    advance(g, now);
  }
  expect(g.phase).toBe("final");
  return { scores: g.teams.map((t) => t.score), leaks };
}

describe("iki dilli oyun: Türkçe ve İngilizce istemci aynı sonucu verir", () => {
  for (const tpl of TPL) {
    it(`${tpl}: puanlar aynı, İngilizce ekranda Türkçe sızıntı yok`, () => {
      for (const seed of ["a", "b"]) {
        const night = buildNight({ template: tpl, theme: tpl === "themed" ? "dizifilm" : undefined, seen: new Set(), allowed: allowedFor("brand"), seed: `bi-${tpl}-${seed}` });
        const tr = playNight(night.questions, "tr");
        const en = playNight(night.questions, "en");
        expect(en.scores, `${tpl}/${seed}`).toEqual(tr.scores);
        expect(en.leaks, `${tpl}/${seed}`).toEqual([]);
        expect(tr.scores.some((s) => s !== 0)).toBe(true);
      }
    });
  }
});
