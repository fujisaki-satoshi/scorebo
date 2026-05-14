import type { Metadata } from "next";

import { WatchView } from "./WatchView";

export const metadata: Metadata = {
  title: "観戦ページ — スコアボ",
  robots: { index: false },
};

export default async function WatchPage(props: {
  params: Promise<{ viewToken: string }>;
}) {
  const { viewToken } = await props.params;
  return <WatchView viewToken={viewToken} />;
}
