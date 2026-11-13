import { describe, expect, it } from "vitest";
import { sanitizeSvg, sniffImage } from "@/lib/server/svg";
import { rateLimit } from "@/lib/server/ratelimit";
import { parseAi, isDuplicate, aiRequestSchema, generate } from "@/lib/server/ai";
import { contrast, suggestDarker } from "@/lib/brand";
import { parseCsv } from "@/lib/csv";
import { quote, subscribe, renewDue, cancel, downgrade, findCoupon } from "@/lib/server/billing";
import { db } from "@/lib/server/db";
import { signup, login, verifyEmail, sameOrigin } from "@/lib/server/auth";
import { createVenueGame, effectivePlan, onGameEvent, anonymizeOld, leagueTable } from "@/lib/server/venue";
import { advance, createTeam, submitAnswer } from "@/lib/engine/game";
import { can } from "@config/plans";

describe("SVG/logo güvenliği", () => {
  it("script, olay yöneticisi ve dış kaynağı temizler/reddeder", () => {
    expect(sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="1" height="1"/></svg>')).toBeNull();
    expect(sanitizeSvg('<svg><foreignObject><iframe/></foreignObject></svg>')).toBeNull();
    expect(sanitizeSvg('<svg><use href="http://evil/x.svg#a"/></svg>')).toBeNull();
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)" viewBox="0 0 10 10"><rect onclick="x()" fill="url(http://evil)" width="5" height="5"/></svg>')!;
    expect(out).not.toMatch(/onload|onclick|evil/);
    expect(out).toContain("<rect");
    expect(sanitizeSvg('<!DOCTYPE svg [<!ENTITY x "y">]><svg></svg>')).toBeNull();
  });
  it("içerik tipi imzadan belirlenir", () => {
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]))).toBe("image/png");
    expect(sniffImage(Buffer.from("<html><script>"))).toBeNull();
    expect(sniffImage(Buffer.from("GIF89a....."))).toBeNull();
    expect(sniffImage(Buffer.from("<svg xmlns='x'></svg>"))).toBe("image/svg+xml");
  });
});

describe("hız sınırı", () => {
  it("pencerede aşılınca reddeder, süre geçince açar", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k1", 3, 1000, 0)).toBe(true);
    expect(rateLimit("k1", 3, 1000, 10)).toBe(false);
    expect(rateLimit("k1", 3, 1000, 2000)).toBe(true);
  });
});

describe("AI hattı", () => {
  const r = aiRequestSchema.parse({ category: "Tarih", difficulty: 2, count: 3 });
  it("şemaya uymayan çıktıyı reddeder, geçerli olanı taslak yapar", () => {
    const good = JSON.stringify({ questions: [
      { text: "Malazgirt Savaşı hangi yıl yapıldı?", kind: "open", correct: "1071", accepted: [] },
      { text: "Bozuk şıklı soru örneği burada?", kind: "choice", options: ["a", "b", "c", "d"], correct: "z" },
      { text: "Cevabı içinde geçen Ankara sorusu: Ankara?", kind: "open", correct: "Ankara" },
    ] });
    const out = parseAi("Tamam:\n" + good, r);
    expect(out.questions).toHaveLength(1);
    expect(out.rejected).toBe(2);
    expect(out.questions[0].status).toBe("draft");
    expect(parseAi("json değil", r).questions).toHaveLength(0);
    expect(parseAi('{"questions":[{"text":1}]}', r).questions).toHaveLength(0);
  });
  it("mükerrer soruyu yakalar", () => {
    expect(isDuplicate("Türkiye'nin başkenti neresidir?", [{ text: "türkiyenin başkenti nedir?" }])).toBe(true);
    expect(isDuplicate("Everest kaç metre?", [{ text: "Türkiye'nin başkenti neresidir?" }])).toBe(false);
  });
  it("API çağrısı sahte fetch ile çalışır ve mükerrerleri eler", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    const fake = (async () => new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ questions: [
      { text: "İstanbul'un fethi hangi yıl gerçekleşti?", kind: "open", correct: "1453" },
      { text: "Mimar Sinan'ın kalfalık eseri hangi camidir?", kind: "open", correct: "Şehzade Camii" },
    ] }) }] }), { status: 200 })) as unknown as typeof fetch;
    const out = await generate(r, [], fake);
    expect(out.dupes).toBe(1); expect(out.questions).toHaveLength(1);
    delete process.env.ANTHROPIC_API_KEY;
    await expect(generate(r, [], fake)).rejects.toThrow(/anahtar/);
  });
});

