export const dynamic = "force-dynamic";

import { FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/admin";
import { generateRecoveryKey, hashKey, keyPrefix } from "@/lib/keys-server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }

  const existing = await adminDb
    .collection("identities")
    .where("firebase_uid", "==", uid)
    .where("status", "==", "active")
    .get();
  const batch = adminDb.batch();
  for (const doc of existing.docs) {
    batch.update(doc.ref, { status: "revoked" });
  }

  const code = generateRecoveryKey();
  const prefix = keyPrefix(code);
  const newRef = adminDb.collection("identities").doc();
  batch.set(newRef, {
    firebase_uid: uid,
    key_hash: hashKey(code),
    key_prefix: prefix,
    created_at: FieldValue.serverTimestamp(),
    last_used_at: FieldValue.serverTimestamp(),
    status: "active",
    save_methods: { screenshot: false, line: false, email: false, print: false },
  });
  await batch.commit();

  return Response.json({ code, identityId: newRef.id, keyPrefix: prefix });
}
