"use client";

import { format, parse } from "date-fns";
import { ja } from "react-day-picker/locale";
import { DayPicker } from "react-day-picker";
import { useState } from "react";

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  try {
    return parse(iso, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

function dateToIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function DatePickerField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = isoToDate(value);

  const display = selected
    ? format(selected, "yyyy年M月d日(E)", { locale: ja })
    : "日付を選択";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left rounded-xl border border-line bg-canvas px-3 py-3 text-base text-ink ${className ?? ""}`}
      >
        {display}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-[480px] rounded-t-3xl bg-card px-4 pt-3.5 pb-8">
            <div className="mx-auto mb-3 h-1 w-10 rounded bg-line" />
            <div className="mb-2 text-center text-[15px] font-bold text-ink">日付を選択</div>
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (date) {
                    onChange(dateToIso(date));
                    setOpen(false);
                  }
                }}
                locale={ja}
                defaultMonth={selected ?? new Date()}
                navLayout="around"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
