// Eğlence turlarının ekranlarını İngilizce modda gezip kalan Türkçe metni listeler + ekran görüntüsü alır.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = process.env.OUT ?? "e2e/shots-fun"; mkdirSync(OUT, { recursive: true });
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (p, b, h = {}) => fetch(BASE + p, { method: "POST", headers: { ...J, ...h }, body: JSON.stringify(b) });
const email = `funi${Date.now()}@test.co`, password = "uzun-sifre-123";
const su = await (await post("/api/auth/signup", { email, password, venueName: "Fun Cafe", acceptTerms: true })).json();
await fetch(su.devVerifyUrl, { redirect: "manual" });
const login = await post("/api/auth/login", { email, password });
const C = { Cookie: login.headers.get("set-cookie").split(";")[0] };
await post("/api/billing/subscribe", { plan: "brand", cycle: "monthly", paymentToken: "tok_ok", acceptSale: true }, C);
const g = await (await post("/api/games", { template: "party", durationSec: 20 }, C)).json();
const act = async (role, token, action) => { await new Promise((r) => setTimeout(r, 150)); const r = await post(`/api/games/${g.id}/action`, { role, token, action }); return r.ok; };
const host = (a) => act("host", g.hostToken, a);
const teams = [];
for (const [n, c, e] of [["Reds", "#D64933", "⚽"], ["Yellows", "#F4B942", "🎲"], ["Blues", "#5B8DB8", "🦁"]]) teams.push(await (await post(`/api/rooms/${g.code}/join`, { mode: "create", nickname: n, teamName: n, color: c, emoji: e })).json());
const browser = await chromium.launch();
const mk = async (w, h, mobile) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile }); await ctx.addInitScript(() => { try { localStorage.setItem("lang", "en"); localStorage.setItem("lang-chosen", "1"); } catch {} }); return ctx.newPage(); };
const tv = await mk(1600, 900, false); await tv.goto(`${BASE}/tv/${g.id}?t=${g.tvToken}`);
const hostP = await mk(420, 900, true); await hostP.goto(`${BASE}/host/${g.id}?t=${g.hostToken}`);
const ph = await mk(390, 800, true);
await ph.addInitScript(([id, tok, code]) => { try { localStorage.setItem(`player:${code}`, JSON.stringify({ gameId: id, memberToken: tok, teamCode: "" })); } catch {} }, [g.id, teams[0].memberToken, g.code]);
await ph.goto(`${BASE}/j/${g.code}`);
const TR = /[çğıöşüÇĞİÖŞÜ]|\b(Takım|Soru|Cevap|Oyun|Kaptan|Süre|Puan|Doğru|Yanlış|Sessiz|Sahte|Saçma|Tahmin|oy|Gerçek|yazan)\b/;
const bad = new Map();
const scan = async (p, label) => {
  await p.waitForTimeout(500);
  const texts = await p.evaluate(() => { const o = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const e = n.parentElement; if (!e || e.closest("script,style")) continue; const t = n.nodeValue.trim(); if (t) o.push(t); } return o; });
  for (const t of texts) if (TR.test(t)) bad.set(`${label}: ${t}`, 1);
};
const seenR = new Set(); let shots = 0;
const view = async (token, role) => { const r = await fetch(`${BASE}/api/games/${g.id}/events?role=${role}&token=${token}`, { headers: { Accept: "text/event-stream" } }); const rd = r.body.getReader(); const d = new TextDecoder(); let b = ""; for (;;) { const { value } = await rd.read(); b += d.decode(value); const m = b.match(/data: (\{.*\})\n\n/); if (m) { rd.cancel(); return JSON.parse(m[1]); } } };
for (let guard = 0; guard < 200; guard++) {
  const hv = await view(g.hostToken, "host"); if (hv.phase === "final") break;
  const q = hv.question; const key = `${q?.round}:${hv.phase}`;
  if (q && !seenR.has(key) && ["round_intro", "question_open", "question_locked", "answer_reveal"].includes(hv.phase)) {
    seenR.add(key);
    if (["silent", "bluff", "funny", "streak"].includes(q.round) || q.kind === "estimate" || q.category === "Emoji") {
      await tv.waitForTimeout(400); await scan(tv, `TV ${key}`); await scan(ph, `Phone ${key}`); await scan(hostP, `Host ${key}`);
      if (shots < 12) { await ph.screenshot({ path: `${OUT}/phone-${key.replace(":", "-")}.png` }); await tv.screenshot({ path: `${OUT}/tv-${key.replace(":", "-")}.png` }); shots++; }
    }
  }
  if (hv.phase === "question_open" && q) for (let i = 0; i < 3; i++) {
    const my = await view(teams[i].memberToken, "player"); const mq = my.question;
    let value = mq.kind === "choice" ? mq.options[0] : mq.kind === "estimate" ? "100" : mq.kind === "ordering" ? JSON.stringify(mq.items) : mq.kind === "matching" ? JSON.stringify(mq.right) : `Made up ${i}`;
    if (my.mode === "majority") await act("player", teams[i].memberToken, { type: "suggest", value }); else await act("player", teams[i].memberToken, { type: "answer", value, lock: true, key: `k${guard}${i}` });
  }
  if (hv.phase === "question_locked" && ["bluff", "funny"].includes(q?.round)) for (let i = 0; i < 3; i++) { const my = await view(teams[i].memberToken, "player"); const c = my.me.vote.choices.find((x) => !x.own); await act("player", teams[i].memberToken, { type: "pick", id: c.id }); }
  if (hv.phase === "round_intro" && ["wager", "final"].includes(q?.round)) for (let i = 0; i < 3; i++) await act("player", teams[i].memberToken, { type: "wager", amount: 10 });
  await host({ type: "advance" });
}
for (const k of bad.keys()) console.log("TR kalıntı →", k);
console.log(`\n${bad.size} Türkçe kalıntı (özel adlar dahil olabilir); ${seenR.size} ekran durumu tarandı, ${shots} görüntü`);
await browser.close();
