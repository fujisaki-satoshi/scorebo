"use client";

import Link from "next/link";
import { useState } from "react";
import { dismissBanner, hasKey, isBannerDismissed } from "@/lib/keys-client";

export function RecoveryKeyBanner({ gameCount }: { gameCount: number }) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && (hasKey() || isBannerDismissed()),
  );

  const visible = gameCount >= 3 && !dismissed;

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dismissBanner();
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div className="mx-4 mb-3 overflow-hidden rounded-[10px] border border-dashed border-stamp/60 bg-paper-warm">
      <Link href="/keys/new" className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Key icon */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stamp text-[14px] text-white">
          🔑
        </span>

        {/* Text */}
        <span className="flex-1 min-w-0">
          <span className="block text-[12px] font-bold leading-tight text-stamp-deep">
            この記録は、今の端末だけにあります
          </span>
          <span className="block text-[10.5px] leading-relaxed text-ink-mute">
            新しい端末でも戻れるように、鍵を作っておけます。
          </span>
        </span>

        {/* Arrow */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-stamp"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>

      {/* Dismiss */}
      <div className="flex justify-end px-3 pb-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[10px] text-ink-mute"
        >
          あとで · ✕
        </button>
      </div>
    </div>
  );
}
