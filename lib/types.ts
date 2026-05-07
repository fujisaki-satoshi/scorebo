import type { Timestamp } from "firebase/firestore";

export type Sport = "softball" | "baseball" | "kickball";

export type GameStatus = "scheduled" | "live" | "finished";

export type Inning = {
  inning: number;
  top: number;
  bottom: number;
};

export type Game = {
  id: string;
  sport: Sport;
  date?: string | Timestamp;
  location?: string;
  team_top: string;
  team_bottom: string;
  innings: Inning[];
  status: GameStatus;
  created_at?: Timestamp;
};
