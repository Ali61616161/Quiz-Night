function lum(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/** WCAG kontrast oranı. */
export function contrast(a: string, b: string) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Okunaksız renk seçilirse çuhaya en yakın okunur koyulaştırma önerir. */
export function suggestDarker(hex: string, against = "#EDE4D0", min = 4.5) {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < 40 && contrast(`#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`, against) < min; i++) { r = Math.round(r * 0.92); g = Math.round(g * 0.92); b = Math.round(b * 0.92); }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
export const FONT_STACKS: Record<string, string> = {
  varsayilan: "var(--font-display)", serif: "Georgia, 'Times New Roman', serif", mono: "ui-monospace, 'SF Mono', Menlo, monospace", yuvarlak: "'Trebuchet MS', 'Segoe UI', sans-serif",
};
