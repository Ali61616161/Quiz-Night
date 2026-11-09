import { z } from "zod";
import {
  advance, claimCaptain, createTeam, extendTime, GameError, heartbeat, joinTeam,
  kickTeam, overrideTeam, renameTeam, submitAnswer, suggest,
} from "@/lib/engine/game";
import type { Game } from "@/lib/engine/types";
import { notify, scheduleLock, seenKey } from "./store";

const hostAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("advance") }),
  z.object({ type: z.literal("extend"), ms: z.number().int().min(5000).max(60000) }),
  z.object({ type: z.literal("override"), teamId: z.string(), correct: z.boolean() }),
  z.object({ type: z.literal("kick"), teamId: z.string() }),
  z.object({ type: z.literal("rename"), teamId: z.string(), name: z.string().max(40) }),
]);

const playerAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("answer"), value: z.string().max(120), lock: z.boolean(), key: z.string().max(64).optional() }),
  z.object({ type: z.literal("suggest"), value: z.string().max(120) }),
  z.object({ type: z.literal("claim_captain") }),
  z.object({ type: z.literal("heartbeat"), hidden: z.boolean().optional() }),
]);

export const joinSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"), nickname: z.string().min(1).max(40), teamName: z.string().min(1).max(40),
    color: z.string(), emoji: z.string(),
  }),
  z.object({ mode: z.literal("join"), nickname: z.string().min(1).max(40), teamRef: z.string().min(1).max(40) }),
]);

export function runHostAction(game: Game, raw: unknown) {
  const a = hostAction.parse(raw);
  const now = Date.now();
  switch (a.type) {
    case "advance": advance(game, now); break;
    case "extend": extendTime(game, a.ms, now); break;
    case "override": overrideTeam(game, a.teamId, a.correct); break;
    case "kick": kickTeam(game, a.teamId); break;
    case "rename": renameTeam(game, a.teamId, a.name); break;
  }
  scheduleLock(game);
  notify(game.id);
}

export function runPlayerAction(game: Game, memberToken: string, raw: unknown) {
  const a = playerAction.parse(raw);
  const now = Date.now();
  switch (a.type) {
    case "answer":
      if (seenKey(game.id, a.key)) return; // tekrar deneme: çift kayıt yok
      submitAnswer(game, { memberToken, value: a.value, lock: a.lock, now });
      break;
    case "suggest": suggest(game, memberToken, a.value); break;
    case "claim_captain": claimCaptain(game, memberToken, now); break;
    case "heartbeat": heartbeat(game, memberToken, now, a.hidden); break;
  }
  notify(game.id);
}

export function runJoin(game: Game, raw: unknown) {
  const j = joinSchema.parse(raw);
  const now = Date.now();
  const res = j.mode === "create"
    ? createTeam(game, { nickname: j.nickname, teamName: j.teamName, color: j.color, emoji: j.emoji, now })
    : joinTeam(game, { nickname: j.nickname, teamRef: j.teamRef, now });
  notify(game.id);
  return res;
}

export function errorResponse(e: unknown) {
  if (e instanceof GameError) return Response.json({ error: e.code, message: e.message }, { status: e.status });
  if (e instanceof z.ZodError) return Response.json({ error: "invalid", message: "Geçersiz istek." }, { status: 400 });
  console.error(e);
  return Response.json({ error: "server", message: "Sunucu hatası, tekrar dene." }, { status: 500 });
}
