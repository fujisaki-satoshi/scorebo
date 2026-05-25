import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

export async function createTestEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: "scorebo-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
}

export async function seedGame(
  testEnv: RulesTestEnvironment,
  gameId: string,
  viewToken: string,
  overrides?: Record<string, unknown>,
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "games", gameId), {
      sport: "baseball",
      date: "2026-05-24",
      location: "",
      team_top: "テストA",
      team_bottom: "テストB",
      max_innings: 9,
      innings: [],
      status: "in_progress",
      created_at: new Date(),
      updated_at: new Date(),
      view_token: viewToken,
      ...overrides,
    });
    await setDoc(doc(db, "view_tokens", viewToken), { game_id: gameId });
  });
}
