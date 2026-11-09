import { randomBytes, randomInt } from "node:crypto";
import { nextPhase } from "./machine";
import { scoreQuestion } from "./scoring";
import { TEAM_COLORS, TEAM_EMOJIS } from "./types";
import type { Game, Member, Question, Settings, Team } from "./types";

export const CAPTAIN_TIMEOUT_MS = 15_000;
const ROOM_ALPHABET = "ABCDEFGHJKLMNPRSTUVYZ23456789"; // karışan harfler yok (O/0, I/1, Q)

export class GameError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

const token = () => randomBytes(18).toString("base64url");
const pick = (alphabet: string, n: number) =>
  Array.from({ length: n }, () => alphabet[randomInt(alphabet.length)]).join("");

export const DEFAULT_SETTINGS: Settings = {
  points: 100,
  wrongPenalty: 0,
  teamMax: 6,
  durationMs: 30_000,
  lockFirst: false,
};

export function newGame(opts: { venueName: string; questions: Question[]; code?: string; settings?: Partial<Settings> }): Game {
  return {
    id: token().slice(0, 12),
    code: opts.code ?? pick(ROOM_ALPHABET, 4),
    venueName: opts.venueName,
    hostToken: token(),
    tvToken: token(),
    phase: "lobby",
    qIndex: 0,
    questions: opts.questions,
    openedAt: null,
    deadline: null,
    settings: { ...DEFAULT_SETTINGS, ...opts.settings },
    teams: [],
    answers: {},
    suggestions: {},
    results: {},
    overrides: {},
    version: 0,
  };
}

const bump = (g: Game) => { g.version++; };

export function findMember(g: Game, memberToken: string): { team: Team; member: Member } | null {
  for (const team of g.teams) {
    const member = team.members.find((m) => m.token === memberToken);
    if (member) return { team, member };
  }
  return null;
}

function requireMember(g: Game, memberToken: string) {
  const f = findMember(g, memberToken);
  if (!f) throw new GameError("not_member", "Takım bulunamadı, yeniden katıl.", 403);
  return f;
}

const cleanName = (s: string, max: number) => s.replace(/\s+/g, " ").trim().slice(0, max);

const BLOCKED = ["amk", "aq", "orospu", "siktir", "piç", "yarrak", "göt", "sik"];
export function isNameBlocked(name: string): boolean {
  const n = name.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, "");
  return n.split(" ").some((w) => BLOCKED.includes(w)) || BLOCKED.some((b) => b.length > 3 && n.includes(b));
}

export function createTeam(g: Game, p: { nickname: string; teamName: string; color: string; emoji: string; now: number }) {
  if (g.phase === "final") throw new GameError("finished", "Oyun bitti.");
  const nickname = cleanName(p.nickname, 20);
  const teamName = cleanName(p.teamName, 24);
  if (!nickname || !teamName) throw new GameError("invalid", "Adını ve takım adını yaz.");
  if (isNameBlocked(nickname) || isNameBlocked(teamName)) throw new GameError("blocked", "Bu isim kullanılamaz, başka bir isim seç.");
  if (!TEAM_COLORS.includes(p.color as never) || !TEAM_EMOJIS.includes(p.emoji as never)) throw new GameError("invalid", "Renk ve rozet seç.");
  if (g.teams.some((t) => t.color === p.color && t.emoji === p.emoji)) throw new GameError("taken", "Bu renk ve rozet kullanımda, başka seç.");
  const member: Member = { id: token().slice(0, 10), token: token(), nickname, lastSeen: p.now, hiddenCount: 0 };
  const team: Team = {
    id: token().slice(0, 10),
    code: pick("0123456789", 4),
    name: teamName, color: p.color, emoji: p.emoji,
    captainId: member.id, members: [member], score: 0,
  };
  g.teams.push(team);
  bump(g);
  return { teamId: team.id, teamCode: team.code, memberId: member.id, memberToken: member.token };
}

export function joinTeam(g: Game, p: { nickname: string; teamRef: string; now: number }) {
  const nickname = cleanName(p.nickname, 20);
  if (!nickname) throw new GameError("invalid", "Adını yaz.");
  if (isNameBlocked(nickname)) throw new GameError("blocked", "Bu isim kullanılamaz, başka bir isim seç.");
  const team = g.teams.find((t) => t.code === p.teamRef || t.id === p.teamRef);
  if (!team) throw new GameError("no_team", "Takım bulunamadı. Kodu kontrol et.", 404);
  if (team.members.length >= g.settings.teamMax) throw new GameError("full", "Takım dolu.");
  const member: Member = { id: token().slice(0, 10), token: token(), nickname, lastSeen: p.now, hiddenCount: 0 };
  team.members.push(member);
  bump(g);
  return { teamId: team.id, teamCode: team.code, memberId: member.id, memberToken: member.token };
}

