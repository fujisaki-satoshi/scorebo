import { test, expect } from "@playwright/test";
import { type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { createTestEnv } from "./_helpers";

let testEnv: RulesTestEnvironment;

test.beforeAll(async () => {
  testEnv = await createTestEnv();
});

test.afterAll(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async ({ page }) => {
  await testEnv.clearFirestore();
  // rate limit は localStorage ベースのためリセットする
  await page.goto("/games/new");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("試合を作成できる", async ({ page }) => {
  await page.getByPlaceholder("先攻チーム名").fill("チームA");
  await page.getByPlaceholder("後攻チーム名").fill("チームB");

  await page.getByRole("button", { name: "試合を作成して共有する" }).click();

  await expect(page).toHaveURL(/\/games\/[^/]+$/, { timeout: 15000 });
});

test("チーム名が空だと送信ボタンが disabled", async ({ page }) => {
  // 両フィールド未入力の状態
  const submitButton = page.getByRole("button", { name: "試合を作成して共有する" });
  await expect(submitButton).toBeDisabled();

  // 先攻だけ入力しても disabled のまま
  await page.getByPlaceholder("先攻チーム名").fill("チームA");
  await expect(submitButton).toBeDisabled();

  // 後攻だけ入力しても disabled のまま（先攻クリア）
  await page.getByPlaceholder("先攻チーム名").fill("");
  await page.getByPlaceholder("後攻チーム名").fill("チームB");
  await expect(submitButton).toBeDisabled();
});
