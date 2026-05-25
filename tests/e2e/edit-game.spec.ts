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

test("チーム名を編集できる", async ({ page }) => {
  await seedGame(testEnv, "edit-game-1", "edit-token-1");

  await page.goto("/games/edit-game-1");
  // ゲームロード待ち
  await page.getByLabel("メニュー").click({ timeout: 15000 });
  await page.getByText("試合情報を編集").click();

  // EditSheet が表示される
  await expect(page.getByText("試合情報を編集")).toBeVisible({ timeout: 15000 });

  // 先攻チーム名を変更
  // SheetTeamInput は side="先攻" のラベルと同行の input
  const teamTopInput = page
    .locator("div")
    .filter({ hasText: /^先攻/ })
    .locator("input")
    .first();
  await teamTopInput.fill("新チームA");

  // 保存ボタンをクリック
  await page.getByRole("button", { name: "変更を保存" }).click();

  // EditSheet が閉じる（「変更を保存」ボタンが消える）
  await expect(page.getByRole("button", { name: "変更を保存" })).not.toBeVisible({
    timeout: 15000,
  });
});
