"use client";

import { useMemo } from "react";

import { toInningMap, totalSlots } from "@/lib/games";
import { teamShort } from "@/lib/utils";
import type { InningScore } from "@/lib/types";

type Props = {
  innings: InningScore[];
  maxInnings: number;
  teamTop: string;
  teamBottom: string;
  /** Inning number to highlight with accent color. */
  highlightInning?: number;
  /** If provided, cells become clickable. */
  onPickInning?: (n: number) => void;
  totals: { top: number; bottom: number };
};

export function ScoreTable({
  innings,
  maxInnings,
  teamTop,
  teamBottom,
  highlightInning,
  onPickInning,
  totals,
}: Props) {
  const slots = totalSlots(innings, maxInnings);
  const inningNumbers = Array.from({ length: slots }, (_, i) => i + 1);
  const inningMap = useMemo(() => toInningMap(innings), [innings]);

  const rows = [
    {
      key: "top",
      label: teamShort(teamTop),
      getValue: (s: InningScore | undefined) => s?.top,
      total: totals.top,
      isLast: false,
    },
    {
      key: "bottom",
      label: teamShort(teamBottom),
      getValue: (s: InningScore | undefined) => s?.bottom,
      total: totals.bottom,
      isLast: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <table className="w-full table-fixed border-separate border-spacing-0 text-center text-[13px] tabular-nums">
        <colgroup>
          <col style={{ width: 120 }} />
          {inningNumbers.map((n) => (
            <col key={n} />
          ))}
          <col style={{ width: 36 }} />
        </colgroup>
        <thead>
          <tr>
            <th className="border-b border-r border-line bg-canvas py-2.5 px-2 text-left text-[12px] font-semibold text-ink-sub">
              チーム
            </th>
            {inningNumbers.map((n) => (
              <th
                key={n}
                className={`border-b border-r border-line bg-canvas py-2.5 text-[12px] font-semibold text-ink-sub ${
                  n === highlightInning
                    ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                    : n > maxInnings
                      ? "text-brand-dark"
                      : ""
                }`}
              >
                {n}
              </th>
            ))}
            <th className="border-b border-line bg-brand-light py-2.5 text-[12px] font-bold text-brand-dark">
              計
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, label, getValue, total, isLast }) => {
            const borderB = isLast ? "" : "border-b";
            return (
              <tr key={key}>
                <td
                  className={`${borderB} border-r-[1.5px] border-line bg-[#fafcfa] py-2.5 pl-2.5 text-left text-[13px] font-semibold`}
                >
                  {label}
                </td>
                {inningNumbers.map((n) => {
                  const slot = inningMap.get(n);
                  const value = getValue(slot);
                  const isActive = n === highlightInning;
                  const isExtra = n > maxInnings;
                  return (
                    <td
                      key={n}
                      onClick={onPickInning ? () => onPickInning(n) : undefined}
                      className={`${borderB} border-r border-line py-2.5 text-[14px] ${
                        onPickInning ? "cursor-pointer" : ""
                      } ${
                        isActive
                          ? "bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                          : isExtra
                            ? "bg-brand-light/50"
                            : onPickInning
                              ? "hover:bg-brand-light"
                              : ""
                      } ${value == null ? "text-[#c9c9c9]" : value === "skip" ? "text-[#bbb]" : ""}`}
                    >
                      {value == null ? "−" : value === "skip" ? "✕" : value}
                    </td>
                  );
                })}
                <td
                  className={`${borderB} bg-brand-light py-2.5 text-[14px] font-bold text-brand-dark`}
                >
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
