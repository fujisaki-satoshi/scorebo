import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/app/_components/BrandMark";

export const metadata: Metadata = {
  title: "プライバシーポリシー — スコアボ",
  description: "スコアボのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="bg-brand px-[18px] pt-6 pb-5 text-white">
        <div className="mb-3 flex items-center gap-2.5">
          <BrandMark size={32} />
          <div>
            <div className="text-[18px] font-bold leading-[1.1] tracking-[0.04em]">
              プライバシーポリシー
            </div>
            <div className="mt-0.5 text-[9px] tracking-[0.18em] opacity-85">
              PRIVACY POLICY
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

        <Section title="1. 運営者情報">
          <p>
            スコアボ（以下「本サービス」）は、藤崎 聡（以下「運営者」）が個人で運営するWebアプリケーションです。
          </p>
        </Section>

        <Section title="2. 収集する情報">
          <p>本サービスは、ユーザーの個人情報（氏名・メールアドレス等）を収集しません。アカウント登録も不要です。</p>
          <p className="mt-2">本サービスでは以下の情報を取り扱います。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="text-ink">試合データ</strong>
              ：ユーザーが入力したチーム名・スコア・イニング情報等。Google Firebase（Firestore）に保存されます。
            </li>
            <li>
              <strong className="text-ink">アクセス情報</strong>
              ：ページ閲覧・操作のログ。Google Firebase Analyticsにより匿名で収集されます。IPアドレス等の個人を特定できる情報は取得しません。
            </li>
          </ul>
        </Section>

        <Section title="3. 情報の利用目的">
          <ul className="list-inside list-disc space-y-1">
            <li>試合スコアの記録・共有機能の提供</li>
            <li>サービスの品質向上・不具合対応</li>
            <li>利用状況の把握（匿名の集計データのみ）</li>
          </ul>
        </Section>

        <Section title="4. 第三者への提供">
          <p>
            運営者は、法令に基づく場合を除き、収集した情報を第三者に提供しません。
          </p>
        </Section>

        <Section title="5. Googleのサービスについて">
          <p>
            本サービスはGoogle Firebase（Firestore・Analytics）を利用しています。Googleのプライバシーポリシーについては
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-brand underline"
            >
              こちら
            </a>
            をご参照ください。
          </p>
        </Section>

        <Section title="6. データの保存期間">
          <p>
            試合データはユーザーが削除するまで保存されます。サービス終了時にはすべてのデータが削除されます。
          </p>
        </Section>

        <Section title="7. ポリシーの変更">
          <p>
            運営者は必要に応じて本ポリシーを変更することがあります。変更後のポリシーは本ページへの掲載をもって効力を生じます。
          </p>
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
