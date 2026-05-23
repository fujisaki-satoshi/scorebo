export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/admin";

async function getIdentityByToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    const snap = await adminDb
      .collection("identities")
      .where("firebase_uid", "==", decoded.uid)
      .where("status", "==", "active")
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { doc: snap.docs[0], uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const result = await getIdentityByToken(req.headers.get("authorization"));
  if (!result) return Response.json({ error: "not_found" }, { status: 404 });

  const data = result.doc.data();
  return Response.json({
    identityId: result.doc.id,
    keyPrefix: data.key_prefix,
    createdAt: data.created_at?.toDate?.()?.toISOString() ?? null,
    lastUsedAt: data.last_used_at?.toDate?.()?.toISOString() ?? null,
    saveMethods: data.save_methods,
  });
}

export async function DELETE(req: NextRequest) {
  const result = await getIdentityByToken(req.headers.get("authorization"));
  if (!result) return Response.json({ error: "not_found" }, { status: 404 });

  await result.doc.ref.update({ status: "revoked" });
  return Response.json({ ok: true });
}
