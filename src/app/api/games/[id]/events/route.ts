import { heartbeat, tick } from "@/lib/engine/game";
import { hostView, playerView, tvView } from "@/lib/engine/views";
import { getGame, scheduleLock, subscribe } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const token = url.searchParams.get("token") ?? "";
  const game = getGame(id);
  if (!game) return new Response("not found", { status: 404 });
  if (role === "host" && token !== game.hostToken) return new Response("forbidden", { status: 403 });
  if (role === "tv" && token !== game.tvToken) return new Response("forbidden", { status: 403 });

  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = () => {
        if (closed) return;
        const now = Date.now();
        tick(game, now);
        if (role === "player") { try { heartbeat(game, token, now); } catch { /* üye silinmiş olabilir */ } }
        const view = role === "host" ? hostView(game, now) : role === "tv" ? tvView(game, now) : playerView(game, token, now);
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(view)}\n\n`)); } catch { closed = true; }
      };
      scheduleLock(game);
      send();
      const unsub = subscribe(id, send);
      const iv = setInterval(send, 3000); // varlık (presence) ve saat senkronu
      cleanup = () => { closed = true; clearInterval(iv); unsub(); };
      req.signal.addEventListener("abort", () => { cleanup(); try { controller.close(); } catch {} });
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
