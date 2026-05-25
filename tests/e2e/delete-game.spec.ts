import { test, expect, type Page } from "@playwright/test";
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

async function deleteGame(page: Page, gameId: string) {
  await page.goto(`/games/${gameId}`);
  // メニューボタンが表示 = ゲームがロードされた状態（landscape 対応なし・常時表示）
  await page.getByLabel("メニュー").click({ timeout: 15000 });
  await page.getByText("この試合を削除").click();
  await page.getByRole("button", { name: "削除する" }).click();
}

// ─── メインシナリオ ────────────────────────────────────────────────────────────

test("試合を削除するとホームへ遷移する", async ({ page }) => {
  await seedGame(testEnv, "e2e-delete-1", "e2e-token-1");

  await deleteGame(page, "e2e-delete-1");

  await expect(page).toHaveURL("/", { timeout: 10000 });
});

// ─── リグレッション ───────────────────────────────────────────────────────────
//
// 修正前のバグ:
//   view_tokens の allow delete が false だったため削除バッチが失敗し、
//   Firestore SDK の楽観的更新で watchGame が null を受け取り
//   「試合が見つかりません」画面に固まってしまっていた。

test("削除後に「試合が見つかりません」で固まらない（リグレッション）", async ({
  page,
}) => {
  await seedGame(testEnv, "e2e-delete-2", "e2e-token-2");

  await deleteGame(page, "e2e-delete-2");

  // ホームへ遷移し、試合が見つかりません画面が残らないことを確認
  await expect(page).toHaveURL("/", { timeout: 10000 });
  await expect(page.getByText("試合が見つかりません")).not.toBeVisible();
});
