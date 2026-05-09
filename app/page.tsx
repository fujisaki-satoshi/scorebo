import Link from "next/link";
import type { Metadata } from "next";

import { BrandMark } from "@/app/_components/BrandMark";
import { SportIcon } from "@/app/_components/SportIcon";

const SITE_DESC =
  "野球・ソフトボール・キックベースのスコアをスマホで記録し、QRコードを見せるだけでチーム全員にリアルタイム共有できる無料Webアプリ。アカウント登録不要・完全無料・インストール不要。";

export const metadata: Metadata = {
  title: "スコアボ — QRひとつで試合スコアをチーム全員に共有",
  description: SITE_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "スコアボ — QRひとつで試合スコアをチーム全員に共有",
    description: SITE_DESC,
    url: "/",
    siteName: "スコアボ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "スコアボ — QRひとつで試合スコアをチーム全員に共有",
    description: SITE_DESC,
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <UseCases />
      <HowToUse />
      <ScreenStrip />
      <Features />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark px-[22px] pt-7 pb-9 text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-[200px] w-[200px] rounded-full bg-white/[0.05]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-[140px] w-[140px] rounded-full bg-white/[0.04]"
      />

      <div className="relative z-[1] mb-7 flex items-center gap-2.5">
        <BrandMark size={36} />
        <div>
          <div className="text-[20px] font-bold leading-[1.1] tracking-[0.04em]">
            スコアボ
          </div>
          <div className="mt-0.5 text-[9px] tracking-[0.18em] opacity-85">
            SCORE SHARING APP
          </div>
        </div>
      </div>

      <h1 className="relative z-[1] mb-4 text-[28px] font-extrabold leading-[1.35] tracking-[0.01em]">
        QRひとつで、
        <br />
        試合のスコアを
        <br />
        <span className="inline-block rounded bg-accent px-1.5 text-[#1a1a1a]">
          チーム全員に共有
        </span>
      </h1>

      <p className="relative z-[1] mb-6 text-[14px] leading-[1.7] opacity-95">
        野球・ソフトボール・キックベースのスコアをスマホで記録。
        <br />
        QRコードを見せるだけで、応援団も家族も
        <br />
        リアルタイムで観戦できます。
      </p>

      <Link
        href="/games/new"
        className="relative z-[1] mb-2.5 block w-full rounded-2xl bg-white py-4 text-center text-base font-extrabold text-brand-dark shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:bg-white/90"
      >
        ＋ 無料で試合を作成する
      </Link>
      <a
        href="#how-to-use"
        className="relative z-[1] block text-center text-[13px] text-white/90 underline underline-offset-[3px]"
      >
        使い方を見る ↓
      </a>

      <div className="relative z-[1] mt-[22px] flex items-center justify-center gap-3.5 text-[11px] opacity-90">
        <HeroMetaCheck>アカウント不要</HeroMetaCheck>
        <HeroMetaCheck>完全無料</HeroMetaCheck>
        <HeroMetaCheck>インストール不要</HeroMetaCheck>
      </div>

      <div className="relative z-[1] mx-[-8px] mt-6 flex items-center justify-center rounded-2xl bg-white/[0.08] p-4">
        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroMetaCheck({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {children}
    </span>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 150"
      className="h-[140px] w-full"
      role="img"
      aria-label="QRコードを介してチーム全員のスマホにスコアが共有されるイメージ"
    >
      <g
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M160 75 Q 105 45 60 55" />
        <path d="M160 75 Q 105 105 60 115" />
        <path d="M160 75 Q 215 45 260 55" />
        <path d="M160 75 Q 215 105 260 115" />
      </g>

      <SmallPhone x={36} y={28} />
      <SmallPhone x={36} y={88} />
      <SmallPhone x={244} y={28} />
      <SmallPhone x={244} y={88} />

      <g transform="translate(132 18)">
        <rect width="56" height="114" rx="9" fill="#ffffff" />
        <rect
          x="20"
          y="5"
          width="16"
          height="3"
          rx="1.5"
          fill="#1a1a1a"
          opacity="0.25"
        />
        <g transform="translate(11 14)">
          <rect width="34" height="34" rx="2" fill="#1a1a1a" />
          <rect x="3" y="3" width="8" height="8" fill="#ffffff" />
          <rect x="5" y="5" width="4" height="4" fill="#1a1a1a" />
          <rect x="23" y="3" width="8" height="8" fill="#ffffff" />
          <rect x="25" y="5" width="4" height="4" fill="#1a1a1a" />
          <rect x="3" y="23" width="8" height="8" fill="#ffffff" />
          <rect x="5" y="25" width="4" height="4" fill="#1a1a1a" />
          <rect x="13" y="13" width="3" height="3" fill="#ffffff" />
          <rect x="18" y="14" width="3" height="3" fill="#ffffff" />
          <rect x="14" y="19" width="3" height="3" fill="#ffffff" />
          <rect x="20" y="22" width="3" height="3" fill="#ffffff" />
          <rect x="22" y="17" width="3" height="3" fill="#ffffff" />
        </g>
        <rect x="9" y="56" width="38" height="3" rx="1.5" fill="#1a7a35" opacity="0.55" />
        <rect x="9" y="62" width="26" height="3" rx="1.5" fill="#1a7a35" opacity="0.3" />
        <rect x="9" y="78" width="38" height="14" rx="3.5" fill="#1a7a35" />
        <rect x="14" y="83" width="28" height="4" rx="1.5" fill="#ffffff" />
        <circle cx="28" cy="105" r="3" fill="#1a1a1a" opacity="0.2" />
      </g>
    </svg>
  );
}

function SmallPhone({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="40" height="34" rx="4" fill="#ffffff" opacity="0.92" />
      <rect x="4" y="5" width="20" height="2.4" rx="1.2" fill="#1a7a35" />
      <rect x="4" y="11" width="32" height="1.8" rx="0.9" fill="#1a1a1a" opacity="0.18" />
      <rect x="4" y="15" width="24" height="1.8" rx="0.9" fill="#1a1a1a" opacity="0.18" />
      <rect x="4" y="22" width="32" height="8" rx="2" fill="#1a7a35" opacity="0.18" />
      <text
        x="20"
        y="28"
        fontSize="6"
        fontWeight="800"
        fontFamily="-apple-system, sans-serif"
        textAnchor="middle"
        fill="#1a7a35"
      >
        3 − 5
      </text>
    </g>
  );
}

function SectionShell({
  alt = false,
  id,
  eyebrow,
  title,
  sub,
  children,
}: {
  alt?: boolean;
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`px-[22px] py-9 ${alt ? "bg-card" : "bg-canvas"}`}
    >
      <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-brand">
        {eyebrow}
      </div>
      <h2 className="mb-2 text-[22px] font-extrabold leading-[1.4] text-ink">
        {title}
      </h2>
      {sub && (
        <p className="mb-[22px] text-[13px] leading-[1.7] text-ink-sub">
          {sub}
        </p>
      )}
      {children}
    </section>
  );
}

