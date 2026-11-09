import { z } from "zod";
import { PLANS, can } from "@config/plans";
import { generate, aiRequestSchema, CATEGORIES } from "@/lib/server/ai";
import { errorResponse } from "@/lib/server/actions";
import { fail, json, requireVenue } from "@/lib/server/api";
import { audit, db, save } from "@/lib/server/db";
import { sanitizeSvg, sniffImage, MAX_LOGO } from "@/lib/server/svg";
import { sendMail } from "@/lib/server/mail";
import { inviteHost, removeMember } from "@/lib/server/auth";
import { closeSeason, effectivePlan, leagueTable, monthKey, venueStats } from "@/lib/server/venue";
import { contrast } from "@/lib/brand";
import { parseCsv } from "@/lib/csv";
import type { Question } from "@/lib/engine/types";

const FONTS = ["varsayilan", "serif", "mono", "yuvarlak"];
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const questionSchema = z.object({
  category: z.enum(CATEGORIES), difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2), kind: z.enum(["open", "choice"]),
  text: z.string().trim().min(8).max(300), options: z.array(z.string().trim().min(1).max(80)).length(4).optional(),
  correct: z.string().trim().min(1).max(100), accepted: z.array(z.string().max(100)).max(6).default([]), explanation: z.string().max(300).optional(),
});

