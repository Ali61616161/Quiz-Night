import { UI_DICT } from "./dict";

/** Sayı içeren dinamik metinler: [desen, İngilizce karşılık]. */
const PATTERNS: [RegExp, string][] = [
  [/^(\d+) kişi$/, "$1 people"],
  [/^(\d+) takım hazır$/, "$1 teams ready"],
  [/^(\d+) sn kaldı$/, "$1 s left"],
  [/^(\d+)\/(\d+) takım cevapladı$/, "$1/$2 teams answered"],
  [/^(-?\d+) puan$/, "$1 points"],
  [/^(-?\d+) puan · (.*)$/, "$1 points · $2"],
  [/^Soru (\d+)\/(\d+) · (.*)$/, "Question $1/$2 · $3"],
  [/^Soru (\d+)\/(\d+)$/, "Question $1/$2"],
  [/^✔ Takımın doğru bildi, (-?\d+) puan\.$/, "✔ Your team got it right, $1 points."],
  [/^✘ Takımın bilemedi\.$/, "✘ Your team missed it."],
  [/^✘ Takımın bilemedi, (-?\d+) puan\.$/, "✘ Your team missed it, $1 points."],
  [/^Takımın %(\d+) doğru, (-?\d+) puan\.$/, "Your team was $1% correct, $2 points."],
  [/^Sıran: (\d+)\.$/, "Your rank: $1."],
  [/^Takımın (\d+)\. sırada, (-?\d+) puan\.$/, "Your team is ranked $1 with $2 points."],
  [/^Bahsin: (\d+) puan$/, "Your wager: $1 points"],
  [/^Soruyu görmeden bahis yap\. En çok (\d+) puan\. Doğruysa kazanırsın, yanlışsa kaybedersin\.$/, "Place a wager without seeing the question. At most $1 points. You win it if right and lose it if wrong."],
  [/^(\d+) soru görüldü; tekrar çıkmaz\.$/, "$1 questions seen; they won't repeat."],
  [/^Bu mekanda (\d+) soru görüldü; tekrar çıkmaz\.$/, "$1 questions have been seen at this venue; they won't repeat."],
  [/^Bu ay (\d+)\/(\d+) soru üretildi\. Taslaklar sen onaylamadan oyuna girmez\.$/, "$1/$2 questions generated this month. Drafts never enter a game until you approve them."],
  [/^Planında en fazla (\d+) host cihazı var\. Bu cihaz salt okunur\.$/, "Your plan allows at most $1 host device(s). This device is read-only."],
  [/^Ücretsiz planda en fazla (\d+) oyuncu katılabilir\.$/, "On the Free plan at most $1 players can join."],
  [/^Ücretsiz planda günde en fazla (\d+) oyun açılır\. Planı yükselt\.$/, "On the Free plan at most $1 games can be opened per day. Upgrade your plan."],
  [/^Bahis 0 ile (\d+) arasında olmalı\.$/, "The wager must be between 0 and $1."],
  [/^(\d+)\/(\d+) soru üretildi\.?(.*)$/, "$1/$2 questions generated.$3"],
  [/^(\d+) taslak eklendi \((\d+) geçersiz, (\d+) mükerrer elendi\)\.$/, "$1 drafts added ($2 invalid, $3 duplicates removed)."],
  [/^(\d+) soru eklendi\.$/, "$1 questions added."],
  [/^(\d+) eklendi\. Hatalar: (.*)$/, "$1 added. Errors: $2"],
  [/^(\d+) gece · (\d+) takım · (\d+) oyuncu · ortalama doğru oranı %(\d+) · geri dönen takım: (\d+)$/, "$1 nights · $2 teams · $3 players · average correct rate $4% · returning teams: $5"],
  [/^(.*) takımı atılsın mı\?$/, "Remove team $1?"],
  [/^(.*) için yeni ad:$/, "New name for $1:"],
  [/^Katıl: (.*)$/, "Join: $1"],
  [/^(\d+) gece · (\d+) takım$/, "$1 nights · $2 teams"],
  [/^(\d+) mekan · (\d+) canlı oyun · (\d+) havuz sorusu · (\d+) AI taslağı$/, "$1 venues · $2 live games · $3 pool questions · $4 AI drafts"],
  [/^(\d+) takım ·? ?(.*)$/, "$1 teams · $2"],
  [/^Sezon (\d+)$/, "Season $1"],
  [/^Sezon (\d+): (.*) \((\d+) puan\)$/, "Season $1: $2 ($3 points)"],
  [/^(\d+)\. sıra$/, "rank $1"],
  [/^Kaptan: (.*)$/, "Captain: $1"],
  [/^Doğru cevap: (.*)$/, "Correct answer: $1"],
  [/^Takım: (.*)$/, "Team: $1"],
  [/^Takımlar \((\d+)\)$/, "Teams ($1)"],
  [/^İtirazlar \((\d+)\)$/, "Appeals ($1)"],
  [/^Sorularım \((\d+)\)$/, "My questions ($1)"],
  [/^Oyuna katıl · (.*)$/, "Join the game · $1"],
  [/^Host · (.*)$/, "Host · $1"],
  [/^Bu gece (.*) sundu$/, "Tonight $1 presents"],
  [/^Bu (.*) sundu$/, "$1 presents"],
  [/^(.*) oyununa katılmak için QR kod$/, "QR code to join the $1 game"],
  [/^Takım: (.*) · kod (.*)$/, "Team: $1 · code $2"],
];

