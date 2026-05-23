"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveKeySession } from "@/lib/keys-client";
import { track } from "@/lib/analytics";

export default function KeyRestoreInputPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLostModal, setShowLostModal] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const code = digits.every((d) => d.length === 4) ? `SB-${digits[0]}-${digits[1]}-${digits[2]}` : null;

  function handleDigitChange(idx: number, value: string) {
    const clean = value.replace(/[^0-9]/g, "").slice(0, 4);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    if (clean.length === 4 && idx < 2) {
      inputRefs[idx + 1].current?.focus();
    }
    setError(null);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (raw.length >= 12) {
      setDigits([raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12)]);
      inputRefs[2].current?.focus();
    }
  }

  async function handleRestore() {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.status === 404) {
        track("key_restore_failed", { reason: "not_found" });
        setError("この鍵では戻せません。打ち間違いをご確認ください。");
        return;
      }
      if (res.status === 429) {
        setError("試行回数が多すぎます。しばらくお待ちください。");
        return;
      }
      if (!res.ok) throw new Error();

      const data = (await res.json()) as {
        customToken: string;
        identityId: string;
        gameCount: number;
        memoryQuote: { text: string; date: string; location: string } | null;
      };

      await signInWithCustomToken(auth, data.customToken);
      saveKeySession({ recoveryKey: code, identityId: data.identityId, keyPrefix: code.split("-")[1] });
      track("key_restored", {});

      sessionStorage.setItem(
        "scorebo:restore_result",
        JSON.stringify({ gameCount: data.gameCount, memoryQuote: data.memoryQuote }),
      );
      router.push("/restore/done");
    } catch {
      setError("エラーが発生しました。電波の届く場所で再試行してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-canvas px-5 pt-4 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/games" className="flex items-center gap-1 text-[13px] text-ink-sub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          戻る
        </Link>
        <span className="font-mono text-[10px] tracking-[0.16em] text-brand">新しい端末</span>
      </div>

      <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-brand">復元する</p>
      <h1 className="mb-2 font-sans text-[24px] font-bold leading-[1.3] text-ink">
        鍵で、記録を戻す
      </h1>
      <p className="mb-8 text-[12px] leading-relaxed text-ink-sub">
        以前の端末でつくった鍵を入力します。
      </p>

      {/* Manual input */}
      <div className="mb-2">
        <p className="mb-2 font-mono text-[10px] tracking-[0.12em] text-ink-sub">
          12桁の鍵を入力
        </p>
        <div className="rounded-xl border border-line bg-white px-4 py-3.5">
          <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
            <span className="font-mono text-[12px] text-brand">SB-</span>
            {digits.map((d, i) => (
              <span key={i} className="flex items-center gap-2">
                <input
                  ref={inputRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  placeholder="0000"
                  aria-label={`鍵 ${i + 1}番目の4桁`}
                  className="h-10 w-[56px] rounded border border-line bg-canvas text-center font-mono text-[16px] tracking-widest text-ink outline-none focus:border-brand"
                />
                {i < 2 && <span className="text-ink-sub">-</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-[12.5px] text-red-700">{error}</p>
          {error.includes("打ち間違い") && (
            <button type="button" onClick={handleRestore} className="mt-1.5 text-[11px] font-semibold text-brand underline">
              再試行
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] px-5 pb-8 pt-4 bg-canvas/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleRestore}
          disabled={!code || loading}
          className="block w-full rounded-xl bg-brand py-3.5 text-center text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.3)] disabled:opacity-40"
        >
          {loading ? "確認中…" : "記録を戻す →"}
        </button>
        <button
          type="button"
          onClick={() => setShowLostModal(true)}
          className="mt-3 block w-full text-center text-[11px] text-ink-sub underline decoration-dotted"
        >
          鍵をなくしてしまった？
        </button>
      </div>

      {/* Lost key modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 px-4 pb-8">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-2 text-[15px] font-bold text-ink">鍵をなくしてしまった場合</p>
            <p className="mb-5 text-[12.5px] leading-relaxed text-ink-sub">
              サーバーには鍵を保管していないため、復元できません。
              新しく試合を始めてください。
            </p>
            <button
              type="button"
              onClick={() => setShowLostModal(false)}
              className="w-full rounded-lg border border-line py-2.5 text-[13px] font-semibold text-ink"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
