export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/admin";

export async function PATCH(req: NextRequest) {
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

  const body = (await req.json()) as { method?: string; done?: boolean };
  const allowed = ["screenshot", "line", "email", "print"];
  if (!body.method || !allowed.includes(body.method) || typeof body.done !== "boolean") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const snap = await adminDb
    .collection("identities")
    .where("firebase_uid", "==", uid)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (snap.empty) return Response.json({ error: "not_found" }, { status: 404 });

  await snap.docs[0].ref.update({ [`save_methods.${body.method}`]: body.done });
  return Response.json({ ok: true });
}
