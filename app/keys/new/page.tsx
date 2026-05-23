"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAnonymousAuth } from "@/lib/auth";
import { saveKeySession } from "@/lib/keys-client";
import { track } from "@/lib/analytics";

export default function KeyGenIntroPage() {
  const router = useRouter();
  const user = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("サーバーエラーが発生しました");
      const data = (await res.json()) as { code: string; identityId: string; keyPrefix: string };

      saveKeySession({
        recoveryKey: data.code,
        identityId: data.identityId,
        keyPrefix: data.keyPrefix,
      });
      track("key_generated", {});

      // Pass key via sessionStorage so it never appears in URL
      sessionStorage.setItem("scorebo:new_key", data.code);
      router.push("/keys/display");
    } catch {
      setError("もう一度お試しください");
    } finally {
      setLoading(false);
    }
  }

  const points = [
    {
      icon: "🔑",
      title: "この鍵で、すべての記録を戻せます",
      body: "新しい端末でも、アプリを消しても、戻ってこれます。",
    },
    {
      icon: "📥",
      title: "あなたが保管します",
      body: "サーバーには鍵を保管しません。スクショ・LINE・印刷など、お好きな方法で。",
    },
    {
      icon: "✋",
      title: "メアド・パスワードは要りません",
      body: "スコアボの「アカウント不要」の約束、そのままです。",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-paper px-5 pt-4 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/games" className="flex items-center gap-1 text-[13px] text-ink-mute">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          戻る
        </Link>
        <span className="font-mono text-[10px] tracking-[0.16em] text-stamp">STEP 1 / 2</span>
      </div>

      {/* Eyebrow */}
      <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-stamp">復元の鍵</p>

      {/* Title */}
      <h1 className="mb-6 font-serif text-[26px] font-bold leading-[1.3] text-ink">
        あなただけの
        <br />
        鍵をつくります
      </h1>

      {/* Explanation points */}
      <div className="mb-6 flex flex-col gap-3">
        {points.map((p) => (
          <div key={p.title} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule-soft bg-paper-warm text-[18px]">
              {p.icon}
            </div>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight text-ink">{p.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-mute">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[12px] text-red-600">
          {error}
        </p>
      )}

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] px-5 pb-8 pt-4 bg-paper/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || !user}
          className="block w-full rounded-xl bg-stamp py-3.5 text-center text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(184,122,44,0.3)] disabled:opacity-50"
        >
          {loading ? "作成中…" : "鍵をつくる →"}
        </button>
        <p className="mt-2 text-center font-mono text-[10.5px] text-ink-mute">
          かかる時間 · 約 1 分
        </p>
      </div>
    </div>
  );
}
