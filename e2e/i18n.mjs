// İngilizce arayüz taraması: tüm ekranları İngilizce modda gezip kalan Türkçe metinleri listeler; ayrıca ekran görüntüleri alır.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = process.env.OUT ?? "e2e/shots-i18n";
const LANG = process.env.LANG_UI ?? "en";
mkdirSync(OUT, { recursive: true });
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (p, b, h = {}) => fetch(BASE + p, { method: "POST", headers: { ...J, ...h }, body: JSON.stringify(b) });
const TR = /[çğıöşüÇĞİÖŞÜ]|\b(Takım|Soru|Cevap|Oyun|Kaptan|Süre|Puan|Doğru|Yanlış|Giriş|Şifre|Hesap|Mekan|Gece|Bölüm|Kaydet|Sil|Gönder|Seç|Evet|Hayır|Çıkış)\b/;
const bad = new Map();
const browser = await chromium.launch();
async function page(w, h, mobile, cookie) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((l) => { try { localStorage.setItem("lang", l); localStorage.setItem("lang-chosen", "1"); } catch {} }, LANG);
  if (cookie) await ctx.addCookies([{ name: "qh_session", value: cookie, url: BASE }]);
  return ctx.newPage();
}
async function scan(p, label, shot) {
  await p.waitForTimeout(700);
  const found = await p.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { const e = n.parentElement; if (!e || e.closest("[data-no-translate],script,style")) continue; const t = n.nodeValue.trim(); if (t) out.push(t); }
    document.querySelectorAll("[placeholder],[aria-label],[title],[alt]").forEach((el) => ["placeholder", "aria-label", "title", "alt"].forEach((a) => { const v = el.getAttribute(a); if (v && !el.closest("[data-no-translate]")) out.push(v); }));
    return out;
  });
  for (const t of found) if (TR.test(t)) (bad.get(label) ?? bad.set(label, new Set()).get(label)).add(t.slice(0, 90));
  if (shot) await p.screenshot({ path: `${OUT}/${LANG}-${shot}.png` });
}

// Kamuya açık sayfalar
for (const [path, name] of [["/", "landing"], ["/giris", "login"], ["/demo", "demo"], ["/gizlilik", "privacy"], ["/kvkk", "kvkk"], ["/kosullar", "terms"], ["/cerez", "cookies"]]) {
  const p = await page(1280, 800, false); await p.goto(BASE + path); await scan(p, path, name); await p.context().close();
}

// Oyun akışı (İngilizce oyun: İngilizce sorular)
const g = await (await post("/api/games", { template: "quick", durationSec: 20, lang: LANG })).json();
const host = await page(420, 900, true); await host.goto(`${BASE}/host/${g.id}?t=${g.hostToken}`);
const tv = await page(1920, 1080, false); await tv.goto(`${BASE}/tv/${g.id}?t=${g.tvToken}`);
const mk = async (nick, mode, o) => {
  const p = await page(390, 800, true); await p.goto(`${BASE}/j/${g.code}`);
  await scan(p, "join", mode === "create" && nick === "Ali" ? "join" : undefined);
  await p.locator("input").first().fill(nick);
  if (mode === "create") { await p.locator("input").nth(1).fill(o.name); await p.locator(`button[aria-label$="${o.color}"]`).first().click(); await p.locator(`button[aria-label$="${o.emoji}"]`).first().click(); await p.locator("form button.btn").last().click(); }
  else { await p.locator('[role="tab"]').nth(1).click(); await p.locator('input[inputmode="numeric"]').fill(o.code); await p.locator("form button.btn").last().click(); }
  await p.locator("h1").filter({ hasText: /./ }).first().waitFor();
  return p;
};
const a1 = await mk("Ali", "create", { name: "Red Team", color: "#D64933", emoji: "⚽" });
const b1 = await mk("Bob", "create", { name: "Blue Team", color: "#5B8DB8", emoji: "🔥" });
await scan(a1, "lobby-phone", "phone-lobby"); await scan(tv, "lobby-tv", "tv-lobby");
await scan(host, "host-lobby", "host-lobby");
const next = async (n) => host.locator("div[style*='fixed'] button.btn").last().click();
await next(); await scan(tv, "intro-tv"); await next();
await a1.waitForTimeout(600);
await scan(a1, "question-phone", "phone-question"); await scan(tv, "question-tv", "tv-question"); await scan(host, "question-host", "host-question");
await a1.locator("main button[aria-pressed]").first().click().catch(() => {});
await next(); await next(); await a1.waitForTimeout(600);
await scan(a1, "reveal-phone", "phone-reveal"); await scan(tv, "reveal-tv", "tv-reveal"); await scan(host, "reveal-host", "host-reveal");
await next(); await tv.waitForTimeout(900); await scan(tv, "board-tv", "tv-board");

// Mekan paneli ve admin
const email = `i18n${Date.now()}@test.co`, pw = "cok-uzun-sifre-1";
const su = await (await post("/api/auth/signup", { email, password: pw, venueName: "Test Cafe" })).json();
if (su.devVerifyUrl) {
  await fetch(su.devVerifyUrl.replace(/^https?:\/\/[^/]+/, BASE), { redirect: "manual" });
  const r = await post("/api/auth/login", { email, password: pw }); const cookie = r.headers.get("set-cookie").split(";")[0].split("=")[1];
  await post("/api/billing/subscribe", { plan: "brand", cycle: "monthly", paymentToken: "tok_ok" }, { Cookie: `qh_session=${cookie}` });
  const pp = await page(1100, 900, false, cookie); await pp.goto(BASE + "/panel"); await pp.waitForSelector("nav button");
  const tabs = await pp.locator("nav[aria-label] button").count();
  for (let i = 0; i < tabs; i++) { await pp.locator("nav[aria-label] button").nth(i).click(); await scan(pp, "panel-tab-" + i, i === 0 ? "panel" : i === 5 ? "panel-brand" : undefined); }
  const ap = await page(900, 900, false, cookie); await ap.goto(BASE + "/panel/afis"); await scan(ap, "poster", "poster");
}
await browser.close();
let n = 0; for (const [k, v] of bad) { console.log(`\n[${k}]`); for (const t of v) { console.log("  " + t); n++; } }
console.log(`\n${n} Türkçe kalıntı`);
process.exit(n && LANG === "en" ? 1 : 0);
