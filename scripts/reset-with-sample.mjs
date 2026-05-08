// Wipe all games from Firestore and insert one sample game so the home page
// is never in an empty state.
//
// Usage:
//   node --env-file=.env.local scripts/reset-with-sample.mjs

import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error(
    "Missing Firebase env vars. Run with: node --env-file=.env.local scripts/reset-with-sample.mjs",
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(`Project: ${firebaseConfig.projectId}`);

// 1) Load and delete all games (batched, 500/op limit per batch).
const all = await getDocs(collection(db, "games"));
console.log(`Existing games: ${all.size}`);

if (all.size > 0) {
  const docs = all.docs;
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`  deleted ${Math.min(i + CHUNK, docs.length)}/${docs.length}`);
  }
}

// 2) Insert one sample so first-time visitors see what the app does.
//    Live state (in_progress + partial scores) shows "進行中の試合" with the
//    pulse indicator, demonstrating the realtime feel.
const sample = {
  sport: "baseball",
  date: "2026-05-09",
  location: "駒沢オリンピック公園 野球場",
  team_top: "中野ベアーズ",
  team_bottom: "町田パイレーツ",
  max_innings: 9,
  innings: [
    { inning: 1, top: 0, bottom: 1 },
    { inning: 2, top: 2, bottom: 0 },
    { inning: 3, top: 1, bottom: 1 },
    { inning: 4, top: 0, bottom: 3 },
  ],
  status: "in_progress",
  created_at: serverTimestamp(),
};

const ref = await addDoc(collection(db, "games"), sample);
console.log(`Inserted sample game: ${ref.id}`);

process.exit(0);
