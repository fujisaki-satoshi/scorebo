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

test("イニングのスコアを入力して保存すると次のイニングへ進む", async ({ page }) => {
  await seedGame(testEnv, "score-game-1", "score-token-1");

  await page.goto("/games/score-game-1");
  // ゲームロード待ち
  await expect(page.getByText("1回の得点を入力")).toBeVisible({ timeout: 15000 });

  // 先攻に +1 を 2 回
  const plusButtons = page.getByRole("button", { name: "+1" });
  await plusButtons.first().click();
  await plusButtons.first().click();

  // 後攻に +1 を 1 回
  await plusButtons.nth(1).click();

  // 保存
  await page.getByRole("button", { name: "1回を保存する" }).click();

  // 2 回の見出しに変わる
  await expect(page.getByText("2回の得点を入力")).toBeVisible({ timeout: 15000 });
});

test("保存後に見出しが「2回の得点を入力」に変わる", async ({ page }) => {
  await seedGame(testEnv, "score-game-2", "score-token-2");

  await page.goto("/games/score-game-2");
  await expect(page.getByText("1回の得点を入力")).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "1回を保存する" }).click();

  await expect(page.getByText("2回の得点を入力")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("1回の得点を入力")).not.toBeVisible();
});

test("イニングを追加できる", async ({ page }) => {
  // max_innings: 1 でシードして、すでに最終回の状態を作る
  await seedGame(testEnv, "score-game-3", "score-token-3", {
    max_innings: 1,
    innings: [{ inning: 1, top: 0, bottom: 0 }],
  });

  await page.goto("/games/score-game-3");
  await expect(page.getByText("回の得点を入力")).toBeVisible({ timeout: 15000 });

  // イニング追加ボタンをクリック
  await page.getByRole("button", { name: "＋ イニングを追加" }).click({ timeout: 15000 });

  // 見出しが 2 回に変わる
  await expect(page.getByText("2回の得点を入力")).toBeVisible({ timeout: 15000 });
});
