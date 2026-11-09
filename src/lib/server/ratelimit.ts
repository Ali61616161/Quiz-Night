/** Bellek içi kayan pencere sınırlayıcı. Çok sunuculu kurulumda Redis/Upstash ile değiştirilmeli. */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr);
  if (hits.size > 20000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  return true;
}

export function clientIp(req: Request): string {
  // Güvenilir proxy arkasında çalışırken x-forwarded-for'un ilk değeri kullanılır.
  const xf = req.headers.get("x-forwarded-for");
  return (xf ? xf.split(",")[0].trim() : req.headers.get("x-real-ip")) || "local";
}

/**
 * Mekanlar tek NAT IP'si arkasında oturur (200 telefon = 1 IP). Bu yüzden oyuncu uçları IP yerine
 * oyuncu token'ına göre, katılım uçları ise yüksek IP eşiğiyle sınırlanır.
 */
export const LIMITS = {
  join: { max: 400, win: 60_000, byIp: true }, room: { max: 900, win: 60_000, byIp: true },
  answer: { max: 20, win: 10_000, byIp: false }, action: { max: 60, win: 10_000, byIp: false },
  login: { max: 10, win: 60_000, byIp: true }, signup: { max: 5, win: 3600_000, byIp: true },
  gameCreate: { max: 20, win: 3600_000, byIp: true }, ai: { max: 10, win: 3600_000, byIp: true }, upload: { max: 10, win: 60_000, byIp: true },
  api: { max: 300, win: 60_000, byIp: true },
} as const;

export function limited(req: Request, name: keyof typeof LIMITS, extra = ""): boolean {
  const l = LIMITS[name];
  return !rateLimit(`${name}:${l.byIp ? clientIp(req) : ""}:${extra}`, l.max, l.win);
}