describe("marka ve CSV", () => {
  it("kontrast hesaplar ve düzeltme önerir", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    const bad = "#EDE4D0"; expect(contrast(bad, "#EDE4D0")).toBeLessThan(4.5);
    expect(contrast(suggestDarker(bad), "#EDE4D0")).toBeGreaterThanOrEqual(4.5);
  });
  it("CSV tırnak ve noktalı virgülü çözer", () => {
    const rows = parseCsv('category,difficulty,text,options,correct\nTarih,2,"Soru, virgüllü?",A;B;C;D,A\n');
    expect(rows[0].text).toBe("Soru, virgüllü?"); expect(rows[0].options).toBe("A;B;C;D");
  });
});

describe("hesap, plan, ödeme", () => {
  let venueId = "";
  it("kayıt → doğrulama zorunlu → giriş", () => {
    const r = signup({ email: "a@b.co", password: "uzunsifre123", venueName: "Kafe X", acceptTerms: true });
    expect("ok" in r && r.devVerifyUrl).toBeTruthy();
    expect("error" in login("a@b.co", "uzunsifre123", "1.1.1.1")).toBe(true); // doğrulanmadı
    const u = Object.values(db.users)[0]; venueId = u.venueId;
    expect(verifyEmail(u.verifyToken!)).toBe(true);
    expect("error" in login("a@b.co", "yanlis-sifre", "1.1.1.1")).toBe(true);
    expect("token" in login("a@b.co", "uzunsifre123", "1.1.1.1")).toBe(true);
    expect("error" in signup({ email: "a@b.co", password: "uzunsifre123", venueName: "Y", acceptTerms: true })).toBe(true);
  });
  it("şifre düz metin saklanmaz", () => { expect(JSON.stringify(db.users)).not.toContain("uzunsifre123"); });
  it("sameOrigin farklı origin'i reddeder", () => {
    expect(sameOrigin(new Request("http://x/", { headers: { origin: "http://evil.com", host: "x" } }))).toBe(false);
    expect(sameOrigin(new Request("http://x/", { headers: { origin: "http://x", host: "x" } }))).toBe(true);
  });
  it("kupon, KDV ve yıllık fiyat", () => {
    db.coupons["PILOT50"] = { code: "PILOT50", percentOff: 50, months: 3, maxUses: 2, uses: 0, expires: null, note: "" };
    const q = quote("starter", "monthly", "pilot50");
    expect(q.net).toBe(495); expect(q.total).toBe(594);
    expect(quote("pro", "yearly").gross).toBe(19900);
    db.coupons["OLD"] = { code: "OLD", percentOff: 10, months: 1, maxUses: 1, uses: 0, expires: Date.now() - 1, note: "" };
    expect(findCoupon("OLD")).toBeNull();
  });
  it("abonelik: başarılı ödeme planı açar, reddedilen kart planı değiştirmez, iptal ve düşürme", async () => {
    const v = db.venues[venueId];
    expect((await subscribe(v, "pro", "monthly", "tok_fail")).ok).toBe(false);
    expect(v.plan).toBe("free");
    expect((await subscribe(v, "pro", "monthly", "tok_ok", "PILOT50")).ok).toBe(true);
    expect(effectivePlan(v)).toBe("pro"); expect(can("pro", "stats")).toBe(true);
    expect(db.coupons["PILOT50"].uses).toBe(1);
    cancel(v); expect(effectivePlan(v)).toBe("pro"); // dönem sonuna kadar
    v.renewsAt = Date.now() - 1; expect(effectivePlan(v)).toBe("free");
    downgrade(v); expect(v.plan).toBe("free");
  });
  it("başarısız yenileme past_due yapar, 7 gün sonra ücretsize düşer", async () => {
    const v = db.venues[venueId];
    await subscribe(v, "starter", "monthly", "tok_ok");
    v.renewsAt = Date.now() - 1000;
    process.env.BILLING_PROVIDER = "iyzico";
    const r = await renewDue();
    delete process.env.BILLING_PROVIDER;
    expect(r.failed).toBe(1); expect(v.status).toBe("past_due");
    expect(effectivePlan(v)).toBe("starter");
    v.renewsAt = Date.now() - 8 * 86400_000; expect(effectivePlan(v)).toBe("free");
  });
  it("plan kapısı: ücretsiz günlük 2 oyun, marka yalnızca Marka planında", async () => {
    const v = db.venues[venueId]; downgrade(v); v.gameTimes = [];
    createVenueGame(v, { template: "quick" }); createVenueGame(v, { template: "quick" });
    expect(() => createVenueGame(v, { template: "quick" })).toThrow(/günde en fazla/);
    v.gameTimes = []; await subscribe(v, "brand", "monthly", "tok_ok");
    const { game } = createVenueGame(v, { template: "quick", teamMode: "majority", autoHost: true });
    expect(game.brand).not.toBeNull(); expect(game.allowedModes).toContain("majority"); expect(game.autoHost).toBe(true);
    v.gameTimes = []; downgrade(v);
    const g2 = createVenueGame(v, { template: "classic", teamMode: "majority", autoHost: true }).game;
    expect(g2.brand).toBeNull(); expect(g2.settings.teamMode).toBe("captain"); expect(g2.autoHost).toBe(false);
    expect(g2.questions.every((q) => ["open", "choice"].includes(q.kind))).toBe(true);
    expect(g2.questions.every((q) => (q.round ?? "all") === "all")).toBe(true);
  });
  it("oyun bitince geçmiş, görülmüş soru, lig ve anonimleştirme işler", async () => {
    const v = db.venues[venueId]; v.gameTimes = []; await subscribe(v, "brand", "monthly", "tok_ok");
    const { game: g } = createVenueGame(v, { template: "bilbakalim" });
    const a = createTeam(g, { nickname: "Ali", teamName: "Kırmızılar", color: "#D64933", emoji: "⚽", now: 0 });
    advance(g, 0); advance(g, 0);
    submitAnswer(g, { memberToken: a.memberToken, value: g.questions[0].correct, lock: true, now: 1 });
    advance(g, 2); advance(g, 2); onGameEvent(g);
    expect(v.seen).toContain(g.questions[0].id);
    g.phase = "final"; onGameEvent(g);
    expect(v.history.at(-1)!.ranking[0].name).toBe("Kırmızılar");
    expect(leagueTable(v)[0].name).toBe("Kırmızılar");
    expect(anonymizeOld(30, Date.now() + 31 * 86400_000)).toBeGreaterThan(0);
    expect(v.history.at(-1)!.ranking[0].name).toBe("Takım 1");
  });
});

