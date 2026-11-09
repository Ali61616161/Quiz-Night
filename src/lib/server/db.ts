import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { PlanId } from "@config/plans";
import type { Brand, Question } from "@/lib/engine/types";

export interface User { id: string; email: string; salt: string; hash: string; verified: boolean; verifyToken: string | null; venueId: string; role: "owner" | "host"; createdAt: number }
export interface Schedule { id: string; title: string; weekday: number; time: string; remindEmail: boolean; lastReminded?: string }
export interface GameRecord {
  gameId: string; at: number; teams: number; players: number; ranking: { name: string; score: number }[];
  perQuestion: { id: string; text: string; correctRate: number }[];
  returningTeams: number;
}
export interface Venue {
  id: string; name: string; ownerEmail: string; plan: PlanId; status: "active" | "past_due" | "canceled" | "trial";
  cycle: "monthly" | "yearly"; renewsAt: number | null; couponCode: string | null; discountPercent: number; discountMonthsLeft: number;
  brand: Brand; logo: { type: string; b64: string } | null;
  schedules: Schedule[]; aiUsed: { month: string; n: number };
  seen: string[]; customQuestions: Question[]; history: GameRecord[]; gameTimes: number[];
  league: { season: number; teams: Record<string, { name: string; points: number; played: number; wins: number }>; seasons: { season: number; champion: string; points: number }[] };
  billing: { company: string; taxNo: string; address: string } | null;
  invoices: { id: string; at: number; amountTry: number; kdv: number; plan: PlanId; status: "paid" | "failed" }[];
  createdAt: number;
}
export interface Coupon { code: string; percentOff: number; months: number; maxUses: number; uses: number; expires: number | null; note: string }
export interface AbuseFlag { id: string; at: number; venueId: string | null; kind: string; detail: string }
export interface QReport { id: string; at: number; questionId: string; venueId: string | null; reason: string }

export interface DB {
  users: Record<string, User>; venues: Record<string, Venue>; coupons: Record<string, Coupon>;
  abuse: AbuseFlag[]; reports: QReport[]; audit: { at: number; who: string; what: string }[];
  qstats: Record<string, { n: number; ok: number }>; drafts: Question[]; announcement: string;
  mailLog: { at: number; to: string; subject: string; body: string }[];
}

const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");
const empty = (): DB => ({ users: {}, venues: {}, coupons: {}, abuse: [], reports: [], audit: [], qstats: {}, drafts: [], announcement: "", mailLog: [] });

const g = globalThis as unknown as { __db?: DB; __dbTimer?: ReturnType<typeof setTimeout> };

function load(): DB {
  if (process.env.NODE_ENV === "test" || process.env.DB_MEMORY === "1") return empty();
  try { if (existsSync(FILE)) return { ...empty(), ...JSON.parse(readFileSync(FILE, "utf8")) }; } catch { /* bozuk dosya: boş başla */ }
  return empty();
}
export const db: DB = (g.__db ??= load());

/** Debounced anlık görüntü. Oyun durumu (canlı oyunlar) kalıcı değildir, hesaplar ve içerik kalıcıdır. */
export function save() {
  if (process.env.NODE_ENV === "test" || process.env.DB_MEMORY === "1") return;
  clearTimeout(g.__dbTimer);
  g.__dbTimer = setTimeout(() => {
    try {
      mkdirSync(DIR, { recursive: true });
      const tmp = FILE + ".tmp";
      writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
      renameSync(tmp, FILE);
    } catch (e) { console.error("db save failed", e); }
  }, 400);
}

export function audit(who: string, what: string) {
  db.audit.push({ at: Date.now(), who, what });
  if (db.audit.length > 2000) db.audit.splice(0, 500);
  save();
}
export function flag(venueId: string | null, kind: string, detail: string) {
  db.abuse.push({ id: Math.random().toString(36).slice(2, 10), at: Date.now(), venueId, kind, detail: detail.slice(0, 300) });
  if (db.abuse.length > 2000) db.abuse.splice(0, 500);
  save();
}
