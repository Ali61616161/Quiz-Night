import { z } from "zod";
import { BANK } from "@/lib/content/bank";
import { errorResponse } from "@/lib/server/actions";
import { fail, json, requireVenue } from "@/lib/server/api";
import { audit, db, save } from "@/lib/server/db";
import { liveGames } from "@/lib/server/store";
import { calibrationSuggestions, effectivePlan } from "@/lib/server/venue";

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const s = requireVenue(req, { admin: true }); if (s instanceof Response) return s;
  if (action === "overview") {
    return json({
      venues: Object.values(db.venues).map((v) => ({ id: v.id, name: v.name, email: v.ownerEmail, plan: v.plan, effective: effectivePlan(v), status: v.status, games: v.history.length, createdAt: v.createdAt })),
      liveGames: liveGames().length, abuse: db.abuse.slice(-50).reverse(), coupons: Object.values(db.coupons), announcement: db.announcement,
      reports: db.reports.slice(-50).reverse().map((r) => ({ ...r, text: BANK.find((q) => q.id === r.questionId)?.text ?? db.drafts.find((q) => q.id === r.questionId)?.text ?? r.questionId })),
      drafts: db.drafts.length, calibration: calibrationSuggestions(), audit: db.audit.slice(-50).reverse(),
      bank: { total: BANK.length },
    });
  }
  return fail(404, "nf", "Bulunamadı.");
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await ctx.params;
    const s = requireVenue(req, { admin: true, write: true }); if (s instanceof Response) return s;
    const b = await req.json();
    if (action === "coupon") {
      const c = z.object({ code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/), percentOff: z.number().int().min(1).max(100), months: z.number().int().min(1).max(24), maxUses: z.number().int().min(1).max(10000), expiresDays: z.number().int().min(1).max(730).optional(), note: z.string().max(100).default("") }).parse(b);
      const code = c.code.toUpperCase();
      db.coupons[code] = { code, percentOff: c.percentOff, months: c.months, maxUses: c.maxUses, uses: 0, expires: c.expiresDays ? Date.now() + c.expiresDays * 86400_000 : null, note: c.note };
      audit(s.user.email, `kupon: ${code}`); save(); return json({ ok: true });
    }
    if (action === "coupon_delete") { delete db.coupons[String(b.code).toUpperCase()]; save(); return json({ ok: true }); }
    if (action === "announce") { db.announcement = z.string().max(300).parse(b.text); save(); return json({ ok: true }); }
    if (action === "set_plan") {
      const v = db.venues[String(b.venueId)]; if (!v) return fail(404, "nf", "Mekan yok.");
      v.plan = z.enum(["free", "starter", "pro", "brand"]).parse(b.plan); v.status = "active"; audit(s.user.email, `admin plan: ${v.id} → ${v.plan}`); save(); return json({ ok: true });
    }
    if (action === "draft_list") return json({ drafts: db.drafts.slice(0, 100) });
    return fail(404, "nf", "Bulunamadı.");
  } catch (e) { return errorResponse(e); }
}
