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

test("シードした試合が「すべて」タブに表示される", async ({ page }) => {
  await seedGame(testEnv, "list-game-1", "list-token-1", {
    team_top: "リストチームA",
    team_bottom: "リストチームB",
  });

  await page.goto("/games");
  // 「すべて」は tab ボタンと filter chip の 2 箇所にある。tab は先頭
  await page.getByRole("button", { name: "すべて" }).first().click();

  await expect(page.getByText("リストチームA")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("リストチームB")).toBeVisible({ timeout: 15000 });
});

test("「野球」フィルターで絞り込める", async ({ page }) => {
  // baseball と softball の試合をシード
  await seedGame(testEnv, "list-game-2", "list-token-2", {
    sport: "baseball",
    team_top: "野球チームA",
    team_bottom: "野球チームB",
  });
  await seedGame(testEnv, "list-game-3", "list-token-3", {
    sport: "softball",
    team_top: "ソフトチームA",
    team_bottom: "ソフトチームB",
  });

  await page.goto("/games");
  await page.getByRole("button", { name: "すべて" }).first().click();

  // 両方表示されていることを確認
  await expect(page.getByText("野球チームA")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("ソフトチームA")).toBeVisible({ timeout: 15000 });

  // 「野球」フィルターチップをクリック
  await page.getByRole("button", { name: "野球" }).click();

  // baseball のみ表示、softball は非表示
  await expect(page.getByText("野球チームA")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("ソフトチームA")).not.toBeVisible();
});

test("チーム名で検索できる", async ({ page }) => {
  await seedGame(testEnv, "list-game-4", "list-token-4", {
    team_top: "検索対象チームX",
    team_bottom: "検索対象チームY",
  });
  await seedGame(testEnv, "list-game-5", "list-token-5", {
    team_top: "別のチームP",
    team_bottom: "別のチームQ",
  });

  await page.goto("/games");
  await page.getByRole("button", { name: "すべて" }).first().click();

  // 両方表示されている
  await expect(page.getByText("検索対象チームX")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("別のチームP")).toBeVisible({ timeout: 15000 });

  // 検索 input に入力
  await page.getByPlaceholder("チーム名・場所で検索…").fill("検索対象");

  // 一致するチームのみ表示
  await expect(page.getByText("検索対象チームX")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("別のチームP")).not.toBeVisible();
});