function toQuestion(q: z.infer<typeof questionSchema>, status: Question["status"]): Question {
  if (q.kind === "choice" && (!q.options || !q.options.includes(q.correct))) throw new z.ZodError([{ code: "custom", path: [], message: "Doğru cevap şıklardan biri olmalı." }]);
  return { id: `c-${Math.random().toString(36).slice(2, 10)}`, ...q, status, reports: 0 };
}

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const s = requireVenue(req, { rate: "api" }); if (s instanceof Response) return s;
  const v = s.venue; const plan = effectivePlan(v); const P = PLANS[plan];
  switch (action) {
    case "info": return json({
      id: v.id, name: v.name, plan, planName: P.name, status: v.status, email: s.user.email, brand: v.brand, hasLogo: Boolean(v.logo),
      features: [...P.features], aiQuota: P.aiQuotaMonthly, aiUsed: v.aiUsed.month === monthKey() ? v.aiUsed.n : 0, schedules: v.schedules,
      seenCount: v.seen.length, history: v.history.slice(-10).reverse().map((h) => ({ gameId: h.gameId, at: h.at, teams: h.teams, players: h.players, winner: h.ranking[0]?.name ?? "" })),
    });
    case "team": return json({ me: s.user.id, role: s.user.role, members: Object.values(db.users).filter((u) => u.venueId === v.id).map((u) => ({ id: u.id, email: u.email, role: u.role, verified: u.verified })) });
    case "questions": return json({ custom: v.customQuestions, drafts: db.drafts.filter((d) => (d as Question & { venueId?: string }).venueId === v.id) });
    case "stats": return can(plan, "stats") ? json(venueStats(v)) : fail(402, "plan", "İstatistikler Pro planında.");
    case "league": return can(plan, "league") ? json({ season: v.league.season, table: leagueTable(v), seasons: v.league.seasons }) : fail(402, "plan", "Lig Marka planında.");
    default: return fail(404, "nf", "Bulunamadı.");
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await ctx.params;
    const s = requireVenue(req, { write: true, raw: action === "logo", rate: action === "ai" ? "ai" : action === "logo" ? "upload" : "api" }); if (s instanceof Response) return s;
    const OWNER_ONLY = ["rename", "brand", "logo", "league_close", "invite", "member_remove"];
    if (OWNER_ONLY.includes(action) && s.user.role !== "owner") return fail(403, "forbidden", "Bu işlem yalnızca mekan sahibine açıktır.");
    const v = s.venue; const plan = effectivePlan(v);
    const body = action === "logo" ? null : await req.json();
    switch (action) {
      case "rename": v.name = z.string().trim().min(2).max(60).parse(body.name); save(); return json({ ok: true });
      case "brand": {
        if (!can(plan, "branding")) return fail(402, "plan", "Marka özelleştirme Marka planında.");
        const b = z.object({ color1: hex, color2: hex, font: z.enum(FONTS as [string, ...string[]]), bg: z.enum(["cuha", "solid", "image"]) }).parse(body);
        const c = contrast(b.color1, "#EDE4D0");
        if (c < 4.5) return fail(400, "contrast", `Ana renk üzerinde metin okunmuyor (kontrast ${c.toFixed(1)}:1, en az 4,5). Daha koyu bir renk seç.`);
        v.brand = { ...v.brand, ...b }; save(); return json({ ok: true });
      }
      case "question": {
        const q = toQuestion(questionSchema.parse(body), "approved");
        v.customQuestions.push(q); save(); return json({ ok: true, id: q.id });
      }
      case "question_delete": { v.customQuestions = v.customQuestions.filter((q) => q.id !== body.id); save(); return json({ ok: true }); }
      case "bulk": {
        if (!can(plan, "bulk_csv")) return fail(402, "plan", "Toplu yükleme Pro planında.");
        const rows = parseCsv(z.string().max(500_000).parse(body.csv));
        let added = 0; const errors: string[] = [];
        rows.forEach((r, i) => {
          try {
            const kind = r.options?.trim() ? "choice" : "open";
            const q = toQuestion(questionSchema.parse({ category: r.category, difficulty: Number(r.difficulty) || 2, kind, text: r.text, options: kind === "choice" ? r.options.split(";").map((x) => x.trim()) : undefined, correct: r.correct, accepted: r.accepted ? r.accepted.split(";").map((x) => x.trim()) : [], explanation: r.explanation || undefined }), "approved");
            v.customQuestions.push(q); added++;
          } catch (e) { errors.push(`Satır ${i + 2}: ${e instanceof z.ZodError ? e.issues[0].message : "hatalı"}`); }
        });
        save(); return json({ added, errors: errors.slice(0, 20) });
      }
      case "ai": {
        const P = PLANS[plan];
        const r = aiRequestSchema.parse(body);
        const used = v.aiUsed.month === monthKey() ? v.aiUsed.n : 0;
        if (used + r.count > P.aiQuotaMonthly) return fail(402, "quota", `Aylık AI kotası: ${P.aiQuotaMonthly}. Kalan: ${Math.max(0, P.aiQuotaMonthly - used)}.`);
        const out = await generate(r, [...v.customQuestions, ...db.drafts]).catch((e: Error) => { throw Object.assign(new Error(e.message), { status: 502 }); });
        v.aiUsed = { month: monthKey(), n: used + out.questions.length };
        for (const q of out.questions) db.drafts.push(Object.assign(q, { venueId: v.id }));
        audit(v.ownerEmail, `AI üretim: ${out.questions.length}`); save();
        return json({ added: out.questions.length, rejected: out.rejected, duplicates: out.dupes });
      }
      case "draft_approve": {
        const i = db.drafts.findIndex((d) => d.id === body.id && (d as Question & { venueId?: string }).venueId === v.id);
        if (i < 0) return fail(404, "nf", "Taslak bulunamadı.");
        const d = db.drafts.splice(i, 1)[0]; d.status = "approved"; v.customQuestions.push(d); save(); return json({ ok: true });
      }
      case "draft_reject": { db.drafts = db.drafts.filter((d) => !(d.id === body.id && (d as Question & { venueId?: string }).venueId === v.id)); save(); return json({ ok: true }); }
      case "schedule": {
        const b = z.object({ title: z.string().trim().min(2).max(60), weekday: z.number().int().min(0).max(6), time: z.string().regex(/^\d{2}:\d{2}$/), remindEmail: z.boolean().default(true) }).parse(body);
        if (v.schedules.length >= 20) return fail(400, "limit", "En fazla 20 takvim kaydı.");
        v.schedules.push({ id: Math.random().toString(36).slice(2, 10), ...b }); save(); return json({ ok: true });
      }
      case "support": {
        const b2 = z.object({ subject: z.string().trim().min(3).max(100), message: z.string().trim().min(10).max(2000) }).parse(body);
        sendMail(process.env.SUPPORT_EMAIL || "destek@localhost", `[Destek] ${b2.subject}`, `${v.name} (${s.user.email}, ${PLANS[plan].name}): ${b2.message}`); return json({ ok: true });
      }
      case "invite": { const r = inviteHost(s.user, z.string().email().max(120).parse(body.email)); return "error" in r ? fail(409, "exists", String(r.error)) : json(r); }
      case "member_remove": return removeMember(s.user, String(body.id)) ? json({ ok: true }) : fail(404, "nf", "Üye bulunamadı.");
      case "schedule_delete": { v.schedules = v.schedules.filter((x) => x.id !== body.id); save(); return json({ ok: true }); }
      case "league_close": { if (!can(plan, "league")) return fail(402, "plan", "Lig Marka planında."); closeSeason(v); return json({ ok: true }); }
      case "logo": {
        if (!can(plan, "branding")) return fail(402, "plan", "Logo yükleme Marka planında.");
        const buf = Buffer.from(await req.arrayBuffer());
        if (!buf.length || buf.length > MAX_LOGO) return fail(413, "size", "Logo en fazla 1 MB olmalı.");
        const type = sniffImage(buf);
        if (!type) return fail(415, "type", "Yalnızca PNG, SVG ya da WebP yükle.");
        let out = buf;
        if (type === "image/svg+xml") {
          const clean = sanitizeSvg(buf.toString("utf8"));
          if (!clean) return fail(400, "svg", "SVG güvenli değil (script ya da dış kaynak içeriyor).");
          out = Buffer.from(clean);
        }
        v.logo = { type, b64: out.toString("base64") }; save(); return json({ ok: true });
      }
      default: return fail(404, "nf", "Bulunamadı.");
    }
  } catch (e) {
    if ((e as { status?: number }).status === 502) return fail(502, "ai", (e as Error).message);
    return errorResponse(e);
  }
}
