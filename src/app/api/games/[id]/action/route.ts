import { errorResponse, runHostAction, runPlayerAction } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/api";
import { limited } from "@/lib/server/ratelimit";
import { getGame } from "@/lib/server/store";
import { timingSafeEqual } from "node:crypto";

const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const game = getGame(id);
    if (!game) return fail(404, "no_game", "Oyun bulunamadı.");
    const body = await req.json();
    if (typeof body?.token !== "string") return fail(400, "invalid", "Geçersiz istek.");
    if (limited(req, body?.action?.type === "answer" ? "answer" : "action", body.token)) return fail(429, "rate", "Çok hızlı. Biraz bekle.");
    if (body.role === "host") {
      if (!eq(body.token, game.hostToken)) return fail(403, "forbidden", "Host yetkisi yok.");
      runHostAction(game, body.action);
    } else {
      runPlayerAction(game, body.token, body.action);
    }
    return json({ ok: true, version: game.version });
  } catch (e) { return errorResponse(e); }
}
