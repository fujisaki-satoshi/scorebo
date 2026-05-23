"use client";

import Link from "next/link";
import { useState } from "react";

type RestoreResult = {
  gameCount: number;
  memoryQuote: { text: string; date: string; location: string } | null;
};

export default function KeyRestoreDonePage() {
  const [result] = useState<RestoreResult | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("scorebo:restore_result");
    sessionStorage.removeItem("scorebo:restore_result");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RestoreResult;
    } catch {
      return null;
    }
  });

  const gameCount = result?.gameCount ?? 0;
  const memoryQuote = result?.memoryQuote ?? null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12 text-center">
      {/* Stamp */}
      <div
        className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-brand-light text-[40px] font-sans font-bold text-brand"
        style={{ transform: "rotate(-6deg)" }}
        aria-hidden="true"
      >
        ✓
      </div>

      <h1 className="mb-3 font-sans text-[28px] font-bold leading-[1.3] text-ink">
        おかえりなさい、
        <br />
        あなたの記録へ。
      </h1>
      <p className="mb-8 text-[13px] text-ink-sub">
        あなたの記録を、すべて戻しました。
      </p>

      {/* Stats card */}
      {gameCount > 0 && (
        <div className="mb-6 w-full max-w-[320px] rounded-xl border border-line bg-white p-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="text-center">
              <p className="font-mono text-[11px] tracking-[0.1em] text-ink-sub">試合数</p>
              <p className="font-sans text-[28px] font-bold text-brand">{gameCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Memory quote */}
      {memoryQuote && (
        <div className="mb-8 w-full max-w-[320px] rounded-xl border border-line bg-brand-light px-4 py-3">
          <p className="mb-1 font-sans text-[14px] italic text-ink">&ldquo;{memoryQuote.text}&rdquo;</p>
          <p className="font-mono text-[11px] text-ink-sub">
            {memoryQuote.date}
            {memoryQuote.location ? ` · ${memoryQuote.location}` : ""}
          </p>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/games"
        className="block w-full max-w-[320px] rounded-xl bg-brand py-3.5 text-center text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.25)]"
      >
        記録を見にいく
      </Link>
    </div>
  );
}
