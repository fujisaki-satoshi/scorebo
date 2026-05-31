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

test("先攻・後攻を入力すると自動保存されて進行中インジケーターが次の回に進む", async ({ page }) => {
  await seedGame(testEnv, "score-game-1", "score-token-1");

  await page.goto("/games/score-game-1");
  await expect(page.getByText("1回の得点を入力")).toBeVisible({ timeout: 15000 });

  // 先攻に +1 を 2 回、後攻に +1 を 1 回
  const plusButtons = page.getByRole("button", { name: "+1" });
  await plusButtons.first().click();
  await plusButtons.first().click();
  await plusButtons.nth(1).click();

  // autosave 完了を待つ（debounce 1秒 + Firestore 書き込み + watchGame 受信）
  await page.waitForTimeout(4000);

  // portrait/landscape 両方にピルがあるが、visible なものだけを対象にする
  await expect(page.getByText("進行中 2回").filter({ visible: true })).toBeVisible({ timeout: 5000 });
});

test("スコアボードの合計列（R）が autosave 後に更新される", async ({ page }) => {
  await seedGame(testEnv, "score-game-2", "score-token-2");

  await page.goto("/games/score-game-2");
  await expect(page.getByText("1回の得点を入力")).toBeVisible({ timeout: 15000 });

  // 先攻に +1 を 3 回
  const plusButtons = page.getByRole("button", { name: "+1" });
  await plusButtons.first().click();
  await plusButtons.first().click();
  await plusButtons.first().click();

  await page.waitForTimeout(4000);

  // ScoreTable の R 列（tbody の各行の最終 td）先攻行が 3 になっている
  const topTotal = page.locator("tbody tr").first().locator("td").last();
  await expect(topTotal).toHaveText("3", { timeout: 5000 });
});

test("スコアボードのセルをタップして編集イニングを切り替えられる", async ({ page }) => {
  await seedGame(testEnv, "score-game-3", "score-token-3", {
    innings: [
      { inning: 1, top: 2, bottom: 1 },
      { inning: 2, top: 0, bottom: 0 },
    ],
  });

  await page.goto("/games/score-game-3");
  await expect(page.getByText("3回の得点を入力")).toBeVisible({ timeout: 15000 });

  // スコアボードの 1 回セルをタップ（td index 0 = チームラベル、index 1 = 1回）
  await page.locator("tbody tr").first().locator("td").nth(1).click();

  // 編集パネルが 1 回に切り替わる
  await expect(page.getByText("1回の得点を入力")).toBeVisible({ timeout: 5000 });
});

test("イニングを追加できる", async ({ page }) => {
  await seedGame(testEnv, "score-game-4", "score-token-4", {
    max_innings: 1,
    innings: [{ inning: 1, top: 0, bottom: 0 }],
  });

  await page.goto("/games/score-game-4");
  await expect(page.getByText("回の得点を入力")).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "＋ イニングを追加" }).click({ timeout: 15000 });

  await expect(page.getByText("2回の得点を入力")).toBeVisible({ timeout: 15000 });
});
