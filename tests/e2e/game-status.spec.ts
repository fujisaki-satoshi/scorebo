import { test, expect } from "@playwright/test";
import { type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { createTestEnv, seedGame } from "./_helpers";

let testEnv: RulesTestEnvironment;

test.beforeAll(async () => {
  testEnv = await createTestEnv();
});

test.afterAll(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("試合を終了できる", async ({ page }) => {
  await seedGame(testEnv, "status-game-1", "status-token-1", {
    status: "in_progress",
  });

  await page.goto("/games/status-game-1");
  // ゲームロード待ち
  await expect(page.getByRole("button", { name: "🏁 試合を終了" })).toBeVisible({
    timeout: 15000,
  });

  await page.getByRole("button", { name: "🏁 試合を終了" }).click({ timeout: 15000 });

  // ボタンテキストが「↩ 試合を再開」に変わる
  await expect(page.getByRole("button", { name: "↩ 試合を再開" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("button", { name: "🏁 試合を終了" })).not.toBeVisible();
});

test("試合を再開できる", async ({ page }) => {
  // completed でシード
  await seedGame(testEnv, "status-game-2", "status-token-2", {
    status: "completed",
  });

  await page.goto("/games/status-game-2");
  await expect(page.getByRole("button", { name: "↩ 試合を再開" })).toBeVisible({
    timeout: 15000,
  });

  await page.getByRole("button", { name: "↩ 試合を再開" }).click({ timeout: 15000 });

  // ボタンテキストが「🏁 試合を終了」に変わる
  await expect(page.getByRole("button", { name: "🏁 試合を終了" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("button", { name: "↩ 試合を再開" })).not.toBeVisible();
});
