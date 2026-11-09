import type { CSSProperties } from "react";
import { FONT_STACKS } from "@/lib/brand";

export interface BrandView { logo: string | null; color1: string; color2: string; font: string; bg: string }

/** Marka planı: iki ana renk + yazı tipi CSS değişkeni olarak uygulanır. */
export function brandStyle(b: BrandView | null | undefined): CSSProperties {
  if (!b) return {};
  return {
    ["--cuha" as string]: b.color1, ["--cuha-deep" as string]: shade(b.color1, 0.72), ["--cuha-line" as string]: shade(b.color1, 1.35),
    ["--lamba" as string]: b.color2, ["--font-display" as string]: FONT_STACKS[b.font] ?? FONT_STACKS.varsayilan,
    backgroundColor: b.color1,
  };
}
function shade(hex: string, f: number) {
  const c = [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * f))));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
