import { timingSafeEqual } from "node:crypto";
import { fail, json } from "@/lib/server/api";
import { renewDue } from "@/lib/server/billing";
import { db, save } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";
import { purgeOld } from "@/lib/server/store";
import { anonymizeOld } from "@/lib/server/venue";

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** Zamanlanmış işler. `Authorization: Bearer $CRON_SECRET` gerekir. */
export async function POST(req: Request, ctx: { params: Promise<{ job: string }> }) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || secret.length < 16 || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) return fail(401, "auth", "Yetkisiz.");
  const { job } = await ctx.params;
  const now = new Date();
  if (job === "reminders") {
    let sent = 0;
    const day = now.getDay(), tomorrow = (day + 1) % 7, key = now.toISOString().slice(0, 10);
    for (const v of Object.values(db.venues)) for (const s of v.schedules) {
      if (!s.remindEmail || s.lastReminded === key) continue;
      if (s.weekday === tomorrow || s.weekday === day) {
        sendMail(v.ownerEmail, `Hatırlatma: ${s.title}`, `${s.weekday === day ? "Bugün" : "Yarın"} (${DAYS[s.weekday]}) ${s.time} · ${s.title}. Oyunu önceden hazırla.`);
        s.lastReminded = key; sent++;
      }
    }
    save(); return json({ sent });
  }
  if (job === "billing") return json(await renewDue());
  if (job === "purge") { purgeOld(Date.now()); return json({ anonymized: anonymizeOld() }); }
  return fail(404, "nf", "Bulunamadı.");
}
