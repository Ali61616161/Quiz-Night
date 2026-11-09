/** Basit CSV ayrıştırıcı (tırnaklı alan, virgül/noktalı virgül). Başlık satırı zorunlu: category,difficulty,text,options,correct,accepted,explanation */
export function parseCsv(src: string): Record<string, string>[] {
  const text = src.replace(/^﻿/, "").replace(/\r/g, "");
  const first = text.split("\n")[0] ?? "";
  const sep = first.includes("\t") ? "\t" : (first.match(/,/g)?.length ?? 0) >= (first.match(/;/g)?.length ?? 0) ? "," : ";";
  const rows: string[][] = []; let cur: string[] = []; let f = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === sep) { cur.push(f); f = ""; }
    else if (c === "\n") { cur.push(f); rows.push(cur); cur = []; f = ""; }
    else f += c;
  }
  if (f || cur.length) { cur.push(f); rows.push(cur); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}
