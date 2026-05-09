import Image from "next/image";
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

      <HeroVisual />
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

function HeroVisual() {
  return (
    <div
      className="relative z-[1] mx-[-8px] mt-7 -mb-1 h-[280px]"
      aria-label="QRコード付きのシェアモーダルを中央に、両脇のスマホでもスコアが見られる様子"
      role="img"
    >
      <svg
        viewBox="0 0 360 280"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
        aria-hidden="true"
      >
        <g
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="3 3"
          strokeLinecap="round"
        >
          <path d="M180 80 Q 100 100 60 140" />
          <path d="M180 80 Q 260 100 300 140" />
        </g>
      </svg>
      <PhoneMockup
        src="/landing/screen-score.png"
        alt=""
        className="absolute left-1.5 top-[38px] z-[1] h-[220px] w-[130px] -rotate-[9deg] opacity-80"
      />
      <PhoneMockup
        src="/landing/screen-list.png"
        alt=""
        className="absolute right-1.5 top-[38px] z-[1] h-[220px] w-[130px] rotate-[9deg] opacity-80"
      />
      <PhoneMockup
        src="/landing/screen-share.png"
        alt="共有モーダルのプレビュー"
        priority
        className="absolute left-1/2 top-3 z-[3] h-[264px] w-[168px] -translate-x-1/2"
      />
    </div>
  );
}

function PhoneMockup({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[22px] bg-[#1a1a1a] p-1 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[18px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="170px"
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
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
  const screens: Array<{ src: string; alt: string; label: string }> = [
    {
      src: "/landing/screen-create.png",
      alt: "試合作成画面のスクリーンショット",
      label: "試合を作成",
    },
    {
      src: "/landing/screen-score.png",
      alt: "スコア入力画面のスクリーンショット",
      label: "スコア入力",
    },
    {
      src: "/landing/screen-share.png",
      alt: "QR共有モーダルのスクリーンショット",
      label: "QR共有",
    },
    {
      src: "/landing/screen-list.png",
      alt: "試合一覧画面のスクリーンショット",
      label: "試合一覧",
    },
  ];
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
        {screens.map((s) => (
          <ScreenCard key={s.src} {...s} />
        ))}
      </div>
    </SectionShell>
  );
}

function ScreenCard({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="flex shrink-0 flex-col items-stretch">
      <div className="overflow-hidden rounded-[16px] border border-line bg-card shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <Image
          src={src}
          alt={alt}
          width={140}
          height={303}
          sizes="140px"
          className="block h-[303px] w-[140px] object-cover object-top"
        />
      </div>
      <div className="mt-2 text-center text-[11px] font-semibold text-ink-sub">
        {label}
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
