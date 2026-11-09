import { errorResponse, runHostAction, runPlayerAction } from "@/lib/server/actions";
import { getGame } from "@/lib/server/store";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const game = getGame(id);
    if (!game) return Response.json({ error: "no_game", message: "Oyun bulunamadı." }, { status: 404 });
    const body = await req.json();
    if (body.role === "host") {
      if (body.token !== game.hostToken) return Response.json({ error: "forbidden", message: "Host yetkisi yok." }, { status: 403 });
      runHostAction(game, body.action);
    } else {
      runPlayerAction(game, String(body.token), body.action);
    }
    return Response.json({ ok: true, version: game.version });
  } catch (e) { return errorResponse(e); }
}