function UseCases() {
  return (
    <SectionShell
      alt
      eyebrow="こんな場面で"
      title="3つの競技で使えます"
      sub="標準回数や雰囲気に合わせて、競技ごとに最適化されています。"
    >
      <div className="grid gap-3">
        <UseCase
          sport="baseball"
          title="野球"
          body="休日の試合を、応援団・来られなかったご家族にもリアルタイム共有。最大9回+延長対応。"
        />
        <UseCase
          sport="softball"
          title="ソフトボール"
          body="会社・地域・PTAのソフトを、チームLINEにQRひとつで共有。標準7回+コールドゲーム対応。"
        />
        <UseCase
          sport="kickball"
          title="キックベース"
          body="学校・学童・PTAのキックベースを、保護者みんなで観戦。標準5回・ライト運用に最適。"
        />
      </div>
    </SectionShell>
  );
}

function UseCase({
  sport,
  title,
  body,
}: {
  sport: "baseball" | "softball" | "kickball";
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[44px_1fr] items-start gap-3 rounded-2xl border border-line bg-card p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
        <SportIcon sport={sport} size={28} />
      </div>
      <div>
        <h3 className="mb-1 text-[15px] font-bold text-ink">{title}</h3>
        <p className="text-[12.5px] leading-[1.7] text-ink-sub">{body}</p>
      </div>
    </div>
  );
}