const cache = new Map<string, string>();
export function translate(s: string): string {
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  const core = m[2];
  if (!core) return s;
  const hit = cache.get(core);
  if (hit !== undefined) return m[1] + hit + m[3];
  let out = UI_DICT.get(core);
  if (out === undefined) for (const [re, rep] of PATTERNS) if (re.test(core)) { out = core.replace(re, rep); break; }
  if (out === undefined) out = core;
  if (cache.size < 5000) cache.set(core, out);
  return m[1] + out + m[3];
}

const ATTRS = ["placeholder", "aria-label", "title", "alt"];
const origText = new WeakMap<Text, string>(); const outText = new WeakMap<Text, string>();
const origAttr = new WeakMap<Element, Record<string, string>>(); const outAttr = new WeakMap<Element, Record<string, string>>();
const skip = (n: Node, attrs = false) => { for (let e: Node | null = n; e; e = e.parentNode) if (e instanceof Element && (e.hasAttribute("data-no-translate") || e.tagName === "SCRIPT" || e.tagName === "STYLE" || (!attrs && e.tagName === "TEXTAREA"))) return true; return false; };

function doText(t: Text) {
  const cur = t.nodeValue ?? "";
  if (outText.get(t) === cur) return;
  const next = skip(t) ? cur : translate(cur);
  origText.set(t, cur); outText.set(t, next);
  if (next !== cur) t.nodeValue = next;
}
function doEl(el: Element) {
  if (skip(el, true)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a); if (v === null) continue;
    const o = outAttr.get(el) ?? {}; if (o[a] === v) continue;
    const next = translate(v); (origAttr.get(el) ?? origAttr.set(el, {}).get(el)!)[a] = v; o[a] = next; outAttr.set(el, o);
    if (next !== v) el.setAttribute(a, next);
  }
}
function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) { doText(root as Text); return; }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root instanceof Element) doEl(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n: Node | null = w.nextNode();
  while (n) { if (n.nodeType === Node.TEXT_NODE) doText(n as Text); else doEl(n as Element); n = w.nextNode(); }
}

/** Arayüzü İngilizceye çevirir (DOM metin düğümleri ve erişilebilirlik öznitelikleri). Türkçeye dönüş sayfa yenilemesiyle olur. */
export function startTranslator(): () => void {
  document.documentElement.lang = "en";
  const titleFix = () => { const t = translate(document.title); if (t !== document.title) document.title = t; };
  walk(document.body); titleFix();
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") doText(m.target as Text);
      else if (m.type === "attributes") doEl(m.target as Element);
      else m.addedNodes.forEach((n) => walk(n));
    }
    titleFix();
  });
  mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  return () => mo.disconnect();
}
