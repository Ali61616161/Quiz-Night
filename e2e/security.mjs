// Genel güvenlik ve işlev denetimi (canlı sunucuya HTTP). Çalıştırma: npm run e2e:security
import assert from "node:assert/strict";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const results = [];
const check = async (name, fn) => { try { await fn(); results.push(["OK ", name]); } catch (e) { results.push(["FAIL", `${name} → ${e.message.split("\n")[0]}`]); } };
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (path, body, headers = {}) => fetch(BASE + path, { method: "POST", headers: { ...J, ...headers }, body: JSON.stringify(body) });

const g = await (await post("/api/games", { template: "quick", durationSec: 20 })).json();
const { id, code, hostToken, tvToken } = g;
const g2 = await (await post("/api/games", { template: "quick" })).json();

const join = async (c, nickname, teamName, color, emoji) => (await post(`/api/rooms/${c}/join`, { mode: "create", nickname, teamName, color, emoji })).json();
const p1 = await join(code, "Ali", "A takımı", "#D64933", "⚽");
const p2 = await join(g2.code, "Veli", "B takımı", "#D64933", "⚽");

const act = (gid, role, token, action) => post(`/api/games/${gid}/action`, { role, token, action });
const readSse = async (url, ms = 700) => { const ac = new AbortController(); const r = await fetch(url, { signal: ac.signal }); const rd = r.body.getReader(); const t = setTimeout(() => ac.abort(), ms); let txt = ""; try { for (;;) { const { value, done } = await rd.read(); if (done) break; txt += new TextDecoder().decode(value); if (txt.includes("\n\n")) break; } } catch {} clearTimeout(t); ac.abort(); return { status: r.status, txt }; };

