import { createHash } from "node:crypto";
import { coach } from "./machine";
import { isOnline, ranking } from "./game";
import { localizeValue, type Lang } from "./scoring";
import { VOTE_ROUNDS, type Game, type Phase, type Question, type QuestionEn, type RoundType } from "./types";

const REVEALED: Phase[] = ["answer_reveal", "scoreboard", "final"];

/** Deterministik karıştırma: aynı soru her istemcide aynı sırada görünür, cevap sızmaz. Permütasyon döner (iki dilde aynı sıra). */
function shuffleIdx(n: number, seed: string): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const h = createHash("sha256").update(seed).digest();
  for (let i = n - 1; i > 0; i--) { const j = h[i % h.length] % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  // Karışım orijinalle aynıysa bir kaydır (sıralama sorusunda bedava cevap olmasın)
  if (n > 1 && idx.every((x, i) => x === i)) idx.push(idx.shift()!);
  return idx;
}

function correctText(q: Question, L: QuestionEn | null): string {
  const items = L?.items ?? q.items, pairs = L?.pairs ?? q.pairs;
  if (q.kind === "ordering") return items!.join(" → ");
  if (q.kind === "matching") return pairs!.map((p) => `${p[0]} = ${p[1]}`).join(" · ");
  return L?.correct ?? q.correct;
}

const isVote = (q: Question) => (VOTE_ROUNDS as readonly RoundType[]).includes(q.round ?? "all");
const teamName = (g: Game, id: string) => g.teams.find((t) => t.id === id)?.name ?? "?";
const hashN = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const poolText = (q: Question, e: { text: string; truth: boolean }, L: QuestionEn | null) => (e.truth ? L?.correct ?? q.correct : e.text);

/** Yarı yarıya jokeri: doğru şık + bir yanlış şık kalır (deterministik). Geri dönen dizi orijinal şık sıralarını tutar. */
function fiftyKeep(g: Game, q: Question, teamId: string): Set<number> | null {
  if (g.jokerKind[teamId] !== "fifty" || !g.jokerActive[teamId] || q.kind !== "choice" || !q.options) return null;
  const ci = q.options.indexOf(q.correct);
  const wrong = q.options.map((_, i) => i).filter((i) => i !== ci);
  return new Set([ci, wrong[hashN(`${g.id}:${q.id}:${teamId}`) % wrong.length]]);
}

function voteReveal(g: Game, q: Question, L: QuestionEn | null) {
  return g.pool.map((e) => ({
    text: poolText(q, e, L), truth: e.truth,
    authors: e.teamIds.map((id) => teamName(g, id)),
    pickedBy: Object.entries(g.picks).filter(([, id]) => id === e.id).map(([tid]) => teamName(g, tid)),
  }));
}

