// Yük testi: 40 takım / 200 sanal oyuncu / 1 TV / 1 host. Çalıştırma: BASE_URL=http://localhost:3100 npm run loadtest
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const TEAMS = Number(process.env.TEAMS ?? 40), PER = Number(process.env.PER ?? 5), ROUNDS = Number(process.env.QUESTIONS ?? 3);
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (p, b, h = {}) => fetch(BASE + p, { method: "POST", headers: { ...J, ...h }, body: JSON.stringify(b) });
const pct = (a, p) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0);
const COLORS = ["#D64933", "#F4B942", "#5B8DB8", "#8FBF6A", "#E07BA0", "#F28C28", "#7A5CA8", "#2E9C8F", "#B5533C", "#C9A227", "#3D6F9E", "#6E8B3D", "#C25B8A", "#D9731A", "#5C4A8A", "#1F7A70"];
const EMOJIS = ["⚽", "🎲", "🦁", "🔥", "🌙", "🍀", "🎯", "🚀", "🐺", "🎸", "🍕", "⭐", "🐙", "🎩", "🧿", "🦅"];

const email = `load${Date.now()}@test.co`, password = "yuk-testi-sifre-1";
const su = await (await post("/api/auth/signup", { email, password, venueName: "Yük Testi" })).json();
if (!su.devVerifyUrl) { console.error("Sunucuyu EXPOSE_DEV_LINKS=1 ile başlat (yalnızca test)."); process.exit(2); }
await fetch(su.devVerifyUrl.replace(/^https?:\/\/[^/]+/, BASE), { redirect: "manual" });
const cookie = (await post("/api/auth/login", { email, password })).headers.get("set-cookie").split(";")[0];
await post("/api/billing/subscribe", { plan: "brand", cycle: "monthly", paymentToken: "tok_ok" }, { Cookie: cookie });
const g = await (await post("/api/games", { template: "classic", durationSec: 15 }, { Cookie: cookie })).json();
if (!g.id) { console.error("oyun açılamadı", g); process.exit(2); }

const errors = []; const joinMs = [];
const players = [];
// emoji+renk çifti benzersiz olmalı: 40 takım için (renk, emoji) kombinasyonu üret
const combos = []; for (const c of COLORS) for (const e of EMOJIS) combos.push([c, e]);
await (async () => {
  await Promise.all(Array.from({ length: TEAMS }, async (_, t) => {
    const [c, e] = combos[(t * 17) % combos.length];
    const t0 = performance.now();
    const r = await post(`/api/rooms/${g.code}/join`, { mode: "create", nickname: `K${t}`, teamName: `Takım ${t}`, color: c, emoji: e });
    const cj = await r.json(); joinMs.push(performance.now() - t0);
    if (!r.ok) { errors.push(`create ${t}: ${cj.message}`); return; }
    players.push({ token: cj.memberToken, captain: true, team: t });
    for (let k = 1; k < PER; k++) {
      const t1 = performance.now();
      const jr = await post(`/api/rooms/${g.code}/join`, { mode: "join", nickname: `U${t}-${k}`, teamRef: cj.teamCode });
      const j = await jr.json(); joinMs.push(performance.now() - t1);
      if (!jr.ok) errors.push(`join ${t}-${k}: ${j.message}`); else players.push({ token: j.memberToken, captain: false, team: t });
    }
  }));
})();

// SSE: TV + host + tüm oyuncular
const lat = []; let msgs = 0; const streams = [];
const open = (url, onMsg) => { const ac = new AbortController(); streams.push(ac);
  fetch(url, { signal: ac.signal }).then(async (r) => { const rd = r.body.getReader(); const dec = new TextDecoder(); let buf = ""; for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value); let i; while ((i = buf.indexOf("\n\n")) >= 0) { const m = buf.slice(0, i); buf = buf.slice(i + 2); msgs++; onMsg?.(m); } } }).catch(() => {}); };
let lastAdvance = 0, seenVersion = new Map();
open(`${BASE}/api/games/${g.id}/events?role=tv&token=${g.tvToken}`);
open(`${BASE}/api/games/${g.id}/events?role=host&token=${g.hostToken}&device=h1`);
for (const p of players.slice(0, 200)) open(`${BASE}/api/games/${g.id}/events?role=player&token=${p.token}`, (m) => {
  if (!lastAdvance) return; const ver = m.match(/"version":(\d+)/)?.[1]; if (ver && seenVersion.get(p.token) !== ver) { seenVersion.set(p.token, ver); lat.push(performance.now() - lastAdvance); }
});
await new Promise((r) => setTimeout(r, 1500));

const adv = async () => { lastAdvance = performance.now(); const t0 = performance.now(); const r = await post(`/api/games/${g.id}/action`, { role: "host", token: g.hostToken, action: { type: "advance" } }, {}); if (!r.ok) errors.push("advance " + r.status); return performance.now() - t0; };
const ansMs = [];
await adv(); await adv(); // başlat, soruyu aç
for (let q = 0; q < ROUNDS; q++) {
  // Tüm oyuncular eşzamanlı: kaptan cevap+kilit, üyeler öneri
  const view = await (async () => { const ac = new AbortController(); const r = await fetch(`${BASE}/api/games/${g.id}/events?role=host&token=${g.hostToken}&device=h1`, { signal: ac.signal }); const { value } = await r.body.getReader().read(); ac.abort(); return JSON.parse(new TextDecoder().decode(value).replace(/^data: /, "")); })();
  const opt = view.question?.options?.[0] ?? "1";
  await Promise.all(players.map(async (p) => {
    const t0 = performance.now();
    const r = await post(`/api/games/${g.id}/action`, { role: "player", token: p.token, action: p.captain ? { type: "answer", value: opt, lock: true, key: `${q}-${p.team}` } : { type: "suggest", value: opt } });
    ansMs.push(performance.now() - t0);
    if (!r.ok && r.status !== 409) errors.push(`answer ${r.status}`);
  }));
  await adv(); await adv(); await adv(); await adv(); // kilit, göster, skor, sonraki
}
await new Promise((r) => setTimeout(r, 1000));
streams.forEach((a) => a.abort());
const mem = process.memoryUsage().rss / 1e6;
console.log(JSON.stringify({
  takim: TEAMS, oyuncu: players.length, akis: players.length + 2, sorular: ROUNDS, hata: errors.length, ornekHatalar: errors.slice(0, 5),
  katilimMs: { p50: Math.round(pct(joinMs, 0.5)), p95: Math.round(pct(joinMs, 0.95)) },
  cevapMs: { p50: Math.round(pct(ansMs, 0.5)), p95: Math.round(pct(ansMs, 0.95)), adet: ansMs.length },
  yayinGecikmeMs: { p50: Math.round(pct(lat, 0.5)), p95: Math.round(pct(lat, 0.95)), adet: lat.length }, sseMesaj: msgs, istemciRssMB: Math.round(mem),
}, null, 1));
process.exit(errors.length ? 1 : 0);
