"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { GameHero } from "@/app/_components/GameHero";
import { ScoreTable } from "@/app/_components/ScoreTable";
import { track } from "@/lib/analytics";
import {
  currentInning,
  findInning,
  getPillStatus,
  hasAnyScore,
  setInning,
  totals,
  updateInnings,
  updateStatus,
  watchGame,
} from "@/lib/games";
import type { Game } from "@/lib/types";
import { DeleteDialog } from "./_components/DeleteDialog";
import { EditSheet } from "./_components/EditSheet";
import { ShareModal } from "./_components/ShareModal";

type Modal = "share" | "edit" | "delete" | null;

export function GameView({ id }: { id: string }) {
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingInning, setEditingInning] = useState<number | null>(null);
  const [localTop, setLocalTop] = useState(0);
  const [localBottom, setLocalBottom] = useState(0);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<Modal>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = watchGame(id, (g) => {
      if (!g) {
        setNotFound(true);
        return;
      }
      setGame(g);
    });
    return () => unsub();
  }, [id]);

  // initialize editing inning when game loads
  useEffect(() => {
    if (!game || editingInning !== null) return;
    const cur = currentInning(game.innings, game.max_innings);
    setEditingInning(cur);
    const slot = findInning(game.innings, cur);
    setLocalTop(slot?.top ?? 0);
    setLocalBottom(slot?.bottom ?? 0);
  }, [game, editingInning]);

  const switchInning = useCallback(
    (n: number) => {
      if (!game) return;
      setEditingInning(n);
      const slot = findInning(game.innings, n);
      setLocalTop(slot?.top ?? 0);
      setLocalBottom(slot?.bottom ?? 0);
    },
    [game],
  );

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 text-3xl">🔎</div>
        <div className="mb-2 text-base font-semibold">試合が見つかりません</div>
        <div className="mb-6 text-sm text-ink-sub">
          URLが正しいか確認するか、ホームに戻ってください。
        </div>
        <Link
          href="/games"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          試合一覧へ
        </Link>
      </div>
    );
  }

  if (!game || editingInning === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-sub">
        読み込み中…
      </div>
    );
  }

  const { top, bottom } = totals(game.innings);
  const { pillText, pillVariant } = getPillStatus(game.innings, game.max_innings, game.status);
  const slots = Math.max(game.max_innings, game.innings.reduce((m, s) => Math.max(m, s.inning), 0));

  async function handleSaveInning() {
    if (!game || editingInning === null) return;
    setSaving(true);
    setError(null);
    try {
      const nextInnings = setInning(game.innings, editingInning, localTop, localBottom);
      await updateInnings(game.id, nextInnings);
      track("inning_saved", { sport: game.sport, inning: editingInning });
      const advance = currentInning(nextInnings, game.max_innings);
      setEditingInning(advance);
      const slot = findInning(nextInnings, advance);
      setLocalTop(slot?.top ?? 0);
      setLocalBottom(slot?.bottom ?? 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!game) return;
    const next: typeof game.status = game.status === "completed" ? "in_progress" : "completed";
    try {
      await updateStatus(game.id, next);
      track("game_status_changed", { sport: game.sport, status: next });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleAddInning() {
    setEditingInning(slots + 1);
    setLocalTop(0);
    setLocalBottom(0);
  }

  return (
    <>
      <header className="relative flex items-center gap-1.5 border-b border-line bg-card px-3.5 py-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-0.5 px-1 py-1.5 text-sm font-medium text-brand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          一覧
        </Link>
        <div className="ml-1 flex-1 text-base font-semibold">スコア</div>
        <button
          type="button"
          onClick={() => {
            track("qr_share_opened", { sport: game.sport });
            setModal("share");
          }}
          className="inline-flex items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-[13px] font-semibold text-brand-dark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          共有
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-sub hover:bg-canvas"
          aria-label="メニュー"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="0.6" />
            <circle cx="12" cy="12" r="0.6" />
            <circle cx="12" cy="19" r="0.6" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-10"
            />
            <div className="absolute right-3 top-12 z-20 w-48 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setModal("edit"); }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-canvas"
              >
                試合情報を編集
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setModal("delete"); }}
                className="block w-full border-t border-line px-4 py-3 text-left text-sm text-live hover:bg-canvas"
              >
                この試合を削除
              </button>
            </div>
          </>
        )}
      </header>

      <GameHero
        sport={game.sport}
        date={game.date}
        location={game.location}
        teamTop={game.team_top}
        teamBottom={game.team_bottom}
        top={top}
        bottom={bottom}
        pillText={pillText}
        pillVariant={pillVariant}
      />

      <div className="px-4 pt-3.5">
        <ScoreTable
          innings={game.innings}
          maxInnings={game.max_innings}
          teamTop={game.team_top}
          teamBottom={game.team_bottom}
          highlightInning={editingInning}
          onPickInning={switchInning}
          totals={{ top, bottom }}
        />
      </div>

      <div className="mx-4 mt-3.5 rounded-2xl border border-line bg-card px-4 py-3.5">
        <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          <span>{editingInning}回の得点を入力</span>
        </div>

        <StepperRow
          label={game.team_top || "先攻"}
          side="先攻"
          value={localTop}
          onChange={setLocalTop}
        />
        <div className="border-t border-dashed border-line">
          <StepperRow
            label={game.team_bottom || "後攻"}
            side="後攻"
            value={localBottom}
            onChange={setLocalBottom}
          />
        </div>

        {error && (
          <div className="mt-2 rounded-md border border-live/30 bg-live/5 px-3 py-1.5 text-xs text-live">
            保存に失敗しました: {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveInning}
          disabled={saving}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-4 text-base font-bold text-white active:bg-brand-dark disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
          {saving ? "保存中…" : `${editingInning}回を保存する`}
        </button>
      </div>

      <div className="mx-4 my-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleAddInning}
          className="rounded-xl border border-dashed border-line bg-transparent py-4 text-center text-[14px] text-ink-sub hover:border-brand hover:bg-card hover:text-brand"
        >
          ＋ イニングを追加
        </button>
        <button
          type="button"
          onClick={handleToggleStatus}
          className={
            game.status === "completed"
              ? "rounded-xl border border-line bg-card py-4 text-center text-[14px] font-semibold text-ink-sub hover:text-brand"
              : "rounded-xl border border-brand bg-card py-4 text-center text-[14px] font-semibold text-brand hover:bg-brand-light"
          }
        >
          {game.status === "completed" ? "↩ 試合を再開" : "🏁 試合を終了"}
        </button>
      </div>

      <div className="mb-5 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-semibold text-brand-dark active:bg-brand-light"
        >
          <span
            className="inline-block rotate-45 rounded-[1px] border-[1.5px] border-brand"
            style={{ width: 10, height: 10 }}
            aria-hidden="true"
          />
          スコアボで作成 — 無料
        </Link>
      </div>

      {modal === "share" && <ShareModal game={game} onClose={() => setModal(null)} />}
      {modal === "edit" && <EditSheet game={game} onClose={() => setModal(null)} />}
      {modal === "delete" && (
        <DeleteDialog game={game} onClose={() => setModal(null)} onDeleted={() => router.replace("/")} />
      )}
    </>
  );
}

function StepperRow({
  label,
  side,
  value,
  onChange,
}: {
  label: string;
  side: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-[14px]">
        <span className="font-semibold">{label}</span>
        <span className="ml-1 text-[12px] text-ink-sub">({side})</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-card text-2xl font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
          aria-label="-1"
        >
          −
        </button>
        <span className="min-w-10 text-center text-[32px] font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(99, value + 1))}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-card text-2xl font-bold leading-none text-brand active:bg-brand-light"
          aria-label="+1"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
