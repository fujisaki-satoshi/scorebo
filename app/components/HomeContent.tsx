"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Game, Inning, Sport } from "@/lib/types";
import SportIcon from "./SportIcon";

type SportFilter = Sport | "all";

const SPORT_OPTIONS: { value: SportFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "softball", label: "ソフトボール" },
  { value: "baseball", label: "野球" },
  { value: "kickball", label: "キックベース" },
];

export default function HomeContent() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");

  useEffect(() => {
    const q = query(
      collection(db, "games"),
      orderBy("created_at", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Game[] = snap.docs.map((d) => {
          const data = d.data() as Omit<Game, "id">;
          return { ...data, id: d.id };
        });
        setGames(next);
        setError(null);
      },
      (err) => {
        console.error("Failed to subscribe to games", err);
        setError("試合データの読み込みに失敗しました");
        setGames([]);
      },
    );
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    if (!games) return null;
    const term = search.trim().toLowerCase();
    return games.filter((g) => {
      if (sportFilter !== "all" && g.sport !== sportFilter) return false;
      if (!term) return true;
      const hay = [g.team_top, g.team_bottom, g.location ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [games, search, sportFilter]);

  const live = filtered?.filter((g) => g.status === "live") ?? [];
  const others = filtered?.filter((g) => g.status !== "live") ?? [];
  const isLoading = games === null;
  const isEmpty =
    !isLoading && live.length === 0 && others.length === 0 && !error;

  return (
    <>
      <div className="bg-[#1a7a35] px-4 pb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="チーム名・場所で検索"
          className="w-full rounded-full bg-white px-4 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SPORT_OPTIONS.map((opt) => {
            const active = sportFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSportFilter(opt.value)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-white text-[#1a7a35]"
                    : "border border-white/40 bg-white/10 text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 py-4">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="py-8 text-center text-sm text-zinc-500">読み込み中…</p>
        )}

        {isEmpty && <EmptyState />}

        {!isLoading && !isEmpty && (
          <div className="flex flex-col gap-6">
            {live.length > 0 && (
              <Section title="進行中">
                {live.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </Section>
            )}
            {others.length > 0 && (
              <Section title="最近の試合">
                {others.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </Section>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  const topScore = sumSide(game.innings, "top");
  const bottomScore = sumSide(game.innings, "bottom");
  return (
    <Link
      href={`/games/${game.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition active:scale-[0.99] hover:shadow"
    >
      <div className="flex items-center gap-3">
        <SportIcon sport={game.sport} size={32} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
            {game.status === "live" && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                LIVE
              </span>
            )}
            <span>{formatDate(game.date)}</span>
            {game.location && (
              <span className="truncate">{game.location}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800">
                {game.team_top || "—"}
              </p>
              <p className="truncate text-sm font-medium text-zinc-800">
                {game.team_bottom || "—"}
              </p>
            </div>
            <div className="text-right tabular-nums leading-tight">
              <p className="text-2xl font-bold text-[#1a7a35]">{topScore}</p>
              <p className="text-2xl font-bold text-[#1a7a35]">{bottomScore}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-sm leading-relaxed text-zinc-600">
        まだ試合がありません。
        <br />
        最初の試合を作成しましょう
      </p>
      <Link
        href="/games/new"
        className="rounded-full bg-[#1a7a35] px-5 py-2 text-sm font-semibold text-white shadow-sm"
      >
        試合を作成
      </Link>
    </div>
  );
}

function sumSide(innings: Inning[] | undefined, side: "top" | "bottom"): number {
  if (!innings) return 0;
  return innings.reduce((acc, i) => acc + (i[side] ?? 0), 0);
}

function formatDate(date: Game["date"]): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString("ja-JP");
  }
  return "";
}
