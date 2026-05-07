export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="8"
          y="8"
          width="20"
          height="20"
          rx="2"
          transform="rotate(45 18 18)"
          fill="white"
        />
      </svg>
      <div className="leading-tight">
        <div className="text-lg font-bold tracking-wide text-white">
          スコアボ
        </div>
        <div className="text-[9px] font-semibold tracking-[0.18em] text-white/80">
          SCORE SHARING APP
        </div>
      </div>
    </div>
  );
}
