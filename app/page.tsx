import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { BrandMark } from "@/app/_components/BrandMark";
import { DemoSlider } from "@/app/_components/DemoSlider";

const SITE_DESC =
  "草野球・ソフトボールの得点板をスマホで。QRコードを見せるだけで保護者・観客がリアルタイムでスコアボードを観戦できる無料Webアプリ。野球・キックベース対応。アカウント登録不要・完全無料。";

export const metadata: Metadata = {
  title: "スコアボ — 草野球・ソフトボールのリアルタイムスコアボード",
  description: SITE_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "スコアボ — 草野球・ソフトボールのリアルタイムスコアボード",
    description: SITE_DESC,
    url: "/",
    siteName: "スコアボ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "スコアボ — 草野球・ソフトボールのリアルタイムスコアボード",
    description: SITE_DESC,
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <DemoSlider />
      <UsageScenes />
      <HowToUse />
      <SpectatorShare />
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
        得点板がない
        <br />
        グラウンドでも、
        <br />
        みんなで
        <span className="inline-block rounded bg-accent px-1.5 text-[#1a1a1a]">
          観戦
        </span>
      </h1>

      <p className="relative z-[1] mb-6 text-[14px] leading-[1.7] opacity-95">
        草野球・ソフトボールの試合をスマホ1台で記録。
        <br />
        QRを見せるだけで保護者・観客も
        <br />
        リアルタイムで見られます。
      </p>

      <Link
        href="/games/new"
        className="relative z-[1] mb-2.5 block w-full rounded-2xl bg-white py-4 text-center text-base font-extrabold text-brand-dark shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:bg-white/90"
      >
        ＋ 無料で試合を作成する
      </Link>
      <div className="relative z-[1] flex justify-center gap-5">
        <a
          href="#how-to-use"
          className="text-[13px] text-white/90 underline underline-offset-[3px]"
        >
          使い方を見る ↓
        </a>
        <Link
          href="/games/sample"
          className="text-[13px] text-white/90 underline underline-offset-[3px]"
        >
          サンプルを見る →
        </Link>
      </div>

      <div className="relative z-[1] mt-[22px] flex items-center justify-center gap-3.5 text-[11px] opacity-90">
        <HeroMetaCheck>アカウント不要</HeroMetaCheck>
        <HeroMetaCheck>完全無料</HeroMetaCheck>
        <HeroMetaCheck>タブレットで得点板に</HeroMetaCheck>
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
      className="relative z-[1] mx-[-8px] mt-7 -mb-1 h-[324px]"
      aria-label="QRコード付きのシェアモーダルを中央に、両脇のスマホでもスコアが見られる様子"
      role="img"
    >
      <svg
        viewBox="0 0 360 324"
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
          <path d="M180 90 Q 100 110 56 156" />
          <path d="M180 90 Q 260 110 304 156" />
        </g>
      </svg>
      <PhoneMockup
        src="/landing/screen-score.png"
        alt=""
        className="absolute left-1 top-[52px] z-[1] h-[238px] w-[110px] -rotate-[9deg] opacity-80"
      />
      <PhoneMockup
        src="/landing/screen-list.png"
        alt=""
        className="absolute right-1 top-[52px] z-[1] h-[238px] w-[110px] rotate-[9deg] opacity-80"
      />
      <PhoneMockup
        src="/landing/screen-share.png"
        alt="共有モーダルのプレビュー"
        priority
        className="absolute left-1/2 top-3 z-[3] h-[303px] w-[140px] -translate-x-1/2"
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

function HowToUse() {
  const steps: Array<{
    n: number;
    title: string;
    body: string;
    src: string;
    alt: string;
  }> = [
    {
      n: 1,
      title: "試合を作成",
      body: "競技・試合日・チーム名を入力するだけ。所要時間 約30秒。",
      src: "/landing/screen-create.png",
      alt: "試合作成画面のスクリーンショット",
    },
    {
      n: 2,
      title: "QRコードで共有",
      body: "右上の「共有」ボタンから出るQRを、応援団・家族・チームメイトに見せるだけで全員のスマホで観戦開始。",
      src: "/landing/screen-share.png",
      alt: "QR共有モーダルのスクリーンショット",
    },
    {
      n: 3,
      title: "得点をリアルタイム入力",
      body: "±ボタンで得点を入れて保存。観ている全員のスマホに即反映されます。",
      src: "/landing/screen-score.png",
      alt: "スコア入力画面のスクリーンショット",
    },
    {
      n: 4,
      title: "URLでずっと残る",
      body: "試合終了後も同じURLで結果を振り返れます。過去の試合は試合一覧から。",
      src: "/landing/screen-list.png",
      alt: "試合一覧画面のスクリーンショット",
    },
  ];
  return (
    <SectionShell
      id="how-to-use"
      eyebrow="30秒で分かる"
      title={
        <>
          4ステップで
          <br />
          使えます
        </>
      }
      sub="作成 → 共有 → 入力 → 振り返り。スマホで完結。"
    >
      <div>
        {steps.map((s, i) => (
          <div key={s.n} className="relative pb-7 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[14px] top-9 bottom-1 w-0.5 bg-brand-light"
              />
            )}
            <div className="mb-2.5 flex items-center gap-3">
              <div className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-extrabold text-white">
                {s.n}
              </div>
              <h4 className="text-base font-bold leading-[1.4] text-ink">
                {s.title}
              </h4>
            </div>
            <div className="grid grid-cols-[1fr_110px] items-start gap-3.5 pl-11">
              <p className="text-[13px] leading-[1.75] text-ink-sub">{s.body}</p>
              <StepPhone src={s.src} alt={s.alt} />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function StepPhone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-[#1a1a1a] p-[3px] shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
      <div className="relative aspect-[390/844] overflow-hidden rounded-[11px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="110px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function UsageScenes() {
  const scenes = [
    {
      title: "得点板がないグラウンドで",
      body: "スマホやタブレット1台で今日からすぐ運用できます",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "保護者へリアルタイム共有",
      body: "離れた場所からスマホで試合状況をリアルタイムに確認",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "体育館・イベントにも",
      body: "タブレットをそのまま置くだけで得点板として機能します",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 3H8" />
          <path d="M12 3v4" />
        </svg>
      ),
    },
    {
      title: "配信画面にも使える",
      body: "OBS等の配信ソフトにブラウザソースとして表示可能",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 8-6 4 6 4V8z" />
          <rect x="2" y="6" width="14" height="12" rx="2" />
        </svg>
      ),
    },
  ];

  return (
    <SectionShell
      alt
      eyebrow="利用シーン"
      title={
        <>
          こんな場面で
          <br />
          活躍します
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {scenes.map((s) => (
          <div
            key={s.title}
            className="rounded-xl border border-line bg-canvas px-3 py-3.5"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
              <span className="block h-[18px] w-[18px]">{s.icon}</span>
            </div>
            <h4 className="mb-1 text-[13px] font-bold leading-[1.4] text-ink">{s.title}</h4>
            <p className="text-[11px] leading-[1.55] text-ink-sub">{s.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function SpectatorShare() {
  const items = [
    {
      title: "QRを見せるだけ",
      body: (
        <>
          カメラを向けてもらうだけで
          <br />
          観戦スタート
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
        </svg>
      ),
    },
    {
      title: "URLを送るだけ",
      body: (
        <>
          LINEやメールで送れば
          <br />
          全員がすぐ見られる
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      title: "全員の画面に即反映",
      body: (
        <>
          スコア入力が
          <br />
          リアルタイムで届く
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      title: "観客はログイン不要",
      body: (
        <>
          アプリDL不要。
          <br />
          何もしなくてOK
        </>
      ),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="m9 10 2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <SectionShell
      eyebrow="かんたん共有"
      title={
        <>
          観客・保護者に
          <br />
          そのまま届ける
        </>
      }
      sub="スコア管理ツールではなく、みんなで試合を楽しむサービスです。"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((f) => (
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
      <div className="mb-3 flex flex-wrap justify-center gap-x-[18px] gap-y-2">
        <Link href="/games" className="font-semibold text-brand">
          試合一覧
        </Link>
        <Link href="/help" className="font-semibold text-brand">
          使い方ガイド
        </Link>
        <Link href="/terms" className="font-semibold text-brand">
          利用規約
        </Link>
        <Link href="/privacy" className="font-semibold text-brand">
          プライバシーポリシー
        </Link>
        <a
          href="https://www.instagram.com/scorebo_app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand"
        >
          お問い合わせ
        </a>
      </div>
      <div className="mb-1 text-[10px] opacity-70">運営者：藤崎 聡</div>
      <div className="text-[10px] opacity-70">© 2026 スコアボ</div>
    </footer>
  );
}
