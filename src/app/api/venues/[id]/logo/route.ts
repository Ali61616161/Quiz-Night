import { db } from "@/lib/server/db";

/** Logo kendi origin'inden, sandbox'lı CSP ile servis edilir (SVG script çalıştıramaz). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const v = db.venues[id];
  if (!v?.logo) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(v.logo.b64, "base64"), {
    headers: {
      "Content-Type": v.logo.type, "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox", "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
