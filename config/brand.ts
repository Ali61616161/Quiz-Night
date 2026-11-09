/** Ürün adı tek yerde tutulur. Metinlerde ve kodda sabit yazma. */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Quizhane",
  tagline: "Mekanın quiz gecesi, telefon çıkarmadan.",
} as const;
