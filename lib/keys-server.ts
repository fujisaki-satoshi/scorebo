import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function generateRecoveryKey(): string {
  const buf = randomBytes(6);
  const digits = Array.from(buf).map((b) => b % 10).join("");
  return `SB-${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

export function hashKey(key: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(key + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyKey(key: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const computed = createHash("sha256").update(key + salt).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

export function keyPrefix(key: string): string {
  return key.split("-")[1] ?? "";
}

export function normalizeKey(raw: string): string {
  const stripped = raw.replace(/\s/g, "").toUpperCase();
  if (/^SB-\d{4}-\d{4}-\d{4}$/.test(stripped)) return stripped;
  const digits = stripped.replace(/[^0-9]/g, "");
  if (digits.length === 12) {
    return `SB-${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
  }
  return stripped;
}
