"use client";

export function InningsStepper({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const min = 1;
  const max = 9;
  const safe = Math.min(max, Math.max(min, value || min));

  const btnClass = [
    "flex items-center justify-center rounded-full border-[1.5px] border-brand bg-card font-bold leading-none text-brand",
    "active:bg-brand-light disabled:cursor-not-allowed disabled:border-line disabled:text-[#ccc]",
    size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg",
  ].join(" ");

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-line bg-canvas px-2 ${size === "sm" ? "py-1" : "py-1.5"}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, safe - 1))}
        disabled={safe <= min}
        className={btnClass}
        aria-label="-1"
      >
        −
      </button>
      <span className={`font-bold tabular-nums ${size === "sm" ? "text-[18px]" : "text-[20px]"}`}>
        {safe}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, safe + 1))}
        disabled={safe >= max}
        className={btnClass}
        aria-label="+1"
      >
        ＋
      </button>
    </div>
  );
}
