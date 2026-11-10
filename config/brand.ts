/** Ürün adı tek yerde tutulur. Metinlerde ve kodda sabit yazma. */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Quizhane",
  tagline: "Mekanın quiz gecesi, telefon çıkarmadan.",
} as const;

/** Yasal kimlik: yayına almadan önce ortam değişkenleriyle doldurulur (KVKK/Koşullar sayfalarında görünür). */
export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
  mersis: process.env.NEXT_PUBLIC_COMPANY_MERSIS || "",
  verbis: process.env.NEXT_PUBLIC_COMPANY_VERBIS || "",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  kep: process.env.NEXT_PUBLIC_COMPANY_KEP || "",
} as const;