import { requestReset, resetPassword, deleteAccount } from "@/lib/server/auth";
import { advance as adv, createTeam as ct, newGame as ng, tick as tk } from "@/lib/engine/game";
describe("şifre sıfırlama, hesap silme, ilerletme", () => {
  it("sıfırlama bağlantısı tek kullanımlık; eski şifre geçersiz; açık oturumlar kapanır", () => {
    signup({ email: "r@b.co", password: "eski-sifre-123", venueName: "Reset Kafe", acceptTerms: true });
    const u = Object.values(db.users).find((x) => x.email === "r@b.co")!; verifyEmail(u.verifyToken!);
    expect("token" in login("r@b.co", "eski-sifre-123", "1.1.1.1")).toBe(true);
    expect(requestReset("yok@yok.co")).toBeNull();
    const link = requestReset("r@b.co")!; const t = link.split("sifirla=")[1];
    expect(() => resetPassword(t, "kisa")).toThrow();
    expect(resetPassword(t, "yeni-sifre-1234")).toBe(true);
    expect(resetPassword(t, "baska-sifre-1234")).toBe(false);
    expect("error" in login("r@b.co", "eski-sifre-123", "1.1.1.1")).toBe(true);
    expect("token" in login("r@b.co", "yeni-sifre-1234", "1.1.1.1")).toBe(true);
    expect(deleteAccount(u, "yanlis")).toBe(false);
    expect(deleteAccount(u, "yeni-sifre-1234")).toBe(true);
    expect(db.users[u.id]).toBeUndefined(); expect(db.venues[u.venueId]).toBeUndefined();
  });
  it("süre dolmuşken ilerlet yalnızca kilidi uygular (adım atlamaz)", () => {
    const q = { id: "1", category: "T", kind: "choice" as const, text: "S?", options: ["A", "B", "C", "D"], correct: "A", accepted: [] };
    const g = ng({ venueName: "T", questions: [q] });
    ct(g, { nickname: "a", teamName: "T1", color: "#D64933", emoji: "⚽", now: 0 });
    adv(g, 0); adv(g, 0);
    adv(g, 999_999); // süre dolmuş
    expect(g.phase).toBe("question_locked");
    void tk;
  });
});

import { signupSchema } from "@/lib/server/auth";
describe("kayıt: koşulların açık kabulü", () => {
  it("kabul işaretlenmeden kayıt reddedilir", () => {
    expect(signupSchema.safeParse({ email: "k@b.co", password: "uzunsifre123", venueName: "Kafe" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "k@b.co", password: "uzunsifre123", venueName: "Kafe", acceptTerms: false }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "k@b.co", password: "uzunsifre123", venueName: "Kafe", acceptTerms: true }).success).toBe(true);
  });
  it("kabul edilen sürüm ve zaman kullanıcıya yazılır", async () => {
    const { LEGAL_VERSION } = await import("@/lib/legal");
    const { db } = await import("@/lib/server/db");
    signup({ email: "kabul@b.co", password: "uzunsifre123", venueName: "Kabul Kafe", acceptTerms: true });
    const u = Object.values(db.users).find((x) => x.email === "kabul@b.co")!;
    expect(u.termsVersion).toBe(LEGAL_VERSION); expect(u.termsAt).toBeGreaterThan(0);
  });
});
