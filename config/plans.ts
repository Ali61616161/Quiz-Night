export type PlanId = "free" | "starter" | "pro" | "brand";

export type Feature =
  | "unlimited_players"
  | "unlimited_games"
  | "mode_individual"
  | "mode_majority"
  | "round_speed"
  | "round_wager"
  | "round_ordering"
  | "round_picture"
  | "round_matching"
  | "round_estimate"
  | "own_packs_play"
  | "poster_pdf"
  | "stats"
  | "bulk_csv"
  | "branding"
  | "league"
  | "hide_platform_brand"
  | "auto_host";

export interface Plan {
  id: PlanId;
  name: string;
  priceTryMonthly: number; // KDV hariç
  playerLimit: number | null;
  dailyGames: number | null;
  aiQuotaMonthly: number;
  hostDevices: number;
  features: ReadonlySet<Feature>;
}

const starter: Feature[] = [
  "unlimited_players", "unlimited_games", "mode_individual",
  "round_speed", "round_wager", "round_ordering",
  "own_packs_play", "poster_pdf", "auto_host",
];
const pro: Feature[] = [
  ...starter, "mode_majority", "round_picture", "round_matching",
  "round_estimate", "stats", "bulk_csv",
];
const brand: Feature[] = [...pro, "branding", "league", "hide_platform_brand"];

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", name: "Ücretsiz", priceTryMonthly: 0, playerLimit: 10, dailyGames: 2, aiQuotaMonthly: 0, hostDevices: 1, features: new Set() },
  starter: { id: "starter", name: "Başlangıç", priceTryMonthly: 990, playerLimit: null, dailyGames: null, aiQuotaMonthly: 250, hostDevices: 1, features: new Set(starter) },
  pro: { id: "pro", name: "Pro", priceTryMonthly: 1990, playerLimit: null, dailyGames: null, aiQuotaMonthly: 500, hostDevices: 1, features: new Set(pro) },
  brand: { id: "brand", name: "Marka", priceTryMonthly: 3990, playerLimit: null, dailyGames: null, aiQuotaMonthly: 2000, hostDevices: 2, features: new Set(brand) },
};

/** Yıllık ödemede 2 ay bedava. */
export const yearlyPrice = (p: Plan) => p.priceTryMonthly * 10;

/** Özellik kapısı: tek yardımcı. Sunucu tarafında çağrılır. */
export function can(planId: PlanId, feature: Feature): boolean {
  return PLANS[planId].features.has(feature);
}