await check("başlıklar: CSP, nosniff, frame, referrer", async () => {
  const h = (await fetch(BASE + "/")).headers;
  assert.match(h.get("content-security-policy") ?? "", /default-src 'self'/); assert.equal(h.get("x-content-type-options"), "nosniff");
  assert.equal(h.get("x-frame-options"), "DENY"); assert.ok(h.get("referrer-policy")); assert.equal(h.get("x-powered-by"), null);
});
await check("host eylemi token olmadan/yanlış token ile reddedilir", async () => {
  assert.equal((await act(id, "host", "yanlis", { type: "advance" })).status, 403);
  assert.equal((await act(id, "host", p1.memberToken, { type: "advance" })).status, 403); // oyuncu tokenı host yetkisi vermez
});
await check("TV/host SSE yanlış token ile 403", async () => {
  assert.equal((await readSse(`${BASE}/api/games/${id}/events?role=tv&token=x`)).status, 403);
  assert.equal((await readSse(`${BASE}/api/games/${id}/events?role=host&token=${tvToken}`)).status, 403);
  assert.equal((await readSse(`${BASE}/api/games/${id}/events?role=admin&token=x`)).status, 400);
});
await check("IDOR: başka oyunun oyuncu tokenı bu oyunda işe yaramaz", async () => {
  const r = await act(id, "player", p2.memberToken, { type: "suggest", value: "x" });
  assert.equal(r.status, 403);
  const sse = await readSse(`${BASE}/api/games/${id}/events?role=player&token=${p2.memberToken}`);
  assert.ok(sse.txt.includes('"me":null'));
});
await check("TV akışı soru açıkken doğru cevabı sızdırmaz", async () => {
  await act(id, "host", hostToken, { type: "advance" }); await act(id, "host", hostToken, { type: "advance" });
  const tv = await readSse(`${BASE}/api/games/${id}/events?role=tv&token=${tvToken}`);
  const pl = await readSse(`${BASE}/api/games/${id}/events?role=player&token=${p1.memberToken}`);
  for (const s of [tv.txt, pl.txt]) { assert.ok(s.includes('"phase":"question_open"')); assert.ok(!s.includes('"correct"')); assert.ok(!s.includes('"explanation"')); }
});
await check("süre dolduktan sonra cevap reddedilir (sunucu saati)", async () => {
  await act(id, "host", hostToken, { type: "extend", ms: 5000 }).catch(() => {});
  const game = await (await post(`/api/games`, { template: "quick", durationSec: 10 })).json();
  const pp = await join(game.code, "Z", "Z takımı", "#5B8DB8", "🔥");
  for (let i = 0; i < 2; i++) await act(game.id, "host", game.hostToken, { type: "advance" });
  await new Promise((r) => setTimeout(r, 10500));
  const r = await act(game.id, "player", pp.memberToken, { type: "answer", value: "x", lock: true, key: "k1" });
  assert.equal(r.status, 409);
});
await check("geçersiz/aşırı büyük girdi 400 döner, sunucu çökmez", async () => {
  assert.equal((await post(`/api/rooms/${code}/join`, { mode: "create", nickname: "x".repeat(5000), teamName: "t", color: "#D64933", emoji: "⚽" })).status, 400);
  assert.equal((await fetch(`${BASE}/api/games/${id}/action`, { method: "POST", headers: J, body: "{bozuk" })).status, 400);
  assert.equal((await act(id, "host", hostToken, { type: "extend", ms: -5 })).status, 400);
  assert.equal((await act(id, "player", p1.memberToken, { type: "answer", value: "x".repeat(700), lock: true })).status, 400);
});
await check("takım adı HTML/script içerse de veri olarak saklanır, < > temizlenir", async () => {
  const r = await join(code, "<img src=x onerror=alert(1)>", "<script>alert(1)</script>Takım", "#F4B942", "🎲");
  const info = await (await fetch(`${BASE}/api/rooms/${code}`)).json();
  const names = JSON.stringify(info.teams);
  assert.ok(!names.includes("<script"), names); assert.ok(r.memberToken);
});
await check("küfürlü takım adı reddedilir", async () => {
  const r = await post(`/api/rooms/${code}/join`, { mode: "create", nickname: "ali", teamName: "s1kt1r siktir", color: "#5B8DB8", emoji: "🔥" });
  assert.equal(r.status, 400);
});
await check("ücretsiz planda 10 oyuncu sınırı", async () => {
  const gg = await (await post("/api/games", { template: "quick" })).json();
  const t = await join(gg.code, "a", "T1", "#D64933", "⚽");
  let last = 200;
  for (let i = 0; i < 11; i++) last = (await post(`/api/rooms/${gg.code}/join`, { mode: "join", nickname: "p" + i, teamRef: t.teamCode })).status;
  assert.ok([400, 402].includes(last), `son istek ${last}`);
});
await check("CSRF: farklı Origin ile oyun/hesap/panel mutasyonu reddedilir", async () => {
  const bad = { "Content-Type": "application/json", Origin: "http://evil.example" };
  assert.equal((await fetch(BASE + "/api/games", { method: "POST", headers: bad, body: "{}" })).status, 403);
  assert.equal((await fetch(BASE + "/api/auth/login", { method: "POST", headers: bad, body: JSON.stringify({ email: "a@b.co", password: "x" }) })).status, 403);
});
await check("oturumsuz panel/admin/cron uçları kapalı", async () => {
  assert.equal((await fetch(BASE + "/api/venue/info")).status, 401);
  assert.equal((await fetch(BASE + "/api/admin/overview")).status, 401);
  assert.equal((await post("/api/cron/purge", {})).status, 401);
  assert.equal((await post("/api/cron/billing", {}, { Authorization: "Bearer tahmin" })).status, 401);
  assert.equal((await post("/api/billing/subscribe", { plan: "pro", cycle: "monthly" })).status, 401);
});

