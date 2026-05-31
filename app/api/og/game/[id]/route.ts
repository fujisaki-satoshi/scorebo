import { loadGameById } from "@/lib/og-data";
import { buildNotFoundImageResponse, buildScoreImageResponse, OG_SIZE } from "@/lib/og-render";

const SITE_URL_BASE = "scorebo.vercel.app";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const result = await loadGameById(id).catch(() => null);
  if (!result) {
    return buildNotFoundImageResponse();
  }
  return buildScoreImageResponse(result.game, `${SITE_URL_BASE}/games/${id}`);
}

export const runtime = "edge";
export const contentType = "image/png";
export const size = OG_SIZE;
