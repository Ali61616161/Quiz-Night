// Eğlence gecesi uçtan uca (HTTP): Marka planlı mekan, 3 takım, tüm tur türleri baştan sona.
// Çalıştırma: EXPOSE_DEV_LINKS=1 APP_URL=http://localhost:3100 npm run start:e2e  →  node e2e/fun-game.mjs
import assert from "node:assert/strict";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (p, b, h = {}) => fetch(BASE + p, { method: "POST", headers: { ...J, ...h }, body: JSON.stringify(b) });
const email = `fun${Date.now()}@test.co`, password = "uzun-sifre-123";
const su = await (await post("/api/auth/signup", { email, password, venueName: "Eğlence Kafe", acceptTerms: true })).json();
await fetch(su.devVerifyUrl, { redirect: "manual" });
const login = await post("/api/auth/login", { email, password });
const C = { Cookie: login.headers.get("set-cookie").split(";")[0] };
assert.equal((await post("/api/billing/subscribe", { plan: "brand", cycle: "monthly", paymentToken: "tok_ok", acceptSale: true }, C)).status, 200);
const g = await (await post("/api/games", { template: "party", durationSec: 20 }, C)).json();
assert.ok(g.id, JSON.stringify(g));
const act = async (role, token, action) => { const r = await post(`/api/games/${g.id}/action`, { role, token, action }); return { ok: r.ok, body: await r.json() }; };
const host = (a) => act("host", g.hostToken, a);
const view = async (token, role = "host", lang = "tr") => {
  const r = await fetch(`${BASE}/api/games/${g.id}/events?role=${role}&token=${token}&lang=${lang}`, { headers: { Accept: "text/event-stream" } });
  const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = "";
  for (;;) { const { value } = await reader.read(); buf += dec.decode(value); const m = buf.match(/data: (\{.*\})\n\n/); if (m) { reader.cancel(); return JSON.parse(m[1]); } }
};
const teams = [];
for (const [n, c, e] of [["Kırmızı", "#D64933", "⚽"], ["Sarı", "#F4B942", "🎲"], ["Mavi", "#5B8DB8", "🦁"]]) {
  const r = await (await post(`/api/rooms/${g.code}/join`, { mode: "create", nickname: n, teamName: n, color: c, emoji: e })).json();
  teams.push(r);
}
const player = async (i, a) => { await new Promise((r) => setTimeout(r, 120)); return act("player", teams[i].memberToken, a); };
const seen = new Set(); const log = [];
let guard = 0;
while (guard++ < 400) {
  const hv = await view(g.hostToken);
  if (hv.phase === "final") break;
  const q = hv.question;
  if (q) seen.add(q.round);
  if (hv.phase === "round_intro" && ["wager", "final"].includes(q?.round)) for (let i = 0; i < 3; i++) await player(i, { type: "wager", amount: 10 });
  if (hv.phase === "question_open" && q) {
    const pv = await view(teams[0].memberToken, "player");
    // her takım cevap yazar; sahte cevap turunda gerçeği değil uydurma cevap
    for (let i = 0; i < 3; i++) {
      const my = await view(teams[i].memberToken, "player");
      const mq = my.question;
      let value;
      if (mq.kind === "choice") value = mq.options[i % mq.options.length];
      else if (mq.kind === "estimate") value = String(100 + i * 50);
      else if (mq.kind === "ordering") value = JSON.stringify(mq.items);
      else if (mq.kind === "matching") value = JSON.stringify(mq.right);
      else value = `Uydurma ${i} ${mq.round}`;
      if (hv.mode === "majority" || my.mode === "majority") await player(i, { type: "suggest", value });
      else await player(i, { type: "answer", value, lock: true, key: `k${guard}${i}` });
    }
    void pv;
  }
  if (hv.phase === "question_locked" && ["bluff", "funny"].includes(q?.round)) {
    for (let i = 0; i < 3; i++) {
      const my = await view(teams[i].memberToken, "player");
      assert.ok(my.me.vote, "oylama görünümü");
      const choice = my.me.vote.choices.find((c) => !c.own);
      assert.ok(choice);
      const own = my.me.vote.choices.find((c) => c.own);
      if (own) assert.equal((await player(i, { type: "pick", id: own.id })).ok, false, "kendi cevabı seçilemez");
      assert.equal((await player(i, { type: "pick", id: choice.id })).ok, true);
    }
    // TV'de oylama sırasında yazar bilgisi yok
    const tv = JSON.stringify(await view(g.tvToken, "tv"));
    assert.ok(!tv.includes("authors"), "TV oylamada yazarı göstermez");
  }
  await new Promise((r) => setTimeout(r, 250)); // oyuncu/host token hız sınırına takılmamak için
  const r = await host({ type: "advance" });
  if (!r.ok) { log.push(r.body); break; }
}
const fin = await view(g.hostToken);
assert.equal(fin.phase, "final", JSON.stringify({ log, phase: fin.phase, q: fin.question && [fin.question.round, fin.question.index, fin.question.total], guard }));
for (const r of ["silent", "streak", "bluff", "funny", "final"]) assert.ok(seen.has(r), `tur görüldü: ${r}`);
const en = await view(g.tvToken, "tv", "en");
assert.ok(en.teams.length === 3);
console.log("FUN E2E OK", [...seen].join(","));
