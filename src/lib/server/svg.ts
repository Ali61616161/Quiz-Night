/** Logo yükleme güvenliği: içerik tipi imzadan doğrulanır, SVG'den script ve dış kaynak temizlenir. */
export type LogoType = "image/png" | "image/webp" | "image/svg+xml";
export const MAX_LOGO = 1_000_000;

export function sniffImage(buf: Buffer): LogoType | null {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  const head = buf.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg")) ) return "image/svg+xml";
  return null;
}

/** Beyaz liste yaklaşımı: yalnızca güvenli öğe ve öznitelikler kalır. */
const TAGS = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "title", "desc", "clippath", "mask", "text", "tspan"]);
const ATTRS = new Set(["viewbox", "width", "height", "xmlns", "d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity", "transform", "x", "y", "cx", "cy", "r", "rx", "ry", "x1", "y1", "x2", "y2", "points", "id", "offset", "stop-color", "stop-opacity", "gradientunits", "gradienttransform", "fill-rule", "clip-rule", "preserveaspectratio", "font-size", "font-family", "font-weight", "text-anchor", "clip-path", "mask", "class", "version"]);

export function sanitizeSvg(src: string): string | null {
  if (/<!ENTITY|<!DOCTYPE[^>]*\[/i.test(src)) return null; // XXE/entity bombası
  const noComments = src.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?xml[^>]*\?>/gi, "").replace(/<!DOCTYPE[^>]*>/gi, "");
  let ok = true;
  const out = noComments.replace(/<\/?([a-zA-Z][\w:-]*)((?:\s+[^<>]*?)?)\s*(\/?)>/g, (full, tag: string, attrs: string, selfClose: string) => {
    const t = tag.toLowerCase();
    if (!TAGS.has(t)) { if (/^(script|foreignobject|iframe|object|embed|use|image|a|style|animate|set)$/.test(t)) ok = false; return ""; }
    if (full.startsWith("</")) return `</${t}>`;
    const kept: string[] = [];
    for (const m of attrs.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const name = m[1].toLowerCase(); const val = m[3] ?? m[4] ?? "";
      if (!ATTRS.has(name)) continue;
      if (/javascript:|data:|url\s*\(\s*['"]?\s*(?!#)/i.test(val) || /[<>]/.test(val)) continue; // yalnızca #id referansı
      kept.push(`${name}="${val.replace(/"/g, "&quot;")}"`);
    }
    return `<${t}${kept.length ? " " + kept.join(" ") : ""}${selfClose ? "/" : ""}>`;
  });
  if (!ok || !/<svg[\s>]/i.test(out)) return null;
  // Etiket dışında kalan metin sadece <text>/<title> içeriği olabilir; tehlikeli kalıp kalmadığını son kez denetle
  if (/<\s*script|on\w+\s*=|javascript:|<\s*foreignobject/i.test(out)) return null;
  return out;
}
