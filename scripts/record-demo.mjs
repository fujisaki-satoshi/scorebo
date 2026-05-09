// Record 3 Instagram Reels demo videos for Scorebo using Playwright's built-in video
// capture. Each demo is recorded in an isolated browser context.
//
//   node --env-file=.env.local scripts/record-demo.mjs
//
// Output (after ffmpeg conversion if available):
//   public/demo/demo-1-create.mp4   → 試合を30秒で作成
//   public/demo/demo-2-score.mp4    → スコアをイニングごとに入力
//   public/demo/demo-3-share.mp4    → QRコードで全員に共有
//
// Without ffmpeg the raw .webm files remain in public/demo/.
//
// Tips for Instagram Reels upload:
//   - Crop/trim to 15–30 seconds in any video editor
//   - Videos are 390×693 (9:16). Scale up in-editor if needed.

import { execSync } from "node:child_process";
import { mkdir, rename } from "node:fs/promises";
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
const OUT_DIR = resolve("public/demo");

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

// ── Firestore helpers ──────────────────────────────────────────────────────────

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
  // updated_at must be strictly greater than created_at
  await new Promise((r) => setTimeout(r, 1100));
  await updateDoc(ref, {
    innings: meta.innings,
    status: meta.status,
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

// Pre-seed game used in demos 2 and 3 (4 innings done, 5th is the active entry)
const demoId = await createTempGame({
  sport: "baseball",
  date: "2026-05-10",
  location: "駒沢オリンピック公園 野球場",
  team_top: "北区ファイターズ",
  team_bottom: "足立サムライズ",
  max_innings: 9,
  innings: [
    { inning: 1, top: 0, bottom: 1 },
    { inning: 2, top: 2, bottom: 0 },
    { inning: 3, top: 1, bottom: 1 },
    { inning: 4, top: 0, bottom: 2 },
  ],
  status: "in_progress",
});
console.log(`Seeded demo game: ${demoId}`);

// IDs to clean up at the end (demo-1 adds one more after form creation)
const cleanupIds = [demoId];

// ── Browser context factory ────────────────────────────────────────────────────

async function makeContext(browser, videoDir) {
  const ctx = await browser.newContext({
    ...devices["iPhone 14"],
    locale: "ja-JP",
    deviceScaleFactor: 2,
    // 9:16 aspect ratio matches Instagram Reels
    viewport: { width: 390, height: 693 },
    recordVideo: {
      dir: videoDir,
      size: { width: 390, height: 693 },
    },
  });
  // Stub navigator.share so the share UI renders on headless Chromium
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: () => Promise.resolve(),
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
  });
  return ctx;
}

async function settle(page, ms = 400) {
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(ms);
}

// ── ffmpeg helper ──────────────────────────────────────────────────────────────

function hasFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

async function toMp4(webmPath, mp4Path) {
  execSync(
    `ffmpeg -y -i "${webmPath}" -vf scale=1080:1920 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${mp4Path}"`,
    { stdio: "inherit" },
  );
}

// ── Demo recordings ────────────────────────────────────────────────────────────

let exitCode = 0;
let browser;

