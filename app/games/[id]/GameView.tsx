"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";

import { SportIcon } from "@/app/_components/SportIcon";
import { track } from "@/lib/analytics";
import {
  currentInning,
  deleteGame,
  findInning,
  hasAnyScore,
  setInning,
  totalSlots,
  totals,
  updateGameMeta,
  updateInnings,
  updateStatus,
  watchGame,
} from "@/lib/games";
import { SPORT_META, SPORT_ORDER } from "@/lib/sports";
import type { Game, Sport } from "@/lib/types";

type Modal = "share" | "edit" | "delete" | null;

function teamShort(name: string): string {
  if (!name) return "—";
  return name.length > 5 ? name.slice(0, 5) + "…" : name;
}

function formatMonthDay(date: string): string {
  if (!date) return "";
  const [, m, d] = date.split("-");
  if (!m || !d) return date;
  return `${Number(m)}/${Number(d)}`;
}

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
          href="/"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          ホームへ
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

  const slots = totalSlots(game.innings, game.max_innings);
  const { top, bottom } = totals(game.innings);
  const live = game.status === "in_progress" && hasAnyScore(game.innings);
  const cur = currentInning(game.innings, game.max_innings);
  const meta = SPORT_META[game.sport];

  let pillText: string;
  let pillVariant: "live" | "done" | "scheduled";
  if (game.status === "completed") {
    pillText = "終了";
    pillVariant = "done";
  } else if (live) {
    pillText = `進行中 ${cur}回`;
    pillVariant = "live";
  } else {
    pillText = "予定";
    pillVariant = "scheduled";
  }

  async function handleSaveInning() {
    if (!game || editingInning === null) return;
    setSaving(true);
    setError(null);
    try {
      const nextInnings = setInning(game.innings, editingInning, localTop, localBottom);
      await updateInnings(game.id, nextInnings);
      track("inning_saved", { sport: game.sport, inning: editingInning });
      // advance edit cursor to next incomplete inning
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
          href="/"
          className="inline-flex items-center gap-0.5 px-1 py-1.5 text-sm font-medium text-brand"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
                onClick={() => {
                  setMenuOpen(false);
                  setModal("edit");
                }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-canvas"
              >
                試合情報を編集
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setModal("delete");
                }}
                className="block w-full border-t border-line px-4 py-3 text-left text-sm text-live hover:bg-canvas"
              >
                この試合を削除
              </button>
            </div>
          </>
        )}
      </header>

      <section className="bg-gradient-to-b from-brand to-brand-dark px-[18px] pt-3.5 pb-[18px] text-white">
        <div className="mb-3 flex items-center gap-2 text-[12px] opacity-95">
          <SportIcon sport={game.sport} size={14} />
          <span>{meta.label}</span>
          <span>·</span>
          <span>{formatMonthDay(game.date)}</span>
          {game.location && (
            <>
              <span>·</span>
              <span className="truncate">{game.location}</span>
            </>
          )}
        </div>

        <div className="mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="flex flex-col items-center text-center">
            <div className="text-[15px] font-semibold leading-tight">{game.team_top || "—"}</div>
            <div className="mt-0.5 text-[10px] opacity-85">先攻</div>
          </div>
          <div className="self-center text-[28px] font-light leading-none opacity-60">vs</div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[15px] font-semibold leading-tight">{game.team_bottom || "—"}</div>
            <div className="mt-0.5 text-[10px] opacity-85">後攻</div>
          </div>
        </div>

        <div className="-mt-0.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="text-center text-[56px] font-extrabold leading-none tabular-nums">
            {top}
          </div>
          <div className="text-center text-4xl font-light opacity-60">−</div>
          <div className="text-center text-[56px] font-extrabold leading-none tabular-nums">
            {bottom}
          </div>
        </div>

        <div className="mt-3.5 text-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
              pillVariant === "live"
                ? "bg-black/25"
                : pillVariant === "done"
                  ? "bg-white/20"
                  : "bg-black/20"
            }`}
          >
            {pillVariant === "live" && <span className="pulse-dot">●</span>}
            {pillText}
          </span>
        </div>
      </section>

      <div className="px-4 pt-3.5">
        <ScoreTable
          innings={game.innings}
          maxInnings={game.max_innings}
          slots={slots}
          editingInning={editingInning}
          teamTop={game.team_top}
          teamBottom={game.team_bottom}
          onPickInning={switchInning}
          totals={{ top, bottom }}
        />
      </div>

      <div className="mx-4 mt-3.5 rounded-2xl border border-line bg-card px-4 py-3.5">
        <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          >
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
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-3 text-sm font-bold text-white active:bg-brand-dark disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          className="rounded-xl border border-dashed border-line bg-transparent py-2.5 text-center text-[13px] text-ink-sub hover:border-brand hover:bg-card hover:text-brand"
        >
          ＋ イニングを追加
        </button>
        <button
          type="button"
          onClick={handleToggleStatus}
          className={
            game.status === "completed"
              ? "rounded-xl border border-line bg-card py-2.5 text-center text-[13px] font-semibold text-ink-sub hover:text-brand"
              : "rounded-xl border border-brand bg-card py-2.5 text-center text-[13px] font-semibold text-brand hover:bg-brand-light"
          }
        >
          {game.status === "completed" ? "↩ 試合を再開" : "🏁 試合を終了"}
        </button>
      </div>

      {modal === "share" && (
        <ShareModal game={game} onClose={() => setModal(null)} />
      )}
      {modal === "edit" && (
        <EditSheet game={game} onClose={() => setModal(null)} />
      )}
      {modal === "delete" && (
        <DeleteDialog
          game={game}
          onClose={() => setModal(null)}
          onDeleted={() => router.replace("/")}
        />
      )}
    </>
  );
}

function ScoreTable({
  innings,
  maxInnings,
  slots,
  editingInning,
  teamTop,
  teamBottom,
  onPickInning,
  totals,
}: {
  innings: Game["innings"];
  maxInnings: number;
  slots: number;
  editingInning: number;
  teamTop: string;
  teamBottom: string;
  onPickInning: (n: number) => void;
  totals: { top: number; bottom: number };
}) {
  const inningNumbers = Array.from({ length: slots }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <table className="w-full table-fixed border-separate border-spacing-0 text-center text-[13px] tabular-nums">
        <colgroup>
          <col style={{ width: 64 }} />
          {inningNumbers.map((n) => (
            <col key={n} />
          ))}
          <col style={{ width: 36 }} />
        </colgroup>
        <thead>
          <tr>
            <th className="border-b border-r border-line bg-canvas py-2 px-2 text-left text-[11px] font-semibold text-ink-sub">
              チーム
            </th>
            {inningNumbers.map((n) => (
              <th
                key={n}
                className={`border-b border-r border-line bg-canvas py-2 text-[11px] font-semibold text-ink-sub ${
                  n === editingInning
                    ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                    : n > maxInnings
                      ? "text-brand-dark"
                      : ""
                }`}
              >
                {n}
              </th>
            ))}
            <th className="border-b border-line bg-brand-light py-2 text-[11px] font-bold text-brand-dark">
              計
            </th>
          </tr>
        </thead>
        <tbody>
          <ScoreRow
            label={teamShort(teamTop)}
            innings={innings}
            slots={slots}
            getValue={(s) => s?.top}
            editingInning={editingInning}
            maxInnings={maxInnings}
            onPickInning={onPickInning}
            total={totals.top}
            isLast={false}
          />
          <ScoreRow
            label={teamShort(teamBottom)}
            innings={innings}
            slots={slots}
            getValue={(s) => s?.bottom}
            editingInning={editingInning}
            maxInnings={maxInnings}
            onPickInning={onPickInning}
            total={totals.bottom}
            isLast
          />
        </tbody>
      </table>
    </div>
  );
}

function ScoreRow({
  label,
  innings,
  slots,
  getValue,
  editingInning,
  maxInnings,
  onPickInning,
  total,
  isLast,
}: {
  label: string;
  innings: Game["innings"];
  slots: number;
  getValue: (s: Game["innings"][number] | undefined) => number | null | undefined;
  editingInning: number;
  maxInnings: number;
  onPickInning: (n: number) => void;
  total: number;
  isLast: boolean;
}) {
  const inningNumbers = Array.from({ length: slots }, (_, i) => i + 1);
  const bottomBorder = isLast ? "" : "border-b";
  return (
    <tr>
      <td
        className={`${bottomBorder} border-r-[1.5px] border-line bg-[#fafcfa] py-2 pl-2.5 text-left text-[12px] font-semibold`}
      >
        {label}
      </td>
      {inningNumbers.map((n) => {
        const slot = findInning(innings, n);
        const value = getValue(slot);
        const isActive = n === editingInning;
        const isExtra = n > maxInnings;
        return (
          <td
            key={n}
            onClick={() => onPickInning(n)}
            className={`${bottomBorder} cursor-pointer border-r border-line py-2 ${
              isActive
                ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                : isExtra
                  ? "bg-brand-light/50"
                  : "hover:bg-brand-light"
            } ${value == null ? "text-[#c9c9c9]" : ""}`}
          >
            {value == null ? "−" : value}
          </td>
        );
      })}
      <td
        className={`${bottomBorder} bg-brand-light py-2 font-bold text-brand-dark`}
      >
        {total}
      </td>
    </tr>
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
    <div className="flex items-center justify-between py-2">
      <div className="text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="ml-1 text-[11px] text-ink-sub">({side})</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-lg font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
          aria-label="-1"
        >
          −
        </button>
        <span className="min-w-7 text-center text-[22px] font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(99, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-lg font-bold leading-none text-brand active:bg-brand-light"
          aria-label="+1"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

function ShareModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(`${window.location.origin}/games/${game.id}`);
  }, [game.id]);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("qr_share_copy", { sport: game.sport });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const lineHref = url
    ? `https://line.me/R/msg/text/?${encodeURIComponent(`${game.team_top} vs ${game.team_bottom} のスコア共有\n${url}`)}`
    : "#";

  return (
    <div className="fixed inset-0 z-30 mx-auto w-full max-w-[480px] bg-black/50 p-4">
      <div className="absolute inset-x-4 top-6 bottom-4 overflow-y-auto rounded-2xl bg-card p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-base font-bold">試合をシェア</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-base text-ink-sub"
          >
            ×
          </button>
        </div>

        <div className="mb-3.5 rounded-xl bg-canvas px-3.5 py-3">
          <div className="mb-1 text-sm font-bold">
            {game.team_top} vs {game.team_bottom}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-sub">
            <SportIcon sport={game.sport} size={14} />
            <span>
              {formatMonthDay(game.date)}
              {game.location ? ` | ${game.location}` : ""}
            </span>
          </div>
        </div>

        <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-lg border border-line bg-white p-2">
          {url ? (
            <QRCodeCanvas
              value={url}
              size={200}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          ) : (
            <div className="h-[200px] w-[200px]" />
          )}
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1 truncate rounded-lg border border-line bg-canvas px-3 py-2.5 text-[12px] text-ink-sub">
            {url || "URL生成中…"}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!url}
            className="shrink-0 rounded-lg border border-brand bg-card px-3.5 text-[13px] font-semibold text-brand disabled:opacity-50"
          >
            {copied ? "コピー済" : "コピー"}
          </button>
        </div>

        <div className="mb-2.5">
          <a
            href={lineHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("qr_share_line", { sport: game.sport })}
            className="flex items-center justify-center gap-2 rounded-xl border border-line-green bg-line-green px-1.5 py-3.5 text-[14px] font-semibold text-white"
          >
            <svg viewBox="0 0 36 36" className="h-6 w-6">
              <path
                fill="#fff"
                d="M18 3C9.16 3 2 8.79 2 15.93c0 6.41 5.81 11.78 13.66 12.79.53.11 1.26.35 1.44.81.17.42.11 1.07.05 1.5l-.23 1.4c-.07.42-.33 1.63 1.42.89 1.75-.74 9.42-5.55 12.85-9.5h-.01C33.55 21.16 35 18.69 35 15.93 35 8.79 27.84 3 18 3z"
              />
              <path
                fill="#06c755"
                d="M14.06 12.66h-1.01a.28.28 0 0 0-.28.28v6.27c0 .15.13.28.28.28h1.01a.28.28 0 0 0 .28-.28v-6.27a.28.28 0 0 0-.28-.28zm6.94 0h-1a.28.28 0 0 0-.28.28v3.73l-2.87-3.88-.02-.03h-1.18a.28.28 0 0 0-.28.28v6.27c0 .15.13.28.28.28h1a.28.28 0 0 0 .28-.28v-3.73l2.88 3.89c.02.03.05.05.08.07h1.11a.28.28 0 0 0 .28-.28v-6.27a.28.28 0 0 0-.28-.28zm-9.4 5.27H8.85v-4.99a.28.28 0 0 0-.28-.28h-1a.28.28 0 0 0-.28.28v6.27c0 .07.03.14.08.19.05.05.12.08.2.08h4.03a.28.28 0 0 0 .28-.28v-1a.28.28 0 0 0-.28-.27zm15.74-3.7a.28.28 0 0 0 .28-.28v-1.01a.28.28 0 0 0-.28-.28h-4.03a.27.27 0 0 0-.19.08.28.28 0 0 0-.08.19v6.26c0 .07.03.14.08.19.05.05.12.08.19.08h4.03a.28.28 0 0 0 .28-.28v-1.01a.28.28 0 0 0-.28-.27h-2.74v-1.06h2.74a.28.28 0 0 0 .28-.28v-1a.28.28 0 0 0-.28-.28h-2.74v-1.06h2.74z"
              />
            </svg>
            LINEで送る
          </a>
        </div>

        <div className="mt-1.5 text-center text-[11px] text-ink-sub">
          URLを知っている人は誰でも閲覧・編集できます
        </div>
      </div>
    </div>
  );
}

