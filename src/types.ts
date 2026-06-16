export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
}

export interface Idiom {
  text: string;           // e.g. "畫蛇添足"
  missingIndex: number;   // e.g. 3
  missingChar: string;    // e.g. "足"
  hint: string;           // e.g. "比喻做多餘的事，反而有害無益"
}

export interface NormalLevel {
  id: number;             // e.g. 1
  name: string;           // e.g. "第一關 - 初試身手"
  idioms: Idiom[];
  distractors: string[];  // e.g. ["手", "頭", "風"] (extra characters to pad the candidate pool)
}

export interface LevelRecord {
  levelId: string;        // e.g. "level_1"
  userId: string;
  userName: string;
  seconds: number;
  achievedAt: number;
}

export interface ChallengeRecord {
  userId: string;
  userName: string;
  score: number;
  completedAt: number;
  limitSeconds?: number;
  secondsSpent?: number;
}

export type GameMode = "lobby" | "normal_selection" | "normal_game" | "challenge_game" | "settings";

// Coordinates for crossword puzzle
export interface CrosswordCell {
  row: number;
  col: number;
  char: string;
  isIdiotSource?: boolean; // Part of an idiom
  isBlank?: boolean;       // Extracted as blank
  blankId?: number;        // Index of the blank
  solution?: string;       // Correct character to fill
}

export interface CrosswordIdiomPath {
  text: string;
  row: number;
  col: number;
  direction: "H" | "V"; // Horizontal or Vertical
}
