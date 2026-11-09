import { randomBytes, randomInt } from "node:crypto";
import type { PlanId } from "@config/plans";
import { PLANS } from "@config/plans";
import { nextPhase } from "./machine";
import { resolveVotes, scoreQuestion, validateAnswer } from "./scoring";
import { TEAM_COLORS, TEAM_EMOJIS } from "./types";
import type { Brand, Game, Member, Question, Settings, Team, TeamMode } from "./types";

export const CAPTAIN_TIMEOUT_MS = 15_000;
const ROOM_ALPHABET = "ABCDEFGHJKLMNPRSTUVYZ23456789";

export class GameError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export const token = () => randomBytes(18).toString("base64url");
const pick = (alphabet: string, n: number) => Array.from({ length: n }, () => alphabet[randomInt(alphabet.length)]).join("");

export const DEFAULT_SETTINGS: Settings = {
  points: 100, wrongPenalty: 0, teamMax: 6, durationMs: 30_000, lockFirst: false,
  teamMode: "captain", individualAgg: "avg", speedBonus: true,
};

export function allowedModesFor(plan: PlanId): TeamMode[] {
  const f = PLANS[plan].features;
  const m: TeamMode[] = ["captain"];
  if (f.has("mode_individual")) m.push("individual");
  if (f.has("mode_majority")) m.push("majority");
  return m;
}

export function newGame(opts: {
  venueName: string; questions: Question[]; code?: string; settings?: Partial<Settings>;
  plan?: PlanId; venueId?: string | null; brand?: Brand | null; now?: number; lang?: "tr" | "en";
}): Game {
  const plan = opts.plan ?? "free";
  return {
    id: token().slice(0, 12), code: opts.code ?? pick(ROOM_ALPHABET, 4),
    venueId: opts.venueId ?? null, venueName: opts.venueName, plan, brand: opts.brand ?? null, lang: opts.lang ?? "tr",
    hostToken: token(), tvToken: token(), phase: "lobby", qIndex: 0, mode: "captain",
    questions: opts.questions, openedAt: null, deadline: null,
    settings: { ...DEFAULT_SETTINGS, ...opts.settings },
    teams: [], answers: {}, suggestions: {}, wagers: {}, jokersUsed: [], jokerActive: {},
    results: {}, overrides: {}, voided: false, appeals: [], autoHost: false, paused: false,
    playerLimit: PLANS[plan].playerLimit, allowedModes: allowedModesFor(plan),
    createdAt: opts.now ?? Date.now(), endedAt: null, version: 0,
  };
}

const bump = (g: Game) => { g.version++; };
const curQ = (g: Game) => g.questions[g.qIndex];

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

const cleanName = (s: string, max: number) => s.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);

const BLOCKED = ["amk", "aq", "orospu", "siktir", "piç", "pic", "yarrak", "göt", "got", "sik", "ibne", "gavat", "amcik", "amına"];
export function isNameBlocked(name: string): boolean {
  const n = name.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, "");
  const squashed = n.replace(/ /g, "");
  return n.split(" ").some((w) => BLOCKED.includes(w)) || BLOCKED.some((b) => b.length > 3 && squashed.includes(b));
}

const playerCount = (g: Game) => g.teams.reduce((a, t) => a + t.members.length, 0);
function checkPlayerLimit(g: Game) {
  if (g.playerLimit !== null && playerCount(g) >= g.playerLimit)
    throw new GameError("player_limit", `Ücretsiz planda en fazla ${g.playerLimit} oyuncu katılabilir.`, 402);
}

export function createTeam(g: Game, p: { nickname: string; teamName: string; color: string; emoji: string; now: number }) {
  if (g.phase === "final") throw new GameError("finished", "Oyun bitti.");
  checkPlayerLimit(g);
  const nickname = cleanName(p.nickname, 20), teamName = cleanName(p.teamName, 24);
  if (!nickname || !teamName) throw new GameError("invalid", "Adını ve takım adını yaz.");
  if (isNameBlocked(nickname) || isNameBlocked(teamName)) throw new GameError("blocked", "Bu isim kullanılamaz, başka bir isim seç.");
  if (!TEAM_COLORS.includes(p.color as never) || !TEAM_EMOJIS.includes(p.emoji as never)) throw new GameError("invalid", "Renk ve rozet seç.");
  if (g.teams.some((t) => t.color === p.color && t.emoji === p.emoji)) throw new GameError("taken", "Bu renk ve rozet kullanımda, başka seç.");
  const member: Member = { id: token().slice(0, 10), token: token(), nickname, lastSeen: p.now, hiddenCount: 0 };
  let code = pick("0123456789", 4);
  while (g.teams.some((t) => t.code === code)) code = pick("0123456789", 4);
  const team: Team = { id: token().slice(0, 10), code, name: teamName, color: p.color, emoji: p.emoji, captainId: member.id, members: [member], score: 0 };
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
  checkPlayerLimit(g);
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
  team.captainId = member.id; member.lastSeen = now; bump(g);
}
/** Kaptan isteyerek devreder. */
export function handOverCaptain(g: Game, memberToken: string, toMemberId: string) {
  const { team, member } = requireMember(g, memberToken);
  if (team.captainId !== member.id) throw new GameError("not_captain", "Sadece kaptan devredebilir.", 403);
  if (!team.members.some((m) => m.id === toMemberId)) throw new GameError("no_member", "Üye bulunamadı.", 404);
  team.captainId = toMemberId; bump(g);
}

