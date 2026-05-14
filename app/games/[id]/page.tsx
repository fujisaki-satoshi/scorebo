import type { Metadata } from "next";

import { GameView } from "./GameView";

export const metadata: Metadata = {
  robots: { index: false },
};

export default async function GameDetailPage(props: PageProps<"/games/[id]">) {
  const { id } = await props.params;
  return <GameView id={id} />;
}
