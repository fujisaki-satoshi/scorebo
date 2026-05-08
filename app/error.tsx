"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 text-4xl" aria-hidden="true">
        ⚠️
      </div>
      <div className="mb-2 text-base font-semibold text-ink">
        エラーが発生しました
      </div>
      <div className="mb-6 max-w-xs text-sm text-ink-sub">
        通信状況を確認して、もう一度お試しください。
      </div>
      {error?.digest && (
        <div className="mb-4 text-[11px] text-ink-sub">code: {error.digest}</div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
        >
          再試行
        </button>
        <Link
          href="/"
          className="rounded-full border border-line bg-card px-5 py-2 text-sm font-semibold text-ink"
        >
          ホームへ
        </Link>
      </div>
    </div>
  );
}
