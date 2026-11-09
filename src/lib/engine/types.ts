import type { PlanId } from "@config/plans";

export type Phase =
  | "lobby" | "round_intro" | "question_open" | "question_locked"
  | "answer_reveal" | "scoreboard" | "final";

/** Cevap biçimi. */
export type QuestionKind = "open" | "choice" | "ordering" | "matching" | "estimate";
/** Tur tipi. "all" = Herkes cevaplar. */
export type RoundType = "all" | "speed" | "wager" | "final";
export type TeamMode = "captain" | "majority" | "individual";

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
