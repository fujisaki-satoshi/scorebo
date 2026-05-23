"use client";

import Link from "next/link";
import { useState } from "react";
import { YearTimelineGate } from "@/app/_components/YearTimelineGate";

export default function TimelinePage() {
  const [gateOpen, setGateOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Timeline content preview (blurred behind gate) */}
      <div
        className={`transition-all duration-300 ${gateOpen ? "pointer-events-none opacity-35 blur-sm" : ""}`}
      >
        <header className="bg-brand px-5 pt-6 pb-5 text-white">
          <Link href="/games" className="mb-4 flex items-center gap-1 text-[13px] text-white/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            試合一覧
          </Link>
          <h1 className="font-serif text-[24px] font-bold leading-[1.3]">
            シーズン年表
          </h1>
          <p className="mt-1 text-[12px] text-white/75">2026 シーズン</p>
        </header>

        <main className="px-5 py-6">
          <div className="rounded-2xl border border-dashed border-line bg-card px-5 py-12 text-center">
            <p className="mb-2 text-[16px] font-bold text-ink">年表機能は準備中</p>
            <p className="text-[12px] text-ink-sub">
              シーズンを通じた試合記録の年表表示は
              <br />
              次フェーズでリリース予定です。
            </p>
          </div>
        </main>
      </div>

      {/* Tier 3 soft gate */}
      {gateOpen && <YearTimelineGate onDismiss={() => setGateOpen(false)} />}
    </div>
  );
}