// --- Hesap akışı ---
let cookie = "";
const email = `t${Date.now()}@test.co`, password = "cok-uzun-sifre-1";
await check("koşullar kabul edilmeden kayıt yapılamaz", async () => { assert.equal((await post("/api/auth/signup", { email: "nokabul@test.co", password: "uzun-sifre-123", venueName: "Mekan" })).status, 400); });
await check("kısa şifre reddedilir", async () => { assert.equal((await post("/api/auth/signup", { email, password: "kisa", venueName: "Mekan", acceptTerms: true })).status, 400); });
const su = await (await post("/api/auth/signup", { email, password, venueName: "Test Kafe", acceptTerms: true })).json();
await check("doğrulamadan giriş yapılamaz, doğrulayınca yapılır", async () => {
  assert.equal((await post("/api/auth/login", { email, password })).status, 401);
  assert.ok(su.devVerifyUrl, "geliştirme doğrulama bağlantısı");
  const v = await fetch(su.devVerifyUrl, { redirect: "manual" }); assert.equal(v.status, 302);
  const r = await post("/api/auth/login", { email, password });
  assert.equal(r.status, 200);
  const sc = r.headers.get("set-cookie"); assert.match(sc, /HttpOnly/); assert.match(sc, /SameSite=Lax/);
  cookie = sc.split(";")[0];
});
await check("yanlış şifre ve olmayan kullanıcı aynı hatayı verir", async () => {
  const a = await (await post("/api/auth/login", { email, password: "yanlis-yanlis" })).json();
  const b = await (await post("/api/auth/login", { email: "yok@yok.co", password: "yanlis-yanlis" })).json();
  assert.equal(a.message, b.message);
});
const C = { Cookie: cookie };
await check("plan kapıları: ücretsizde istatistik/lig/marka/CSV kapalı (402)", async () => {
  assert.equal((await fetch(BASE + "/api/venue/stats", { headers: C })).status, 402);
  assert.equal((await fetch(BASE + "/api/venue/league", { headers: C })).status, 402);
  assert.equal((await post("/api/venue/brand", { color1: "#112233", color2: "#F4B942", font: "serif", bg: "cuha" }, C)).status, 402);
  assert.equal((await post("/api/venue/bulk", { csv: "a" }, C)).status, 402);
  assert.equal((await post("/api/venue/ai", { category: "Tarih", difficulty: 2, count: 3 }, C)).status, 402);
});
await check("ücretsiz günlük 2 oyun sınırı", async () => {
  assert.equal((await post("/api/games", { template: "quick" }, C)).status, 200);
  assert.equal((await post("/api/games", { template: "quick" }, C)).status, 200);
  assert.equal((await post("/api/games", { template: "quick" }, C)).status, 402);
});
await check("kart reddi planı açmaz; geçerli ödeme + kupon yok → plan açılır", async () => {
  assert.equal((await post("/api/billing/subscribe", { plan: "pro", cycle: "monthly", paymentToken: "tok_fail", acceptSale: true }, C)).status, 402);
  assert.equal((await post("/api/billing/subscribe", { plan: "pro", cycle: "monthly", paymentToken: "tok_ok", acceptSale: true, coupon: "YOKKUPON" }, C)).status, 402);
  assert.equal((await post("/api/billing/subscribe", { plan: "pro", cycle: "yearly", paymentToken: "tok_ok", acceptSale: true }, C)).status, 200);
  assert.equal((await fetch(BASE + "/api/venue/stats", { headers: C })).status, 200);
  assert.equal((await post("/api/venue/brand", { color1: "#112233", color2: "#F4B942", font: "serif", bg: "cuha" }, C)).status, 402); // marka yalnız Marka planında
});
await check("Marka planı: logo güvenliği (script'li SVG reddedilir, sahte PNG reddedilir, temiz SVG kabul)", async () => {
  assert.equal((await post("/api/billing/subscribe", { plan: "brand", cycle: "monthly", paymentToken: "tok_ok", acceptSale: true }, C)).status, 200);
  const up = (body, extra = {}) => fetch(BASE + "/api/venue/logo", { method: "POST", headers: { "Content-Type": "application/octet-stream", Origin: BASE, ...C, ...extra }, body });
  assert.equal((await up('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')).status, 400);
  assert.equal((await up("<html><script>alert(1)</script></html>")).status, 415);
  assert.equal((await up(Buffer.alloc(1_100_000, 1))).status, 413);
  assert.equal((await up('<svg xmlns="http://www.w3.org/2000/svg" onload="x()" viewBox="0 0 10 10"><rect width="9" height="9" fill="#fff"/></svg>')).status, 200);
  const me = await (await fetch(BASE + "/api/venue/info", { headers: C })).json();
  const logo = await fetch(`${BASE}/api/venues/${me.id}/logo`);
  assert.equal(logo.headers.get("content-type"), "image/svg+xml"); assert.match(logo.headers.get("content-security-policy"), /sandbox/);
  assert.ok(!(await logo.text()).includes("onload"));
  assert.equal((await post("/api/venue/brand", { color1: "#EEEEEE", color2: "#F4B942", font: "serif", bg: "cuha" }, C)).status, 400); // kontrast
  assert.equal((await post("/api/venue/brand", { color1: "#112233", color2: "#F4B942", font: "serif", bg: "cuha" }, C)).status, 200);
});
await check("Marka oyunu: TV/oyuncu görünümünde marka ve filigransızlık", async () => {
  const bg = await (await post("/api/games", { template: "quick", teamMode: "majority", autoHost: true }, C)).json();
  const sse = await readSse(`${BASE}/api/games/${bg.id}/events?role=tv&token=${bg.tvToken}`);
  assert.ok(sse.txt.includes('"color1":"#112233"')); assert.ok(sse.txt.includes('"watermark":false'));
  const h = await readSse(`${BASE}/api/games/${bg.id}/events?role=host&token=${bg.hostToken}`);
  assert.ok(h.txt.includes('"autoHost":true'));
});
await check("plan düşürülünce özellikler kapanır, soru verisi silinmez", async () => {
  assert.equal((await post("/api/venue/question", { category: "Tarih", text: "Test sorusu burada mı?", kind: "open", correct: "evet" }, C)).status, 200);
  assert.equal((await post("/api/billing/subscribe", { plan: "free", cycle: "monthly" }, C)).status, 200);
  assert.equal((await post("/api/venue/brand", { color1: "#112233", color2: "#F4B942", font: "serif", bg: "cuha" }, C)).status, 402);
  const q = await (await fetch(BASE + "/api/venue/questions", { headers: C })).json();
  assert.equal(q.custom.length, 1);
});
await check("başka mekanın verisine erişilemez (oturum başka mekana bağlı)", async () => {
  const e2 = `u${Date.now()}@test.co`;
  const s2 = await (await post("/api/auth/signup", { email: e2, password, venueName: "Diğer", acceptTerms: true })).json();
  await fetch(s2.devVerifyUrl, { redirect: "manual" });
  const c2 = (await post("/api/auth/login", { email: e2, password })).headers.get("set-cookie").split(";")[0];
  const q = await (await fetch(BASE + "/api/venue/questions", { headers: { Cookie: c2 } })).json();
  assert.equal(q.custom.length, 0);
});
let hostCookie = "";
await check("ekip: sahip host davet eder, host şifresini belirler; host abonelik/marka/davet yapamaz", async () => {
  const hostMail = `h${Date.now()}@test.co`;
  const inv = await (await post("/api/venue/invite", { email: hostMail }, C)).json();
  assert.ok(inv.devLink, "davet bağlantısı");
  const token = inv.devLink.split("sifirla=")[1];
  assert.equal((await post("/api/auth/reset", { token, password: "host-uzun-sifre-9" })).status, 200);
  const lr = await post("/api/auth/login", { email: hostMail, password: "host-uzun-sifre-9" });
  assert.equal(lr.status, 200);
  hostCookie = lr.headers.get("set-cookie").split(";")[0];
  const H = { Cookie: hostCookie };
  assert.equal((await post("/api/billing/subscribe", { plan: "pro", cycle: "monthly", paymentToken: "tok_ok", acceptSale: true }, H)).status, 403);
  assert.equal((await post("/api/venue/brand", { color1: "#112233", color2: "#F4B942", font: "serif", bg: "cuha" }, H)).status, 403);
  assert.equal((await post("/api/venue/invite", { email: "x@y.co" }, H)).status, 403);
  assert.notEqual((await post("/api/games", { template: "quick" }, H)).status, 403); // host oyun açabilir (günlük sınır 402 olabilir)
});
await check("admin: normal kullanıcı 403", async () => { assert.equal((await fetch(BASE + "/api/admin/overview", { headers: C })).status, 403); });
await check("oturum kapatılınca çerez geçersiz", async () => {
  await post("/api/auth/logout", {}, C);
  assert.equal((await fetch(BASE + "/api/venue/info", { headers: C })).status, 401);
});
await check("giriş hız sınırı (brute force)", async () => {
  let blocked = false;
  for (let i = 0; i < 14; i++) { const r = await post("/api/auth/login", { email: "brute@x.co", password: "x" + i }); if (r.status === 429) blocked = true; }
  assert.ok(blocked);
});

console.log(results.map((r) => r.join(" ")).join("\n"));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} kontrol geçti`);
process.exit(failed ? 1 : 0);
