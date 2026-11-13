import { z } from "zod";
import { PLANS } from "@config/plans";
import { errorResponse } from "@/lib/server/actions";
import { fail, json, requireVenue } from "@/lib/server/api";
import { cancel, quote, subscribe } from "@/lib/server/billing";
import { db, save } from "@/lib/server/db";
import { effectivePlan } from "@/lib/server/venue";

const subSchema = z.object({ plan: z.enum(["free", "starter", "pro", "brand"]), cycle: z.enum(["monthly", "yearly"]), paymentToken: z.string().max(80).default("tok_demo"), acceptSale: z.boolean().optional(), coupon: z.string().max(30).optional() });

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const s = requireVenue(req); if (s instanceof Response) return s;
  const v = s.venue;
  if (action === "state") return json({ plan: v.plan, effective: effectivePlan(v), status: v.status, cycle: v.cycle, renewsAt: v.renewsAt, coupon: v.couponCode, invoices: v.invoices.slice(-20).reverse(), billing: v.billing });
  if (action === "quote") {
    const u = new URL(req.url);
    const plan = u.searchParams.get("plan") as keyof typeof PLANS;
    if (!PLANS[plan]) return fail(400, "invalid", "Plan geçersiz.");
    const q = quote(plan, u.searchParams.get("cycle") === "yearly" ? "yearly" : "monthly", u.searchParams.get("coupon") ?? undefined);
    return json({ ...q, coupon: q.coupon ? { code: q.coupon.code, percentOff: q.coupon.percentOff, months: q.coupon.months } : null });
  }
  return fail(404, "nf", "Bulunamadı.");
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await ctx.params;
    const s = requireVenue(req, { write: true, owner: true }); if (s instanceof Response) return s;
    const v = s.venue;
    if (action === "subscribe") {
      const b = subSchema.parse(await req.json());
      if (b.plan !== "free" && b.acceptSale !== true) return fail(400, "consent", "Ön bilgilendirme ve iptal/iade koşullarını onaylamalısın.");
      const r = await subscribe(v, b.plan, b.cycle, b.paymentToken, b.coupon);
      return r.ok ? json(r) : fail(402, "payment", r.error);
    }
    if (action === "cancel") { cancel(v); return json({ ok: true }); }
    if (action === "info") {
      const b = z.object({ company: z.string().max(100), taxNo: z.string().regex(/^\d{10,11}$/, "Vergi/TC no 10 veya 11 haneli olmalı."), address: z.string().max(240) }).parse(await req.json());
      v.billing = b; save(); void db; return json({ ok: true });
    }
    return fail(404, "nf", "Bulunamadı.");
  } catch (e) { return errorResponse(e); }
}
