# スコアボ (Scorebo)

野球・ソフトボール・キックベースボールの試合スコアをイニングごとに記録し、QRコードやURLで簡単に共有できるスマホ向けWebアプリです。アカウント登録は不要で、URLを知っている人なら誰でも閲覧・編集できます。

公開先: https://scorebo.vercel.app

## 主な機能

- 試合の作成(競技 / 試合日 / 最大回数 / 対戦チーム / 場所)
- イニングごとの得点入力 (±ステッパー、過去のイニング編集も可)
- リアルタイム同期(Firestore `onSnapshot`)
- QRコード / 短縮URL / LINE 共有
- 試合の終了 / 再開、延長戦 (+イニング追加)、コールド対応
- 試合一覧の検索・競技フィルタ・ページネーション

ユーザー向けの使い方は [/help](https://scorebo.vercel.app/help) ページにまとめてあります。

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com/) (`@theme` でデザイントークンを管理)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (asia-northeast1)
- [qrcode.react](https://github.com/zpao/qrcode.react)
- ホスティング: [Vercel](https://vercel.com/) (`main` への push で自動デプロイ)

## ディレクトリ構成

```
app/
  _components/      共有コンポーネント (BrandMark, SportIcon)
  games/
    new/            試合作成フォーム
    [id]/           試合詳細・スコア入力 (リアルタイム同期)
  help/             使い方ガイド
  layout.tsx        ルートレイアウト・メタデータ
  page.tsx          ホーム (試合一覧)
  manifest.ts       PWA マニフェスト
  icon.svg          ファビコン (Next.js が自動配信)
  apple-icon.svg    iOS ホーム画面アイコン
  opengraph-image.tsx  OG 画像 (動的生成)
lib/
  firebase.ts       Firebase 初期化
  games.ts          Firestore CRUD・スコア計算ヘルパ
  sports.ts         競技マスタ (野球/ソフト/キック)
  types.ts          型定義
mockups/            HTML モックアップ (実装の参照元)
firestore.rules     Firestore セキュリティルール
firebase.json       Firebase CLI 設定
```

## ローカル開発

### 必要なもの

- Node.js 22 以上 (本リポジトリは 20/22/24 を想定)
- 自分の Firebase プロジェクト (テスト用) と Web アプリ設定

### セットアップ

```bash
npm install
cp .env.local.example .env.local  # 後述の環境変数を埋める
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

### 環境変数

`.env.local` に以下を設定してください。Firebase コンソール > プロジェクト設定 > 全般 > 「マイアプリ」から取得できます。

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## ビルドとデプロイ

```bash
npm run build       # 本番ビルド
npm start           # 本番サーバー起動
```

Vercel に `main` ブランチを連携してあるため、`main` への push で自動デプロイされます。Pull Request にはプレビュー URL が払い出されます。

## Firestore セキュリティルール

`firestore.rules` がリポジトリに含まれています。デプロイには Firebase CLI を使います。

```bash
npx firebase login                                # 初回のみ
npx firebase deploy --only firestore:rules
```

ルールの方針:

- `games` コレクションのみ認証なしで read / write を許可
- 書き込み時にフィールド形状を検証 (sport の列挙、最大回数の範囲、文字列の長さなど)
- `created_at` の改ざんを禁止
- それ以外のパスは暗黙的に拒否

## データモデル

`games` コレクションのドキュメントが1試合に対応します。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `sport` | `'baseball' \| 'softball' \| 'kickball'` | 競技 |
| `date` | string (`YYYY-MM-DD`) | 試合日 |
| `location` | string | 場所 (任意) |
| `team_top` | string | 先攻チーム |
| `team_bottom` | string | 後攻チーム |
| `max_innings` | number | 最大回数 (UI では1〜9、延長は別途追加) |
| `innings` | `{ inning, top, bottom }[]` | イニングごとの得点 |
| `status` | `'in_progress' \| 'completed'` | 進行中 / 終了 |
| `created_at` | Timestamp | 作成日時 (サーバータイム) |

## ライセンス・運用

個人開発プロジェクトです。フィードバックやバグ報告は Issue / PR にてお願いします。