function EditSheet({ game, onClose }: { game: Game; onClose: () => void }) {
  const [sport, setSport] = useState<Sport>(game.sport);
  const [date, setDate] = useState(game.date);
  const [maxInnings, setMaxInnings] = useState(game.max_innings);
  const [location, setLocation] = useState(game.location);
  const [teamTop, setTeamTop] = useState(game.team_top);
  const [teamBottom, setTeamBottom] = useState(game.team_bottom);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateGameMeta(game.id, {
        sport,
        date,
        max_innings: maxInnings,
        location: location.trim(),
        team_top: teamTop.trim(),
        team_bottom: teamBottom.trim(),
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-[480px] items-end justify-center bg-black/50">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-card px-[18px] pt-3.5 pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded bg-[#d4d4d4]" />
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-base font-bold">試合情報を編集</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-base text-ink-sub"
          >
            ×
          </button>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-sub">
            競技種別
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {SPORT_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={`rounded-xl border-2 px-1 pt-2.5 pb-2 text-center text-[11px] font-semibold ${
                  sport === s
                    ? "border-brand bg-brand-light text-brand-dark"
                    : "border-line bg-card text-ink"
                }`}
              >
                <SportIcon sport={s} size={28} className="mx-auto mb-0.5 block" />
                {SPORT_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
          <FieldGroup label="試合日">
            <SheetInput type="date" value={date} onChange={(v) => setDate(v)} />
          </FieldGroup>
          <FieldGroup label="回数(最大)">
            <InningsStepper value={maxInnings} onChange={setMaxInnings} />
          </FieldGroup>
        </div>

        <FieldGroup label="場所・グラウンド名">
          <SheetInput type="text" value={location} onChange={(v) => setLocation(v)} />
        </FieldGroup>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-sub">
            対戦チーム
          </label>
          <SheetTeamInput side="先攻" value={teamTop} onChange={setTeamTop} />
          <SheetTeamInput side="後攻" value={teamBottom} onChange={setTeamBottom} className="mt-2" />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-live/30 bg-live/5 px-3 py-2 text-xs text-live">
            保存に失敗しました: {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-1.5 block w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "保存中…" : "変更を保存"}
        </button>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-semibold text-ink-sub">{label}</label>
      {children}
    </div>
  );
}

function InningsStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const min = 1;
  const max = 9;
  const safe = Math.min(max, Math.max(min, value || min));
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-2 py-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, safe - 1))}
        disabled={safe <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-base font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
        aria-label="-1"
      >
        −
      </button>
      <span className="text-[18px] font-bold tabular-nums">{safe}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, safe + 1))}
        disabled={safe >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-base font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
        aria-label="+1"
      >
        ＋
      </button>
    </div>
  );
}

function SheetInput({
  type,
  value,
  onChange,
}: {
  type: "text" | "date" | "number";
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-line bg-canvas px-3 py-2.5 text-[15px] outline-none focus:border-brand focus:bg-card focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
    />
  );
}

function SheetTeamInput({
  side,
  value,
  onChange,
  className,
}: {
  side: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-xl border border-line bg-canvas py-0.5 pr-1.5 pl-3 ${className ?? ""}`}
    >
      <span className="mr-2 shrink-0 rounded bg-brand-light px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">
        {side}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-none bg-transparent py-2.5 text-[15px] outline-none"
      />
    </div>
  );
}

function DeleteDialog({
  game,
  onClose,
  onDeleted,
}: {
  game: Game;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteGame(game.id);
      track("game_deleted", { sport: game.sport });
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-[480px] items-center justify-center bg-black/50 p-5">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative w-full max-w-80 rounded-2xl bg-card px-5 pt-5 pb-4 text-center">
        <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecea] text-live">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <div className="mb-2 text-[17px] font-bold">この試合を削除しますか?</div>
        <div className="mb-4 text-[13px] leading-relaxed text-ink-sub">
          <strong className="text-ink">
            {game.team_top} vs {game.team_bottom}
          </strong>
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
