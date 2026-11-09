import { db, save } from "./db";

/**
 * E-posta: RESEND_API_KEY + MAIL_FROM tanımlıysa Resend HTTP API ile gönderilir.
 * Tanımlı değilse geliştirme günlüğüne yazılır (üretimde gövde saklanmaz, doğrulama bağlantıları sızmasın).
 */
export function sendMail(to: string, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (key && from) {
    void fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text: body }),
    }).catch((e) => console.error("mail failed", e));
    return;
  }
  if (process.env.NODE_ENV === "production" && process.env.EXPOSE_DEV_LINKS !== "1") { console.warn(`[mail] sağlayıcı yok, gönderilmedi: ${to} / ${subject}`); return; }
  db.mailLog.push({ at: Date.now(), to, subject, body });
  if (db.mailLog.length > 500) db.mailLog.splice(0, 100);
  save();
}
