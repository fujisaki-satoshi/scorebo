import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

function getApp(): App {
  if (cachedApp) return cachedApp;
  // Dynamic imports to prevent build-time initialization
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cert, getApps, initializeApp } = require("firebase-admin/app") as typeof import("firebase-admin/app");
  cachedApp =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        })
      : getApps()[0];
  return cachedApp;
}

export function getAdminAuth(): Auth {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require("firebase-admin/auth") as typeof import("firebase-admin/auth");
  return getAuth(getApp());
}

export function getAdminDb(): Firestore {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getFirestore } = require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
  return getFirestore(getApp());
}
