import { db, save } from "./db";

/** Gönderim sağlayıcısı yoksa e-postalar geliştirme günlüğüne yazılır (SMTP_URL ile gerçek gönderim eklenecek). */
export function sendMail(to: string, subject: string, body: string) {
  db.mailLog.push({ at: Date.now(), to, subject, body });
  if (db.mailLog.length > 500) db.mailLog.splice(0, 100);
  save();
  if (process.env.NODE_ENV !== "production") console.log(`[mail] ${to}: ${subject}`);
}
