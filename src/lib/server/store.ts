import { advance, DEFAULT_SETTINGS, newGame, tick } from "@/lib/engine/game";
import type { Game, Question, Settings } from "@/lib/engine/types";
import { DEMO_QUESTIONS } from "./seed-demo";

/**
 * Bellek içi depo: yerel demo, test ve tek süreçli deploy için.
 * Üretimde aynı arayüz Supabase'e taşınır (bkz. DECISIONS.md).
 */
interface Hub {
  games: Map<string, Game>;
  byCode: Map<string, string>;
  listeners: Map<string, Set<() => void>>;
  timers: Map<string, ReturnType<typeof setTimeout>>;
  idem: Map<string, Set<string>>;
}

const g = globalThis as unknown as { __hub?: Hub };
const hub: Hub = (g.__hub ??= { games: new Map(), byCode: new Map(), listeners: new Map(), timers: new Map(), idem: new Map() });

export function createGame(venueName: string, questions: Question[] = DEMO_QUESTIONS, settings?: Partial<Settings>): Game {
  let game = newGame({ venueName, questions, settings });
  while (hub.byCode.has(game.code)) game = { ...game, code: newGame({ venueName, questions }).code };
  hub.games.set(game.id, game);
  hub.byCode.set(game.code, game.id);
  return game;
}

export const getGame = (id: string) => hub.games.get(id) ?? null;
export const getGameByCode = (code: string) => {
  const id = hub.byCode.get(code.toUpperCase());
  return id ? hub.games.get(id) ?? null : null;
};

export function subscribe(id: string, fn: () => void) {
  let set = hub.listeners.get(id);
  if (!set) hub.listeners.set(id, (set = new Set()));
  set.add(fn);
  return () => { set!.delete(fn); };
}

export function notify(id: string) {
  hub.listeners.get(id)?.forEach((fn) => fn());
}

/** Kilit zamanlayıcısı: süre dolunca sunucu soruyu kendisi kilitler. */
export function scheduleLock(game: Game) {
  const old = hub.timers.get(game.id);
  if (old) clearTimeout(old);
  if (game.phase !== "question_open" || game.deadline === null) return;
  const delay = Math.max(0, game.deadline - Date.now()) + 20;
  hub.timers.set(game.id, setTimeout(() => {
    if (tick(game, Date.now())) notify(game.id);
    else scheduleLock(game);
  }, delay));
}

/** Idempotency: aynı anahtar ikinci kez gelirse işlem yapılmaz. */
export function seenKey(gameId: string, key: string | undefined): boolean {
  if (!key) return false;
  let set = hub.idem.get(gameId);
  if (!set) hub.idem.set(gameId, (set = new Set()));
  if (set.has(key)) return true;
  set.add(key);
  if (set.size > 5000) set.clear();
  return false;
}

export { advance, DEFAULT_SETTINGS };
