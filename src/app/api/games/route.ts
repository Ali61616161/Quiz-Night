import { z } from "zod";
import { TEMPLATES, THEMES } from "@/lib/content/bank";
import { errorResponse } from "@/lib/server/actions";
import { fail, json } from "@/lib/server/api";
import { sameOrigin, sessionFrom } from "@/lib/server/auth";
import { limited } from "@/lib/server/ratelimit";
import { registerGame } from "@/lib/server/store";
import { createVenueGame } from "@/lib/server/venue";

const body = z.object({
  template: z.enum(Object.keys(TEMPLATES) as [string, ...string[]]).default("classic"),
  theme: z.enum(Object.keys(THEMES) as [string, ...string[]]).optional(),
  durationSec: z.number().int().min(10).max(120).optional(),
  teamMode: z.enum(["captain", "majority", "individual"]).optional(),
  autoHost: z.boolean().optional(),
  demo: z.boolean().optional(),
});

/** Oturum varsa mekan planıyla; yoksa ücretsiz demo (kısa şablon) olarak oyun açar. */
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail(403, "csrf", "İstek reddedildi.");
    if (limited(req, "gameCreate")) return fail(429, "rate", "Çok fazla oyun açıldı. Biraz bekle.");
    const b = body.parse(await req.json().catch(() => ({})));
    const s = sessionFrom(req);
    const { game, poolLow } = createVenueGame(s?.venue ?? null, { ...b, template: s ? (b.template as never) : "quick" });
    registerGame(game);
    return json({ id: game.id, code: game.code, hostToken: game.hostToken, tvToken: game.tvToken, poolLow, questions: game.questions.length });
  } catch (e) { return errorResponse(e); }
}
