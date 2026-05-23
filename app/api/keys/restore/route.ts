export const dynamic = "force-dynamic";

import { FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/admin";
import { normalizeKey, verifyKey } from "@/lib/keys-server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const history = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (history.length >= RATE_LIMIT_MAX) return false;
  history.push(now);
  rateLimitMap.set(ip, history);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json()) as { code?: string };
  const code = normalizeKey(body.code ?? "");
  if (!code.startsWith("SB-")) {
    return Response.json({ error: "invalid_format" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const adminAuth = getAdminAuth();

  const snap = await adminDb
    .collection("identities")
    .where("status", "==", "active")
    .where("key_prefix", "==", code.split("-")[1])
    .get();

  let matchedId: string | null = null;
  let matchedUid: string | null = null;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (verifyKey(code, data.key_hash as string)) {
      matchedId = doc.id;
      matchedUid = data.firebase_uid as string;
      break;
    }
  }

  if (!matchedId || !matchedUid) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  await adminDb.collection("identities").doc(matchedId).update({
    last_used_at: FieldValue.serverTimestamp(),
  });

  const gamesSnap = await adminDb
    .collection("games")
    .where("owner_uid", "==", matchedUid)
    .orderBy("created_at", "desc")
    .limit(20)
    .get();

  const gameCount = gamesSnap.size;
  let memoryQuote: { text: string; date: string; location: string } | null = null;

  if (!gamesSnap.empty) {
    const game = gamesSnap.docs[0].data();
    const top = game.team_top as string;
    const bottom = game.team_bottom as string;
    const innings: Array<{ top: number | null; bottom: number | null }> = Array.isArray(game.innings)
      ? (game.innings as Array<{ top: number | null; bottom: number | null }>)
      : [];
    const topScore = innings.reduce((s, i) => s + (i.top ?? 0), 0);
    const bottomScore = innings.reduce((s, i) => s + (i.bottom ?? 0), 0);
    memoryQuote = {
      text: `${top} ${topScore} — ${bottomScore} ${bottom}`,
      date: game.date as string,
      location: (game.location as string) ?? "",
    };
  }

  const customToken = await adminAuth.createCustomToken(matchedUid);

  return Response.json({
    customToken,
    identityId: matchedId,
    firebaseUid: matchedUid,
    gameCount,
    memoryQuote,
  });
}
