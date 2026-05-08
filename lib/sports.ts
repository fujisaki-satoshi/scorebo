import type { Sport } from "./types";

export const SPORT_ORDER: Sport[] = ["baseball", "softball", "kickball"];

export const SPORT_META: Record<
  Sport,
  { label: string; shortLabel: string; defaultMaxInnings: number }
> = {
  baseball: { label: "野球", shortLabel: "野球", defaultMaxInnings: 9 },
  softball: { label: "ソフトボール", shortLabel: "ソフト", defaultMaxInnings: 7 },
  kickball: { label: "キックベース", shortLabel: "キック", defaultMaxInnings: 5 },
};