function questionView(g: Game, forHost: boolean, lang: Lang) {
  const q = g.questions[g.qIndex];
  if (!q || g.phase === "lobby") return null;
  const L = lang === "en" && q.en ? q.en : null;
  const revealed = REVEALED.includes(g.phase) || forHost;
  const visible = g.phase !== "round_intro" || forHost;
  const seed = `${g.id}:${q.id}`;
  const itemsPerm = q.kind === "ordering" ? shuffleIdx(q.items!.length, seed) : [];
  const rightPerm = q.kind === "matching" ? shuffleIdx(q.pairs!.length, seed) : [];
  const items = L?.items ?? q.items, pairs = L?.pairs ?? q.pairs;
  const vote = isVote(q);
  const voting = vote && ["question_locked", "answer_reveal", "scoreboard", "final"].includes(g.phase);
  const reveal = vote && REVEALED.includes(g.phase) ? voteReveal(g, q, L) : null;
  let correct = correctText(q, L);
  if (vote && q.round === "funny") {
    const top = reveal ? Math.max(0, ...reveal.map((r) => r.pickedBy.length)) : 0;
    correct = reveal && top > 0 ? reveal.filter((r) => r.pickedBy.length === top).map((r) => `${r.text} (${r.authors.join(", ")})`).join(" · ") : "—";
  }
  return {
    index: g.qIndex, total: g.questions.length, category: q.category, kind: voting ? "choice" : q.kind === "freeform" ? "open" : q.kind, round: q.round ?? "all",
    roundNo: q.roundNo ?? 1, roundLabel: q.roundLabel ?? "",
    text: visible ? L?.text ?? q.text : null, image: visible ? q.image ?? null : null,
    options: voting ? g.pool.map((e) => poolText(q, e, L)) : visible && q.kind === "choice" ? L?.options ?? q.options ?? null : null,
    reveal,
    items: visible && q.kind === "ordering" ? itemsPerm.map((i) => items![i]) : null,
    left: visible && q.kind === "matching" ? pairs!.map((p) => p[0]) : null,
    right: visible && q.kind === "matching" ? rightPerm.map((i) => pairs![i][1]) : null,
    ...(revealed ? { correct, explanation: L?.explanation ?? q.explanation ?? null } : {}),
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

function base(g: Game, now: number, lang: Lang) {
  return {
    serverNow: now, version: g.version, code: g.code, venueName: g.venueName, phase: g.phase, mode: g.mode,
    openedAt: g.openedAt, deadline: g.deadline, durationMs: g.settings.durationMs,
    lang: g.lang, brand: g.brand, watermark: g.plan === "free", paused: g.paused,
    question: questionView(g, false, lang), teams: board(g, now),
  };
}

export const tvView = (g: Game, now: number, lang: Lang = "tr") => base(g, now, lang);

export function playerView(g: Game, memberToken: string | null, now: number, lang: Lang = "tr") {
  const b = base(g, now, lang);
  const cq = g.questions[g.qIndex];
  const mine = memberToken ? g.teams.find((t) => t.members.some((m) => m.token === memberToken)) : undefined;
  const keep = mine && cq ? fiftyKeep(g, cq, mine.id) : null;
  if (keep && b.question?.options && g.phase === "question_open") b.question = { ...b.question, options: b.question.options.filter((_, i) => keep.has(i)) };
  const loc = (v: string) => (cq ? localizeValue(cq, v, lang) : v);
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
        answer: ans ? { value: loc(ans.value), locked: ans.locked } : null,
        // Takım arkadaşlarının önerileri yalnızca kaptan modunda ve kaptana görünür; çoğunluk modunda oy dağılımı
        suggestions: g.mode === "captain" ? Object.entries(sugg).map(([memberId, s]) => ({
          memberId, value: loc(s.value), nickname: team.members.find((m) => m.id === memberId)?.nickname ?? "",
        })) : [],
        votes: g.mode === "majority" ? Object.values(sugg).reduce<Record<string, number>>((a, s) => { a[loc(s.value)] = (a[loc(s.value)] ?? 0) + 1; return a; }, {}) : {},
        mySuggestion: own === null ? null : loc(own),
        wager: g.wagers[team.id] ?? null, wagerMax: Math.max(team.score, 50),
        jokerAvailable: !g.jokersUsed.includes(team.id), jokerActive: Boolean(g.jokerActive[team.id]), jokerKind: g.jokerKind[team.id] ?? null,
        sabotageAvailable: !g.sabotageUsed.includes(team.id), sabotageTarget: g.sabotage[team.id] ? teamName(g, g.sabotage[team.id]) : null,
        rivals: g.teams.filter((t) => t.id !== team.id).map((t) => ({ id: t.id, name: t.name })),
        streak: cq?.round === "streak" ? g.streakBase[team.id] ?? 0 : 0,
        vote: g.phase === "question_locked" && cq && isVote(cq) ? {
          choices: g.pool.map((e) => ({ id: e.id, text: poolText(cq, e, lang === "en" && cq.en ? cq.en : null), own: e.teamIds.includes(team.id) })),
          picked: g.picks[team.id] ?? null,
        } : null,
        result: REVEALED.includes(g.phase) ? g.results[team.id] ?? null : null,
        appealed: g.appeals.some((a) => a.teamId === team.id && a.qIndex === g.qIndex),
        voided: g.voided && REVEALED.includes(g.phase),
      };
    }
  }
  return { ...b, me };
}

export function hostView(g: Game, now: number, extra: { otherHostActive?: boolean; poolLow?: boolean } = {}, lang: Lang = "tr") {
  const q = g.questions[g.qIndex];
  const isWager = q?.round === "wager" || q?.round === "final";
  return {
    ...base(g, now, lang),
    question: questionView(g, true, lang),
    id: g.id, tvToken: g.tvToken, settings: g.settings, allowedModes: g.allowedModes, autoHost: g.autoHost,
    coach: coach(g.phase, g.teams.length, isWager), voided: g.voided, ...extra,
    teamDetails: g.teams.map((t) => ({
      id: t.id, code: t.code, name: t.name, color: t.color, emoji: t.emoji,
      members: t.members.map((m) => ({ id: m.id, nickname: m.nickname, online: isOnline(m, now), hidden: m.hiddenCount })),
      captainId: t.captainId,
      answered: Boolean(g.answers[t.id]) || Object.keys(g.suggestions[t.id] ?? {}).length > 0,
      locked: Boolean(g.answers[t.id]?.locked),
      wager: g.wagers[t.id] ?? null, joker: Boolean(g.jokerActive[t.id]),
      answerValue: g.phase === "question_open" ? null : g.answers[t.id] ? (q ? localizeValue(q, g.answers[t.id].value, lang) : g.answers[t.id].value) : null,
      result: g.results[t.id] ?? null,
      override: t.id in g.overrides ? g.overrides[t.id] : null,
    })),
    appeals: g.appeals.filter((a) => a.status === "open").map((a) => ({ ...a, team: g.teams.find((t) => t.id === a.teamId)?.name ?? "" })),
    answeredCount: g.teams.filter((t) => g.answers[t.id] || g.suggestions[t.id]).length,
  };
}
