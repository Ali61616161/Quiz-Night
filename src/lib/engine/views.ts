import { coach } from "./machine";
import { isOnline, ranking } from "./game";
import type { Game, Phase } from "./types";

type Reveal = Phase[];
const REVEALED: Reveal = ["answer_reveal", "scoreboard", "final"];

function questionView(g: Game, forHost: boolean) {
  const q = g.questions[g.qIndex];
  if (!q || g.phase === "lobby") return null;
  const revealed = REVEALED.includes(g.phase) || forHost;
  return {
    index: g.qIndex, total: g.questions.length, category: q.category, kind: q.kind, text: q.text, options: q.options ?? null,
    ...(revealed ? { correct: q.correct, explanation: q.explanation ?? null } : {}),
  };
}

function board(g: Game, now: number) {
  return ranking(g).map((t, i) => ({
    id: t.id, rank: i + 1, name: t.name, color: t.color, emoji: t.emoji, score: t.score,
    members: t.members.length, captain: t.members.find((m) => m.id === t.captainId)?.nickname ?? "",
    online: t.members.some((m) => isOnline(m, now)),
  }));
}

function base(g: Game, now: number) {
  return {
    serverNow: now, version: g.version, code: g.code, venueName: g.venueName, phase: g.phase,
    openedAt: g.openedAt, deadline: g.deadline, durationMs: g.settings.durationMs,
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
      me = {
        teamId: team.id, teamCode: team.code, memberId: member.id, nickname: member.nickname,
        isCaptain, captainName: captain.nickname, captainOnline: isOnline(captain, now),
        canClaim: !isCaptain && !isOnline(captain, now),
        members: team.members.map((m) => ({ id: m.id, nickname: m.nickname, online: isOnline(m, now), captain: m.id === team.captainId })),
        answer: ans ? { value: ans.value, locked: ans.locked } : null,
        suggestions: Object.entries(g.suggestions[team.id] ?? {}).map(([memberId, value]) => ({
          memberId, value, nickname: team.members.find((m) => m.id === memberId)?.nickname ?? "",
        })),
        mySuggestion: g.suggestions[team.id]?.[member.id] ?? null,
        result: REVEALED.includes(g.phase) ? g.results[team.id] ?? null : null,
      };
    }
  }
  return { ...b, me };
}

export function hostView(g: Game, now: number) {
  const q = g.questions[g.qIndex];
  return {
    ...base(g, now),
    question: questionView(g, true),
    id: g.id, tvToken: g.tvToken, settings: g.settings, coach: coach(g.phase, g.teams.length),
    teamDetails: g.teams.map((t) => ({
      id: t.id, code: t.code, name: t.name, color: t.color, emoji: t.emoji,
      members: t.members.map((m) => ({ id: m.id, nickname: m.nickname, online: isOnline(m, now), hidden: m.hiddenCount })),
      captainId: t.captainId,
      answered: Boolean(g.answers[t.id]), locked: Boolean(g.answers[t.id]?.locked),
      // Cevap metni host'a kilitten sonra gösterilir
      answerValue: g.phase === "question_open" ? null : g.answers[t.id]?.value ?? null,
      result: g.results[t.id] ?? null,
      override: t.id in g.overrides ? g.overrides[t.id] : null,
      autoCorrect: q && g.answers[t.id] ? g.results[t.id]?.correct ?? null : null,
    })),
    answeredCount: Object.keys(g.answers).length,
  };
}
