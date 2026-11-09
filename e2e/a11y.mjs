// Erişilebilirlik taraması (axe-core): ana ekranlarda ciddi/kritik ihlalleri listeler.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const axeSrc = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const J = { "Content-Type": "application/json", Origin: BASE };
const post = (p, b, h = {}) => fetch(BASE + p, { method: "POST", headers: { ...J, ...h }, body: JSON.stringify(b) });
const browser = await chromium.launch();
const results = [];
async function audit(path, label, mobile = false, setup) {
  const ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 800 } : { width: 1280, height: 800 }, isMobile: mobile });
  const p = await ctx.newPage(); await p.goto(BASE + path); if (setup) await setup(p); await p.waitForTimeout(600);
  await p.evaluate(axeSrc);
  const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0].html.slice(0, 110) })));
  for (const v of r) if (["serious", "critical"].includes(v.impact)) results.push({ label, ...v });
  await ctx.close();
}
const g = await (await post("/api/games", { template: "quick", durationSec: 20 })).json();
await audit("/", "landing"); await audit("/giris", "giris", true); await audit("/demo", "demo", true); await audit("/fonttest", "fonttest"); await audit("/gizlilik", "gizlilik");
await audit(`/host/${g.id}?t=${g.hostToken}`, "host", true); await audit(`/tv/${g.id}?t=${g.tvToken}`, "tv");
await audit(`/j/${g.code}`, "join", true);
await browser.close();
console.log(results.length ? results.map((r) => `${r.label}: ${r.id} (${r.impact}) x${r.n}  ${r.sample}`).join("\n") : "Ciddi/kritik ihlal yok");
process.exit(results.length ? 1 : 0);
