import { isAdmin, sameOrigin, sessionFrom } from "./auth";
import { clientIp, limited, type LIMITS } from "./ratelimit";
import type { User, Venue } from "./db";

export const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });
export const fail = (status: number, error: string, message: string) => json({ error, message }, status);

/** Mutasyon + oturum koruması. Dönen değer Response ise doğrudan döndürülür. */
export function requireVenue(req: Request, opts: { write?: boolean; admin?: boolean; raw?: boolean; rate?: keyof typeof LIMITS } = {}): { user: User; venue: Venue } | Response {
  if (opts.write && !sameOrigin(req)) return fail(403, "csrf", "İstek reddedildi.");
  if (opts.write && !opts.raw && !(req.headers.get("content-type") ?? "").includes("application/json") && req.method !== "DELETE") return fail(415, "type", "JSON bekleniyor.");
  if (opts.rate && limited(req, opts.rate)) return fail(429, "rate", "Çok fazla deneme. Biraz bekle.");
  const s = sessionFrom(req);
  if (!s) return fail(401, "auth", "Giriş yapmalısın.");
  if (opts.admin && !isAdmin(s.user.email)) return fail(403, "forbidden", "Yetkin yok.");
  return s;
}
export { clientIp };
