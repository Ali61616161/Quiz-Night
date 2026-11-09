// Yerel demo: örnek mekan (Marka planı), geçmiş geceler, lig, kupon ve admin yetkisiyle `next dev` başlatır.
import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const DIR = process.env.DATA_DIR || ".data";
const FILE = `${DIR}/db.json`;
const EMAIL = "demo@quizhane.local", PASSWORD = "demo-sifre-123";

if (!existsSync(FILE) || process.env.RESET === "1") {
  mkdirSync(DIR, { recursive: true });
  const salt = randomBytes(16).toString("hex");
  const now = Date.now(), day = 86400_000;
  const names = ["Okey Ustaları", "Kampüs Kurtları", "Son Yudum", "Çuha Çocukları", "Bilmişler"];
  const history = [3, 2, 1].map((n, k) => ({
    gameId: `demo${k}`, at: now - n * 7 * day, teams: 5, players: 22 + k * 3,
    ranking: names.map((name, i) => ({ name, score: 900 - i * 120 - k * 20 })),
    perQuestion: [{ id: "capital-0", text: "Fransa ülkesinin başkenti neresidir?", correctRate: 0.9 }, { id: "history-1", text: "İstanbul'un fethi hangi yıl gerçekleşti?", correctRate: 0.55 }, { id: "est-1", text: "Everest Dağı'nın yüksekliği yaklaşık kaç metredir?", correctRate: 0.2 }],
    returningTeams: k * 2,
  }));
  const league = { season: 1, seasons: [], teams: Object.fromEntries(names.map((n, i) => [n.toLocaleLowerCase("tr").replace(/[^a-z0-9 ]/g, ""), { name: n, points: 28 - i * 5, played: 3, wins: i === 0 ? 2 : 0 }])) };
  const db = {
    users: { u1: { id: "u1", email: EMAIL, salt, hash: scryptSync(PASSWORD, salt, 64).toString("hex"), verified: true, verifyToken: null, venueId: "v1", role: "owner", createdAt: now } },
    venues: { v1: { id: "v1", name: "Demo Kafe", ownerEmail: EMAIL, plan: "brand", status: "active", cycle: "monthly", renewsAt: now + 30 * day, couponCode: null, discountPercent: 0, discountMonthsLeft: 0,
      brand: { logo: null, color1: "#17483B", color2: "#F4B942", font: "varsayilan", bg: "cuha" }, logo: null,
      schedules: [{ id: "s1", title: "Salı quiz gecesi", weekday: 2, time: "20:30", remindEmail: true }], aiUsed: { month: "", n: 0 }, seen: [],
      customQuestions: [{ id: "c-demo1", category: "Yerel", kind: "open", text: "Demo Kafe hangi mahallededir?", correct: "Bahçeşehir", accepted: [], difficulty: 1, status: "approved", reports: 0 }],
      history, gameTimes: [], league, billing: null, invoices: [], createdAt: now - 30 * day } },
    coupons: { PILOT50: { code: "PILOT50", percentOff: 50, months: 3, maxUses: 50, uses: 0, expires: null, note: "Pilot mekanlar" } },
    abuse: [], reports: [], audit: [], qstats: {}, drafts: [], announcement: "", mailLog: [],
  };
  writeFileSync(FILE, JSON.stringify(db), { mode: 0o600 });
  console.log(`Demo verisi hazır. Mekan girişi: ${EMAIL} / ${PASSWORD}`);
}
console.log("Panel: http://localhost:3000/panel · Admin: http://localhost:3000/admin\n");
const child = spawn("npx", ["next", "dev"], { stdio: "inherit", env: { ...process.env, ADMIN_EMAILS: EMAIL, DATA_DIR: DIR } });
child.on("exit", (c) => process.exit(c ?? 0));
