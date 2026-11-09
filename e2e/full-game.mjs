// Uçtan uca: host + TV + 2 takım (her takımda 2 telefon). Çalıştırma: npm run build && npm run e2e
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const SHOTS = process.env.SHOTS ?? "e2e/shots";
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const mk = async (w, h, mobile) => (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })).newPage();

const created = await (await fetch(`${BASE}/api/games`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venueName: "Demo Kafe", durationSec: 20 }) })).json();
const { id, code, hostToken, tvToken } = created;

const host = await mk(420, 900, true);
await host.goto(`${BASE}/host/${id}?t=${hostToken}`);
const tv = await mk(1920, 1080, false);
await tv.goto(`${BASE}/tv/${id}?t=${tvToken}`);

async function join(page, nickname, mode, opts) {
  await page.goto(`${BASE}/j/${code}`);
  await page.getByLabel("Adın").fill(nickname);
  if (mode === "create") {
    await page.getByLabel("Takım adı").fill(opts.name);
    await page.getByLabel(`Renk ${opts.color}`).click();
    await page.getByLabel(`Rozet ${opts.emoji}`).click();
    await page.getByRole("button", { name: "Takımını kur" }).click();
  } else {
    await page.getByRole("tab", { name: "Takıma katıl" }).click();
    await page.getByLabel("Ya da 4 haneli takım kodu").fill(opts.teamCode);
    await page.getByRole("button", { name: "Takıma katıl" }).last().click();
  }
  await page.getByText("Takımın hazır").waitFor();
}

const a1 = await mk(390, 800, true);
await join(a1, "Ali", "create", { name: "Kırmızılar", color: "#D64933", emoji: "⚽" });
const b1 = await mk(390, 800, true);
await join(b1, "Ayşe", "create", { name: "Sarılar", color: "#F4B942", emoji: "🎲" });
const codeA = await a1.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => k.startsWith("player:")))).teamCode);
const codeB = await b1.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => k.startsWith("player:")))).teamCode);
const a2 = await mk(390, 800, true); await join(a2, "Can", "join", { teamCode: codeA });
const b2 = await mk(390, 800, true); await join(b2, "Deniz", "join", { teamCode: codeB });

await tv.getByText("2 takım hazır").waitFor();
await tv.screenshot({ path: `${SHOTS}/tv-lobby.png` });

const next = async (label) => { await host.getByRole("button", { name: label, exact: true }).click(); };
await next("Oyunu başlat");
await next("Soruyu aç");
await a1.getByText("Soru 1/5").waitFor();
await tv.screenshot({ path: `${SHOTS}/tv-question.png` });
await a1.screenshot({ path: `${SHOTS}/phone-captain-question.png` });
await a2.screenshot({ path: `${SHOTS}/phone-member-question.png` });

// Üye öneri yollar, kaptan görür; üye doğrudan cevap veremez (UI'da kilitle butonu yok)
await a2.getByRole("button", { name: /Ankara/ }).click();
await a1.getByRole("button", { name: /Can: Ankara/ }).waitFor();
await a1.getByRole("button", { name: /Ankara/ }).first().click();
await a1.getByRole("button", { name: "Cevabı kilitle" }).click();
await a1.getByText("Cevap kilitlendi, değişiklik yapılamaz.").waitFor();
await b1.getByRole("button", { name: /İzmir/ }).click();
await b1.getByRole("button", { name: "Cevabı kilitle" }).click();

await next("Süreyi bitir");
await next("Cevabı göster");
await tv.getByText("Doğru cevap: Ankara").waitFor();
await a1.getByText(/Takımın doğru bildi/).waitFor();
await b1.getByText(/Takımın bilemedi/).waitFor();
await next("Skoru göster");
await tv.getByText("Skor tablosu").waitFor();
await tv.waitForTimeout(900);
await tv.screenshot({ path: `${SHOTS}/tv-scoreboard.png` });
await a1.screenshot({ path: `${SHOTS}/phone-reveal.png` });

// Host düzeltmesi: Sarılar'ı doğru say → herkese anında yansır
await host.getByRole("button", { name: "Doğru say" }).nth(1).click();
await b1.getByText(/Takımın doğru bildi/).waitFor();

// Kopma: Ali sayfayı kapatır, 15 sn sonra Can kaptanlığı alır
await a1.context().close();
await a2.getByRole("button", { name: "Kaptanlığı al" }).waitFor({ timeout: 25000 });
await a2.getByRole("button", { name: "Kaptanlığı al" }).click();
await a2.getByText("Kaptansın").waitFor();

await next("Sonraki soru");
await a2.getByText("Soru 2/5").waitFor();
await a2.screenshot({ path: `${SHOTS}/phone-new-captain.png` });

await host.screenshot({ path: `${SHOTS}/host.png` });
const ft = await mk(900, 700, false);
await ft.goto(`${BASE}/fonttest`);
await ft.screenshot({ path: `${SHOTS}/fonttest.png` });
const landing = await mk(1280, 800, false);
await landing.goto(`${BASE}/`);
await landing.waitForTimeout(500);
await landing.screenshot({ path: `${SHOTS}/landing.png` });

await browser.close();
console.log("E2E OK");
