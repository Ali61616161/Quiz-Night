import { isCorrectOpen, normalizeTr } from "./normalize";
import type { Game, Question } from "./types";

const tryJson = (s: string): unknown => { try { return JSON.parse(s); } catch { return null; } };

export type Lang = "tr" | "en";
const tryArr = (s: string): string[] | null => { try { const a = JSON.parse(s); return Array.isArray(a) && a.every((x) => typeof x === "string") ? a : null; } catch { return null; } };

/** İstemcinin gösterdiği (İngilizce olabilir) cevabı Türkçe kanonik biçime çevirir. */
export function canonAnswer(q: Question, value: string): string {
  const e = q.en; if (!e) return value;
  if (q.kind === "choice" && e.options) { const i = e.options.indexOf(value); return i >= 0 ? q.options![i] : value; }
  if (q.kind === "ordering" && e.items) { const a = tryArr(value); if (a) { const m = a.map((x) => { const i = e.items!.indexOf(x); return i >= 0 ? q.items![i] : x; }); return JSON.stringify(m); } }
  if (q.kind === "matching" && e.pairs) { const a = tryArr(value); if (a) { const rights = e.pairs.map((p) => p[1]); return JSON.stringify(a.map((x) => { const i = rights.indexOf(x); return i >= 0 ? q.pairs![i][1] : x; })); } }
  return value;
}
/** Kanonik (Türkçe) cevabı gösterim diline çevirir. */
export function localizeValue(q: Question, value: string, lang: Lang): string {
  const e = q.en; if (lang !== "en" || !e) return value;
  if (q.kind === "choice" && e.options) { const i = q.options!.indexOf(value); return i >= 0 ? e.options[i] : value; }
  if (q.kind === "ordering" && e.items) { const a = tryArr(value); if (a) return JSON.stringify(a.map((x) => { const i = q.items!.indexOf(x); return i >= 0 ? e.items![i] : x; })); }
  if (q.kind === "matching" && e.pairs) { const a = tryArr(value); if (a) { return JSON.stringify(a.map((x) => { const i = q.pairs!.findIndex((p) => p[1] === x); return i >= 0 ? e.pairs![i][1] : x; })); } }
  return value;
}

/** Cevap biçimini doğrular. Geçerliyse true. */
export function validateAnswer(q: Question, value: string): boolean {
  if (!value || value.length > 600) return false;
  switch (q.kind) {
    case "open": return value.trim().length > 0;
    case "choice": return Boolean(q.options?.includes(value));
    case "estimate": return Number.isFinite(parseNum(value));
    case "ordering": {
      const a = tryJson(value);
      return Array.isArray(a) && a.length === q.items!.length && [...a].sort().join("|") === [...q.items!].sort().join("|");
    }
    case "matching": {
      const a = tryJson(value);
      const rights = q.pairs!.map((p) => p[1]);
      return Array.isArray(a) && a.length === rights.length && [...a].sort().join("|") === [...rights].sort().join("|");
    }
  }
}

export function parseNum(v: string): number {
  return Number(v.replace(/\./g, "").replace(",", ".").trim());
}

export function isAnswerCorrect(q: Question, value: string): boolean {
  switch (q.kind) {
    case "choice": return value === q.correct;
    case "open": return isCorrectOpen(value, [q.correct, ...q.accepted, ...(q.en ? [q.en.correct, ...(q.en.accepted ?? [])] : [])]);
    case "estimate": return parseNum(value) === parseNum(q.correct);
    case "ordering": return value === JSON.stringify(q.items);
    case "matching": return value === JSON.stringify(q.pairs!.map((p) => p[1]));
  }
}

