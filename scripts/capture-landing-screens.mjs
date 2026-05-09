// Capture the four landing-page screen previews against scorebo.vercel.app
// using Playwright (Chromium, mobile viewport).
//
//   node --env-file=.env.local scripts/capture-landing-screens.mjs
//
// Strategy:
//   1. Create 2 temp games in Firestore (1 in_progress baseball + 1 completed
//      softball) so /games has variety and we have an in_progress game id for
//      score / share screenshots.
//   2. Capture 4 PNGs into public/landing/.
//   3. Delete the temp games no matter what.
//
// Output filenames mirror what the LP imports:
//   public/landing/screen-create.png
//   public/landing/screen-score.png
//   public/landing/screen-share.png
//   public/landing/screen-list.png

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { chromium, devices } from "playwright";

const SITE = process.env.SCOREBO_SITE ?? "https://scorebo.vercel.app";
const OUT_DIR = resolve("public/landing");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (!firebaseConfig.projectId) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_* env vars (use --env-file=.env.local)");
  process.exit(1);
}
const db = getFirestore(initializeApp(firebaseConfig));

await mkdir(OUT_DIR, { recursive: true });

console.log(`Site: ${SITE}`);
console.log(`Project: ${firebaseConfig.projectId}`);

// 1) Seed temp games. Firestore rules force `innings: []` + `status:
//    in_progress` on create, so the desired state is filled in via a
//    follow-up update.
async function createTempGame(meta) {
  const ref = await addDoc(collection(db, "games"), {
    sport: meta.sport,
    date: meta.date,
    location: meta.location,
    team_top: meta.team_top,
    team_bottom: meta.team_bottom,
    max_innings: meta.max_innings,
    innings: [],
    status: "in_progress",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  // Update must produce updated_at strictly greater than created_at.
  await new Promise((r) => setTimeout(r, 1100));
  await updateDoc(ref, {
    innings: meta.innings,
    status: meta.status,
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

const liveId = await createTempGame({
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
});

const doneId = await createTempGame({
  sport: "softball",
  date: "2026-05-04",
  location: "横浜市スポーツ会館",
  team_top: "豊洲ファルコンズ",
  team_bottom: "横浜サンズ",
  max_innings: 7,
  innings: [
    { inning: 1, top: 1, bottom: 0 },
    { inning: 2, top: 0, bottom: 2 },
    { inning: 3, top: 2, bottom: 1 },
    { inning: 4, top: 1, bottom: 0 },
    { inning: 5, top: 0, bottom: 0 },
    { inning: 6, top: 0, bottom: 1 },
    { inning: 7, top: 2, bottom: 0 },
  ],
  status: "completed",
});

const tempIds = [liveId, doneId];
console.log(`Seeded temp games: ${tempIds.join(", ")}`);

let exitCode = 0;
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14"],
    locale: "ja-JP",
    deviceScaleFactor: 2,
    viewport: { width: 390, height: 844 },
  });
  // Headless Chromium has no navigator.share; the LP previews want the
  // mobile-style "みんなに送る" CTA, so we stub the API before scripts run.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: () => Promise.resolve(),
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
  });
  const page = await context.newPage();

  // Helper: wait for fonts and any async render
  async function settle() {
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(400);
  }

  async function shot(name) {
    const path = resolve(OUT_DIR, name);
    await page.screenshot({ path, type: "png" });
    console.log(`✓ ${name}`);
  }

  // ── 1. /games (試合一覧) ─────────────────────────────
  await page.goto(`${SITE}/games`, { waitUntil: "domcontentloaded" });
  // Wait for at least one game card to render
  await page.waitForSelector("text=中野ベアーズ", { timeout: 10000 });
  await settle();
  await shot("screen-list.png");

  // ── 2. /games/new (試合を作成) ───────────────────────
  await page.goto(`${SITE}/games/new`, { waitUntil: "domcontentloaded" });
  await settle();
  // Pre-fill team names so the form looks lived-in
  await page.getByPlaceholder("先攻チーム名").fill("中野ベアーズ");
  await page.getByPlaceholder("後攻チーム名").fill("町田パイレーツ");
  // blur to dismiss any focus rings
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await settle();
  await shot("screen-create.png");

  // ── 3. /games/[liveId] (スコア入力) ───────────────────
  await page.goto(`${SITE}/games/${liveId}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=進行中", { timeout: 10000 });
  await settle();
  await shot("screen-score.png");

  // ── 4. share modal (QR共有) ─────────────────────────
  await page.getByRole("button", { name: "共有" }).click();
  await page.waitForSelector("text=みんなに送る", { timeout: 10000 });
  // Wait for the OG-image preview <img> to actually finish loading.
  // Selector matches the alt text "<teams> のスコア のプレビュー".
  await page.waitForFunction(
    () => {
      const img = document.querySelector('img[alt$="のプレビュー"]');
      return img && img.complete && img.naturalWidth > 0;
    },
    { timeout: 30000 },
  );
  await settle();
  await shot("screen-share.png");

  console.log(`Saved 4 screenshots to ${OUT_DIR}`);
} catch (err) {
  exitCode = 1;
  console.error("Capture failed:", err);
} finally {
  if (browser) await browser.close();

  // 2) Cleanup temp games — runs whether capture succeeded or not.
  for (const id of tempIds) {
    try {
      await deleteDoc(doc(db, "games", id));
      console.log(`✓ deleted ${id}`);
    } catch (e) {
      console.error(`  failed to delete ${id}:`, e.message);
      exitCode = 1;
    }
  }
}

process.exit(exitCode);
