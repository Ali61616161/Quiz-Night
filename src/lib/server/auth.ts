import { LEGAL_VERSION } from "@/lib/legal";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { PLANS } from "@config/plans";
import { audit, db, flag, save, type User, type Venue } from "./db";
import { sendMail } from "./mail";

export const COOKIE = "qh_session";
const SESSION_TTL = 14 * 24 * 3600_000;
const sessions = ((globalThis as unknown as { __sess?: Map<string, { userId: string; at: number; ip: string }> }).__sess ??= new Map());
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const rid = () => randomBytes(9).toString("base64url");

export const signupSchema = z.object({
  email: z.string().email().max(120).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(10, "Şifre en az 10 karakter olmalı.").max(200),
  venueName: z.string().trim().min(2).max(60),
  acceptTerms: z.literal(true, { message: "Kullanım koşullarını ve KVKK aydınlatma metnini kabul etmelisin." }),
});

function hashPw(pw: string, salt: string) { return scryptSync(pw, salt, 64).toString("hex"); }

export function emptyBrand(): Venue["brand"] {
  return { logo: null, color1: "#17483B", color2: "#F4B942", font: "varsayilan", bg: "cuha" };
}

export function signup(input: z.infer<typeof signupSchema>) {
  if (Object.values(db.users).some((u) => u.email === input.email)) return { error: "Bu e-posta zaten kayıtlı. Giriş yap." } as const;
  const venueId = rid(), userId = rid(), salt = randomBytes(16).toString("hex");
  const venue: Venue = {
    id: venueId, name: input.venueName, ownerEmail: input.email, plan: "free", status: "active", cycle: "monthly", renewsAt: null,
    couponCode: null, discountPercent: 0, discountMonthsLeft: 0, brand: emptyBrand(), logo: null, schedules: [], aiUsed: { month: "", n: 0 },
    seen: [], customQuestions: [], history: [], gameTimes: [], league: { season: 1, teams: {}, seasons: [] }, billing: null, invoices: [], createdAt: Date.now(),
  };
  const verifyToken = randomBytes(24).toString("base64url");
  const user: User = { id: userId, email: input.email, salt, hash: hashPw(input.password, salt), verified: false, verifyToken, venueId, role: "owner", createdAt: Date.now(), termsAt: Date.now(), termsVersion: LEGAL_VERSION };
  db.venues[venueId] = venue; db.users[userId] = user; save();
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${base}/api/auth/verify?token=${verifyToken}`;
  sendMail(input.email, "E-posta adresini doğrula", `Hesabını doğrulamak için bağlantıya tıkla: ${link}`);
  return { ok: true, devVerifyUrl: process.env.NODE_ENV !== "production" || process.env.EXPOSE_DEV_LINKS === "1" ? link : undefined } as const;
}

export function verifyEmail(tokenStr: string): boolean {
  const u = Object.values(db.users).find((x) => x.verifyToken && x.verifyToken === tokenStr);
  if (!u) return false;
  u.verified = true; u.verifyToken = null; save();
  return true;
}

export function login(email: string, password: string, ip: string) {
  const u = Object.values(db.users).find((x) => x.email === email.trim().toLowerCase());
  // Kullanıcı yoksa da hash hesaplanır: zamanlama farkıyla kullanıcı sayımı yapılamasın
  const salt = u?.salt ?? "0".repeat(32);
  const h = Buffer.from(hashPw(password, salt), "hex");
  const ok = u && timingSafeEqual(h, Buffer.from(u.hash, "hex"));
  if (!u || !ok) return { error: "E-posta veya şifre hatalı." } as const;
  if (!u.verified) return { error: "E-posta doğrulanmadı. Doğrulama bağlantısını aç." } as const;
  const t = randomBytes(32).toString("base64url");
  sessions.set(sha(t), { userId: u.id, at: Date.now(), ip });
  // Kötüye kullanım: aynı hesaba kısa sürede çok farklı IP
  const ips = new Set([...sessions.values()].filter((s) => s.userId === u.id && Date.now() - s.at < 3600_000).map((s) => s.ip));
  if (ips.size >= 4) flag(u.venueId, "many_ips", `${ips.size} farklı IP ile 1 saat içinde giriş`);
  return { ok: true, token: t, user: u } as const;
}

export function logout(t: string) { sessions.delete(sha(t)); }

export function cookieHeader(t: string | null) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return t ? `${COOKIE}=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL / 1000}${secure}` : `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(req: Request, name = COOKIE): string | null {
  const c = req.headers.get("cookie") ?? "";
  const m = c.split(/;\s*/).find((p) => p.startsWith(name + "="));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}

