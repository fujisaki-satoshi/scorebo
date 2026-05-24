import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "scorebo-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ルールを無効化してテスト用データを投入する
async function seedGame(gameId: string, viewToken: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "games", gameId), {
      sport: "baseball",
      date: "2026-05-24",
      location: "",
      team_top: "チームA",
      team_bottom: "チームB",
      max_innings: 9,
      innings: [],
      status: "in_progress",
      created_at: new Date(),
      updated_at: new Date(),
      view_token: viewToken,
      owner_uid: "user-1",
    });
    await setDoc(doc(db, "view_tokens", viewToken), { game_id: gameId });
  });
}

// ─── 試合作成 ─────────────────────────────────────────────────────────────────

describe("試合作成 (createGame)", () => {
  it("正しい形式で試合を作成できる", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      setDoc(doc(db, "games", "create-valid"), {
        sport: "baseball",
        date: "2026-05-24",
        location: "",
        team_top: "チームA",
        team_bottom: "チームB",
        max_innings: 9,
        innings: [],
        status: "in_progress",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("チーム名が空だと作成できない", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "games", "create-invalid-team"), {
        sport: "baseball",
        date: "2026-05-24",
        location: "",
        team_top: "", // 空文字は isStr(v, 1, 50) に違反
        team_bottom: "チームB",
        max_innings: 9,
        innings: [],
        status: "in_progress",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("不正なスポート種別は作成できない", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "games", "create-invalid-sport"), {
        sport: "tennis", // isSport() に違反
        date: "2026-05-24",
        location: "",
        team_top: "チームA",
        team_bottom: "チームB",
        max_innings: 9,
        innings: [],
        status: "in_progress",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("イニングに初期データがあると作成できない", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "games", "create-with-innings"), {
        sport: "baseball",
        date: "2026-05-24",
        location: "",
        team_top: "チームA",
        team_bottom: "チームB",
        max_innings: 9,
        innings: [{ inning: 1, top: 0, bottom: 0 }], // innings.size() == 0 に違反
        status: "in_progress",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    );
  });
});

// ─── 試合読み込み ─────────────────────────────────────────────────────────────

describe("試合読み込み", () => {
  it("誰でも試合を読める", async () => {
    await seedGame("read-game-1", "read-token-1");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "games", "read-game-1")));
  });
});

// ─── 試合更新 ─────────────────────────────────────────────────────────────────

describe("試合更新 (updateInnings / updateStatus / updateGameMeta)", () => {
  it("イニングスコアを更新できる", async () => {
    await seedGame("update-game-1", "update-token-1");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      updateDoc(doc(db, "games", "update-game-1"), {
        innings: [{ inning: 1, top: 3, bottom: 2 }],
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("ステータスを更新できる", async () => {
    await seedGame("update-game-2", "update-token-2");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      updateDoc(doc(db, "games", "update-game-2"), {
        status: "completed",
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("チーム名を更新できる", async () => {
    await seedGame("update-game-3", "update-token-3");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      updateDoc(doc(db, "games", "update-game-3"), {
        team_top: "ライオンズ",
        team_bottom: "タイガース",
        updated_at: serverTimestamp(),
      }),
    );
  });

  it("不正なステータスには更新できない", async () => {
    await seedGame("update-game-4", "update-token-4");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      updateDoc(doc(db, "games", "update-game-4"), {
        status: "cancelled", // isStatus() に違反
        updated_at: serverTimestamp(),
      }),
    );
  });
});

// ─── 試合削除 (deleteGame) ────────────────────────────────────────────────────

describe("試合削除 (deleteGame)", () => {
  it("試合ドキュメントを削除できる", async () => {
    await seedGame("delete-game-1", "delete-token-1");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(deleteDoc(doc(db, "games", "delete-game-1")));
  });

  it("view_token ドキュメントを削除できる", async () => {
    await seedGame("delete-game-2", "delete-token-2");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(deleteDoc(doc(db, "view_tokens", "delete-token-2")));
  });

  // このテストが今回のバグを発見できたケース:
  //   view_tokens の allow delete が false だったため batch が失敗し、
  //   UI が「試合が見つかりません」から回復できなくなっていた
  it("試合と view_token をバッチ削除できる（deleteGame の実動作と同等）", async () => {
    await seedGame("delete-game-3", "delete-token-3");
    const db = testEnv.unauthenticatedContext().firestore();
    const batch = writeBatch(db);
    batch.delete(doc(db, "games", "delete-game-3"));
    batch.delete(doc(db, "view_tokens", "delete-token-3"));
    await assertSucceeds(batch.commit());
  });
});

// ─── view_token ルール ────────────────────────────────────────────────────────

describe("view_token ルール", () => {
  it("誰でも view_token を読める", async () => {
    await seedGame("vt-read-1", "vt-read-token-1");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "view_tokens", "vt-read-token-1")));
  });

  it("正しい形式で view_token を作成できる", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      setDoc(doc(db, "view_tokens", "new-token"), { game_id: "some-game-id" }),
    );
  });

  it("game_id 以外のフィールドを持つ view_token は作成できない", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "view_tokens", "bad-token"), {
        game_id: "some-game-id",
        extra: "field", // hasOnly(['game_id']) に違反
      }),
    );
  });

  it("view_token を更新しようとすると失敗する", async () => {
    await seedGame("vt-update-1", "vt-update-token-1");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      updateDoc(doc(db, "view_tokens", "vt-update-token-1"), {
        game_id: "other-game",
      }),
    );
  });
});
