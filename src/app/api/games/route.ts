import { z } from "zod";
import { createGame } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/actions";

const body = z.object({ venueName: z.string().min(1).max(60).default("Demo Mekan"), durationSec: z.number().int().min(10).max(120).optional() });

// Faz 1 dev: mekan hesabı olmadan oyun oluşturur. Faz 7'de oturum + plan kapısı eklenir.
export async function POST(req: Request) {
  try {
    const b = body.parse(await req.json().catch(() => ({})));
    const g = createGame(b.venueName, undefined, b.durationSec ? { durationMs: b.durationSec * 1000 } : undefined);
    return Response.json({ id: g.id, code: g.code, hostToken: g.hostToken, tvToken: g.tvToken });
  } catch (e) { return errorResponse(e); }
}
