const K = {
  RECOVERY_KEY: "scorebo:recovery_key",
  IDENTITY_ID: "scorebo:identity_id",
  KEY_PREFIX: "scorebo:key_prefix",
  SAVE_METHODS: "scorebo:save_methods",
  BANNER_DISMISSED: "scorebo:banner_dismissed_until",
  TIMELINE_GATE_SHOWN: "scorebo:timeline_gate_shown",
  APP_VERSION: "scorebo:app_version",
} as const;

export type SaveMethods = {
  screenshot: boolean;
  line: boolean;
  email: boolean;
  print: boolean;
};

export type KeySession = {
  recoveryKey: string;
  identityId: string;
  keyPrefix: string;
};

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* localStorage unavailable */
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function saveKeySession(session: KeySession) {
  write(K.RECOVERY_KEY, session.recoveryKey);
  write(K.IDENTITY_ID, session.identityId);
  write(K.KEY_PREFIX, session.keyPrefix);
}

export function clearKeySession() {
  remove(K.RECOVERY_KEY);
  remove(K.IDENTITY_ID);
  remove(K.KEY_PREFIX);
  remove(K.SAVE_METHODS);
}

export function getKeySession(): KeySession | null {
  const recoveryKey = read(K.RECOVERY_KEY);
  const identityId = read(K.IDENTITY_ID);
  const keyPrefix = read(K.KEY_PREFIX);
  if (!recoveryKey || !identityId || !keyPrefix) return null;
  return { recoveryKey, identityId, keyPrefix };
}

export function hasKey(): boolean {
  return read(K.RECOVERY_KEY) !== null;
}

export function getSaveMethods(): SaveMethods {
  const raw = read(K.SAVE_METHODS);
  if (!raw) return { screenshot: false, line: false, email: false, print: false };
  try {
    return JSON.parse(raw) as SaveMethods;
  } catch {
    return { screenshot: false, line: false, email: false, print: false };
  }
}

export function setSaveMethod(method: keyof SaveMethods, done: boolean) {
  const current = getSaveMethods();
  const updated = { ...current, [method]: done };
  write(K.SAVE_METHODS, JSON.stringify(updated));
}

export function isBannerDismissed(): boolean {
  const val = read(K.BANNER_DISMISSED);
  if (!val) return false;
  return Date.now() < parseInt(val, 10);
}

export function dismissBanner() {
  const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
  write(K.BANNER_DISMISSED, String(until));
}

export function markTimelineGateSeen() {
  write(K.TIMELINE_GATE_SHOWN, "1");
}

export function hasSeenTimelineGate(): boolean {
  return read(K.TIMELINE_GATE_SHOWN) === "1";
}

export function setAppVersion(v: string) {
  write(K.APP_VERSION, v);
}

export function getAppVersion(): string | null {
  return read(K.APP_VERSION);
}
