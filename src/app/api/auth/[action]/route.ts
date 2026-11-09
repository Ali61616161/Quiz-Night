import { z } from "zod";
import { errorResponse } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/api";
import { cookieHeader, deleteAccount, isAdmin, login, logout, readCookie, requestReset, resetPassword, sameOrigin, sessionFrom, signup, signupSchema, verifyEmail } from "@/lib/server/auth";
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
    if (action === "forgot") {
      if (limited(req, "signup", "forgot")) return fail(429, "rate", "Çok fazla deneme. Sonra tekrar dene.");
      const b = z.object({ email: z.string().max(120) }).parse(await req.json());
      const link = requestReset(b.email);
      return json({ ok: true, devResetUrl: link && (process.env.NODE_ENV !== "production" || process.env.EXPOSE_DEV_LINKS === "1") ? link : undefined });
    }
    if (action === "reset") {
      if (limited(req, "login", "reset")) return fail(429, "rate", "Çok fazla deneme. Bir dakika bekle.");
      const b = z.object({ token: z.string().max(80), password: z.string().min(10, "Şifre en az 10 karakter olmalı.").max(200) }).parse(await req.json());
      return resetPassword(b.token, b.password) ? json({ ok: true }) : fail(400, "token", "Bağlantı geçersiz ya da süresi dolmuş.");
    }
    if (action === "delete") {
      const s = sessionFrom(req); if (!s) return fail(401, "auth", "Giriş yapmalısın.");
      const b = z.object({ password: z.string().max(200) }).parse(await req.json());
      return deleteAccount(s.user, b.password) ? json({ ok: true }, 200, { "Set-Cookie": cookieHeader(null) }) : fail(403, "password", "Şifre hatalı.");
    }
    if (action === "logout") {
      const t = readCookie(req); if (t) logout(t);
      return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(null) });
    }
    return fail(404, "nf", "Bulunamadı.");
  } catch (e) { return errorResponse(e); }
}
