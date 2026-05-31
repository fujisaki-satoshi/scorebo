"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "スコアを入力",
    desc: "＋ボタンをタップするだけ",
  },
  {
    title: "即座にスコアが変わる",
    desc: "全員の画面にリアルタイム反映",
  },
  {
    title: "QRコードで共有",
    desc: "QRを見せれば観客・保護者がすぐ観戦開始",
  },
  {
    title: "みんなで観戦できる",
    desc: "離れた場所でもリアルタイムで見られる",
  },
];

export function DemoSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((s) => (s + 1) % STEPS.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-card px-[22px] py-9">
      <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-brand">
        HOW IT WORKS
      </div>
      <h2 className="mb-6 text-[22px] font-extrabold leading-[1.4] text-ink">
        3秒で分かる
        <br />
        使い方
      </h2>

      {/* Phone mockup */}
      <div className="mx-auto mb-5 h-[272px] w-[148px]">
        <div className="relative h-full w-full rounded-[28px] bg-[#111] p-[5px] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
          {/* Notch */}
          <div className="absolute left-1/2 top-[7px] z-10 h-[10px] w-[36px] -translate-x-1/2 rounded-full bg-[#111]" />
          <div className="relative h-full w-full overflow-hidden rounded-[23px] bg-white">
            <ScreenInput active={active === 0} />
            <ScreenScore active={active === 1} />
            <ScreenQR active={active === 2} />
            <ScreenSpectator active={active === 3} />
          </div>
        </div>
      </div>

      {/* Step label */}
      <div className="mb-4 text-center">
        <div className="text-[17px] font-bold text-ink">{STEPS[active].title}</div>
        <div className="mt-1 text-[13px] text-ink-sub">{STEPS[active].desc}</div>
      </div>

      {/* Dot indicator */}
      <div className="flex justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`ステップ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-brand" : "w-2 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function screen(active: boolean) {
  return `absolute inset-0 flex flex-col transition-opacity duration-300 ${
    active ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;
}

/* ── Step 1: スコア入力 ── */
function ScreenInput({ active }: { active: boolean }) {
  return (
    <div className={screen(active)}>
      {/* Mini score header */}
      <div className="bg-brand px-3 pt-5 pb-2.5 text-white">
        <div className="mb-1 flex justify-between text-[9px] font-semibold">
          <span>さくら打線</span>
          <span className="opacity-50">vs</span>
          <span>グリーンズ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[30px] font-extrabold leading-none">3</span>
          <span className="text-[14px] font-light opacity-40">−</span>
          <span className="text-[30px] font-extrabold leading-none">2</span>
        </div>
      </div>

      {/* Input panel */}
      <div className="flex-1 bg-white px-2.5 pt-3">
        <div className="mb-2 text-[8px] font-semibold text-ink-sub">4回の得点を入力</div>

        {/* Row: top team */}
        <div className="mb-1.5 flex items-center justify-between rounded-lg bg-canvas px-2 py-1.5">
          <span className="text-[9px] font-medium">さくら打線</span>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-[11px] text-ink-sub/60">
              −
            </span>
            <span className="w-5 text-center text-[14px] font-bold">0</span>
            {/* Highlighted + button */}
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white"
              style={{ boxShadow: "0 0 0 3px rgba(26,122,53,0.25)" }}
            >
              ＋
            </span>
          </div>
        </div>

        {/* Row: bottom team */}
        <div className="flex items-center justify-between rounded-lg bg-canvas px-2 py-1.5">
          <span className="text-[9px] font-medium">グリーンズ</span>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-[11px] text-ink-sub/60">
              −
            </span>
            <span className="w-5 text-center text-[14px] font-bold">0</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand text-[11px] font-bold text-brand">
              ＋
            </span>
          </div>
        </div>

        {/* Autosave indicator */}
        <div className="mt-3 flex items-center justify-center gap-1 text-[9px] text-ink-sub">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          自動保存されました
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: スコア更新 ── */
function ScreenScore({ active }: { active: boolean }) {
  return (
    <div
      className={`${screen(active)} items-center justify-center bg-gradient-to-b from-brand to-brand-dark`}
    >
      <div className="mb-2 text-[10px] font-semibold text-white/80">スコアが更新されました</div>
      <div className="flex items-center gap-4 text-white">
        <div className="text-center">
          <div className="text-[9px] opacity-75">さくら打線</div>
          <div className="text-[52px] font-extrabold leading-none drop-shadow">4</div>
        </div>
        <div className="text-[20px] font-light opacity-40">−</div>
        <div className="text-center">
          <div className="text-[9px] opacity-75">グリーンズ</div>
          <div className="text-[52px] font-extrabold leading-none drop-shadow">2</div>
        </div>
      </div>
      <div className="mt-4 rounded-full bg-black/25 px-3 py-1 text-[10px] text-white">
        <span className="pulse-dot mr-1">●</span>進行中 4回
      </div>
      <div className="mt-3 text-[9px] text-white/60">全員の画面に即反映</div>
    </div>
  );
}

/* ── Step 3: QR共有 ── */
function ScreenQR({ active }: { active: boolean }) {
  return (
    <div className={`${screen(active)} items-center justify-center bg-white`}>
      <div className="mb-3 text-[11px] font-bold text-ink">試合をシェア</div>
      {/* Deterministic QR-like pattern */}
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        {/* Top-left finder */}
        <rect x="4" y="4" width="26" height="26" rx="2" fill="#111" />
        <rect x="8" y="8" width="18" height="18" rx="1" fill="white" />
        <rect x="12" y="12" width="10" height="10" fill="#111" />
        {/* Top-right finder */}
        <rect x="66" y="4" width="26" height="26" rx="2" fill="#111" />
        <rect x="70" y="8" width="18" height="18" rx="1" fill="white" />
        <rect x="74" y="12" width="10" height="10" fill="#111" />
        {/* Bottom-left finder */}
        <rect x="4" y="66" width="26" height="26" rx="2" fill="#111" />
        <rect x="8" y="70" width="18" height="18" rx="1" fill="white" />
        <rect x="12" y="74" width="10" height="10" fill="#111" />
        {/* Data area (fixed decorative pattern) */}
        {DATA_CELLS.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="5" fill="#111" />
        ))}
      </svg>
      <div className="mt-3 text-center text-[9px] leading-[1.6] text-ink-sub">
        このQRを
        <br />
        観客に見せるだけ
      </div>
    </div>
  );
}

// Fixed data module positions for QR illustration
const DATA_CELLS: [number, number][] = [
  [34,4],[40,4],[46,4],[52,4],[58,4],
  [34,10],[46,10],[58,10],
  [34,16],[40,16],[52,16],[58,16],
  [34,22],[40,22],[46,22],
  [34,28],[52,28],[58,28],
  [4,34],[10,34],[22,34],[28,34],[34,34],[46,34],[52,34],[58,34],[64,34],[70,34],[76,34],[82,34],[88,34],
  [10,40],[22,40],[40,40],[52,40],[64,40],[76,40],[88,40],
  [4,46],[16,46],[28,46],[34,46],[46,46],[58,46],[70,46],[82,46],
  [10,52],[16,52],[28,52],[40,52],[52,52],[64,52],[76,52],[88,52],
  [4,58],[22,58],[34,58],[46,58],[58,58],[70,58],[82,58],
  [10,64],[16,64],[28,64],[40,64],[52,64],[58,64],[70,64],[88,64],
  [34,70],[40,70],[52,70],[64,70],[76,70],[88,70],
  [34,76],[46,76],[52,76],[64,76],[82,76],
  [34,82],[40,82],[46,82],[58,82],[70,82],[76,82],[88,82],
  [34,88],[52,88],[64,88],[70,88],
];

/* ── Step 4: 観戦画面 ── */
function ScreenSpectator({ active }: { active: boolean }) {
  return (
    <div className={screen(active)}>
      {/* Score header */}
      <div className="bg-gradient-to-b from-brand to-brand-dark px-3 pt-5 pb-3 text-white">
        <div className="mb-1 flex justify-between text-[9px] opacity-80">
          <span>さくら打線</span>
          <span>グリーンズ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[36px] font-extrabold leading-none">4</span>
          <span className="text-[14px] font-light opacity-40">−</span>
          <span className="text-[36px] font-extrabold leading-none">2</span>
        </div>
        <div className="mt-1.5 text-center text-[9px]">
          <span className="rounded-full bg-black/25 px-2 py-0.5">
            <span className="pulse-dot mr-0.5">●</span>進行中 4回
          </span>
        </div>
      </div>

      {/* Score table */}
      <div className="mx-2 mt-2 overflow-hidden rounded-lg border border-line text-[8px]">
        <table className="w-full table-fixed border-separate border-spacing-0 text-center tabular-nums">
          <thead>
            <tr className="bg-canvas">
              <th className="border-b border-r border-line py-1 pl-1 text-left font-semibold text-ink-sub">
                チーム
              </th>
              {[1, 2, 3, 4].map((n) => (
                <th key={n} className="border-b border-r border-line py-1 font-semibold text-ink-sub">
                  {n}
                </th>
              ))}
              <th className="border-b border-line bg-brand-light py-1 font-bold text-brand-dark">
                計
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-line py-1.5 pl-1 text-left font-semibold">
                さくら
              </td>
              {[0, 3, 0, 1].map((v, i) => (
                <td key={i} className="border-b border-r border-line py-1.5">
                  {v}
                </td>
              ))}
              <td className="border-b bg-brand-light py-1.5 font-bold text-brand-dark">4</td>
            </tr>
            <tr>
              <td className="border-r border-line py-1.5 pl-1 text-left font-semibold">
                グリーン
              </td>
              {[2, 0, 0, 0].map((v, i) => (
                <td key={i} className="border-r border-line py-1.5">
                  {v}
                </td>
              ))}
              <td className="bg-brand-light py-1.5 font-bold text-brand-dark">2</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-center text-[9px] text-ink-sub">離れた場所でもリアルタイムで見られる</div>
    </div>
  );
}
