import type { PlanId } from "@config/plans";

export type Phase =
  | "lobby" | "round_intro" | "question_open" | "question_locked"
  | "answer_reveal" | "scoreboard" | "final";

/** Cevap biçimi. */
export type QuestionKind = "open" | "choice" | "ordering" | "matching" | "estimate" | "freeform";
/**
 * Tur tipi. "all" = Herkes cevaplar.
 * streak: zamana karşı seri (süre kısalır, art arda doğru çarpan kazandırır) · silent: sessiz tur (konuşmak yok, herkes oy verir)
 * bluff: sahte cevap yaz, gerçeği bul · funny: saçma/komik cevap yaz, takımlar oylar.
 */
export type RoundType = "all" | "speed" | "wager" | "final" | "streak" | "silent" | "bluff" | "funny";
export const VOTE_ROUNDS: readonly RoundType[] = ["bluff", "funny"];
export type JokerKind = "double" | "fifty";
/** Oylama aşamasındaki bir seçenek: gerçek cevap (teamIds boş) ya da takımların yazdığı cevap. */
export interface PoolEntry { id: string; text: string; teamIds: string[]; truth: boolean }
export type TeamMode = "captain" | "majority" | "individual";

/** Sorunun İngilizce karşılığı. Dizi alanları (options/items/pairs) Türkçe ile aynı sıradadır. */
export interface QuestionEn { text: string; options?: string[]; items?: string[]; pairs?: [string, string][]; correct: string; accepted?: string[]; explanation?: string }

export interface Question {
  id: string;
  category: string;
  subtopic?: string;
  difficulty?: 1 | 2 | 3;
  kind: QuestionKind;
  text: string;
  /** choice: şıklar */
  options?: string[];
  /** ordering: doğru sırada öğeler */
  items?: string[];
  /** matching: [sol, sağ] çiftleri */
  pairs?: [string, string][];
  /** choice: doğru şık, open: ana cevap, estimate: sayı, ordering/matching: JSON */
  correct: string;
  accepted: string[];
  explanation?: string;
  image?: string;
  sourceNote?: string;
  status?: "draft" | "approved" | "archived";
  reports?: number;
  en?: QuestionEn;
  // Oyun içi yerleşim
  round?: RoundType;
  roundNo?: number;
  roundLabel?: string;
}

export interface Member { id: string; token: string; nickname: string; lastSeen: number; hiddenCount: number }

export interface Team {
  id: string; code: string; name: string; color: string; emoji: string;
  captainId: string; members: Member[]; score: number;
}

export interface TeamAnswer { value: string; byMemberId: string; at: number; locked: boolean }
export interface Suggestion { value: string; at: number }
export interface Appeal { id: string; teamId: string; qIndex: number; note: string; status: "open" | "accepted" | "rejected" }

export interface Settings {
  points: number;
  wrongPenalty: number;
  teamMax: number;
  durationMs: number;
  lockFirst: boolean;
  teamMode: TeamMode;
  individualAgg: "avg" | "sum";
  speedBonus: boolean;
}

export interface Brand {
  logo: string | null; // /api/venues/:id/logo
  color1: string; color2: string; font: string; bg: "cuha" | "solid" | "image";
}

export interface Game {
  id: string;
  code: string;
  venueId: string | null;
  venueName: string;
  plan: PlanId;
  brand: Brand | null;
  lang: "tr" | "en";
  hostToken: string;
  tvToken: string;
  phase: Phase;
  qIndex: number;
  mode: TeamMode; // geçerli sorunun modu (açılışta kilitlenir)
  questions: Question[];
  openedAt: number | null;
  deadline: number | null;
  settings: Settings;
  teams: Team[];
  answers: Record<string, TeamAnswer>;
  suggestions: Record<string, Record<string, Suggestion>>;
  wagers: Record<string, number>;
  jokersUsed: string[];
  jokerActive: Record<string, boolean>;
  jokerKind: Record<string, JokerKind>;
  sabotage: Record<string, string>; // saldıran takım → hedef takım (bu soru)
  sabotageUsed: string[];
  streakBase: Record<string, number>; // seri turunda soruya girerken art arda doğru sayısı
  pool: PoolEntry[]; // bluff/funny oylama seçenekleri
  picks: Record<string, string>; // takım → seçilen PoolEntry.id
  results: Record<string, { correct: boolean; gained: number; fraction?: number }>;
  overrides: Record<string, boolean>;
  voided: boolean;
  appeals: Appeal[];
  autoHost: boolean;
  paused: boolean;
  playerLimit: number | null;
  allowedModes: TeamMode[];
  createdAt: number;
  endedAt: number | null;
  version: number;
}

export const TEAM_COLORS = [
  "#D64933", "#F4B942", "#5B8DB8", "#8FBF6A", "#E07BA0", "#F28C28", "#7A5CA8", "#2E9C8F",
  "#B5533C", "#C9A227", "#3D6F9E", "#6E8B3D", "#C25B8A", "#D9731A", "#5C4A8A", "#1F7A70",
] as const;
export const TEAM_EMOJIS = ["⚽", "🎲", "🦁", "🔥", "🌙", "🍀", "🎯", "🚀", "🐺", "🎸", "🍕", "⭐", "🐙", "🎩", "🧿", "🦅"] as const;
