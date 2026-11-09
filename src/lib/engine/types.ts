export type Phase =
  | "lobby" | "round_intro" | "question_open" | "question_locked"
  | "answer_reveal" | "scoreboard" | "final";

export type QuestionKind = "open" | "choice";

export interface Question {
  id: string;
  category: string;
  kind: QuestionKind;
  text: string;
  options?: string[];
  /** Çoktan seçmelide doğru şıkkın indeksi, açık uçluda ilk kabul edilen cevap. */
  correct: string;
  accepted: string[];
  explanation?: string;
}

export interface Member {
  id: string;
  token: string;
  nickname: string;
  lastSeen: number;
  hiddenCount: number;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  color: string;
  emoji: string;
  captainId: string;
  members: Member[];
  score: number;
}

export interface TeamAnswer {
  value: string;
  byMemberId: string;
  at: number;
  /** Kaptan "kilitle" dedi mi. */
  locked: boolean;
}

export interface Settings {
  points: number;
  wrongPenalty: number;
  teamMax: number;
  durationMs: number;
  lockFirst: boolean;
}

export interface Game {
  id: string;
  code: string;
  venueName: string;
  hostToken: string;
  tvToken: string;
  phase: Phase;
  qIndex: number;
  questions: Question[];
  openedAt: number | null;
  deadline: number | null;
  settings: Settings;
  teams: Team[];
  answers: Record<string, TeamAnswer>; // teamId -> cevap (geçerli soru)
  suggestions: Record<string, Record<string, string>>; // teamId -> memberId -> öneri
  results: Record<string, { correct: boolean; gained: number }>; // reveal sonrası
  overrides: Record<string, boolean>; // teamId -> host düzeltmesi (geçerli soru)
  version: number;
}

export const TEAM_COLORS = [
  "#D64933", "#F4B942", "#5B8DB8", "#8FBF6A", "#E07BA0", "#F28C28", "#7A5CA8", "#2E9C8F",
  "#B5533C", "#C9A227", "#3D6F9E", "#6E8B3D", "#C25B8A", "#D9731A", "#5C4A8A", "#1F7A70",
] as const;
export const TEAM_EMOJIS = ["⚽", "🎲", "🦁", "🔥", "🌙", "🍀", "🎯", "🚀", "🐺", "🎸", "🍕", "⭐", "🐙", "🎩", "🧿", "🦅"] as const;