function HowToUse() {
  const steps = [
    {
      n: 1,
      title: "試合を作成",
      body: "競技・試合日・チーム名を入力するだけ。所要時間 約30秒。",
    },
    {
      n: 2,
      title: "QRコードを表示",
      body: "右上の「共有」ボタンから、QRと試合URLが瞬時に出ます。",
    },
    {
      n: 3,
      title: "みんながQRを読む",
      body: "応援に来た人・家族・チームメイトがQRを読むだけで、全員のスマホでスコアが見られます。",
    },
    {
      n: 4,
      title: "得点をリアルタイム入力",
      body: "±ボタンで得点を入れて保存。観ている全員のスマホに即反映されます。",
    },
    {
      n: 5,
      title: "試合終了でURLを記録に",
      body: "試合が終わったらワンタップで終了。同じURLで結果がいつまでも残ります。",
    },
  ];
  return (
    <SectionShell
      id="how-to-use"
      eyebrow="30秒で分かる"
      title={
        <>
          5ステップで
          <br />
          使えます
        </>
      }
      sub="試合作成から共有・スコア入力までスマホで完結。"
    >
      <div>
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="relative grid grid-cols-[32px_1fr] gap-3.5 pb-5 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[15px] top-9 bottom-1 w-0.5 bg-brand-light"
              />
            )}
            <div className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[14px] font-extrabold text-white">
              {s.n}
            </div>
            <div>
              <h4 className="mb-1 text-[15px] font-bold leading-[1.4] text-ink">
                {s.title}
              </h4>
              <p className="text-[12.5px] leading-[1.7] text-ink-sub">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ScreenStrip() {
  return (
    <SectionShell
      alt
      eyebrow="画面イメージ"
      title={
        <>
          こんな画面で
          <br />
          使えます
        </>
      }
      sub="スマホ最適化された、シンプルなUIです。"
    >
      <div className="-mx-[22px] flex gap-2.5 overflow-x-auto px-[22px] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ScreenCardCreate />
        <ScreenCardScore />
        <ScreenCardShare />
        <ScreenCardList />
      </div>
    </SectionShell>
  );
}

function ScreenFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col items-stretch">
      <div className="flex h-[290px] w-[140px] flex-col overflow-hidden rounded-[16px] border border-line bg-card shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        {children}
      </div>
      <div className="mt-2 text-center text-[11px] font-semibold text-ink-sub">
        {label}
      </div>
    </div>
  );
}

function ScreenCardCreate() {
  return (
    <ScreenFrame label="試合を作成">
      <div className="bg-brand px-2.5 pt-2 pb-2.5 text-white">
        <div className="text-[8px] font-bold tracking-[0.05em]">スコアボ</div>
        <div className="mt-1 text-[9px] font-semibold opacity-90">試合を作成</div>
      </div>
      <div className="flex-1 px-2 py-2.5">
        <div className="mb-1 text-[7.5px] text-ink-sub">競技</div>
        <div className="mb-2 grid grid-cols-3 gap-1">
          <div className="flex h-7 items-center justify-center rounded border border-brand bg-brand-light">
            <SportIcon sport="baseball" size={14} />
          </div>
          <div className="flex h-7 items-center justify-center rounded border border-line">
            <SportIcon sport="softball" size={14} />
          </div>
          <div className="flex h-7 items-center justify-center rounded border border-line">
            <SportIcon sport="kickball" size={14} />
          </div>
        </div>
        <div className="mb-1 text-[7.5px] text-ink-sub">先攻チーム</div>
        <div className="mb-2 h-5 rounded border border-line bg-canvas" />
        <div className="mb-1 text-[7.5px] text-ink-sub">後攻チーム</div>
        <div className="mb-3 h-5 rounded border border-line bg-canvas" />
        <div className="rounded-lg bg-brand py-1.5 text-center text-[8px] font-extrabold text-white">
          試合を作成して共有する
        </div>
      </div>
    </ScreenFrame>
  );
}

