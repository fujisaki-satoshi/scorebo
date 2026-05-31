import type { Metadata } from "next";

import { loadGameByViewToken } from "@/lib/og-data";
import { WatchView } from "./WatchView";

export async function generateMetadata(
  props: PageProps<"/watch/[viewToken]">,
): Promise<Metadata> {
  const { viewToken } = await props.params;
  const result = await loadGameByViewToken(viewToken).catch(() => null);
  const v = result?.updatedAtSec ?? 0;
  return {
    title: "観戦ページ — スコアボ",
    robots: { index: false },
    openGraph: {
      images: [`/api/og/watch/${viewToken}?v=${v}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og/watch/${viewToken}?v=${v}`],
    },
  };
}

export default async function WatchPage(props: {
  params: Promise<{ viewToken: string }>;
}) {
  const { viewToken } = await props.params;
  return <WatchView viewToken={viewToken} />;
}
