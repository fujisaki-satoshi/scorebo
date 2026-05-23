export const dynamic = "force-dynamic";

import { FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/admin";
import { generateRecoveryKey, hashKey, keyPrefix } from "@/lib/keys-server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
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

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  let firebaseUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    firebaseUid = decoded.uid;
  } catch {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }

  const existing = await adminDb
    .collection("identities")
    .where("firebase_uid", "==", firebaseUid)
    .where("status", "==", "active")
    .get();

  const batch = adminDb.batch();
  for (const doc of existing.docs) {
    batch.update(doc.ref, { status: "revoked" });
  }

  const code = generateRecoveryKey();
  const prefix = keyPrefix(code);
  const identityRef = adminDb.collection("identities").doc();

  batch.set(identityRef, {
    firebase_uid: firebaseUid,
    key_hash: hashKey(code),
    key_prefix: prefix,
    created_at: FieldValue.serverTimestamp(),
    last_used_at: FieldValue.serverTimestamp(),
    status: "active",
    save_methods: { screenshot: false, line: false, email: false, print: false },
  });

  await batch.commit();

  return Response.json({ code, identityId: identityRef.id, keyPrefix: prefix });
}
