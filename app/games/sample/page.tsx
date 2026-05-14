import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サンプル試合 — スコアボ",
  description: "スコアボのサンプル試合です。実際の観戦画面を体験できます。",
  robots: { index: false },
};

const SAMPLE = {
  teamTop: "さくら打線",
  teamBottom: "グリーンズ",
  date: "5月14日(水)",
  location: "市営野球場",
  innings: [
    { n: 1, top: 0, bottom: 2 },
    { n: 2, top: 3, bottom: 0 },
    { n: 3, top: 0, bottom: 1 },
    { n: 4, top: 2, bottom: 0 },
    { n: 5, top: 1, bottom: 0 },
  ],
  maxInnings: 7,
  totalTop: 6,
  totalBottom: 3,
  currentInning: 6,
};

export default function SamplePage() {
  const slots = SAMPLE.maxInnings;
  const inningNums = Array.from({ length: slots }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen flex-col">
      {/* サンプルバナー */}
      <div className="flex items-center justify-between bg-accent px-4 py-2.5">
        <span className="text-[13px] font-bold text-[#1a1a1a]">
          これはサンプルです — 実際の観戦画面を体験中
        </span>
        <Link
          href="/"
          className="shrink-0 rounded-full bg-[#1a1a1a]/10 px-3 py-1 text-[12px] font-semibold text-[#1a1a1a]"
        >
          閉じる
        </Link>
      </div>

      {/* ヘッダー */}
      <header className="flex items-center gap-1.5 border-b border-line bg-card px-3.5 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-0.5 px-1 py-1.5 text-sm font-medium text-brand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          トップ
        </Link>
        <div className="ml-1 flex-1 text-base font-semibold">スコア</div>
        <div className="inline-flex items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-[13px] font-semibold text-brand-dark opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          共有
        </div>
      </header>

      {/* スコアヘッダー */}
      <section className="bg-gradient-to-b from-brand to-brand-dark px-[18px] pt-3.5 pb-[18px] text-white">
        <div className="mb-2 flex items-center gap-2 text-[12px] opacity-95">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span>野球</span>
          <span>·</span>
          <span>{SAMPLE.date}</span>
          <span>·</span>
          <span>{SAMPLE.location}</span>
        </div>

        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{SAMPLE.teamTop}</div>
            <div className="mt-0.5 text-[11px] opacity-90">先攻</div>
          </div>
          <div className="self-center text-[28px] font-light leading-none opacity-50">vs</div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{SAMPLE.teamBottom}</div>
            <div className="mt-0.5 text-[11px] opacity-90">後攻</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
            {SAMPLE.totalTop}
          </div>
          <div className="text-center text-4xl font-light opacity-50">−</div>
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
            {SAMPLE.totalBottom}
          </div>
        </div>

        <div className="mt-3.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[12px] font-semibold">
            <span className="pulse-dot">●</span>
            進行中 {SAMPLE.currentInning}回
          </span>
        </div>
      </section>

      {/* スコアテーブル */}
      <div className="px-4 pt-3.5">
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full table-fixed border-separate border-spacing-0 text-center text-[14px] tabular-nums">
            <colgroup>
              <col style={{ width: 64 }} />
              {inningNums.map((n) => <col key={n} />)}
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-line bg-canvas py-2.5 px-2 text-left text-[12px] font-semibold text-ink-sub">チーム</th>
                {inningNums.map((n) => (
                  <th key={n} className={`border-b border-r border-line bg-canvas py-2.5 text-[12px] font-semibold text-ink-sub ${n === SAMPLE.currentInning ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]" : ""}`}>
                    {n}
                  </th>
                ))}
                <th className="border-b border-line bg-brand-light py-2.5 text-[12px] font-bold text-brand-dark">計</th>
              </tr>
            </thead>
            <tbody>
              <SampleRow
                label={SAMPLE.teamTop}
                innings={SAMPLE.innings}
                getValue={(s) => s.top}
                currentInning={SAMPLE.currentInning}
                slots={slots}
                total={SAMPLE.totalTop}
                isLast={false}
              />
              <SampleRow
                label={SAMPLE.teamBottom}
                innings={SAMPLE.innings}
                getValue={(s) => s.bottom}
                currentInning={SAMPLE.currentInning}
                slots={slots}
                total={SAMPLE.totalBottom}
                isLast
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-4 mt-6 rounded-2xl border border-line bg-card px-4 py-5 text-center">
        <div className="mb-1 text-[15px] font-bold text-ink">あなたの試合をシェアしよう</div>
        <div className="mb-4 text-[13px] leading-[1.7] text-ink-sub">
          30秒で試合を作成。QRコードを見せるだけで<br />
          保護者・観客がリアルタイムで観戦できます。
        </div>
        <Link
          href="/games/new"
          className="block w-full rounded-xl bg-brand py-4 text-[15px] font-bold text-white active:bg-brand-dark"
        >
          ＋ 無料で試合を作成する
        </Link>
        <div className="mt-2 text-[11px] text-ink-sub">アカウント不要・完全無料</div>
      </div>

      <div className="mb-8" />
    </div>
  );
}

function SampleRow({
  label,
  innings,
  getValue,
  currentInning,
  slots,
  total,
  isLast,
}: {
  label: string;
  innings: typeof SAMPLE.innings;
  getValue: (s: (typeof SAMPLE.innings)[number]) => number;
  currentInning: number;
  slots: number;
  total: number;
  isLast: boolean;
}) {
  const shortLabel = label.length > 5 ? label.slice(0, 5) + "…" : label;
  const border = isLast ? "" : "border-b";
  return (
    <tr>
      <td className={`${border} border-r-[1.5px] border-line bg-[#fafcfa] py-2.5 pl-2.5 text-left text-[13px] font-semibold`}>
        {shortLabel}
      </td>
      {Array.from({ length: slots }, (_, i) => i + 1).map((n) => {
        const slot = innings.find((s) => s.n === n);
        const isActive = n === currentInning;
        return (
          <td
            key={n}
            className={`${border} border-r border-line py-2.5 ${isActive ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]" : ""} ${!slot ? "text-[#c9c9c9]" : ""}`}
          >
            {slot ? getValue(slot) : "−"}
          </td>
        );
      })}
      <td className={`${border} bg-brand-light py-2.5 text-[14px] font-bold text-brand-dark`}>
        {total}
      </td>
    </tr>
  );
}
