import { z } from "zod";
import {
  adjustScore, advance, appeal, claimCaptain, createTeam, extendTime, GameError, handOverCaptain, heartbeat, joinTeam,
  kickTeam, overrideTeam, rotateTvToken, placeWager, renameTeam, setMode, submitAnswer, suggest, activateJoker, voidQuestion, pickEntry, sabotageTeam,
} from "@/lib/engine/game";
import type { Game } from "@/lib/engine/types";
import { audit, db, save } from "./db";
import { afterChange, seenKey } from "./store";
import { VenueError } from "./venue";

const hostAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("advance") }),
  z.object({ type: z.literal("extend"), ms: z.number().int().min(5000).max(60000) }),
  z.object({ type: z.literal("override"), teamId: z.string().max(40), correct: z.boolean() }),
  z.object({ type: z.literal("kick"), teamId: z.string().max(40) }),
  z.object({ type: z.literal("rename"), teamId: z.string().max(40), name: z.string().max(40) }),
  z.object({ type: z.literal("adjust"), teamId: z.string().max(40), delta: z.number().int().min(-1000).max(1000), note: z.string().min(2).max(120) }),
  z.object({ type: z.literal("mode"), mode: z.enum(["captain", "majority", "individual"]) }),
  z.object({ type: z.literal("auto"), on: z.boolean() }),
  z.object({ type: z.literal("pause"), on: z.boolean() }),
  z.object({ type: z.literal("void"), award: z.boolean(), reason: z.string().max(200).optional() }),
  z.object({ type: z.literal("settings"), points: z.number().int().min(10).max(1000).optional(), wrongPenalty: z.number().int().min(0).max(500).optional(), durationSec: z.number().int().min(10).max(180).optional(), lockFirst: z.boolean().optional(), teamMax: z.number().int().min(1).max(8).optional(), individualAgg: z.enum(["avg", "sum"]).optional(), speedBonus: z.boolean().optional() }),
  z.object({ type: z.literal("end") }),
  z.object({ type: z.literal("tv_rotate") }),
]);

const playerAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("answer"), value: z.string().max(600), lock: z.boolean(), key: z.string().max(64).optional() }),
  z.object({ type: z.literal("suggest"), value: z.string().max(600) }),
  z.object({ type: z.literal("claim_captain") }),
  z.object({ type: z.literal("handover"), to: z.string().max(20) }),
  z.object({ type: z.literal("heartbeat"), hidden: z.boolean().optional() }),
  z.object({ type: z.literal("wager"), amount: z.number().int() }),
  z.object({ type: z.literal("joker"), kind: z.enum(["double", "fifty"]).optional() }),
  z.object({ type: z.literal("sabotage"), target: z.string().max(40) }),
  z.object({ type: z.literal("pick"), id: z.string().max(10) }),
  z.object({ type: z.literal("appeal"), note: z.string().max(120).default("") }),
]);

export const joinSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("create"), nickname: z.string().min(1).max(40), teamName: z.string().min(1).max(40), color: z.string().max(10), emoji: z.string().max(8) }),
  z.object({ mode: z.literal("join"), nickname: z.string().min(1).max(40), teamRef: z.string().min(1).max(40) }),
]);

export function runHostAction(game: Game, raw: unknown) {
  const a = hostAction.parse(raw);
  const now = Date.now();
  switch (a.type) {
    case "advance": advance(game, now); break;
    case "extend": extendTime(game, a.ms, now); break;
    case "override": overrideTeam(game, a.teamId, a.correct); break;
    case "kick": kickTeam(game, a.teamId); audit(game.id, `takım atıldı ${a.teamId}`); break;
    case "rename": renameTeam(game, a.teamId, a.name); break;
    case "adjust": adjustScore(game, a.teamId, a.delta); audit(game.id, `manuel puan ${a.delta} (${a.teamId}): ${a.note}`); break;
    case "mode": setMode(game, a.mode); break;
    case "auto":
      if (a.on && !(game.plan !== "free")) throw new GameError("plan", "Auto-Host Başlangıç planı ve üstünde.", 402);
      game.autoHost = a.on; game.version++; break;
    case "pause": game.paused = a.on; game.version++; break;
    case "void": {
      const q = game.questions[game.qIndex];
      db.reports.push({ id: Math.random().toString(36).slice(2, 10), at: now, questionId: q.id, venueId: game.venueId, reason: a.reason ?? "hatalı soru" }); save();
      voidQuestion(game, a.award); break;
    }
    case "settings": {
      const s = game.settings;
      if (a.points !== undefined) s.points = a.points;
      if (a.wrongPenalty !== undefined) s.wrongPenalty = a.wrongPenalty;
      if (a.durationSec !== undefined) s.durationMs = a.durationSec * 1000;
      if (a.lockFirst !== undefined) s.lockFirst = a.lockFirst;
      if (a.teamMax !== undefined) s.teamMax = a.teamMax;
      if (a.individualAgg !== undefined) s.individualAgg = a.individualAgg;
      if (a.speedBonus !== undefined) s.speedBonus = a.speedBonus;
      game.version++; break;
    }
    case "tv_rotate": rotateTvToken(game); audit(game.id, "TV bağlantısı yenilendi"); break;
    case "end": game.phase = "final"; game.endedAt = now; game.version++; break;
  }
  afterChange(game);
}

export function runPlayerAction(game: Game, memberToken: string, raw: unknown) {
  const a = playerAction.parse(raw);
  const now = Date.now();
  switch (a.type) {
    case "answer":
      if (seenKey(game.id, a.key)) return;
      submitAnswer(game, { memberToken, value: a.value, lock: a.lock, now }); break;
    case "suggest": suggest(game, memberToken, a.value, now); break;
    case "claim_captain": claimCaptain(game, memberToken, now); break;
    case "handover": handOverCaptain(game, memberToken, a.to); break;
    case "heartbeat": heartbeat(game, memberToken, now, a.hidden); if (!a.hidden) return; break;
    case "wager": placeWager(game, memberToken, a.amount); break;
    case "joker": activateJoker(game, memberToken, a.kind ?? "double"); break;
    case "sabotage": sabotageTeam(game, memberToken, a.target); break;
    case "pick": pickEntry(game, memberToken, a.id, now); break;
    case "appeal": appeal(game, memberToken, a.note); break;
  }
  afterChange(game);
}

export function runJoin(game: Game, raw: unknown) {
  const j = joinSchema.parse(raw);
  const now = Date.now();
  const res = j.mode === "create"
    ? createTeam(game, { nickname: j.nickname, teamName: j.teamName, color: j.color, emoji: j.emoji, now })
    : joinTeam(game, { nickname: j.nickname, teamRef: j.teamRef, now });
  afterChange(game);
  return res;
}

export function errorResponse(e: unknown) {
  if (e instanceof GameError || e instanceof VenueError) return Response.json({ error: e.code, message: e.message }, { status: e.status });
  if (e instanceof z.ZodError) return Response.json({ error: "invalid", message: e.issues[0]?.message && !e.issues[0].message.startsWith("Invalid") ? e.issues[0].message : "Geçersiz istek." }, { status: 400 });
  if (e instanceof SyntaxError) return Response.json({ error: "invalid", message: "Geçersiz istek." }, { status: 400 });
  console.error(e);
  return Response.json({ error: "server", message: "Sunucu hatası, tekrar dene." }, { status: 500 });
}