export function heartbeat(g: Game, memberToken: string, now: number, hidden?: boolean) {
  const { member } = requireMember(g, memberToken);
  member.lastSeen = now;
  if (hidden) { member.hiddenCount++; bump(g); }
}

export const isOnline = (m: Member, now: number) => now - m.lastSeen < CAPTAIN_TIMEOUT_MS;

export function claimCaptain(g: Game, memberToken: string, now: number) {
  const { team, member } = requireMember(g, memberToken);
  if (team.captainId === member.id) return;
  const captain = team.members.find((m) => m.id === team.captainId);
  if (captain && isOnline(captain, now)) throw new GameError("captain_online", "Kaptan bağlı. Kaptan devretmeden alamazsın.", 409);
  team.captainId = member.id;
  member.lastSeen = now;
  bump(g);
}

export function suggest(g: Game, memberToken: string, value: string) {
  const { team, member } = requireMember(g, memberToken);
  if (g.phase !== "question_open") throw new GameError("closed", "Soru açık değil.");
  const v = value.slice(0, 120);
  (g.suggestions[team.id] ??= {})[member.id] = v;
  bump(g);
}

/** Kaptan cevabı gönderir/kilitler. Süre sunucu saatine göre kontrol edilir. */
export function submitAnswer(g: Game, p: { memberToken: string; value: string; lock: boolean; now: number }) {
  const { team, member } = requireMember(g, p.memberToken);
  if (g.phase !== "question_open" || (g.deadline !== null && p.now > g.deadline)) throw new GameError("closed", "Süre doldu.", 409);
  if (team.captainId !== member.id) throw new GameError("not_captain", "Cevabı sadece kaptan gönderir.", 403);
  const q = g.questions[g.qIndex];
  const value = p.value.slice(0, 120);
  if (q.kind === "choice" && !q.options?.includes(value) && !/^\d+$/.test(value)) throw new GameError("invalid", "Geçersiz şık.");
  const prev = g.answers[team.id];
  if (prev?.locked) throw new GameError("locked", "Cevap kilitlendi, değişiklik yapılamaz.", 409);
  if (prev && g.settings.lockFirst) throw new GameError("locked", "İlk cevap kilitlenir, değişiklik yapılamaz.", 409);
  g.answers[team.id] = { value, byMemberId: member.id, at: p.now, locked: p.lock || g.settings.lockFirst };
  bump(g);
}

export function applyScores(g: Game) {
  const before = g.results;
  const next = scoreQuestion(g);
  for (const team of g.teams) {
    const diff = (next[team.id]?.gained ?? 0) - (before[team.id]?.gained ?? 0);
    team.score += diff;
  }
  g.results = next;
}

/** Süre dolduysa soruyu kilitler. Her okumada ve zamanlayıcıda çağrılır. */
export function tick(g: Game, now: number): boolean {
  if (g.phase === "question_open" && g.deadline !== null && now >= g.deadline) {
    g.phase = "question_locked";
    bump(g);
    return true;
  }
  return false;
}

export function advance(g: Game, now: number) {
  tick(g, now);
  const hasMore = g.qIndex < g.questions.length - 1;
  if (g.phase === "lobby" && g.teams.length < 1) throw new GameError("no_teams", "En az bir takım gerekli.");
  const to = nextPhase(g.phase, hasMore);
  if (to === g.phase) return;
  if (g.phase === "scoreboard" && to === "question_open") {
    g.qIndex++;
    g.answers = {}; g.suggestions = {}; g.results = {}; g.overrides = {};
  }
  if (to === "question_open") {
    g.openedAt = now;
    g.deadline = now + g.settings.durationMs;
  }
  if (to === "answer_reveal") applyScores(g);
  g.phase = to;
  bump(g);
}

export function extendTime(g: Game, ms: number, now: number) {
  if (g.phase !== "question_open" || g.deadline === null) throw new GameError("closed", "Soru açık değil.");
  g.deadline = Math.max(now, g.deadline) + ms;
  bump(g);
}

/** Host "doğru say / yanlış say". Reveal sonrası ise puan anında yeniden hesaplanır. */
export function overrideTeam(g: Game, teamId: string, correct: boolean) {
  if (!g.teams.some((t) => t.id === teamId)) throw new GameError("no_team", "Takım yok.", 404);
  g.overrides[teamId] = correct;
  if (g.phase === "answer_reveal" || g.phase === "scoreboard") applyScores(g);
  bump(g);
}

export function kickTeam(g: Game, teamId: string) {
  g.teams = g.teams.filter((t) => t.id !== teamId);
  delete g.answers[teamId];
  bump(g);
}

export function renameTeam(g: Game, teamId: string, name: string) {
  const t = g.teams.find((x) => x.id === teamId);
  if (!t) throw new GameError("no_team", "Takım yok.", 404);
  t.name = cleanName(name, 24) || t.name;
  bump(g);
}

export function ranking(g: Game) {
  return [...g.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"));
}
