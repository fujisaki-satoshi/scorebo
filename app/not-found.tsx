import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 text-4xl" aria-hidden="true">
        🔎
      </div>
      <div className="mb-2 text-base font-semibold text-ink">ページが見つかりません</div>
      <div className="mb-6 text-sm text-ink-sub">
        URLが正しいか確認するか、ホームに戻ってください。
      </div>
      <Link
        href="/"
        className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white"
      >
        ホームへ
      </Link>
    </div>
  );
}
