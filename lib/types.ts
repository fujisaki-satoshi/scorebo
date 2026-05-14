import type { Timestamp } from "firebase/firestore";

export type Sport = "baseball" | "softball" | "kickball";

export type InningScore = {
  inning: number;
  top: number | null;
  bottom: number | null;
};

export type GameStatus = "in_progress" | "completed";

export type Game = {
  id: string;
  view_token?: string;
  owner_uid?: string;
  sport: Sport;
  date: string; // YYYY-MM-DD
  location: string;
  team_top: string;
  team_bottom: string;
  innings: InningScore[];
  max_innings: number;
  status: GameStatus;
  created_at: Timestamp;
  updated_at: Timestamp | null;
};

export type GameDraft = {
  sport: Sport;
  date: string;
  location: string;
  team_top: string;
  team_bottom: string;
  max_innings: number;
};
