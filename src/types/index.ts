export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type GameMode = "sudoku" | "killer";

export interface User {
  id: number;
  username: string;
}

export interface KillerCage {
  cells: [number, number][];
  sum: number;
  colorIndex: number;
}

export interface GameData {
  gameId: number;
  gameType: GameMode;
  difficulty: Difficulty;
  puzzle: number[][];
  currentState: number[][];
  notes: number[][][];
  cages?: KillerCage[];
  timeSeconds: number;
  isCompleted: boolean;
  mistakesEnabled: boolean;
}

export interface CompletionResult {
  valid: boolean;
  rank?: number;
  personalBest?: boolean;
  percentile?: number;
  timeSeconds: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  timeSeconds: number;
  completedAt: string;
  isCurrentUser?: boolean;
}

export interface RecentGame {
  id: number;
  gameType: GameMode;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakesEnabled: boolean;
  completedAt: string;
}

export interface UserStats {
  totalGames: number;
  byType: { sudoku: number; killer: number };
  bestTimes: Record<string, number>;
  recentGames: RecentGame[];
  currentStreak: number;
  longestStreak: number;
  averageTimes: Record<string, number>;
  totalPlayTime: number;
}
