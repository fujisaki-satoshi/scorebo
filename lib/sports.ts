import type { Sport } from "./types";

export const SPORT_ORDER: Sport[] = ["baseball", "softball", "kickball"];

export const SPORT_META: Record<
  Sport,
  { label: string; defaultMaxInnings: number }
> = {
  baseball: { label: "野球", defaultMaxInnings: 9 },
  softball: { label: "ソフト", defaultMaxInnings: 7 },
  kickball: { label: "キック", defaultMaxInnings: 5 },
};
