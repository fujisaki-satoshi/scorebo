import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/app/_components/BrandMark";

export const metadata: Metadata = {
  title: "利用規約 — スコアボ",
  description: "スコアボの利用規約",
};

export default function TermsPage() {
  return (
    <>
      <header className="bg-brand px-[18px] pt-6 pb-5 text-white">
        <div className="mb-3 flex items-center gap-2.5">
          <BrandMark size={32} />
          <div>
            <div className="text-[18px] font-bold leading-[1.1] tracking-[0.04em]">
              利用規約
            </div>
            <div className="mt-0.5 text-[9px] tracking-[0.18em] opacity-85">
              TERMS OF SERVICE
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[12px] text-white/90"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          トップへ戻る
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 text-[13.5px] leading-[1.8] text-ink-sub">
        <p className="mb-6 text-[12px] text-ink-sub/70">最終更新日：2026年5月14日</p>

        <Section title="第1条（適用）">
          <p>
            本規約は、スコアボ（以下「本サービス」）の利用に関する条件を定めるものです。
            本サービスをご利用になる方（以下「ユーザー」）は、本規約に同意したものとみなします。
          </p>
        </Section>

        <Section title="第2条（サービスの内容）">
          <p>
            本サービスは、野球・ソフトボール等の試合スコアをスマホで記録し、URLまたはQRコードを通じて第三者と共有できる無料のWebアプリケーションです。アカウント登録なしでご利用いただけます。
          </p>
        </Section>

        <Section title="第3条（禁止事項）">
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーや第三者に迷惑をかける行為</li>
            <li>本サービスを商業目的で無断利用する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="第4条（免責事項）">
          <p>
            本サービスは現状のまま提供されます。運営者は、本サービスの内容の正確性・完全性・有用性について保証しません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
          </p>
          <p className="mt-2">
            試合URLを知っている人は誰でも閲覧・編集できる仕組みです。URLの共有範囲はユーザー自身の責任で管理してください。
          </p>
        </Section>

        <Section title="第5条（サービスの変更・終了）">
          <p>
            運営者は、予告なく本サービスの内容を変更したり、提供を終了したりする場合があります。これによりユーザーに生じた損害について、運営者は責任を負いません。
          </p>
        </Section>

        <Section title="第6条（規約の変更）">
          <p>
            運営者は必要に応じて本規約を変更できるものとします。変更後の規約は本ページへの掲載をもって効力を生じるものとします。
          </p>
        </Section>

        <Section title="第7条（準拠法）">
          <p>本規約は日本法を準拠法とします。</p>
        </Section>

        <div className="mt-8 border-t border-line pt-5 text-[12px] text-ink-sub/70">
          <p>運営者：藤崎 聡</p>
          <p className="mt-1">
            お問い合わせ：
            <a
              href="https://www.instagram.com/scorebo_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              Instagram @scorebo_app
            </a>
          </p>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[14px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
