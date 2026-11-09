import { PLANS, can, type PlanId } from "@config/plans";
import { BANK, buildNight, type TemplateId } from "@/lib/content/bank";
import { allowedModesFor, newGame } from "@/lib/engine/game";
import { ranking } from "@/lib/engine/game";
import { normalizeTr } from "@/lib/engine/normalize";
import type { Game, Question, QuestionKind, RoundType, TeamMode } from "@/lib/engine/types";
import { db, save, type GameRecord, type Venue } from "./db";

const DAY = 24 * 3600_000;

export function effectivePlan(v: Venue | null): PlanId {
  if (!v) return "free";
  if (v.status === "canceled" && (v.renewsAt ?? 0) < Date.now()) return "free";
  if (v.status === "past_due" && (v.renewsAt ?? 0) + 7 * DAY < Date.now()) return "free";
  return v.plan;
}

export function allowedFor(plan: PlanId) {
  const f = PLANS[plan].features;
  const kinds = new Set<QuestionKind>(["open", "choice"]);
  if (f.has("round_ordering")) kinds.add("ordering");
  if (f.has("round_matching")) kinds.add("matching");
  if (f.has("round_estimate")) kinds.add("estimate");
  const rounds = new Set<RoundType>(["all"]);
  if (f.has("round_speed")) rounds.add("speed");
  if (f.has("round_wager")) { rounds.add("wager"); rounds.add("final"); }
  return { kinds, rounds, image: f.has("round_picture") };
}

export class VenueError extends Error { constructor(public code: string, m: string, public status = 400) { super(m); } }

export function gamesToday(v: Venue, now = Date.now()) { return v.gameTimes.filter((t) => now - t < DAY).length; }

export function createVenueGame(v: Venue | null, opts: { template: TemplateId; theme?: string; durationSec?: number; teamMode?: TeamMode; autoHost?: boolean }) {
  const plan = effectivePlan(v);
  const P = PLANS[plan];
  const now = Date.now();
  if (v && P.dailyGames !== null && gamesToday(v, now) >= P.dailyGames) throw new VenueError("daily_limit", `Ücretsiz planda günde en fazla ${P.dailyGames} oyun açılır. Planı yükselt.`, 402);
  const allowed = allowedFor(plan);
  const extra = v && can(plan, "own_packs_play") ? v.customQuestions : [];
  const { questions, low } = buildNight({ template: opts.template, theme: opts.theme, seen: new Set(v?.seen ?? []), allowed, extra });
  if (!questions.length) throw new VenueError("empty", "Soru havuzu boş, farklı şablon seç.");
  const brand = v && can(plan, "branding") ? { ...v.brand, logo: v.logo ? `/api/venues/${v.id}/logo` : null } : null;
  const game = newGame({
    venueName: v?.name ?? "Demo Kafe", venueId: v?.id ?? null, plan, brand, questions,
    settings: { durationMs: (opts.durationSec ?? 30) * 1000, teamMode: allowedModesFor(plan).includes(opts.teamMode ?? "captain") ? opts.teamMode ?? "captain" : "captain" },
  });
  game.autoHost = Boolean(opts.autoHost && can(plan, "auto_host"));
  if (v) { v.gameTimes = [...v.gameTimes.filter((t) => now - t < 2 * DAY), now]; save(); }
  return { game, poolLow: low };
}

// ---------- Oyun olayları: istatistik, görülmüş soru, lig ----------
const acc = new WeakMap<Game, { rec: Set<number>; perQ: { id: string; text: string; ok: number; n: number }[]; done: boolean }>();
const state = (g: Game) => { let s = acc.get(g); if (!s) acc.set(g, (s = { rec: new Set(), perQ: [], done: false })); return s; };

const monthKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}`;
export const teamKey = (name: string) => normalizeTr(name);

export function onGameEvent(g: Game) {
  const s = state(g);
  const v = g.venueId ? db.venues[g.venueId] : null;
  if ((g.phase === "answer_reveal") && !s.rec.has(g.qIndex) && !g.voided) {
    s.rec.add(g.qIndex);
    const q = g.questions[g.qIndex];
    const res = Object.values(g.results);
    const n = res.length, ok = res.filter((r) => r.correct).length;
    s.perQ.push({ id: q.id, text: q.text, ok, n });
    if (n > 0) {
      const st = (db.qstats[q.id] ??= { n: 0, ok: 0 });
      st.n += n; st.ok += ok; save();
    }
    if (v && !v.seen.includes(q.id)) { v.seen.push(q.id); save(); }
  }
  if (g.phase === "final" && !s.done) {
    s.done = true;
    if (!v) return;
    const rank = ranking(g);
    const returning = rank.filter((t) => v.history.some((h) => h.ranking.some((r) => teamKey(r.name) === teamKey(t.name)))).length;
    const rec: GameRecord = {
      gameId: g.id, at: Date.now(), teams: g.teams.length, players: g.teams.reduce((a, t) => a + t.members.length, 0),
      ranking: rank.map((t) => ({ name: t.name, score: t.score })),
      perQuestion: s.perQ.map((p) => ({ id: p.id, text: p.text, correctRate: p.n ? p.ok / p.n : 0 })), returningTeams: returning,
    };
    v.history.push(rec);
    if (v.history.length > 400) v.history.shift();
    if (can(effectivePlan(v), "league")) {
      const pts = [10, 7, 5, 3, 2, 1];
      rank.forEach((t, i) => {
        const k = teamKey(t.name);
        const e = (v.league.teams[k] ??= { name: t.name, points: 0, played: 0, wins: 0 });
        e.points += pts[i] ?? 1; e.played++; if (i === 0) e.wins++;
      });
    }
    save();
  }
}

/** Retention: oyun verisini N gün sonra anonimleştirir. */
export function anonymizeOld(days = Number(process.env.RETENTION_DAYS ?? 30), now = Date.now()) {
  let n = 0;
  for (const v of Object.values(db.venues)) for (const h of v.history) {
    if (now - h.at > days * DAY && !h.ranking.every((r) => r.name.startsWith("Takım "))) { h.ranking = h.ranking.map((r, i) => ({ ...r, name: `Takım ${i + 1}` })); n++; }
  }
  if (n) save();
  return n;
}

// ---------- İstatistik ----------
export function venueStats(v: Venue) {
  const h = v.history;
  const qs = new Map<string, { text: string; sum: number; n: number }>();
  for (const g of h) for (const q of g.perQuestion) { const e = qs.get(q.id) ?? { text: q.text, sum: 0, n: 0 }; e.sum += q.correctRate; e.n++; qs.set(q.id, e); }
  const rates = [...qs.entries()].map(([id, e]) => ({ id, text: e.text, rate: e.sum / e.n }));
  const sorted = [...rates].sort((a, b) => a.rate - b.rate);
  const avg = rates.length ? rates.reduce((a, r) => a + r.rate, 0) / rates.length : 0;
  return {
    games: h.length, teamsTotal: h.reduce((a, g) => a + g.teams, 0), playersTotal: h.reduce((a, g) => a + g.players, 0),
    avgCorrect: avg, hardest: sorted.slice(0, 5), easiest: sorted.slice(-5).reverse(), returning: h.reduce((a, g) => a + g.returningTeams, 0),
    perGame: h.slice(-12).map((g) => ({ at: g.at, teams: g.teams, players: g.players })),
  };
}

/** Zorluk kalibrasyonu: gerçek doğru oranından önerilen zorluk (süper admin onayına düşer). */
export function calibrationSuggestions(minN = 20) {
  const out: { id: string; text: string; current: number; suggested: 1 | 2 | 3; rate: number; n: number }[] = [];
  for (const [id, st] of Object.entries(db.qstats)) {
    if (st.n < minN) continue;
    const q = BANK.find((x) => x.id === id) ?? db.drafts.find((x) => x.id === id);
    if (!q) continue;
    const rate = st.ok / st.n;
    const suggested = rate > 0.7 ? 1 : rate > 0.4 ? 2 : 3;
    if (suggested !== (q.difficulty ?? 2)) out.push({ id, text: q.text, current: q.difficulty ?? 2, suggested, rate, n: st.n });
  }
  return out;
}

export function leagueTable(v: Venue) {
  return Object.values(v.league.teams).sort((a, b) => b.points - a.points || b.wins - a.wins).map((t, i) => ({ rank: i + 1, ...t }));
}
export function closeSeason(v: Venue) {
  const t = leagueTable(v)[0];
  if (t) v.league.seasons.push({ season: v.league.season, champion: t.name, points: t.points });
  v.league.season++; v.league.teams = {}; save();
}

export { monthKey };
export type { Question };
