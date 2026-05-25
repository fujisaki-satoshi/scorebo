import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3001",
    // アプリはモバイル縦向きを想定。横長 viewport だと landscape: CSS で要素が非表示になる
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // E2E 実行時は firebase emulators:exec から呼ばれるため、
  // Next.js dev サーバーをここで起動しエミュレーターに接続させる
  webServer: {
    command: "npx next dev -p 3001",
    url: "http://localhost:3001",
    timeout: 60000,
    reuseExistingServer: false,
    env: {
      // Firestore エミュレーター接続先（lib/firebase.ts が読む）
      NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: "localhost:8080",
      // テスト用プロジェクト ID（initializeTestEnvironment と合わせる）
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "scorebo-test",
      // その他 Firebase 設定はダミー値（エミュレーター使用時は不要）
      NEXT_PUBLIC_FIREBASE_API_KEY: "test",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "scorebo-test.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "scorebo-test.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:000000000000",
    },
  },
});
