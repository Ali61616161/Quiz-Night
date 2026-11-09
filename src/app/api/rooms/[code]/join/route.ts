import { errorResponse, runJoin } from "@/lib/server/actions";
import { getGameByCode } from "@/lib/server/store";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const g = getGameByCode(code);
    if (!g) return Response.json({ error: "no_room", message: "Oda bulunamadı. Kodu kontrol et." }, { status: 404 });
    const r = runJoin(g, await req.json());
    return Response.json({ gameId: g.id, ...r });
  } catch (e) { return errorResponse(e); }
}