try {
  browser = await chromium.launch();
  const ffmpeg = hasFfmpeg();
  if (!ffmpeg) console.warn("⚠ ffmpeg not found — .webm files only (no mp4 conversion)");

  // ── Demo 1: 試合を作成 ─────────────────────────────────────────────────────
  {
    console.log("\n▶ Recording demo-1-create …");
    const videoDir = resolve(OUT_DIR, "tmp-d1");
    await mkdir(videoDir, { recursive: true });

    const ctx = await makeContext(browser, videoDir);
    const page = await ctx.newPage();

    // Opening pause — lets the recording start cleanly
    await page.goto(`${SITE}/games`, { waitUntil: "domcontentloaded" });
    await settle(page, 1500);

    await page.goto(`${SITE}/games/new`, { waitUntil: "domcontentloaded" });
    await settle(page, 1000);

    // Sport is 野球 by default; click it to make the selection visible
    await page.getByRole("button", { name: "野球" }).click();
    await settle(page, 600);

    // Type team names at a natural pace
    await page.getByPlaceholder("先攻チーム名").fill("北区ファイターズ", { timeout: 5000 });
    await settle(page, 700);
    await page.getByPlaceholder("後攻チーム名").fill("足立サムライズ");
    await settle(page, 700);

    await page.getByPlaceholder("例: 福井県営球場 第2グラウンド").fill("荒川河川敷");
    await settle(page, 800);

    // Submit
    await page.getByRole("button", { name: /試合を作成して共有する/ }).click();

    // Wait for redirect to /games/{id}
    await page.waitForURL(/\/games\/[^/]+$/, { timeout: 20000 });
    const createdId = page.url().split("/").pop();
    if (createdId && createdId !== "new") cleanupIds.push(createdId);

    // Wait for score screen: share button is always present for in_progress games
    await page.waitForSelector("button:has-text('共有')", { timeout: 25000 });
    await settle(page, 2500); // show the fresh score screen

    await ctx.close();

    const [webm] = (await import("node:fs")).readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    if (!webm) throw new Error("No webm found for demo-1");
    const webmPath = resolve(videoDir, webm);
    const finalWebm = resolve(OUT_DIR, "demo-1-create.webm");
    await rename(webmPath, finalWebm);

    if (ffmpeg) {
      await toMp4(finalWebm, resolve(OUT_DIR, "demo-1-create.mp4"));
      console.log("✓ demo-1-create.mp4");
    } else {
      console.log("✓ demo-1-create.webm");
    }
  }

  // ── Demo 2: スコアを入力 ──────────────────────────────────────────────────
  {
    console.log("\n▶ Recording demo-2-score …");
    const videoDir = resolve(OUT_DIR, "tmp-d2");
    await mkdir(videoDir, { recursive: true });

    const ctx = await makeContext(browser, videoDir);
    const page = await ctx.newPage();

    await page.goto(`${SITE}/games/${demoId}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('共有')", { timeout: 25000 });
    await settle(page, 2000); // let viewer read the current scoreboard

    // Scroll down to the stepper card (it may be below the fold on short viewport)
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
    await settle(page, 800);

    // Tap +1 twice for top team (先攻) — first button matching aria-label "+1"
    const plusTop = page.getByRole("button", { name: "+1" }).first();
    await plusTop.click();
    await settle(page, 500);
    await plusTop.click();
    await settle(page, 600);

    // Tap +1 once for bottom team (後攻) — second +1 button
    const plusBottom = page.getByRole("button", { name: "+1" }).last();
    await plusBottom.click();
    await settle(page, 800);

    // Save
    await page.getByRole("button").filter({ hasText: "保存する" }).click();
    await settle(page, 2500); // show the updated score table

    // Scroll back up to see full scoreboard
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await settle(page, 1500);

    await ctx.close();

    const [webm] = (await import("node:fs")).readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    if (!webm) throw new Error("No webm found for demo-2");
    const webmPath = resolve(videoDir, webm);
    const finalWebm = resolve(OUT_DIR, "demo-2-score.webm");
    await rename(webmPath, finalWebm);

    if (ffmpeg) {
      await toMp4(finalWebm, resolve(OUT_DIR, "demo-2-score.mp4"));
      console.log("✓ demo-2-score.mp4");
    } else {
      console.log("✓ demo-2-score.webm");
    }
  }

  // ── Demo 3: QRコードで共有 ────────────────────────────────────────────────
  {
    console.log("\n▶ Recording demo-3-share …");
    const videoDir = resolve(OUT_DIR, "tmp-d3");
    await mkdir(videoDir, { recursive: true });

    const ctx = await makeContext(browser, videoDir);
    const page = await ctx.newPage();

    await page.goto(`${SITE}/games/${demoId}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('共有')", { timeout: 25000 });
    await settle(page, 1800); // show score screen briefly

    // Open share modal
    await page.getByRole("button", { name: "共有" }).click();
    await page.waitForSelector("text=みんなに送る", { timeout: 10000 });
    await settle(page, 1500); // show "みんなに送る" and image preview

    // Wait for OG image to load
    await page.waitForFunction(
      () => {
        const img = document.querySelector('img[alt$="のプレビュー"]');
        return img && img.complete && img.naturalWidth > 0;
      },
      { timeout: 30000 },
    );
    await settle(page, 2000); // linger on image preview

    // Scroll down to QR code section
    await page.evaluate(() => {
      const qr = document.querySelector("canvas");
      if (qr) qr.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await settle(page, 3000); // hold on QR code — key visual for Instagram

    await ctx.close();

    const [webm] = (await import("node:fs")).readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    if (!webm) throw new Error("No webm found for demo-3");
    const webmPath = resolve(videoDir, webm);
    const finalWebm = resolve(OUT_DIR, "demo-3-share.webm");
    await rename(webmPath, finalWebm);

    if (ffmpeg) {
      await toMp4(finalWebm, resolve(OUT_DIR, "demo-3-share.mp4"));
      console.log("✓ demo-3-share.mp4");
    } else {
      console.log("✓ demo-3-share.webm");
    }
  }

  console.log(`\nAll demos saved to ${OUT_DIR}`);
} catch (err) {
  exitCode = 1;
  console.error("Recording failed:", err);
} finally {
  if (browser) await browser.close();

  // Clean up temp game directories
  const { rmSync } = await import("node:fs");
  for (const d of ["tmp-d1", "tmp-d2", "tmp-d3"]) {
    try { rmSync(resolve(OUT_DIR, d), { recursive: true, force: true }); } catch {}
  }

  // Delete Firestore temp games
  for (const id of cleanupIds) {
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
