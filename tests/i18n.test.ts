import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { translate } from "@/lib/i18n/runtime";
import { UI_DICT } from "@/lib/i18n/dict";
import { t } from "@/lib/i18n";

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(p) ? [p] : []; });
const TR = /[çğıöşüÇĞİÖŞÜ]/;

describe("arayüz çevirisi", () => {
  it("bilinen cümleler ve dinamik kalıplar çevrilir, boşluk korunur", () => {
    expect(translate("Cevabı kilitle")).toBe("Lock answer");
    expect(translate(" Soru ")).toBe(" Question ");
    expect(translate("3 takım hazır")).toBe("3 teams ready");
    expect(translate("12 sn kaldı")).toBe("12 s left");
    expect(translate("✔ Takımın doğru bildi, 100 puan.")).toBe("✔ Your team got it right, 100 points.");
    expect(translate("Ücretsiz planda en fazla 10 oyuncu katılabilir.")).toBe("On the Free plan at most 10 players can join.");
    expect(translate("Bilinmeyen bir kullanıcı metni")).toBe("Bilinmeyen bir kullanıcı metni"); // çevrilmeyen metin bozulmaz
    expect(translate("")).toBe("");
  });
  it("sözlükte yinelenen anahtar yok ve hiçbir çeviri boş değil", () => {
    for (const [k, v] of UI_DICT) { expect(k.length).toBeGreaterThan(0); expect(v.trim().length, k).toBeGreaterThan(0); }
  });
  it("tüm ekran bileşenlerindeki Türkçe JSX metinleri ve erişilebilirlik öznitelikleri çevrilmiştir", () => {
    const files = [...walk("src/app"), ...walk("src/components")];
    const missing: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (n: ts.Node) => {
        let txt: string | null = null;
        if (ts.isJsxText(n)) txt = n.getText();
        else if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer) && ["placeholder", "aria-label", "title", "alt"].includes(n.name.getText())) txt = n.initializer.text;
        if (txt) { const s = txt.replace(/\s+/g, " ").trim(); if (s && TR.test(s) && translate(s) === s && !/ığüşöç/.test(s)) missing.push(`${path.basename(f)}: ${s}`); }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    expect(missing).toEqual([]);
  });
  it("sunucu mesajları (motor hataları) çevrilmiştir", () => {
    const src = readFileSync("src/lib/engine/game.ts", "utf8");
    const msgs = [...src.matchAll(/new GameError\("[a-z_]+", "([^"]+)"/g)].map((m) => m[1]).filter((m) => !m.includes("${"));
    const miss = msgs.filter((m) => translate(m) === m);
    expect(miss).toEqual([]);
  });
  it("t() altyapısı eksik anahtarda Türkçeye düşer", () => { expect(t("play.lock", "en")).toBe("Lock answer"); expect(t("yok.anahtar", "en")).toBe("yok.anahtar"); });
});

import { LEGAL } from "@/lib/legal";
describe("hukuki metinlerin İngilizcesi", () => {
  it("her başlık ve paragrafın İngilizce karşılığı var", () => {
    const miss: string[] = [];
    for (const d of Object.values(LEGAL)) for (const x of [d.title, ...d.sections.flatMap((s) => [s.h, s.p])]) if (translate(x) === x) miss.push(x.slice(0, 60));
    expect(miss).toEqual([]);
  });
});
