import { isCorrectOpen } from "./normalize";
import type { Game, Question } from "./types";

export function isAnswerCorrect(q: Question, value: string): boolean {
  if (q.kind === "choice") return value === q.correct;
  return isCorrectOpen(value, [q.correct, ...q.accepted]);
}

/** Geçerli sorunun puanlarını hesaplar. Host düzeltmesi (override) otomatik sonucu ezer. */
export function scoreQuestion(game: Pick<Game, "questions" | "qIndex" | "teams" | "answers" | "overrides" | "settings">) {
  const q = game.questions[game.qIndex];
  const results: Game["results"] = {};
  for (const team of game.teams) {
    const ans = game.answers[team.id];
    const auto = ans ? isAnswerCorrect(q, ans.value) : false;
    const correct = team.id in game.overrides ? game.overrides[team.id] : auto;
    let gained = 0;
    if (correct) gained = game.settings.points;
    else if (ans && game.settings.wrongPenalty > 0) gained = -game.settings.wrongPenalty;
    results[team.id] = { correct, gained };
  }
  return results;
}
