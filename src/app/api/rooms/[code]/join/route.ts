import { errorResponse, runJoin } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/api";
import { limited } from "@/lib/server/ratelimit";
import { getGameByCode } from "@/lib/server/store";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    if (limited(req, "join")) return fail(429, "rate", "Çok fazla deneme. Biraz bekle.");
    const { code } = await ctx.params;
    const g = getGameByCode(code);
    if (!g) return fail(404, "no_room", "Oda bulunamadı. Kodu kontrol et.");
    const r = runJoin(g, await req.json());
    return json({ gameId: g.id, ...r });
  } catch (e) { return errorResponse(e); }
}