/** Öneri (kaptan modu), oy (çoğunluk) ya da kendi cevabı (bireysel). */
export function suggest(g: Game, memberToken: string, value: string, now = Date.now()) {
  const { team, member } = requireMember(g, memberToken);
  if (g.phase !== "question_open" || (g.deadline !== null && now > g.deadline)) throw new GameError("closed", "Soru açık değil.", 409);
  const q = curQ(g);
  if (!validateAnswer(q, value)) throw new GameError("invalid", "Geçersiz cevap.");
  (g.suggestions[team.id] ??= {})[member.id] = { value, at: now };
  bump(g);
}

export function submitAnswer(g: Game, p: { memberToken: string; value: string; lock: boolean; now: number }) {
  const { team, member } = requireMember(g, p.memberToken);
  if (g.phase !== "question_open" || (g.deadline !== null && p.now > g.deadline)) throw new GameError("closed", "Süre doldu.", 409);
  if (g.mode !== "captain") throw new GameError("mode", "Bu turda cevap öneri/oy ile verilir.", 409);
  if (team.captainId !== member.id) throw new GameError("not_captain", "Cevabı sadece kaptan gönderir.", 403);
  const q = curQ(g);
  if (!validateAnswer(q, p.value)) throw new GameError("invalid", "Geçersiz cevap.");
  const prev = g.answers[team.id];
  if (prev?.locked) throw new GameError("locked", "Cevap kilitlendi, değişiklik yapılamaz.", 409);
  if (prev && g.settings.lockFirst) throw new GameError("locked", "İlk cevap kilitlenir, değişiklik yapılamaz.", 409);
  const speed = q.round === "speed";
  g.answers[team.id] = { value: p.value, byMemberId: member.id, at: p.now, locked: p.lock || g.settings.lockFirst || speed };
  bump(g);
}

export function placeWager(g: Game, memberToken: string, amount: number) {
  const { team, member } = requireMember(g, memberToken);
  const r = curQ(g)?.round;
  if (!(r === "wager" || r === "final") || g.phase !== "round_intro") throw new GameError("closed", "Bahis şu an açık değil.", 409);
  if (team.captainId !== member.id) throw new GameError("not_captain", "Bahsi sadece kaptan girer.", 403);
  const cap = Math.max(team.score, 50);
  if (!Number.isInteger(amount) || amount < 0 || amount > cap) throw new GameError("invalid", `Bahis 0 ile ${cap} arasında olmalı.`);
  g.wagers[team.id] = amount; bump(g);
}

export function activateJoker(g: Game, memberToken: string) {
  const { team, member } = requireMember(g, memberToken);
  if (g.phase !== "question_open") throw new GameError("closed", "Joker sadece soru açıkken kullanılır.", 409);
  if (team.captainId !== member.id) throw new GameError("not_captain", "Jokeri sadece kaptan kullanır.", 403);
  if (g.jokersUsed.includes(team.id)) throw new GameError("used", "Jokerini zaten kullandın.", 409);
  g.jokersUsed.push(team.id); g.jokerActive[team.id] = true; bump(g);
}

export function appeal(g: Game, memberToken: string, note: string) {
  const { team } = requireMember(g, memberToken);
  if (g.phase !== "answer_reveal" && g.phase !== "scoreboard") throw new GameError("closed", "İtiraz cevap açıklanınca yapılır.", 409);
  if (g.appeals.some((a) => a.teamId === team.id && a.qIndex === g.qIndex)) throw new GameError("dup", "Bu soru için itirazın var.", 409);
  g.appeals.push({ id: token().slice(0, 8), teamId: team.id, qIndex: g.qIndex, note: cleanName(note, 120), status: "open" }); bump(g);
}

