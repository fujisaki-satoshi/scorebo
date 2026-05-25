"use client";

import { useState } from "react";

import { track } from "@/lib/analytics";
import { deleteGame } from "@/lib/games";
import type { Game } from "@/lib/types";

export function DeleteDialog({
  game,
  onClose,
  onDeleted,
  onDeleting,
}: {
  game: Game;
  onClose: () => void;
  onDeleted: () => void;
  onDeleting?: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    // onDeleting を先に呼ぶことで、Firestore の楽観的更新が発火する前に
    // deletingRef を true にし、watchGame が null を受け取っても notFound にならないようにする
    onDeleting?.();
    setDeleting(true);
    setError(null);
    try {
      await deleteGame(game.id, game.view_token);
      track("game_deleted", { sport: game.sport });
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-[480px] landscape:max-w-[900px] items-center justify-center bg-black/50 p-5">
      <button type="button" aria-label="閉じる" onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full max-w-80 rounded-2xl bg-card px-5 pt-5 pb-4 text-center">
        <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecea] text-live">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <div className="mb-2 text-[17px] font-bold">この試合を削除しますか?</div>
        <div className="mb-4 text-[13px] leading-relaxed text-ink-sub">
          <strong className="text-ink">{game.team_top} vs {game.team_bottom}</strong>
          <br />
          スコア・QR共有リンクは元に戻せません。
        </div>
        {error && (
          <div className="mb-3 rounded-md border border-live/30 bg-live/5 px-3 py-2 text-xs text-live">
            削除に失敗しました: {error}
          </div>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-line bg-canvas py-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-live py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting ? "削除中…" : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
