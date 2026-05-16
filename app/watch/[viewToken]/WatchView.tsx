"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SportIcon } from "@/app/_components/SportIcon";
import { formatGameDate } from "@/lib/dates";
import {
  currentInning,
  findInning,
  hasAnyScore,
  totalSlots,
  totals,
  watchGameByViewToken,
} from "@/lib/games";
import { SPORT_META } from "@/lib/sports";
import type { Game, InningScore } from "@/lib/types";

function teamShort(name: string): string {
  if (!name) return "—";
  return name.length > 8 ? name.slice(0, 8) + "…" : name;
}

export function WatchView({ viewToken }: { viewToken: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const unsub = watchGameByViewToken(viewToken, (g) => {
      if (!g) setNotFound(true);
      else setGame(g);
    });
    return unsub;
  }, [viewToken]);

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 text-3xl">🔎</div>
        <div className="mb-2 text-base font-semibold">試合が見つかりません</div>
        <div className="mb-6 text-sm text-ink-sub">
          URLが正しいか、試合が削除されていないか確認してください。
        </div>
        <Link
          href="/"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          スコアボのトップへ
        </Link>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-sub">
        読み込み中…
      </div>
    );
  }

  const { top, bottom } = totals(game.innings);
  const slots = totalSlots(game.innings, game.max_innings);
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

  const inningNumbers = Array.from({ length: slots }, (_, i) => i + 1);

  const rows: {
    key: string;
    label: string;
    getValue: (s: InningScore | undefined) => number | null | undefined;
    total: number;
    isLast: boolean;
  }[] = [
    {
      key: "top",
      label: game.team_top || "—",
      getValue: (s) => s?.top,
      total: top,
      isLast: false,
    },
    {
      key: "bottom",
      label: game.team_bottom || "—",
      getValue: (s) => s?.bottom,
      total: bottom,
      isLast: true,
    },
  ];

  if (highContrast && game) {
    const { top, bottom } = totals(game.innings);
    const live = game.status === "in_progress" && hasAnyScore(game.innings);
    const cur = currentInning(game.innings, game.max_innings);
    let hcPill = game.status === "completed" ? "終了" : live ? `進行中 ${cur}回` : "予定";
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 text-black">
        <button
          type="button"
          onClick={() => setHighContrast(false)}
          className="absolute top-3 right-3 rounded-full border border-black/20 bg-white px-3 py-1.5 text-[12px] font-semibold text-black/60"
        >
          通常表示
        </button>
        <div className="mb-2 text-[18px] font-bold">
          {game.team_top} <span className="font-normal text-black/40">vs</span> {game.team_bottom}
        </div>
        <div className="flex items-baseline gap-4">
          <span className="text-[120px] font-black leading-none tabular-nums">{top}</span>
          <span className="text-[48px] font-light text-black/30">−</span>
          <span className="text-[120px] font-black leading-none tabular-nums">{bottom}</span>
        </div>
        <div className="mt-3 text-[20px] font-semibold text-black/60">{hcPill}</div>
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-line bg-card px-3.5 py-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-brand"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
            <polygon
              points="12,5 19,12 12,19 5,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <polygon points="12,2.4 13.7,4.1 12,5.8 10.3,4.1" fill="currentColor" />
            <polygon points="21.6,12 19.9,13.7 18.2,12 19.9,10.3" fill="currentColor" />
            <polygon points="12,21.6 13.7,19.9 12,18.2 10.3,19.9" fill="currentColor" />
            <polygon points="2.4,12 4.1,13.7 5.8,12 4.1,10.3" fill="currentColor" />
            <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          </svg>
          スコアボ
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHighContrast(true)}
            title="屋外モード（高コントラスト）"
            className="flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 text-[12px] font-semibold text-ink-sub active:bg-brand-light"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            屋外
          </button>
          <div className="text-[12px] text-ink-sub">観戦ページ</div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-brand to-brand-dark px-[18px] pt-3.5 pb-[18px] landscape:py-3 landscape:px-4 text-white">
        <div className="landscape:hidden">
        <div className="mb-3 flex items-center gap-2 text-[12px] opacity-95">
          <SportIcon sport={game.sport} size={14} />
          <span>{meta.label}</span>
          <span>·</span>
          <span>{formatGameDate(game.date)}</span>
          {game.location && (
            <>
              <span>·</span>
              <span className="truncate">{game.location}</span>
            </>
          )}
        </div>

        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{game.team_top || "—"}</div>
            <div className="mt-0.5 text-[11px] opacity-90">先攻</div>
          </div>
          <div className="self-center text-[28px] font-light leading-none opacity-50">vs</div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{game.team_bottom || "—"}</div>
            <div className="mt-0.5 text-[11px] opacity-90">後攻</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
            {top}
          </div>
          <div className="text-center text-4xl font-light opacity-50">−</div>
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
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
        </div>
        <div className="hidden landscape:flex items-center gap-4 py-0.5">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] opacity-75">先攻</div>
            <div className="truncate text-[15px] font-bold leading-tight">{game.team_top || "—"}</div>
          </div>
          <div className="flex shrink-0 items-center gap-3 tabular-nums">
            <span className="text-[48px] font-extrabold leading-none drop-shadow-sm">{top}</span>
            <span className="text-xl font-light opacity-50">−</span>
            <span className="text-[48px] font-extrabold leading-none drop-shadow-sm">{bottom}</span>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <div className="text-[11px] opacity-75">後攻</div>
            <div className="truncate text-[15px] font-bold leading-tight">{game.team_bottom || "—"}</div>
          </div>
          <span
            className={`ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full table-fixed border-separate border-spacing-0 text-center text-[13px] tabular-nums">
            <colgroup>
              <col style={{ width: 88 }} />
              {inningNumbers.map((n) => (
                <col key={n} />
              ))}
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-line bg-canvas py-2.5 px-2 text-left text-[12px] font-semibold text-ink-sub">
                  チーム
                </th>
                {inningNumbers.map((n) => (
                  <th
                    key={n}
                    className={`border-b border-r border-line bg-canvas py-2.5 text-[12px] font-semibold text-ink-sub ${
                      n === cur && live
                        ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                        : n > game.max_innings
                          ? "text-brand-dark"
                          : ""
                    }`}
                  >
                    {n}
                  </th>
                ))}
                <th className="border-b border-line bg-brand-light py-2.5 text-[12px] font-bold text-brand-dark">
                  計
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ key, label, getValue, total, isLast }) => (
                <tr key={key}>
                  <td
                    className={`${isLast ? "" : "border-b"} border-r-[1.5px] border-line bg-[#fafcfa] py-2.5 pl-2.5 text-left text-[13px] font-semibold`}
                  >
                    {teamShort(label)}
                  </td>
                  {inningNumbers.map((n) => {
                    const slot = findInning(game.innings, n);
                    const value = getValue(slot);
                    const isExtra = n > game.max_innings;
                    return (
                      <td
                        key={n}
                        className={`${isLast ? "" : "border-b"} border-r border-line py-2.5 text-[14px] ${
                          n === cur && live
                            ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                            : isExtra
                              ? "bg-brand-light/50"
                              : ""
                        } ${value == null ? "text-[#c9c9c9]" : ""}`}
                      >
                        {value == null ? "−" : value}
                      </td>
                    );
                  })}
                  <td
                    className={`${isLast ? "" : "border-b"} bg-brand-light py-2.5 text-[14px] font-bold text-brand-dark`}
                  >
                    {total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mx-4 mt-5 mb-6 rounded-2xl border border-line bg-card px-4 py-4 text-center">
        <div className="mb-1.5 text-[13px] font-semibold text-ink">
          あなたの試合もリアルタイムで共有できます
        </div>
        <div className="mb-3 text-[12px] text-ink-sub">
          アカウント不要・完全無料。30秒でスコアボードを作れます。
        </div>
        <Link
          href="/games/new"
          className="inline-block rounded-xl bg-brand px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.2)]"
        >
          試合を作る（無料）
        </Link>
      </div>
    </>
  );
}
