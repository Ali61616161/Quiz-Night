import { createHash } from "node:crypto";
import { coach } from "./machine";
import { isOnline, ranking } from "./game";
import type { Game, Phase, Question } from "./types";

const REVEALED: Phase[] = ["answer_reveal", "scoreboard", "final"];

/** Deterministik karıştırma: aynı soru her istemcide aynı sırada görünür, cevap sızmaz. */
function shuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  const h = createHash("sha256").update(seed).digest();
  for (let i = out.length - 1; i > 0; i--) {
    const j = h[i % h.length] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Karışım orijinalle aynıysa bir kaydır (sıralama sorusunda bedava cevap olmasın)
  if (out.length > 1 && out.every((x, i) => x === arr[i])) out.push(out.shift()!);
  return out;
}

function correctText(q: Question): string {
  if (q.kind === "ordering") return q.items!.join(" → ");
  if (q.kind === "matching") return q.pairs!.map((p) => `${p[0]} = ${p[1]}`).join(" · ");
  return q.correct;
}

function questionView(g: Game, forHost: boolean) {
  const q = g.questions[g.qIndex];
  if (!q || g.phase === "lobby") return null;
  const revealed = REVEALED.includes(g.phase) || forHost;
  const visible = g.phase !== "round_intro" || forHost;
  return {
    index: g.qIndex, total: g.questions.length, category: q.category, kind: q.kind, round: q.round ?? "all",
    roundNo: q.roundNo ?? 1, roundLabel: q.roundLabel ?? "",
    text: visible ? q.text : null, image: visible ? q.image ?? null : null,
    options: visible && q.kind === "choice" ? q.options ?? null : null,
    items: visible && q.kind === "ordering" ? shuffle(q.items!, `${g.id}:${q.id}`) : null,
    left: visible && q.kind === "matching" ? q.pairs!.map((p) => p[0]) : null,
    right: visible && q.kind === "matching" ? shuffle(q.pairs!.map((p) => p[1]), `${g.id}:${q.id}`) : null,
    ...(revealed ? { correct: correctText(q), explanation: q.explanation ?? null } : {}),
  };
}

function board(g: Game, now: number) {
  return ranking(g).map((t, i) => ({
    id: t.id, rank: i + 1, name: t.name, color: t.color, emoji: t.emoji, score: t.score,
    members: t.members.length, captain: t.members.find((m) => m.id === t.captainId)?.nickname ?? "",
    online: t.members.some((m) => isOnline(m, now)),
    locked: g.phase === "question_open" ? Boolean(g.answers[t.id]?.locked) : undefined,
  }));
}

function base(g: Game, now: number) {
  return {
    serverNow: now, version: g.version, code: g.code, venueName: g.venueName, phase: g.phase, mode: g.mode,
    openedAt: g.openedAt, deadline: g.deadline, durationMs: g.settings.durationMs,
    brand: g.brand, watermark: g.plan === "free", paused: g.paused,
    question: questionView(g, false), teams: board(g, now),
  };
}

export const tvView = (g: Game, now: number) => base(g, now);

export function playerView(g: Game, memberToken: string | null, now: number) {
  const b = base(g, now);
  let me = null;
  if (memberToken) {
    for (const team of g.teams) {
      const member = team.members.find((m) => m.token === memberToken);
      if (!member) continue;
      const isCaptain = team.captainId === member.id;
      const captain = team.members.find((m) => m.id === team.captainId)!;
      const ans = g.answers[team.id];
      const sugg = g.suggestions[team.id] ?? {};
      const own = sugg[member.id]?.value ?? null;
      me = {
        teamId: team.id, teamCode: team.code, memberId: member.id, nickname: member.nickname,
        isCaptain, captainName: captain.nickname, captainOnline: isOnline(captain, now),
        canClaim: !isCaptain && !isOnline(captain, now),
        members: team.members.map((m) => ({ id: m.id, nickname: m.nickname, online: isOnline(m, now), captain: m.id === team.captainId })),
        answer: ans ? { value: ans.value, locked: ans.locked } : null,
        // Takım arkadaşlarının önerileri yalnızca kaptan modunda ve kaptana görünür; çoğunluk modunda oy dağılımı
        suggestions: g.mode === "captain" ? Object.entries(sugg).map(([memberId, s]) => ({
          memberId, value: s.value, nickname: team.members.find((m) => m.id === memberId)?.nickname ?? "",
        })) : [],
        votes: g.mode === "majority" ? Object.values(sugg).reduce<Record<string, number>>((a, s) => { a[s.value] = (a[s.value] ?? 0) + 1; return a; }, {}) : {},
        mySuggestion: own,
        wager: g.wagers[team.id] ?? null, wagerMax: Math.max(team.score, 50),
        jokerAvailable: !g.jokersUsed.includes(team.id), jokerActive: Boolean(g.jokerActive[team.id]),
        result: REVEALED.includes(g.phase) ? g.results[team.id] ?? null : null,
        appealed: g.appeals.some((a) => a.teamId === team.id && a.qIndex === g.qIndex),
        voided: g.voided && REVEALED.includes(g.phase),
      };
    }
  }
  return { ...b, me };
}

export function hostView(g: Game, now: number, extra: { otherHostActive?: boolean; poolLow?: boolean } = {}) {
  const q = g.questions[g.qIndex];
  const isWager = q?.round === "wager" || q?.round === "final";
  return {
    ...base(g, now),
    question: questionView(g, true),
    id: g.id, tvToken: g.tvToken, settings: g.settings, allowedModes: g.allowedModes, autoHost: g.autoHost,
    coach: coach(g.phase, g.teams.length, isWager), voided: g.voided, ...extra,
    teamDetails: g.teams.map((t) => ({
      id: t.id, code: t.code, name: t.name, color: t.color, emoji: t.emoji,
      members: t.members.map((m) => ({ id: m.id, nickname: m.nickname, online: isOnline(m, now), hidden: m.hiddenCount })),
      captainId: t.captainId,
      answered: Boolean(g.answers[t.id]) || Object.keys(g.suggestions[t.id] ?? {}).length > 0,
      locked: Boolean(g.answers[t.id]?.locked),
      wager: g.wagers[t.id] ?? null, joker: Boolean(g.jokerActive[t.id]),
      answerValue: g.phase === "question_open" ? null : g.answers[t.id]?.value ?? null,
      result: g.results[t.id] ?? null,
      override: t.id in g.overrides ? g.overrides[t.id] : null,
    })),
    appeals: g.appeals.filter((a) => a.status === "open").map((a) => ({ ...a, team: g.teams.find((t) => t.id === a.teamId)?.name ?? "" })),
    answeredCount: g.teams.filter((t) => g.answers[t.id] || g.suggestions[t.id]).length,
  };
}
