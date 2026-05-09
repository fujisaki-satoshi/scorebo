"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { BrandMark } from "@/app/_components/BrandMark";
import { SportIcon } from "@/app/_components/SportIcon";
import { formatGameDate } from "@/lib/dates";
import {
  currentInning,
  hasAnyScore,
  listGames,
  totals,
} from "@/lib/games";
import { SPORT_META, SPORT_ORDER } from "@/lib/sports";
import type { Game, Sport } from "@/lib/types";

type SportFilter = Sport | "all";

export function GamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [last, setLast] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listGames();
        if (!alive) return;
        setGames(res.games);
        setLast(res.last);
        setHasMore(res.hasMore);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function loadMore() {
    if (!last || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await listGames(last);
      setGames((g) => [...g, ...res.games]);
      setLast(res.last);
      setHasMore(res.hasMore);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }

  const { live, recent } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = games.filter((g) => {
      if (sportFilter !== "all" && g.sport !== sportFilter) return false;
      if (!term) return true;
      return [g.team_top, g.team_bottom, g.location]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term));
    });
    const live: Game[] = [];
    const recent: Game[] = [];
    for (const g of filtered) {
      if (g.status === "in_progress" && hasAnyScore(g.innings)) {
        live.push(g);
      } else {
        recent.push(g);
      }
    }
    return { live, recent };
  }, [games, search, sportFilter]);

  return (
    <>
      <header className="bg-brand px-[18px] pt-6 pb-[18px] text-white">
        <div className="mb-[18px] flex items-center justify-between gap-2.5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="スコアボのトップへ">
            <BrandMark size={36} />
            <div>
              <div className="text-[20px] font-bold leading-[1.1] tracking-[0.04em]">スコアボ</div>
              <div className="mt-0.5 text-[9px] tracking-[0.18em] opacity-85">
                SCORE SHARING APP
              </div>
            </div>
          </Link>
          <Link
            href="/help"
            aria-label="使い方ガイド"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-semibold text-white active:bg-white/25"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            使い方
          </Link>
        </div>

        <label className="mb-3 flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink-sub opacity-60"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="チーム名・場所で検索…"
            className="flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-sub"
          />
        </label>

        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={sportFilter === "all"}
            onClick={() => setSportFilter("all")}
            label="すべて"
          />
          {SPORT_ORDER.map((s) => (
            <FilterChip
              key={s}
              active={sportFilter === s}
              onClick={() => setSportFilter(s)}
              label={SPORT_META[s].label}
              icon={<SportIcon sport={s} size={14} />}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pt-[18px] pb-[110px]">
        {error && (
          <div className="mb-4 rounded-lg border border-live/30 bg-live/5 px-3 py-2 text-xs text-live">
            読み込みエラー: {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-ink-sub">読み込み中…</div>
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {live.length > 0 && (
              <section className="mb-5">
                <SectionHead variant="live" label="進行中の試合" />
                {live.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </section>
            )}

            <section className="mb-5">
              <SectionHead variant="recent" label="最近の試合" />
              {recent.length === 0 ? (
                <div className="rounded-2xl border border-line bg-card px-4 py-6 text-center text-xs text-ink-sub">
                  該当する試合はありません
                </div>
              ) : (
                recent.map((g) => <GameCard key={g.id} game={g} />)
              )}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mx-auto mt-2 block rounded-full border border-line bg-transparent px-5 py-2 text-[13px] font-semibold text-brand disabled:opacity-50"
                >
                  {loadingMore ? "読み込み中…" : "もっと見る"}
                </button>
              )}
            </section>
          </>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[480px] bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-4 pt-3 pb-[18px]">
        <Link
          href="/games/new"
          className="pointer-events-auto block w-full rounded-2xl bg-brand py-4 text-center text-base font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.3)] active:bg-brand-dark"
        >
          ＋ 試合を作成する
        </Link>
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-[13px] font-medium ${
        active ? "bg-white text-brand-dark" : "bg-white/20 text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHead({ variant, label }: { variant: "live" | "recent"; label: string }) {
  return (
    <div className="mx-1 mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-sub">
      {variant === "live" ? (
        <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-live" />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const live = game.status === "in_progress" && hasAnyScore(game.innings);
  const cur = currentInning(game.innings, game.max_innings);
  const { top, bottom } = totals(game.innings);
  const meta = SPORT_META[game.sport];

  let statusText: string;
  if (live) {
    statusText = `${formatGameDate(game.date)} 進行中・${cur}回`;
  } else if (game.status === "completed") {
    statusText = `${formatGameDate(game.date)} 終了`;
  } else {
    statusText = `${formatGameDate(game.date)} 予定`;
  }

  return (
    <Link
      href={`/games/${game.id}`}
      className="mb-2.5 block rounded-2xl border border-line bg-card px-4 py-3.5 active:bg-brand-light"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-semibold text-brand-dark">
          <SportIcon sport={game.sport} size={14} />
          {meta.label}
        </span>
        <span
          className={`flex items-center gap-1 text-[11px] ${
            live ? "font-semibold text-live" : "text-ink-sub"
          }`}
        >
          {live && <span className="pulse-dot text-live">●</span>}
          {statusText}
        </span>
      </div>
      {game.location && (
        <div className="mb-2.5 flex items-center gap-1 text-[12px] text-ink-sub">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">{game.location}</span>
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">{game.team_top || "—"}</span>
          <span className="mt-0.5 text-[10px] text-ink-sub">先攻</span>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-brand">
          <span>{top}</span>
          <span className="font-normal text-ink-sub">−</span>
          <span>{bottom}</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-sm font-medium leading-tight">{game.team_bottom || "—"}</span>
          <span className="mt-0.5 text-[10px] text-ink-sub">後攻</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
      <div className="mb-3 text-3xl" aria-hidden="true">⚾️</div>
      <div className="mb-1 text-sm font-semibold text-ink">まだ試合がありません</div>
      <div className="text-[12px] text-ink-sub">
        下のボタンから最初の試合を作成しましょう。
      </div>
    </div>
  );
}
