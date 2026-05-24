// Record 2 Instagram demo videos for Scorebo using Playwright's built-in video capture.
//
//   node --env-file=.env.local scripts/record-demo.mjs
//
// Output:
//   public/demo/demo-1-flow.mp4        — 全フロー: 試合作成→スコア入力→QR共有 (portrait 9:16)
//   public/demo/demo-2-landscape.mp4   — ランドスケープ: スコア入力→保存→表更新 (landscape 16:9)
//
// Without ffmpeg the raw .webm files remain in public/demo/.

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

// Pre-seeded game for demo 2 (4 innings done, 5th is the active entry)
const demoId = await createTempGame({
  sport: "baseball",
  date: "2026-05-24",
  location: "駒沢公園 野球場",
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

// Games to clean up at the end (demo-1 adds one more after form creation)
const cleanupIds = [demoId];

// ── Browser context factories ──────────────────────────────────────────────────

async function stubShare(ctx) {
  await ctx.addInitScript(() => {
    // Stub navigator.share so share UI renders in headless Chromium
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: () => Promise.resolve(),
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
  });
}

async function makePortraitContext(browser, videoDir) {
  const ctx = await browser.newContext({
    ...devices["iPhone 14"],
    locale: "ja-JP",
    deviceScaleFactor: 2,
    viewport: { width: 390, height: 693 },
    recordVideo: { dir: videoDir, size: { width: 390, height: 693 } },
  });
  await stubShare(ctx);
  return ctx;
}

async function makeLandscapeContext(browser, videoDir) {
  // Width > height triggers @media (orientation: landscape) in the app
  const ctx = await browser.newContext({
    userAgent: devices["iPhone 14"].userAgent,
    locale: "ja-JP",
    deviceScaleFactor: 2,
    viewport: { width: 693, height: 390 },
    recordVideo: { dir: videoDir, size: { width: 693, height: 390 } },
  });
  await stubShare(ctx);
  return ctx;
}

async function settle(page, ms = 400) {
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(ms);
}

// ── ffmpeg helpers ─────────────────────────────────────────────────────────────

function hasFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function toPortraitMp4(webmPath, mp4Path) {
  execSync(
    `ffmpeg -y -i "${webmPath}" -vf scale=1080:1920 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${mp4Path}"`,
    { stdio: "inherit" },
  );
}

function toLandscapeMp4(webmPath, mp4Path) {
  execSync(
    `ffmpeg -y -i "${webmPath}" -vf scale=1920:1080 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${mp4Path}"`,
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

  // ── Demo 1: 全フロー (portrait 9:16) ──────────────────────────────────────
  {
    console.log("\n▶ Recording demo-1-flow …");
    const videoDir = resolve(OUT_DIR, "tmp-d1");
    await mkdir(videoDir, { recursive: true });

    const ctx = await makePortraitContext(browser, videoDir);
    const page = await ctx.newPage();

    // Arrive at create form
    await page.goto(`${SITE}/games/new`, { waitUntil: "domcontentloaded" });
    await settle(page, 1200);

    // Tap 野球 to make the selection visually active
    await page.getByRole("button", { name: "野球" }).click();
    await settle(page, 500);

    // Fill teams and location at a natural pace
    await page.getByPlaceholder("先攻チーム名").fill("北区ファイターズ");
    await settle(page, 600);
    await page.getByPlaceholder("後攻チーム名").fill("足立サムライズ");
    await settle(page, 600);
    await page.getByPlaceholder("例: 福井県営球場 第2グラウンド").fill("駒沢公園 野球場");
    await settle(page, 700);

    // Submit and wait for redirect to score screen
    await page.getByRole("button", { name: "試合を作成して共有する" }).click();
    await page.waitForURL(/\/games\/[^/]+$/, { timeout: 25000 });
    const createdId = page.url().split("/").pop();
    if (createdId && createdId !== "new") cleanupIds.push(createdId);

    await page.waitForSelector("button:has-text('共有')", { timeout: 25000 });
    await settle(page, 1200);

    // Scroll down to the inning stepper
    await page.evaluate(() => window.scrollTo({ top: 260, behavior: "smooth" }));
    await settle(page, 500);

    // Enter 1 inning: +1 for each team
    const plusTop = page.getByRole("button", { name: "+1" }).first();
    await plusTop.click();
    await settle(page, 350);
    const plusBottom = page.getByRole("button", { name: "+1" }).last();
    await plusBottom.click();
    await settle(page, 500);

    // Save — button text is "{n}回を保存する", partial match on "保存する"
    await page.getByRole("button").filter({ hasText: "保存する" }).click();
    await settle(page, 1500);

    // Scroll back to top to show the updated scoreboard
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await settle(page, 1000);

    // Open share modal
    await page.getByRole("button", { name: "共有" }).click();
    await page.waitForSelector("text=みんなに送る", { timeout: 10000 });
    await settle(page, 800);

    // Wait for OG score image to load
    await page.waitForFunction(
      () => {
        const img = document.querySelector('img[alt$="のプレビュー"]');
        return img && img.complete && img.naturalWidth > 0;
      },
      { timeout: 30000 },
    );
    await settle(page, 1500);

    // Scroll modal to QR code — key visual for Instagram
    await page.evaluate(() => {
      const qr = document.querySelector("canvas");
      if (qr) qr.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await settle(page, 2500);

    await ctx.close();

    const [webm] = (await import("node:fs")).readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    if (!webm) throw new Error("No webm found for demo-1");
    const webmPath = resolve(videoDir, webm);
    const finalWebm = resolve(OUT_DIR, "demo-1-flow.webm");
    await rename(webmPath, finalWebm);

    if (ffmpeg) {
      toPortraitMp4(finalWebm, resolve(OUT_DIR, "demo-1-flow.mp4"));
      console.log("✓ demo-1-flow.mp4");
    } else {
      console.log("✓ demo-1-flow.webm");
    }
  }

  // ── Demo 2: ランドスケープ (landscape 16:9) ────────────────────────────────
  {
    console.log("\n▶ Recording demo-2-landscape …");
    const videoDir = resolve(OUT_DIR, "tmp-d2");
    await mkdir(videoDir, { recursive: true });

    const ctx = await makeLandscapeContext(browser, videoDir);
    const page = await ctx.newPage();

    await page.goto(`${SITE}/games/${demoId}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('共有')", { timeout: 25000 });
    // Show compact hero bar + full-width score table
    await settle(page, 2000);

    // Scroll to inning stepper
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: "smooth" }));
    await settle(page, 500);

    // +2 for top team, +1 for bottom team
    const plusTop = page.getByRole("button", { name: "+1" }).first();
    await plusTop.click();
    await settle(page, 350);
    await plusTop.click();
    await settle(page, 350);
    const plusBottom = page.getByRole("button", { name: "+1" }).last();
    await plusBottom.click();
    await settle(page, 500);

    // Save
    await page.getByRole("button").filter({ hasText: "保存する" }).click();
    await settle(page, 1500);

    // Scroll back to top to show updated table in landscape full-width view
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await settle(page, 2000);

    await ctx.close();

    const [webm] = (await import("node:fs")).readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    if (!webm) throw new Error("No webm found for demo-2");
    const webmPath = resolve(videoDir, webm);
    const finalWebm = resolve(OUT_DIR, "demo-2-landscape.webm");
    await rename(webmPath, finalWebm);

    if (ffmpeg) {
      toLandscapeMp4(finalWebm, resolve(OUT_DIR, "demo-2-landscape.mp4"));
      console.log("✓ demo-2-landscape.mp4");
    } else {
      console.log("✓ demo-2-landscape.webm");
    }
  }

  console.log(`\nAll demos saved to ${OUT_DIR}`);
} catch (err) {
  exitCode = 1;
  console.error("Recording failed:", err);
} finally {
  if (browser) await browser.close();

  const { rmSync } = await import("node:fs");
  for (const d of ["tmp-d1", "tmp-d2"]) {
    try { rmSync(resolve(OUT_DIR, d), { recursive: true, force: true }); } catch {}
  }

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
