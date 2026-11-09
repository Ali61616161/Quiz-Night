import { getGameByCode } from "@/lib/server/store";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const g = getGameByCode(code);
  if (!g) return Response.json({ error: "no_room", message: "Oda bulunamadı. Kodu kontrol et." }, { status: 404 });
  return Response.json({
    id: g.id, code: g.code, venueName: g.venueName, phase: g.phase,
    teams: g.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, emoji: t.emoji, members: t.members.length, full: t.members.length >= g.settings.teamMax })),
  });
}
