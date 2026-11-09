import { heartbeat, tick } from "@/lib/engine/game";
import { hostView, playerView, tvView } from "@/lib/engine/views";
import { PLANS } from "@config/plans";
import { getGame, hostDevice, subscribe, afterChange } from "@/lib/server/store";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";
const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const token = url.searchParams.get("token") ?? "";
  const device = (url.searchParams.get("device") ?? "d").slice(0, 24);
  const game = getGame(id);
  if (!game) return new Response("not found", { status: 404 });
  if (role === "host" && !eq(token, game.hostToken)) return new Response("forbidden", { status: 403 });
  if (role === "tv" && !eq(token, game.tvToken)) return new Response("forbidden", { status: 403 });
  if (role !== "host" && role !== "tv" && role !== "player") return new Response("bad request", { status: 400 });

  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = () => {
        if (closed) return;
        const now = Date.now();
        if ((role === "tv" && !eq(token, game.tvToken)) || (role === "host" && !eq(token, game.hostToken))) { closed = true; cleanup(); try { controller.close(); } catch {} return; }
        if (tick(game, now)) afterChange(game);
        let view: unknown;
        if (role === "host") {
          const hd = hostDevice(id, device, PLANS[game.plan].hostDevices, now);
          view = { ...hostView(game, now, { otherHostActive: hd.others }), kicked: hd.kicked };
        } else if (role === "tv") view = tvView(game, now);
        else { try { heartbeat(game, token, now); } catch { /* üye silinmiş olabilir */ } view = playerView(game, token, now); }
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(view)}\n\n`)); } catch { closed = true; }
      };
      send();
      const unsub = subscribe(id, send);
      const iv = setInterval(send, 3000);
      cleanup = () => { closed = true; clearInterval(iv); unsub(); };
      req.signal.addEventListener("abort", () => { cleanup(); try { controller.close(); } catch {} });
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
