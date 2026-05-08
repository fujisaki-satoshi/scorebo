import Link from "next/link";
import type { Metadata } from "next";

import { BrandMark } from "@/app/_components/BrandMark";
import { SportIcon } from "@/app/_components/SportIcon";
import { SPORT_META, SPORT_ORDER } from "@/lib/sports";

export const metadata: Metadata = {
  title: "使い方 — スコアボ",
  description: "スコアボの使い方ガイド：試合を作成・記録・共有する手順をまとめました。",
};

export default function HelpPage() {
  return (
    <>
      <header className="bg-brand px-[18px] pt-6 pb-5 text-white">
        <div className="mb-3 flex items-center gap-2.5">
          <BrandMark size={32} />
          <div>
            <div className="text-[18px] font-bold leading-[1.1] tracking-[0.04em]">
              使い方ガイド
            </div>
            <div className="mt-0.5 text-[9px] tracking-[0.18em] opacity-85">
              HOW TO USE
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
          ホームへ戻る
        </Link>
      </header>

      <main className="flex-1 px-4 py-5">
        <Section title="スコアボとは">
          <p>
            スコアボは、野球・ソフトボール・キックベースボールの試合スコアをイニングごとに記録し、QRコードやURLで簡単に共有できるスマホ向けWebアプリです。
          </p>
          <p className="mt-2">
            <strong className="text-ink">アカウント登録は不要</strong>
            。試合のURLを知っている人なら誰でも閲覧・編集できます。チームメイトや観客にURLを送るだけで、試合の進行をリアルタイムに共有できます。
          </p>
        </Section>

        <Section title="対応している競技">
          <div className="grid grid-cols-3 gap-2">
            {SPORT_ORDER.map((s) => (
              <div
                key={s}
                className="flex flex-col items-center rounded-xl border border-line bg-card px-2 py-3 text-center"
              >
                <SportIcon sport={s} size={36} className="mb-1.5" />
                <div className="text-[13px] font-semibold text-ink">
                  {SPORT_META[s].label}
                </div>
                <div className="mt-0.5 text-[10px] text-ink-sub">
                  標準 {SPORT_META[s].defaultMaxInnings}回
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            標準回数は競技ごとに異なります。試合作成時に1〜9回の範囲で変更できます。延長戦も後から追加できます。
          </p>
        </Section>

        <Section title="使い方の流れ">
          <Step n={1} title="試合を作成する">
            ホームの <Pill>＋ 試合を作成する</Pill>{" "}
            ボタンから、競技・試合日・最大回数・対戦チームを入力します。先攻・後攻はチーム名の入力順で決まります。
          </Step>
          <Step n={2} title="URLとQRコードを共有する">
            作成後のスコア画面で右上の <Pill>共有</Pill>{" "}
            ボタンを押すと、QRコードと試合URLが表示されます。LINEで送るボタンで友達やチームに共有できます。
            <Note>
              <strong>注意</strong>
              ：URLを知っている人は誰でも閲覧・編集できます。むやみに公開しないでください。
            </Note>
          </Step>
          <Step n={3} title="スコアを入力する">
            ＋／− のステッパーで先攻・後攻の得点を入れて{" "}
            <Pill>N回を保存する</Pill>{" "}
            を押すと、その回が確定して次のイニングに進みます。スコア表のセルをタップすれば過去のイニングに戻って修正できます。
          </Step>
          <Step n={4} title="延長戦・コールドゲームに対応">
            延長になったら <Pill>＋ イニングを追加</Pill>{" "}
            で回を増やせます。コールドや早期終了で締めるときは、隣の{" "}
            <Pill>🏁 試合を終了</Pill> を押してください。
            <Note>
              <strong>ポイント</strong>
              ：試合の終了はユーザーが決めます。最大回数まで埋めても自動では終了しません。
            </Note>
          </Step>
          <Step n={5} title="試合情報の編集・削除">
            スコア画面右上の <Pill>︙</Pill>{" "}
            メニューから、競技・日付・場所・チーム名・最大回数を編集できます。同じメニューから試合の削除も可能です(削除は元に戻せません)。
          </Step>
        </Section>

        <Section title="ホーム画面の使い方">
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong className="text-ink">検索</strong>
              ：上部の検索ボックスでチーム名・場所を絞り込めます。
            </li>
            <li>
              <strong className="text-ink">競技フィルタ</strong>
              ：「すべて／野球／ソフト／キック」のチップで競技を切り替えられます。
            </li>
            <li>
              <strong className="text-ink">進行中／最近の試合</strong>
              ：得点が入っている進行中の試合は上のセクションに表示されます。
            </li>
            <li>
              <strong className="text-ink">もっと見る</strong>
              ：一覧は新しい順に20件ずつ読み込まれます。
            </li>
          </ul>
        </Section>

        <Section title="よくある質問">
          <Faq q="ログインしないと使えませんか？">
            いいえ、ログイン不要で誰でもすぐに使えます。
          </Faq>
          <Faq q="他の人に試合を編集されたくありません">
            URLを共有する範囲を限定してください。URLを知っている人は誰でも編集できる仕組みのため、不特定多数への公開はおすすめしません。
          </Faq>
          <Faq q="作成した試合はずっと残りますか？">
            自分で削除しない限り残ります。誤って公開した場合は、︙メニューから削除してください。
          </Faq>
          <Faq q="得点を間違えて保存しました">
            スコア表の該当セルをタップすると、過去のイニングを編集対象に切り替えられます。±ステッパーで修正して保存し直してください。
          </Faq>
          <Faq q="得点が更新されません">
            通信状況を確認の上、ページを再読み込みしてください。スコアはリアルタイムで同期されますが、オフライン時は反映されないことがあります。
          </Faq>
        </Section>

        <div className="mt-6 mb-4">
          <Link
            href="/"
            className="block w-full rounded-2xl bg-brand py-3.5 text-center text-base font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.3)] active:bg-brand-dark"
          >
            ホームに戻る
          </Link>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl border border-line bg-card px-4 py-4 text-[13px] leading-[1.7] text-ink-sub">
      <h2 className="mb-2.5 text-[15px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex gap-3 last:mb-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
        {n}
      </div>
      <div className="pt-0.5">
        <div className="mb-1 text-[14px] font-semibold text-ink">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-brand-light px-1.5 py-0.5 text-[12px] font-semibold text-brand-dark">
      {children}
    </span>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-[12px] text-ink">
      {children}
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-start gap-1.5 text-[13px] font-semibold text-ink">
        <span className="text-brand">Q.</span>
        <span>{q}</span>
      </div>
      <div className="pl-5 text-[13px] text-ink-sub">{children}</div>
    </div>
  );
}
