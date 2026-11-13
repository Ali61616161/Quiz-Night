import { advance } from "@/lib/engine/game";
import { AUTO_DELAY } from "@/lib/engine/machine";
import { isVoteQuestion, tick } from "@/lib/engine/game";
import type { Game } from "@/lib/engine/types";
import { onGameEvent } from "./venue";

/**
 * Canlı oyunlar bellek içidir (tek süreç). Hesaplar, içerik ve geçmiş `db.ts` ile kalıcıdır.
 * Çok sunuculu kurulumda oyun durumu Redis/Supabase'e taşınmalıdır (bkz. README → Ölçekleme).
 */
interface Hub {
  games: Map<string, Game>; byCode: Map<string, string>;
  listeners: Map<string, Set<() => void>>; timers: Map<string, ReturnType<typeof setTimeout>>; auto: Map<string, ReturnType<typeof setTimeout>>;
  idem: Map<string, Set<string>>; hostDevices: Map<string, Map<string, number>>;
}
const g = globalThis as unknown as { __hub?: Hub };
const hub: Hub = (g.__hub ??= { games: new Map(), byCode: new Map(), listeners: new Map(), timers: new Map(), auto: new Map(), idem: new Map(), hostDevices: new Map() });

export function registerGame(game: Game): Game {
  purgeOld(Date.now());
  if (hub.games.size >= 5000) purgeOld(Date.now(), 6 * 3600_000);
  const A = "ABCDEFGHJKLMNPRSTUVYZ23456789";
  while (hub.byCode.has(game.code)) game.code = Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join("");
  hub.games.set(game.id, game); hub.byCode.set(game.code, game.id);
  return game;
}
export const getGame = (id: string) => hub.games.get(id) ?? null;
export const getGameByCode = (code: string) => { const id = hub.byCode.get(code.toUpperCase()); return id ? hub.games.get(id) ?? null : null; };
export const liveGames = () => [...hub.games.values()];

export function subscribe(id: string, fn: () => void) {
  let set = hub.listeners.get(id);
  if (!set) hub.listeners.set(id, (set = new Set()));
  set.add(fn);
  return () => { set!.delete(fn); };
}
/**
 * Yayınlar toplu yapılır: aynı oyun için 120 ms içindeki değişimler tek bir yayına birleşir.
 * 200 telefon aynı anda cevap verince her cevap için 200 görünüm üretmek yerine tek tur yayın yapılır.
 */
const pendingFlush = new Set<string>();
export function notify(id: string) {
  if (pendingFlush.has(id)) return;
  pendingFlush.add(id);
  setTimeout(() => { pendingFlush.delete(id); hub.listeners.get(id)?.forEach((fn) => fn()); }, 120);
}

function scheduleLock(game: Game) {
  const old = hub.timers.get(game.id);
  if (old) clearTimeout(old);
  const voting = game.phase === "question_locked" && isVoteQuestion(game) && game.deadline !== null;
  if ((game.phase !== "question_open" && !voting) || game.deadline === null) return;
  hub.timers.set(game.id, setTimeout(() => {
    if (tick(game, Date.now())) afterChange(game); else scheduleLock(game);
  }, Math.max(0, game.deadline - Date.now()) + 20));
}

function scheduleAuto(game: Game) {
  const old = hub.auto.get(game.id);
  if (old) clearTimeout(old);
  hub.auto.delete(game.id);
  if (!game.autoHost || game.paused || game.phase === "final" || game.phase === "lobby" || game.phase === "question_open") return;
  if (game.phase === "question_locked" && isVoteQuestion(game)) return; // oylama süresi dolunca tick() ilerletir
  const delay = AUTO_DELAY[game.phase] ?? 5000;
  const wagerWait = game.phase === "round_intro" && ["wager", "final"].includes(game.questions[game.qIndex]?.round ?? "all") ? 12000 : 0;
  hub.auto.set(game.id, setTimeout(() => {
    try { advance(game, Date.now()); } catch { return; }
    afterChange(game);
  }, delay + wagerWait));
}

/** Her durum değişiminden sonra: zamanlayıcılar, kayıt kancaları, yayın. */
export function afterChange(game: Game) {
  onGameEvent(game);
  scheduleLock(game);
  scheduleAuto(game);
  notify(game.id);
}
export const touch = scheduleLock;

export function seenKey(gameId: string, key: string | undefined): boolean {
  if (!key) return false;
  let set = hub.idem.get(gameId);
  if (!set) hub.idem.set(gameId, (set = new Set()));
  if (set.has(key)) return true;
  set.add(key);
  if (set.size > 5000) set.clear();
  return false;
}

/** Host cihazı kaydı: plan izin verdiğinden fazla aktif cihaz varsa eskisine uyarı gider. */
export function hostDevice(gameId: string, deviceId: string, limit: number, now: number): { others: boolean; kicked: boolean } {
  let m = hub.hostDevices.get(gameId);
  if (!m) hub.hostDevices.set(gameId, (m = new Map()));
  m.set(deviceId, now);
  const active = [...m.entries()].filter(([, t]) => now - t < 12_000).sort((a, b) => b[1] - a[1]);
  const idx = active.findIndex(([d]) => d === deviceId);
  return { others: active.length > 1, kicked: active.length > limit && idx >= limit };
}

/** Eski oyunları bellekten siler. */
export function purgeOld(now: number, maxAgeMs = 24 * 3600_000) {
  for (const [id, game] of hub.games) {
    const last = game.endedAt ?? game.createdAt;
    if (now - last > maxAgeMs) {
      hub.games.delete(id); hub.byCode.delete(game.code); hub.idem.delete(id); hub.hostDevices.delete(id); hub.listeners.delete(id);
      clearTimeout(hub.timers.get(id)); clearTimeout(hub.auto.get(id)); hub.timers.delete(id); hub.auto.delete(id);
    }
  }
}
