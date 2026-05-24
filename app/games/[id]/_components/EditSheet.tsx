"use client";

import { useState } from "react";

import { DatePickerField } from "@/app/_components/DatePickerField";
import { InningsStepper } from "@/app/_components/InningsStepper";
import { SportIcon } from "@/app/_components/SportIcon";
import { updateGameMeta } from "@/lib/games";
import { SPORT_META, SPORT_ORDER } from "@/lib/sports";
import type { Game, Sport } from "@/lib/types";

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 min-w-0 overflow-hidden">
      <label className="mb-1.5 block text-xs font-semibold text-ink-sub">{label}</label>
      {children}
    </div>
  );
}

function SheetInput({
  type,
  value,
  onChange,
}: {
  type: "text" | "number";
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-line bg-canvas px-3 py-2.5 text-base outline-none focus:border-brand focus:bg-card focus:shadow-[0_0_0_3px_var(--color-brand-light)]"
    />
  );
}

function SheetTeamInput({
  side,
  value,
  onChange,
  className,
}: {
  side: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-xl border border-line bg-canvas py-0.5 pr-1.5 pl-3 ${className ?? ""}`}
    >
      <span className="mr-2 shrink-0 rounded bg-brand-light px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">
        {side}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-none bg-transparent py-2.5 text-base outline-none"
      />
    </div>
  );
}

export function EditSheet({ game, onClose }: { game: Game; onClose: () => void }) {
  const [sport, setSport] = useState<Sport>(game.sport);
  const [date, setDate] = useState(game.date);
  const [maxInnings, setMaxInnings] = useState(game.max_innings);
  const [location, setLocation] = useState(game.location);
  const [teamTop, setTeamTop] = useState(game.team_top);
  const [teamBottom, setTeamBottom] = useState(game.team_bottom);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateGameMeta(game.id, {
        sport,
        date,
        max_innings: maxInnings,
        location: location.trim(),
        team_top: teamTop.trim(),
        team_bottom: teamBottom.trim(),
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-[480px] landscape:max-w-[900px] items-end justify-center bg-black/50">
      <button type="button" aria-label="閉じる" onClick={onClose} className="absolute inset-0" />
      <div className="relative max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-card px-[18px] pt-3.5 pb-6 landscape:max-w-[480px] landscape:rounded-2xl landscape:max-h-[85vh]">
        <div className="mx-auto mb-3 h-1 w-10 rounded bg-[#d4d4d4]" />
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-base font-bold">試合情報を編集</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-base text-ink-sub"
          >
            ×
          </button>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-sub">競技種別</label>
          <div className="grid grid-cols-3 gap-1.5">
            {SPORT_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={`rounded-xl border-2 px-1 pt-2.5 pb-2 text-center text-[11px] font-semibold ${
                  sport === s
                    ? "border-brand bg-brand-light text-brand-dark"
                    : "border-line bg-card text-ink"
                }`}
              >
                <SportIcon sport={s} size={28} className="mx-auto mb-0.5 block" />
                {SPORT_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex gap-2.5">
          <div className="min-w-0 flex-[1.4] overflow-hidden">
            <label className="mb-1.5 block text-xs font-semibold text-ink-sub">試合日</label>
            <DatePickerField value={date} onChange={setDate} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-ink-sub">回数(最大)</label>
            <InningsStepper value={maxInnings} onChange={setMaxInnings} size="sm" />
          </div>
        </div>

        <FieldGroup label="場所・グラウンド名">
          <SheetInput type="text" value={location} onChange={setLocation} />
        </FieldGroup>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink-sub">対戦チーム</label>
          <SheetTeamInput side="先攻" value={teamTop} onChange={setTeamTop} />
          <SheetTeamInput side="後攻" value={teamBottom} onChange={setTeamBottom} className="mt-2" />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-live/30 bg-live/5 px-3 py-2 text-xs text-live">
            保存に失敗しました: {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-1.5 block w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "保存中…" : "変更を保存"}
        </button>
      </div>
    </div>
  );
}
