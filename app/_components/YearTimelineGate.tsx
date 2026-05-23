"use client";

import Link from "next/link";
import { useState } from "react";
import { hasKey, markTimelineGateSeen } from "@/lib/keys-client";
import { track } from "@/lib/analytics";

export function YearTimelineGate({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && !hasKey(),
  );

  function handleContinue() {
    track("gate_dismissed", {});
    markTimelineGateSeen();
    setVisible(false);
    onDismiss();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-[rgba(20,15,8,0.35)]"
        onClick={onDismiss}
      />

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
        <div className="rounded-2xl bg-canvas px-5 pt-3 pb-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          {/* Handle */}
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-rule" aria-hidden="true" />

          {/* Header row */}
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.12em] text-brand">
              ひらく前に、ひとつだけ
            </p>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light font-sans text-[18px] font-bold text-brand"
              style={{ transform: "rotate(-10deg)" }}
              aria-hidden="true"
            >
              鍵
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2.5 font-sans text-[20px] font-bold leading-[1.4] text-ink">
            シーズン年表を、
            <br />
            失いたくないですよね。
          </h2>

          {/* Body */}
          <p className="mb-4 text-[12px] leading-[1.8] text-ink-sub">
            鍵をひとつ作っておくと、新しい端末でも、
            アプリを消しても、必ず戻ってこられます。
            メアドも、パスワードも要りません。
          </p>

          {/* Primary CTA */}
          <Link
            href="/keys/new"
            className="mb-2 block w-full rounded-[10px] bg-brand py-3.5 text-center text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.25)]"
          >
            鍵をつくる · 1 分
          </Link>

          {/* Secondary */}
          <button
            type="button"
            onClick={handleContinue}
            className="block w-full py-2 text-center text-[12px] text-ink-sub"
          >
            そのまま見る
          </button>

          {/* Warning */}
          <p className="mt-0.5 text-center text-[10px] text-live">
            ⚠️ 端末を変えると、すべて消えます
          </p>
        </div>
      </div>
    </div>
  );
}