/** Çoğunluk modunda takım cevabını oylardan türetir. Beraberlikte kaptanın oyu, yoksa ilk gelen oy. */
export function resolveVotes(g: Game) {
  if (g.mode !== "majority") return;
  for (const team of g.teams) {
    const votes = Object.entries(g.suggestions[team.id] ?? {});
    if (!votes.length) continue;
    const groups = new Map<string, { value: string; n: number; first: number; captain: boolean }>();
    for (const [memberId, v] of votes) {
      const k = normalizeTr(v.value) || v.value;
      const gr = groups.get(k) ?? { value: v.value, n: 0, first: v.at, captain: false };
      gr.n++; gr.first = Math.min(gr.first, v.at); gr.captain ||= memberId === team.captainId;
      groups.set(k, gr);
    }
    const best = [...groups.values()].sort((a, b) => b.n - a.n || Number(b.captain) - Number(a.captain) || a.first - b.first)[0];
    g.answers[team.id] = { value: best.value, byMemberId: "majority", at: best.first, locked: true };
  }
}

/** Geçerli sorunun puanları. Host düzeltmesi, hatalı soru, joker, bahis ve hız burada. */
export function scoreQuestion(g: Pick<Game, "questions" | "qIndex" | "teams" | "answers" | "suggestions" | "overrides" | "settings" | "mode" | "wagers" | "jokerActive" | "voided">) {
  const q = g.questions[g.qIndex];
  const results: Game["results"] = {};
  const s = g.settings;
  const round = q.round ?? "all";

  // Tahmin sorusu: en yakın takım (beraberlik paylaşır)
  let bestDist = Infinity;
  if (q.kind === "estimate") {
    for (const t of g.teams) {
      const a = g.answers[t.id];
      if (a && validateAnswer(q, a.value)) bestDist = Math.min(bestDist, Math.abs(parseNum(a.value) - parseNum(q.correct)));
    }
  }
  const teamCorrect = (a?: { value: string }) =>
    !a ? false : q.kind === "estimate" ? Math.abs(parseNum(a.value) - parseNum(q.correct)) === bestDist : isAnswerCorrect(q, a.value);

  // Hız: doğru cevapları zamana göre sırala
  const speedOrder = g.teams
    .filter((t) => g.mode === "individual" ? false : teamCorrect(g.answers[t.id]))
    .sort((a, b) => g.answers[a.id].at - g.answers[b.id].at).map((t) => t.id);

  for (const team of g.teams) {
    let correct = false, fraction: number | undefined, gained = 0;
    if (g.voided) { results[team.id] = { correct: false, gained: 0 }; continue; }
    if (g.mode === "individual") {
      const vals = Object.values(g.suggestions[team.id] ?? {});
      const ok = vals.filter((v) => isAnswerCorrect(q, v.value)).length;
      fraction = vals.length ? ok / vals.length : 0;
      correct = fraction >= 0.5 && vals.length > 0;
      const base = s.individualAgg === "sum" ? s.points * ok : Math.round(s.points * fraction);
      gained = round === "wager" || round === "final" ? (correct ? g.wagers[team.id] ?? 0 : -(g.wagers[team.id] ?? 0)) : base;
    } else {
      const ans = g.answers[team.id];
      correct = teamCorrect(ans);
      if (team.id in g.overrides) correct = g.overrides[team.id];
      if (round === "wager" || round === "final") {
        const w = g.wagers[team.id] ?? 0;
        gained = correct ? w : -w;
      } else if (correct) {
        gained = s.points;
        if (round === "speed" && s.speedBonus) {
          const rank = Math.max(0, speedOrder.indexOf(team.id));
          gained = Math.round(s.points * Math.max(0.3, 1 - 0.1 * rank));
        }
      } else if (ans && s.wrongPenalty > 0) gained = -s.wrongPenalty;
    }
    if (g.mode === "individual" && team.id in g.overrides) {
      correct = g.overrides[team.id];
      gained = correct ? s.points : 0;
    }
    if (g.jokerActive[team.id] && gained > 0) gained *= 2;
    results[team.id] = { correct, gained, ...(fraction !== undefined ? { fraction } : {}) };
  }
  return results;
}
