import type { Metadata } from "next";

import { GamesList } from "./GamesList";

export const metadata: Metadata = {
  title: "試合一覧 — スコアボ",
  description:
    "進行中・最近のスコアボ試合一覧。野球・ソフトボール・キックベースの試合をリアルタイムで閲覧できます。",
};

export default function GamesListPage() {
  return <GamesList />;
}
