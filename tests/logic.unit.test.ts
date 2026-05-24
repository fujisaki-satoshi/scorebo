import { describe, it, expect, vi } from "vitest";

// 純粋関数のテストなので Firebase は不要。lib/firebase の副作用を抑制する
vi.mock("@/lib/firebase", () => ({ db: {}, auth: {} }));

import {
  currentInning,
  findInning,
  getPillStatus,
  hasAnyScore,
  lastRecordedInning,
  setInning,
  toInningMap,
  totals,
  totalSlots,
} from "@/lib/games";
import { formatGameDate, formatGameDateFull } from "@/lib/dates";
import type { InningScore } from "@/lib/types";

// ─── totals ──────────────────────────────────────────────────────────────────

describe("totals", () => {
  it("イニングなしは 0-0 を返す", () => {
    expect(totals([])).toEqual({ top: 0, bottom: 0 });
  });

  it("複数イニングを合算する", () => {
    const innings: InningScore[] = [
      { inning: 1, top: 3, bottom: 1 },
      { inning: 2, top: 0, bottom: 2 },
      { inning: 3, top: 2, bottom: 0 },
    ];
    expect(totals(innings)).toEqual({ top: 5, bottom: 3 });
  });

  it("null 値は 0 として扱う", () => {
    const innings: InningScore[] = [
      { inning: 1, top: null, bottom: 2 },
      { inning: 2, top: 1, bottom: null },
    ];
    expect(totals(innings)).toEqual({ top: 1, bottom: 2 });
  });
});

// ─── findInning ──────────────────────────────────────────────────────────────

describe("findInning", () => {
  const innings: InningScore[] = [
    { inning: 1, top: 0, bottom: 0 },
    { inning: 3, top: 2, bottom: 1 },
  ];

  it("存在するイニングを返す", () => {
    expect(findInning(innings, 3)).toEqual({ inning: 3, top: 2, bottom: 1 });
  });

  it("存在しないイニングは undefined を返す", () => {
    expect(findInning(innings, 2)).toBeUndefined();
  });
});

// ─── hasAnyScore ─────────────────────────────────────────────────────────────

describe("hasAnyScore", () => {
  it("空配列は false", () => {
    expect(hasAnyScore([])).toBe(false);
  });

  it("全て null は false", () => {
    expect(hasAnyScore([{ inning: 1, top: null, bottom: null }])).toBe(false);
  });

  it("top に値があれば true", () => {
    expect(hasAnyScore([{ inning: 1, top: 1, bottom: null }])).toBe(true);
  });

  it("bottom に値があれば true", () => {
    expect(hasAnyScore([{ inning: 1, top: null, bottom: 0 }])).toBe(true);
  });
});

// ─── setInning ───────────────────────────────────────────────────────────────

describe("setInning", () => {
  it("新しいイニングを追加する", () => {
    const result = setInning([], 1, 3, 2);
    expect(result).toEqual([{ inning: 1, top: 3, bottom: 2 }]);
  });

  it("既存イニングを上書きする", () => {
    const innings: InningScore[] = [{ inning: 1, top: 0, bottom: 0 }];
    const result = setInning(innings, 1, 5, 3);
    expect(result).toEqual([{ inning: 1, top: 5, bottom: 3 }]);
  });

  it("イニング番号順にソートされる", () => {
    const innings: InningScore[] = [{ inning: 3, top: 1, bottom: 0 }];
    const result = setInning(innings, 1, 2, 0);
    expect(result[0].inning).toBe(1);
    expect(result[1].inning).toBe(3);
  });
});

// ─── currentInning ───────────────────────────────────────────────────────────

describe("currentInning", () => {
  it("イニングが空なら 1 を返す", () => {
    expect(currentInning([], 9)).toBe(1);
  });

  it("1 回が記録済みなら 2 回を返す", () => {
    const innings: InningScore[] = [{ inning: 1, top: 0, bottom: 0 }];
    expect(currentInning(innings, 9)).toBe(2);
  });

  it("全イニング記録済みなら最終イニングを返す", () => {
    const innings: InningScore[] = Array.from({ length: 9 }, (_, i) => ({
      inning: i + 1,
      top: 0,
      bottom: 0,
    }));
    expect(currentInning(innings, 9)).toBe(9);
  });

  it("途中に未記録があればそこを返す", () => {
    const innings: InningScore[] = [
      { inning: 1, top: 1, bottom: 0 },
      { inning: 3, top: 2, bottom: 1 }, // 2 回が抜けている
    ];
    expect(currentInning(innings, 9)).toBe(2);
  });
});

// ─── lastRecordedInning / totalSlots ─────────────────────────────────────────

describe("lastRecordedInning", () => {
  it("空は 0", () => {
    expect(lastRecordedInning([])).toBe(0);
  });

  it("最大イニング番号を返す", () => {
    const innings: InningScore[] = [
      { inning: 1, top: 0, bottom: 0 },
      { inning: 5, top: 1, bottom: 0 },
    ];
    expect(lastRecordedInning(innings)).toBe(5);
  });
});

describe("totalSlots", () => {
  it("記録がなければ maxInnings を返す", () => {
    expect(totalSlots([], 9)).toBe(9);
  });

  it("記録が maxInnings を超えればその値を返す", () => {
    const innings: InningScore[] = [{ inning: 11, top: 0, bottom: 0 }];
    expect(totalSlots(innings, 9)).toBe(11);
  });
});

// ─── toInningMap ─────────────────────────────────────────────────────────────

describe("toInningMap", () => {
  it("イニング番号をキーにした Map を返す", () => {
    const innings: InningScore[] = [
      { inning: 1, top: 2, bottom: 1 },
      { inning: 2, top: 0, bottom: 3 },
    ];
    const map = toInningMap(innings);
    expect(map.get(1)).toEqual({ inning: 1, top: 2, bottom: 1 });
    expect(map.get(2)).toEqual({ inning: 2, top: 0, bottom: 3 });
    expect(map.get(3)).toBeUndefined();
  });
});

// ─── getPillStatus ───────────────────────────────────────────────────────────

describe("getPillStatus", () => {
  it("completed は '終了' / done", () => {
    const { pillText, pillVariant } = getPillStatus([], 9, "completed");
    expect(pillText).toBe("終了");
    expect(pillVariant).toBe("done");
  });

  it("スコアなし in_progress は '予定' / scheduled", () => {
    const { pillText, pillVariant } = getPillStatus([], 9, "in_progress");
    expect(pillText).toBe("予定");
    expect(pillVariant).toBe("scheduled");
  });

  it("スコアあり in_progress は '進行中 N回' / live", () => {
    const innings: InningScore[] = [{ inning: 1, top: 2, bottom: 1 }];
    const { pillText, pillVariant } = getPillStatus(innings, 9, "in_progress");
    expect(pillText).toBe("進行中 2回");
    expect(pillVariant).toBe("live");
  });
});

// ─── formatGameDate ───────────────────────────────────────────────────────────

describe("formatGameDate", () => {
  it("今年は月/日のみ", () => {
    const thisYear = new Date().getFullYear();
    expect(formatGameDate(`${thisYear}-06-15`)).toBe("6/15");
  });

  it("今年でなければ年/月/日", () => {
    expect(formatGameDate("2020-03-01")).toBe("2020/3/1");
  });

  it("空文字はそのまま返す", () => {
    expect(formatGameDate("")).toBe("");
  });
});

describe("formatGameDateFull", () => {
  it("常に年/月/日を返す", () => {
    const thisYear = new Date().getFullYear();
    expect(formatGameDateFull(`${thisYear}-06-15`)).toBe(`${thisYear}/6/15`);
  });
});