export function applyScores(g: Game) {
  const before = g.results;
  const next = scoreQuestion(g);
  for (const team of g.teams) team.score += (next[team.id]?.gained ?? 0) - (before[team.id]?.gained ?? 0);
  g.results = next;
}

function lockQuestion(g: Game) {
  resolveVotes(g);
  g.phase = "question_locked";
  bump(g);
}

export function tick(g: Game, now: number): boolean {
  if (g.phase === "question_open" && g.deadline !== null && now >= g.deadline) { lockQuestion(g); return true; }
  return false;
}

const needsIntro = (g: Game, i: number) => {
  const n = g.questions[i], p = g.questions[i - 1];
  return Boolean(n) && (n.round === "wager" || n.round === "final" || (n.roundNo ?? 0) !== (p?.roundNo ?? 0));
};

export function advance(g: Game, now: number) {
  // Süre zaten dolduysa 'ilerlet' yalnızca kilidi uygular; bir adım atlanmaz.
  if (tick(g, now)) return;
  const hasMore = g.qIndex < g.questions.length - 1;
  if (g.phase === "lobby" && g.teams.length < 1) throw new GameError("no_teams", "En az bir takım gerekli.");
  const to = nextPhase(g.phase, hasMore, needsIntro(g, g.qIndex + 1));
  if (to === g.phase) return;
  if (g.phase === "scoreboard" && hasMore) {
    g.qIndex++;
    g.answers = {}; g.suggestions = {}; g.results = {}; g.overrides = {}; g.jokerActive = {}; g.wagers = {}; g.voided = false;
  }
  if (g.phase === "question_open" && to === "question_locked") { lockQuestion(g); return; }
  if (to === "question_open") {
    g.mode = g.settings.teamMode; g.openedAt = now; g.deadline = now + g.settings.durationMs;
  }
  if (to === "answer_reveal") applyScores(g);
  if (to === "final") g.endedAt = now;
  g.phase = to;
  bump(g);
}

export function extendTime(g: Game, ms: number, now: number) {
  if (g.phase !== "question_open" || g.deadline === null) throw new GameError("closed", "Soru açık değil.");
  g.deadline = Math.max(now, g.deadline) + ms; bump(g);
}

export function setMode(g: Game, mode: TeamMode) {
  if (!g.allowedModes.includes(mode)) throw new GameError("plan", "Bu takım modu planında yok.", 402);
  if (g.phase === "question_open" || g.phase === "question_locked") throw new GameError("busy", "Mod, soru bitince değişir.", 409);
  g.settings.teamMode = mode;
  if (g.phase === "lobby" || g.phase === "round_intro") g.mode = mode;
  bump(g);
}

export function overrideTeam(g: Game, teamId: string, correct: boolean) {
  if (!g.teams.some((t) => t.id === teamId)) throw new GameError("no_team", "Takım yok.", 404);
  g.overrides[teamId] = correct;
  const ap = g.appeals.find((a) => a.teamId === teamId && a.qIndex === g.qIndex && a.status === "open");
  if (ap) ap.status = correct ? "accepted" : "rejected";
  if (g.phase === "answer_reveal" || g.phase === "scoreboard") applyScores(g);
  bump(g);
}

/** Hatalı soru: puanlar iptal. `award` ise herkese tam puan. */
export function voidQuestion(g: Game, award: boolean) {
  if (g.phase === "lobby") throw new GameError("closed", "Oyun başlamadı.");
  g.voided = !award;
  if (award) for (const t of g.teams) g.overrides[t.id] = true;
  if (["answer_reveal", "scoreboard"].includes(g.phase)) applyScores(g);
  bump(g);
}

export function kickTeam(g: Game, teamId: string) {
  g.teams = g.teams.filter((x) => x.id !== teamId);
  delete g.answers[teamId]; delete g.suggestions[teamId]; delete g.results[teamId];
  bump(g);
}

export function renameTeam(g: Game, teamId: string, name: string) {
  const t = g.teams.find((x) => x.id === teamId);
  if (!t) throw new GameError("no_team", "Takım yok.", 404);
  const n = cleanName(name, 24);
  if (n && isNameBlocked(n)) throw new GameError("blocked", "Bu isim kullanılamaz.");
  t.name = n || t.name; bump(g);
}

/** Manuel puan düzeltmesi (gerekçe notu denetim kaydına yazılır). */
export function adjustScore(g: Game, teamId: string, delta: number) {
  const t = g.teams.find((x) => x.id === teamId);
  if (!t) throw new GameError("no_team", "Takım yok.", 404);
  t.score += delta; bump(g);
}

export function rotateTvToken(g: Game) { g.tvToken = token(); bump(g); }

export function ranking(g: Game) {
  return [...g.teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"));
}

export { curQ };
