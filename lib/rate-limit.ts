const KEY = "scorebo:create_history";
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function readHistory(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as number[]).filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function writeHistory(history: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(history));
  } catch {
    // localStorage 不可(プライベートモード等)は無視
  }
}

export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) {
    super("作成回数の上限に達しました。1時間ほど経ってから再度お試しください。");
    this.name = "RateLimitError";
  }
}

export function checkCreateRateLimit() {
  const now = Date.now();
  const recent = readHistory().filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = Math.min(...recent);
    throw new RateLimitError(WINDOW_MS - (now - oldest));
  }
}

export function recordCreate() {
  const now = Date.now();
  const recent = readHistory().filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  writeHistory(recent);
}
