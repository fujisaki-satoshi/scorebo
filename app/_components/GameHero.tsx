import { formatGameDate } from "@/lib/dates";
import { SPORT_META } from "@/lib/sports";
import type { PillVariant } from "@/lib/games";
import type { Sport } from "@/lib/types";
import { SportIcon } from "./SportIcon";

type Props = {
  sport: Sport;
  date: string;
  location: string;
  teamTop: string;
  teamBottom: string;
  top: number;
  bottom: number;
  pillText: string;
  pillVariant: PillVariant;
};

function PillBadge({
  pillText,
  pillVariant,
  small = false,
}: {
  pillText: string;
  pillVariant: PillVariant;
  small?: boolean;
}) {
  const bg =
    pillVariant === "live" ? "bg-black/25" : pillVariant === "done" ? "bg-white/20" : "bg-black/20";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${small ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-[12px]"} ${bg}`}
    >
      {pillVariant === "live" && <span className="pulse-dot">●</span>}
      {pillText}
    </span>
  );
}

export function GameHero({
  sport,
  date,
  location,
  teamTop,
  teamBottom,
  top,
  bottom,
  pillText,
  pillVariant,
}: Props) {
  const meta = SPORT_META[sport];

  return (
    <section className="bg-gradient-to-b from-brand to-brand-dark px-[18px] pt-3.5 pb-[18px] landscape:py-3 landscape:px-4 text-white">
      {/* Portrait */}
      <div className="landscape:hidden">
        <div className="mb-3 flex items-center gap-2 text-[12px] opacity-95">
          <SportIcon sport={sport} size={14} />
          <span>{meta.label}</span>
          <span>·</span>
          <span>{formatGameDate(date)}</span>
          {location && (
            <>
              <span>·</span>
              <span className="truncate">{location}</span>
            </>
          )}
        </div>

        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{teamTop || "—"}</div>
            <div className="mt-0.5 text-[11px] opacity-90">先攻</div>
          </div>
          <div className="self-center text-[28px] font-light leading-none opacity-50">vs</div>
          <div className="flex flex-col items-center text-center">
            <div className="text-[18px] font-bold leading-tight">{teamBottom || "—"}</div>
            <div className="mt-0.5 text-[11px] opacity-90">後攻</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
            {top}
          </div>
          <div className="text-center text-4xl font-light opacity-50">−</div>
          <div className="text-center text-[68px] font-extrabold leading-none tabular-nums drop-shadow-sm">
            {bottom}
          </div>
        </div>

        <div className="mt-3.5 text-center">
          <PillBadge pillText={pillText} pillVariant={pillVariant} />
        </div>
      </div>

      {/* Landscape */}
      <div className="hidden landscape:flex items-center gap-4 py-0.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] opacity-75">先攻</div>
          <div className="truncate text-[15px] font-bold leading-tight">{teamTop || "—"}</div>
        </div>
        <div className="flex shrink-0 items-center gap-3 tabular-nums">
          <span className="text-[48px] font-extrabold leading-none drop-shadow-sm">{top}</span>
          <span className="text-xl font-light opacity-50">−</span>
          <span className="text-[48px] font-extrabold leading-none drop-shadow-sm">{bottom}</span>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[11px] opacity-75">後攻</div>
          <div className="truncate text-[15px] font-bold leading-tight">{teamBottom || "—"}</div>
        </div>
        <PillBadge pillText={pillText} pillVariant={pillVariant} small />
      </div>
    </section>
  );
}
