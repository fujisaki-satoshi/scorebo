import { track as vercelTrack } from "@vercel/analytics";

import type { Sport } from "./types";

type EventMap = {
  game_created: { sport: Sport; max_innings: number };
  inning_saved: { sport: Sport; inning: number };
  game_status_changed: { sport: Sport; status: "in_progress" | "completed" };
  game_deleted: { sport: Sport };
  qr_share_opened: { sport: Sport };
  qr_share_line: { sport: Sport };
  qr_share_copy: { sport: Sport; mode?: string };
  qr_share_native: { sport: Sport; with_image: boolean };
  key_generated: Record<string, never>;
  save_method_marked: { method: string };
  key_restored: Record<string, never>;
  key_restore_failed: { reason: string };
  gate_dismissed: Record<string, never>;
};

export function track<K extends keyof EventMap>(name: K, props: EventMap[K]) {
  try {
    vercelTrack(name, props as Record<string, string | number | boolean | null>);
  } catch {
    // Analytics 失敗は本来の処理を止めない
  }
}
