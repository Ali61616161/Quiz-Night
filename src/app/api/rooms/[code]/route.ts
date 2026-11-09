import { fail, json } from "@/lib/server/api";
import { limited } from "@/lib/server/ratelimit";
import { getGameByCode } from "@/lib/server/store";

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  if (limited(req, "room")) return fail(429, "rate", "Çok fazla deneme. Biraz bekle.");
  const { code } = await ctx.params;
  const g = getGameByCode(code);
  if (!g) return fail(404, "no_room", "Oda bulunamadı. Kodu kontrol et.");
  return json({
    id: g.id, code: g.code, venueName: g.venueName, phase: g.phase, brand: g.brand,
    teams: g.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, emoji: t.emoji, members: t.members.length, full: t.members.length >= g.settings.teamMax })),
  });
}
