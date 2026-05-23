"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAnonymousAuth } from "@/lib/auth";
import {
  clearKeySession,
  getKeySession,
  getSaveMethods,
  hasKey,
  setSaveMethod,
} from "@/lib/keys-client";
import { track } from "@/lib/analytics";
import type { SaveMethods } from "@/lib/keys-client";

const SAVE_LABELS: Record<keyof SaveMethods, { icon: string; label: string }> = {
  screenshot: { icon: "📷", label: "スクリーンショット" },
  line: { icon: "💬", label: "LINE Keep" },
  email: { icon: "📧", label: "メール" },
  print: { icon: "🖨", label: "印刷" },
};

export default function KeyringSettingsPage() {
  const router = useRouter();
  const user = useAnonymousAuth();
  const [keySession, setKeySession] = useState(() => getKeySession());
  const [methods, setMethods] = useState<SaveMethods>(getSaveMethods());
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [screenshotCountdown, setScreenshotCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const hasActiveKey = hasKey();

  async function getToken(): Promise<string | null> {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }

  async function handleReveal() {
    if (!keySession) return;
    if (revealedKey) {
      setRevealedKey(null);
      return;
    }
    setRevealedKey(keySession.recoveryKey);
    setTimeout(() => setRevealedKey(null), 30000);
  }

  async function handleScreenshot() {
    setScreenshotCountdown(3);
    for (let i = 2; i >= 0; i--) {
      await new Promise((r) => setTimeout(r, 1000));
      setScreenshotCountdown(i === 0 ? null : i);
    }
    await updateSaveMethod("screenshot", true);
  }

  async function updateSaveMethod(method: keyof SaveMethods, done: boolean) {
    setSaveMethod(method, done);
    setMethods(getSaveMethods());
    track("save_method_marked", { method });
    const token = await getToken();
    if (!token) return;
    fetch("/api/keys/me/save-methods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method, done }),
    }).catch(() => {/* non-critical */});
  }

  async function handleRegenerate() {
    setLoading("regen");
    const token = await getToken();
    if (!token) return setLoading(null);
    try {
      const res = await fetch("/api/keys/me/regenerate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { code: string; identityId: string; keyPrefix: string };
      const { saveKeySession } = await import("@/lib/keys-client");
      saveKeySession({ recoveryKey: data.code, identityId: data.identityId, keyPrefix: data.keyPrefix });
      sessionStorage.setItem("scorebo:new_key", data.code);
      router.push("/keys/display");
    } catch {
      /* show nothing, user can retry */
    } finally {
      setLoading(null);
      setShowRegenModal(false);
    }
  }

  async function handleRevoke() {
    setLoading("revoke");
    const token = await getToken();
    if (!token) return setLoading(null);
    try {
      await fetch("/api/keys/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      clearKeySession();
      setKeySession(null);
    } catch {
      /* ignore */
    } finally {
      setLoading(null);
      setShowRevokeModal(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-5 pt-4 pb-16">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Link href="/games" className="flex items-center gap-1 text-[13px] text-ink-sub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-[17px] font-bold text-ink">設定</h1>
      </div>

      {/* Eyebrow */}
      <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-brand-dark">
        SCOREBO · KEYRING
      </p>
      <h2 className="mb-4 font-sans text-[22px] font-bold text-ink">あなたの鍵</h2>

      {!hasActiveKey ? (
        <div className="rounded-xl border border-dashed border-line bg-brand-light px-5 py-8 text-center">
          <p className="mb-1 text-[14px] font-semibold text-ink">鍵がまだありません</p>
          <p className="mb-4 text-[12px] text-ink-sub">鍵を作ると、別の端末でも記録を戻せます。</p>
          <Link
            href="/keys/new"
            className="inline-block rounded-xl bg-brand px-5 py-2.5 text-[13px] font-bold text-white"
          >
            鍵をつくる →
          </Link>
        </div>
      ) : (
        <>
          {/* Key card */}
          <div className="relative mb-4 rounded-xl border border-brand/20 bg-white p-4">
            <div className="absolute top-3 right-3">
              <div
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-brand-light text-[18px] font-sans font-bold text-brand"
                style={{ transform: "rotate(-10deg)" }}
                aria-hidden="true"
              >
                鍵
              </div>
            </div>

            <p className="mb-0.5 font-mono text-[9px] tracking-[0.12em] text-brand">
              ACTIVE · KEY
            </p>

            {revealedKey ? (
              <>
                <div className="mb-1 font-mono text-[16px] font-medium tracking-[0.04em] text-ink">
                  <span className="text-[12px] text-brand">SB-</span>
                  {revealedKey.slice(3)}
                </div>
                <div className="mb-3 flex justify-center py-1">
                  <QRCodeSVG value={revealedKey} size={100} />
                </div>
                <p className="mb-2 text-center font-mono text-[9px] text-ink-sub">
                  30秒後に非表示になります
                </p>
              </>
            ) : (
              <div className="mb-1 font-mono text-[16px] font-medium tracking-[0.04em] text-ink">
                <span className="text-[12px] text-brand">SB-</span>
                {keySession?.keyPrefix ?? "????"}
                <span className="text-ink-sub">-????-????</span>
              </div>
            )}

            <p className="mb-3 font-mono text-[10.5px] text-ink-sub">
              作成 · {keySession?.keyPrefix ? "取得済" : "—"} / 最終利用 · 今日
            </p>

            {/* Action buttons */}
            <div className="flex gap-1.5">
              {[
                { label: "👁 見る", action: handleReveal },
                {
                  label: "📷 スクショ",
                  action: handleScreenshot,
                },
                {
                  label: "🔄 再発行",
                  action: () => setShowRegenModal(true),
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  className="flex-1 rounded-lg border border-line bg-brand-light px-1.5 py-1.5 text-[11px] font-semibold text-ink"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screenshot countdown overlay */}
          {screenshotCountdown !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <p className="text-[80px] font-bold text-white">{screenshotCountdown}</p>
            </div>
          )}

          {/* Save methods */}
          <p className="mb-2 font-mono text-[9.5px] tracking-[0.12em] text-brand-dark">
            この鍵をどこに保存したか
          </p>
          <div className="mb-4 flex flex-col gap-1.5">
            {(Object.entries(SAVE_LABELS) as [keyof SaveMethods, { icon: string; label: string }][]).map(
              ([key, { icon, label }]) => {
                const done = methods[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateSaveMethod(key, !done)}
                    className="grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2"
                  >
                    <span className="text-[16px]">{icon}</span>
                    <span className={`text-left text-[12px] font-medium ${done ? "text-ink" : "text-ink-sub"}`}>
                      {label}
                    </span>
                    <span className={`text-[11px] font-mono ${done ? "text-brand" : "text-ink-sub"}`}>
                      {done ? "✓ 保存済" : "未保存"}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {/* Tip */}
          <div className="mb-6 rounded-lg border border-dashed border-brand/40 bg-brand-light px-3 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-ink-sub">
              💡 2つ以上の場所に保存しておくと、より安心です。
            </p>
          </div>

          {/* Danger zone */}
          <button
            type="button"
            onClick={() => setShowRevokeModal(true)}
            className="w-full rounded-lg border border-red-200 py-2.5 text-[12px] font-semibold text-red-500"
          >
            この鍵を無効にする
          </button>
        </>
      )}

      {/* Regenerate modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 px-4 pb-8">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-2 text-[15px] font-bold text-ink">鍵を再発行しますか？</p>
            <p className="mb-5 text-[12.5px] leading-relaxed text-ink-sub">
              現在の鍵は無効になります。新しい鍵で保存しなおしてください。
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowRegenModal(false)} className="flex-1 rounded-lg border border-line py-2.5 text-[13px] font-semibold text-ink">
                キャンセル
              </button>
              <button type="button" onClick={handleRegenerate} disabled={loading === "regen"} className="flex-1 rounded-lg bg-brand py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                {loading === "regen" ? "処理中…" : "再発行する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 px-4 pb-8">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-2 text-[15px] font-bold text-ink">鍵を無効にしますか？</p>
            <p className="mb-5 text-[12.5px] leading-relaxed text-ink-sub">
              鍵を無効にすると、新しい端末から記録を戻せなくなります。本当に？
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowRevokeModal(false)} className="flex-1 rounded-lg border border-line py-2.5 text-[13px] font-semibold text-ink">
                キャンセル
              </button>
              <button type="button" onClick={handleRevoke} disabled={loading === "revoke"} className="flex-1 rounded-lg bg-red-500 py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
                {loading === "revoke" ? "処理中…" : "無効にする"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
