"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SportIcon } from "@/app/_components/SportIcon";
import { track } from "@/lib/analytics";
import { createGame } from "@/lib/games";
import { checkCreateRateLimit, RateLimitError, recordCreate } from "@/lib/rate-limit";
import { SPORT_META, SPORT_ORDER } from "@/lib/sports";
import type { Sport } from "@/lib/types";

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function NewGamePage() {
  const router = useRouter();
  const [sport, setSport] = useState<Sport>("baseball");
  const [date, setDate] = useState(todayISO());
  const [maxInnings, setMaxInnings] = useState(SPORT_META.baseball.defaultMaxInnings);
  const [maxInningsTouched, setMaxInningsTouched] = useState(false);
  const [location, setLocation] = useState("");
  const [teamTop, setTeamTop] = useState("");
  const [teamBottom, setTeamBottom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSportChange(s: Sport) {
    setSport(s);
    if (!maxInningsTouched) {
      setMaxInnings(SPORT_META[s].defaultMaxInnings);
    }
  }

  const canSubmit =
    !!sport && !!date && !!maxInnings && !!teamTop.trim() && !!teamBottom.trim() && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      checkCreateRateLimit();
      const id = await createGame({
        sport,
        date,
        max_innings: maxInnings,
        location: location.trim(),
        team_top: teamTop.trim(),
        team_bottom: teamBottom.trim(),
      });
      recordCreate();
      track("game_created", { sport, max_innings: maxInnings });
      router.push(`/games/${id}`);
    } catch (e) {
      setError(
        e instanceof RateLimitError ? e.message : (e as Error).message,
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="flex items-center gap-2.5 border-b border-line bg-card px-4 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-1 px-1 py-1 text-sm font-medium text-brand"
          aria-label="戻る"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          もどる
        </Link>
        <div className="ml-2 text-base font-semibold">試合を作成</div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 pt-[18px] pb-8">
        <FieldCard label="競技種別" required>
          <div className="grid grid-cols-3 gap-2.5">
            {SPORT_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSportChange(s)}
                className={`rounded-xl border-2 px-1 pt-3.5 pb-2.5 text-center text-[13px] font-semibold ${
                  sport === s
                    ? "border-brand bg-brand-light text-brand-dark"
                    : "border-line bg-card text-ink"
                }`}
              >
                <SportIcon sport={s} size={40} className="mx-auto mb-1 block" />
                {SPORT_META[s].label}
              </button>
            ))}
          </div>
        </FieldCard>

        <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
          <FieldCard label="試合日" required>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full appearance-none rounded-xl border border-line bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-brand focus:bg-card focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
            />
          </FieldCard>
          <FieldCard label="回数(最大)">
            <InningsStepper
              value={maxInnings}
              onChange={(n) => {
                setMaxInnings(n);
                setMaxInningsTouched(true);
              }}
            />
          </FieldCard>
        </div>

        <FieldCard label="場所・グラウンド名">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 福井県営球場 第2グラウンド"
            className="w-full appearance-none rounded-xl border border-line bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-brand focus:bg-card focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
          />
        </FieldCard>

        <FieldCard label="対戦チーム" required>
          <TeamInput side="先攻" value={teamTop} onChange={setTeamTop} placeholder="先攻チーム名" />
          <TeamInput
            side="後攻"
            value={teamBottom}
            onChange={setTeamBottom}
            placeholder="後攻チーム名"
            className="mt-2"
          />
          <div className="mt-2 text-[11px] leading-relaxed text-ink-sub">
            スコア表で上段が先攻、下段が後攻になります。
          </div>
        </FieldCard>

        {error && (
          <div className="mt-3 rounded-lg border border-live/30 bg-live/5 px-3 py-2 text-xs text-live">
            作成に失敗しました: {error}
          </div>
        )}

        <div className="mt-5">
          <button
            type="submit"
            disabled={!canSubmit}
            className="block w-full rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.25)] active:bg-brand-dark disabled:opacity-50"
          >
            {submitting ? "作成中…" : "試合を作成して共有する"}
          </button>
        </div>
      </form>
    </>
  );
}

function FieldCard({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 rounded-2xl border border-line bg-card px-4 py-3.5">
      <div className="mb-2.5 text-[12px] font-semibold tracking-[0.04em] text-ink-sub">
        {label}
        {required && <span className="ml-0.5 text-[#c0392b]">*</span>}
      </div>
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
    <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-2 py-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, safe - 1))}
        disabled={safe <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-lg font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
        aria-label="-1"
      >
        −
      </button>
      <span className="text-[20px] font-bold tabular-nums">{safe}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, safe + 1))}
        disabled={safe >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-brand bg-card text-lg font-bold leading-none text-brand active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]"
        aria-label="+1"
      >
        ＋
      </button>
    </div>
  );
}

function TeamInput({
  side,
  value,
  onChange,
  placeholder,
  className,
}: {
  side: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-xl border border-line bg-canvas py-1 pr-2 pl-3 focus-within:border-brand focus-within:bg-card focus-within:shadow-[0_0_0_3px_var(--color-brand-light)] ${className ?? ""}`}
    >
      <span className="mr-2.5 shrink-0 rounded-md bg-brand-light px-2 py-1 text-[11px] font-bold text-brand-dark">
        {side}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent py-2.5 text-base outline-none"
      />
    </div>
  );
}
