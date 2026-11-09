import { z } from "zod";
import { errorResponse } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/api";
import { cookieHeader, isAdmin, login, logout, readCookie, sameOrigin, sessionFrom, signup, signupSchema, verifyEmail } from "@/lib/server/auth";
import { clientIp, limited } from "@/lib/server/ratelimit";
import { effectivePlan } from "@/lib/server/venue";

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action === "verify") {
    const t = new URL(req.url).searchParams.get("token") ?? "";
    const ok = verifyEmail(t);
    return Response.redirect(new URL(ok ? "/giris?dogrulandi=1" : "/giris?hata=dogrulama", req.url), 302);
  }
  if (action === "me") {
    const s = sessionFrom(req);
    if (!s) return fail(401, "auth", "Giriş yapmalısın.");
    return json({ email: s.user.email, venueId: s.venue.id, venue: s.venue.name, plan: effectivePlan(s.venue), admin: isAdmin(s.user.email) });
  }
  return fail(404, "nf", "Bulunamadı.");
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await ctx.params;
    if (!sameOrigin(req)) return fail(403, "csrf", "İstek reddedildi.");
    if (action === "signup") {
      if (limited(req, "signup")) return fail(429, "rate", "Çok fazla kayıt denemesi. Sonra tekrar dene.");
      const r = signup(signupSchema.parse(await req.json()));
      return "error" in r ? fail(409, "exists", String(r.error)) : json(r);
    }
    if (action === "login") {
      if (limited(req, "login")) return fail(429, "rate", "Çok fazla giriş denemesi. Bir dakika bekle.");
      const b = z.object({ email: z.string().max(120), password: z.string().max(200) }).parse(await req.json());
      if (limited(req, "login", b.email.toLowerCase())) return fail(429, "rate", "Çok fazla giriş denemesi. Bir dakika bekle.");
      const r = login(b.email, b.password, clientIp(req));
      if ("error" in r) return fail(401, "login", String(r.error));
      return json({ ok: true, venue: r.user.venueId }, 200, { "Set-Cookie": cookieHeader(r.token) });
    }
    if (action === "logout") {
      const t = readCookie(req); if (t) logout(t);
      return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(null) });
    }
    return fail(404, "nf", "Bulunamadı.");
  } catch (e) { return errorResponse(e); }
}
