import type { Metadata } from "next";

import { loadGameById } from "@/lib/og-data";
import { GameView } from "./GameView";

export async function generateMetadata(
  props: PageProps<"/games/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const result = await loadGameById(id).catch(() => null);
  const v = result?.updatedAtSec ?? 0;
  return {
    robots: { index: false },
    openGraph: {
      images: [`/api/og/game/${id}?v=${v}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og/game/${id}?v=${v}`],
    },
  };
}

export default async function GameDetailPage(props: PageProps<"/games/[id]">) {
  const { id } = await props.params;
  return <GameView id={id} />;
}
