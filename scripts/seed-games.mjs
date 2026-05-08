// One-off seed script for "もっと見る" pagination testing.
// Inserts 50 games into the production Firestore.
//
// Usage:
//   node --env-file=.env.local scripts/seed-games.mjs
//
// Generates a mix of in-progress/live/completed games across the 3 sports
// so that both "進行中の試合" and "最近の試合" sections render with real data.

import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error(
    "Missing Firebase env vars. Run with: node --env-file=.env.local scripts/seed-games.mjs",
  );
  process.exit(1);
}

const SPORTS = {
  baseball: {
    max: 9,
    teams: [
      "中野ベアーズ",
      "町田パイレーツ",
      "渋谷スターズ",
      "横浜キッズ",
      "杉並ファイターズ",
      "練馬ライオンズ",
      "川崎ホークス",
      "武蔵野ブレイブス",
      "国分寺イーグルス",
      "多摩川クラブ",
    ],
  },
  softball: {
    max: 7,
    teams: [
      "江戸川レディース",
      "葛飾ソフト",
      "世田谷ガールズ",
      "目黒ヴィーナス",
      "大田クィーンズ",
      "北区ソフト",
      "板橋エンジェルス",
      "練馬スワン",
    ],
  },
  kickball: {
    max: 5,
    teams: [
      "桜小学校",
      "ひまわり子供会",
      "富士見台小",
      "みどり台小",
      "山田スポーツ少年団",
      "たんぽぽ会",
      "緑町チーム",
      "北山小学校",
    ],
  },
};

const LOCATIONS = [
  "駒沢オリンピック公園",
  "二子玉川公園",
  "世田谷区民球場",
  "川崎市営多目的球場",
  "二宮スポーツ広場",
  "武蔵野中央公園",
  "多摩市営球場",
  "上井草スポーツセンター",
  "立川公園野球場",
  "井の頭公園グラウンド",
  "",
];

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickTwoUnique(arr) {
  const i = randInt(0, arr.length - 1);
  let j = randInt(0, arr.length - 1);
  while (j === i) j = randInt(0, arr.length - 1);
  return [arr[i], arr[j]];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateMinusDays(d) {
  const base = new Date("2026-05-09T00:00:00Z");
  base.setUTCDate(base.getUTCDate() - d);
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`;
}

const SPORT_KEYS = ["baseball", "softball", "kickball"];

function makeGame(i) {
  const sport = SPORT_KEYS[i % 3];
  const meta = SPORTS[sport];
  const [team_top, team_bottom] = pickTwoUnique(meta.teams);
  const location = LOCATIONS[randInt(0, LOCATIONS.length - 1)];
  const date = dateMinusDays(Math.floor(i / 2));
  const max_innings = meta.max;

  // Distribute statuses:
  //   pattern 0: live (in_progress + partial scores)  ~20%
  //   pattern 1,2: scheduled (in_progress + empty)    ~40%
  //   pattern 3,4: completed (full innings)           ~40%
  const pattern = i % 5;
  let innings = [];
  let status = "in_progress";

  if (pattern === 0) {
    const filled = randInt(1, Math.max(1, max_innings - 1));
    for (let n = 1; n <= filled; n++) {
      innings.push({ inning: n, top: randInt(0, 7), bottom: randInt(0, 7) });
    }
  } else if (pattern === 1 || pattern === 2) {
    innings = [];
  } else {
    for (let n = 1; n <= max_innings; n++) {
      innings.push({ inning: n, top: randInt(0, 7), bottom: randInt(0, 7) });
    }
    status = "completed";
  }

  return {
    sport,
    date,
    location,
    team_top,
    team_bottom,
    max_innings,
    innings,
    status,
    created_at: serverTimestamp(),
  };
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COUNT = 50;
const games = Array.from({ length: COUNT }, (_, i) => makeGame(i));

console.log(`Seeding ${COUNT} games into project "${firebaseConfig.projectId}"...`);

let ok = 0;
let failed = 0;
// Sequential to spread server timestamps so the order on the home page reflects
// insertion order; pagination uses doc-cursor so it works either way, but this
// keeps the test data visually intuitive.
for (let i = 0; i < games.length; i++) {
  try {
    const ref = await addDoc(collection(db, "games"), games[i]);
    ok++;
    if ((i + 1) % 10 === 0 || i === games.length - 1) {
      console.log(`  ${i + 1}/${games.length} inserted (latest id: ${ref.id})`);
    }
  } catch (e) {
    failed++;
    console.error(`  failed at ${i}:`, e.message);
  }
}

console.log(`Done. ok=${ok} failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);