function ScreenCardScore() {
  return (
    <ScreenFrame label="スコア入力">
      <div className="bg-brand px-2.5 pt-2 pb-2.5 text-white">
        <div className="flex items-center justify-between text-[7.5px]">
          <span className="opacity-85">中野ベアーズ</span>
          <span className="opacity-85">町田パイレーツ</span>
        </div>
        <div className="mt-1 flex items-center justify-center gap-2 text-[18px] font-extrabold tabular-nums">
          <span>3</span>
          <span className="text-[12px] opacity-70">−</span>
          <span>5</span>
        </div>
        <div className="mt-1 text-center text-[7.5px] opacity-85">進行中 4回</div>
      </div>
      <div className="flex-1 px-2 py-2.5">
        <div className="mb-2 grid grid-cols-7 gap-[1px] overflow-hidden rounded border border-line text-center">
          {Array.from({ length: 7 }).map((_, i) => {
            const isCurrent = i === 3;
            return (
              <div
                key={i}
                className={`text-[7px] leading-tight ${
                  isCurrent ? "bg-accent-soft" : "bg-card"
                }`}
              >
                <div className="border-b border-line py-[1px] text-ink-sub">
                  {i + 1}
                </div>
                <div className="py-[1px]">{i < 3 ? "1" : ""}</div>
                <div className="border-t border-line py-[1px]">
                  {i < 3 ? "2" : ""}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mb-1 text-[7.5px] font-semibold text-ink">4回 を入力</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map((c) => (
            <div
              key={c}
              className="flex items-center justify-between rounded border border-line bg-canvas px-1.5 py-1"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">
                −
              </span>
              <span className="text-[10px] font-extrabold tabular-nums">0</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">
                ＋
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-brand py-1.5 text-center text-[8px] font-extrabold text-white">
          4回を保存する
        </div>
      </div>
    </ScreenFrame>
  );
}

function ScreenCardShare() {
  return (
    <ScreenFrame label="QR共有">
      <div className="bg-brand px-2.5 pt-2 pb-2.5 text-center text-white">
        <div className="text-[8px] font-bold tracking-[0.05em]">スコアボ</div>
        <div className="mt-1 text-[9px] font-semibold opacity-90">試合を共有</div>
      </div>
      <div className="flex flex-1 flex-col items-center px-2 py-2.5">
        <div className="text-[7.5px] text-ink-sub">中野ベアーズ vs 町田パイレーツ</div>
        <div className="mt-1 mb-2 flex h-[70px] w-[70px] items-center justify-center rounded border border-line bg-card">
          <QrSquare />
        </div>
        <div className="mb-2 h-3 w-full rounded border border-line bg-canvas" />
        <div className="w-full rounded-lg bg-line-green py-1.5 text-center text-[8px] font-extrabold text-white">
          みんなに送る
        </div>
      </div>
    </ScreenFrame>
  );
}

function QrSquare() {
  return (
    <svg viewBox="0 0 36 36" width="58" height="58" aria-hidden="true">
      <rect width="36" height="36" fill="#ffffff" />
      <g fill="#1a1a1a">
        <rect x="3" y="3" width="9" height="9" />
        <rect x="24" y="3" width="9" height="9" />
        <rect x="3" y="24" width="9" height="9" />
      </g>
      <g fill="#ffffff">
        <rect x="5" y="5" width="5" height="5" />
        <rect x="26" y="5" width="5" height="5" />
        <rect x="5" y="26" width="5" height="5" />
      </g>
      <g fill="#1a1a1a">
        <rect x="6" y="6" width="3" height="3" />
        <rect x="27" y="6" width="3" height="3" />
        <rect x="6" y="27" width="3" height="3" />
        <rect x="14" y="3" width="2" height="2" />
        <rect x="18" y="5" width="2" height="2" />
        <rect x="20" y="3" width="2" height="2" />
        <rect x="14" y="9" width="2" height="2" />
        <rect x="14" y="14" width="2" height="2" />
        <rect x="17" y="14" width="2" height="2" />
        <rect x="20" y="14" width="2" height="2" />
        <rect x="14" y="18" width="2" height="2" />
        <rect x="20" y="18" width="2" height="2" />
        <rect x="23" y="18" width="2" height="2" />
        <rect x="26" y="14" width="2" height="2" />
        <rect x="29" y="17" width="2" height="2" />
        <rect x="14" y="22" width="2" height="2" />
        <rect x="20" y="22" width="2" height="2" />
        <rect x="26" y="22" width="2" height="2" />
        <rect x="29" y="25" width="2" height="2" />
        <rect x="17" y="26" width="2" height="2" />
        <rect x="23" y="29" width="2" height="2" />
        <rect x="14" y="29" width="2" height="2" />
        <rect x="26" y="29" width="2" height="2" />
        <rect x="29" y="29" width="2" height="2" />
      </g>
    </svg>
  );
}

function ScreenCardList() {
  return (
    <ScreenFrame label="試合一覧">
      <div className="bg-brand px-2.5 pt-2 pb-2.5 text-white">
        <div className="text-[8px] font-bold tracking-[0.05em]">スコアボ</div>
        <div className="mt-1 mb-1 h-3 rounded bg-white" />
        <div className="flex gap-1">
          <span className="rounded-full bg-white/95 px-1.5 py-[1px] text-[6.5px] font-semibold text-brand-dark">
            すべて
          </span>
          <span className="rounded-full bg-white/20 px-1.5 py-[1px] text-[6.5px]">
            野球
          </span>
          <span className="rounded-full bg-white/20 px-1.5 py-[1px] text-[6.5px]">
            ソフト
          </span>
        </div>
      </div>
      <div className="flex-1 px-2 py-2 text-[7.5px]">
        <div className="mb-1 text-[7px] font-semibold text-live">● 進行中</div>
        <MiniGameCard live top="3" bottom="5" />
        <div className="mt-2 mb-1 text-[7px] font-semibold text-ink-sub">最近</div>
        <MiniGameCard top="2" bottom="2" />
        <MiniGameCard top="6" bottom="1" />
      </div>
    </ScreenFrame>
  );
}

function MiniGameCard({
  live,
  top,
  bottom,
}: {
  live?: boolean;
  top: string;
  bottom: string;
}) {
  return (
    <div className="mb-1 rounded border border-line bg-card px-1.5 py-1">
      <div className="flex items-center justify-between text-[6.5px]">
        <span className="rounded-full bg-brand-light px-1 text-brand-dark">
          野球
        </span>
        <span className={live ? "text-live" : "text-ink-sub"}>
          {live ? "進行中" : "終了"}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between">
        <span>中野</span>
        <span className="font-extrabold tabular-nums text-brand">
          {top} − {bottom}
        </span>
        <span>町田</span>
      </div>
    </div>
  );
}

function Features() {
  const list = [
    {
      title: "アカウント不要",
      body: (
        <>
          登録ゼロ。
          <br />
          URL/QRだけで全員が参加
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
          <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      ),
    },
    {
      title: "リアルタイム同期",
      body: (
        <>
          誰かが入力すると
          <br />
          全員の画面に即反映
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: "完全無料",
      body: (
        <>
          広告なし。
          <br />
          追加課金なし
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="M12 18v4" />
          <path d="m16.24 16.24 2.83 2.83" />
          <path d="M18 12h4" />
          <path d="m16.24 7.76 2.83-2.83" />
        </svg>
      ),
    },
    {
      title: "PCでも見られる",
      body: (
        <>
          スマホもPCも
          <br />
          同じURLで閲覧可
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <SectionShell
      eyebrow="スコアボの特徴"
      title={
        <>
          他にはない
          <br />
          4つのポイント
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-line bg-card px-3 py-3.5 text-center"
          >
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
              <span className="block h-[18px] w-[18px]">{f.icon}</span>
            </div>
            <h4 className="mb-1 text-[13px] font-bold text-ink">{f.title}</h4>
            <p className="text-[11px] leading-[1.5] text-ink-sub">{f.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function Faq() {
  const items = [
    { q: "本当に無料ですか？", a: "はい、完全に無料です。広告も表示しません。" },
    {
      q: "登録なしで使えますか？",
      a: "アカウント登録は不要です。URLを開けばすぐ使えます。",
    },
    {
      q: "勝手に編集されたりしませんか？",
      a: "URLを知っている人なら誰でも編集できる仕組みです。共有はチーム内など信頼できる範囲にとどめてください。",
    },
    {
      q: "過去の試合は残りますか？",
      a: "削除しない限り残ります。同じURLでいつでも振り返れます。",
    },
    {
      q: "延長やコールドにも対応していますか？",
      a: "回の追加・試合の早期終了どちらにも対応しています。",
    },
  ];
  return (
    <SectionShell alt eyebrow="FAQ" title="よくある質問">
      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.q}
            className="rounded-xl border border-line bg-card px-4 py-3.5"
          >
            <div className="mb-1.5 flex items-start gap-2 text-[13.5px] font-bold leading-[1.5] text-ink">
              <span className="shrink-0 font-extrabold text-brand">Q.</span>
              <span>{it.q}</span>
            </div>
            <div className="pl-[18px] text-[12.5px] leading-[1.7] text-ink-sub">
              {it.a}
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/help"
        className="mt-4 block text-center text-[13px] font-semibold text-brand underline"
      >
        もっと詳しい使い方を見る →
      </Link>
    </SectionShell>
  );
}

function FinalCta() {
  return (
    <section className="bg-gradient-to-br from-brand to-brand-dark px-[22px] py-9 text-center text-white">
      <h2 className="mb-2.5 text-[20px] font-extrabold leading-[1.5]">
        今すぐ、試合を共有しよう
      </h2>
      <p className="mb-[22px] text-[13px] leading-[1.7] opacity-95">
        登録不要・完全無料。
        <br />
        30秒で試合を作って、QRでチームに送るだけ。
      </p>
      <Link
        href="/games/new"
        className="block w-full rounded-2xl bg-white py-4 text-center text-base font-extrabold text-brand-dark shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:bg-white/90"
      >
        ＋ 無料で試合を作成する
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-card px-[22px] py-[22px] text-center text-[12px] text-ink-sub">
      <div className="mb-3 flex justify-center gap-[18px]">
        <Link href="/games" className="font-semibold text-brand">
          試合一覧
        </Link>
        <Link href="/help" className="font-semibold text-brand">
          使い方ガイド
        </Link>
      </div>
      <div className="text-[10px] opacity-70">© 2026 スコアボ</div>
    </footer>
  );
}