export function sessionFrom(req: Request): { user: User; venue: Venue } | null {
  const t = readCookie(req);
  if (!t) return null;
  const s = sessions.get(sha(t));
  if (!s || Date.now() - s.at > SESSION_TTL) { sessions.delete(sha(t)); return null; }
  const user = db.users[s.userId];
  const venue = user && db.venues[user.venueId];
  return user && venue ? { user, venue } : null;
}

export const isAdmin = (email: string) => (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email);

/** Mutasyon isteklerinde Origin denetimi (CSRF'ye ek koruma; çerez zaten SameSite=Lax). */
export function sameOrigin(req: Request): boolean {
  const o = req.headers.get("origin");
  if (!o) return true; // aynı-site form/fetch dışı istemciler (curl) çerezsiz çalışır
  try { return new URL(o).host === (req.headers.get("host") ?? ""); } catch { return false; }
}

export function planOf(v: Venue) { return PLANS[v.status === "canceled" ? "free" : v.plan]; }
export { audit };

const pwSchema = z.string().min(10, "Şifre en az 10 karakter olmalı.").max(200);

/** Şifre sıfırlama: kullanıcı var olsa da olmasa da aynı yanıt verilir (hesap sayımı yapılamaz). */
export function requestReset(email: string) {
  const u = Object.values(db.users).find((x) => x.email === email.trim().toLowerCase());
  if (!u) return null;
  u.resetToken = randomBytes(24).toString("base64url"); u.resetExp = Date.now() + 3600_000; save();
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${base}/giris?sifirla=${u.resetToken}`;
  sendMail(u.email, "Şifre sıfırlama", `Şifreni sıfırlamak için (1 saat geçerli): ${link}`);
  return link;
}
export function resetPassword(tokenStr: string, password: string) {
  const u = Object.values(db.users).find((x) => x.resetToken && x.resetToken === tokenStr && (x.resetExp ?? 0) > Date.now());
  if (!u) return false;
  pwSchema.parse(password);
  u.salt = randomBytes(16).toString("hex"); u.hash = hashPw(password, u.salt); u.resetToken = null; u.verified = true;
  for (const [k, s2] of sessions) if (s2.userId === u.id) sessions.delete(k); // açık oturumlar kapanır
  audit(u.email, "şifre sıfırlandı"); save();
  return true;
}
/** Hesap ve mekan verisini siler (KVKK silme hakkı). */
export function deleteAccount(user: User, password: string) {
  const h = Buffer.from(hashPw(password, user.salt), "hex");
  if (!timingSafeEqual(h, Buffer.from(user.hash, "hex"))) return false;
  for (const [k, s2] of sessions) if (s2.userId === user.id) sessions.delete(k);
  // Fatura/muhasebe kayıtları yasal saklama süresi boyunca ayrı tutulur (KVKK m.7, VUK/TTK)
  const v = db.venues[user.venueId];
  if (v?.invoices?.length) (db.retainedInvoices ??= []).push({ venue: v.name, billing: v.billing, invoices: v.invoices, deletedAt: Date.now() });
  delete db.users[user.id]; delete db.venues[user.venueId];
  audit(user.email, "hesap silindi"); save();
  return true;
}

/** Ekibe host ekler: hesap oluşturulur, kişi e-postadaki bağlantıyla şifresini belirler. */
export function inviteHost(owner: User, email: string) {
  const e = email.trim().toLowerCase();
  if (Object.values(db.users).some((u) => u.email === e)) return { error: "Bu e-posta zaten kayıtlı." } as const;
  const venue = db.venues[owner.venueId];
  const members = Object.values(db.users).filter((u) => u.venueId === owner.venueId);
  if (members.length >= (PLANS[planOf(venue).id].hostDevices + 4)) return { error: "Ekip üyesi sınırına ulaştın." } as const;
  const salt = randomBytes(16).toString("hex");
  const u: User = { id: rid(), email: e, salt, hash: hashPw(randomBytes(24).toString("hex"), salt), verified: false, verifyToken: null, venueId: owner.venueId, role: "host", createdAt: Date.now() };
  db.users[u.id] = u; save();
  const link = requestReset(e);
  audit(owner.email, `ekip daveti: ${e}`);
  return { ok: true, devLink: process.env.NODE_ENV !== "production" || process.env.EXPOSE_DEV_LINKS === "1" ? link : undefined } as const;
}
export function removeMember(owner: User, id: string) {
  const u = db.users[id];
  if (!u || u.venueId !== owner.venueId || u.role === "owner") return false;
  for (const [k, s2] of sessions) if (s2.userId === id) sessions.delete(k);
  delete db.users[id]; audit(owner.email, `ekip üyesi çıkarıldı: ${u.email}`); save(); return true;
}
