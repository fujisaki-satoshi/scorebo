"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAnonymousAuth } from "@/lib/auth";
import { getSaveMethods, setSaveMethod } from "@/lib/keys-client";
import { track } from "@/lib/analytics";
import type { SaveMethods } from "@/lib/keys-client";

function KeyStamp({ char = "鍵" }: { char?: string }) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-stamp-soft text-[18px] font-serif font-bold text-stamp"
      style={{ transform: "rotate(-12deg)" }}
      aria-hidden="true"
    >
      {char}
    </div>
  );
}

function CodeDisplay({ code }: { code: string }) {
  const parts = code.split("-");
  return (
    <div className="flex items-center justify-center gap-0.5 font-mono text-[24px] font-medium tracking-[0.04em]">
      <span className="text-[16px] text-stamp">SB</span>
      <span className="text-ink-mute">-</span>
      <span className="text-ink">{parts[1]}</span>
      <span className="text-ink-mute">-</span>
      <span className="text-ink">{parts[2]}</span>
      <span className="text-ink-mute">-</span>
      <span className="text-ink">{parts[3]}</span>
    </div>
  );
}

type SaveOption = {
  key: keyof SaveMethods;
  icon: string;
  label: string;
  sub: string;
};

const SAVE_OPTIONS: SaveOption[] = [
  { key: "screenshot", icon: "📷", label: "スクリーンショットで残す", sub: "一番おすすめ。すぐ終わる" },
  { key: "line", icon: "💬", label: "自分にLINEで送る", sub: "LINEのKeepにも自動保存" },
  { key: "email", icon: "📧", label: "自分にメールで送る", sub: "検索しやすい場所に届く" },
  { key: "print", icon: "🖨", label: "印刷して財布に入れる", sub: "紙が一番強い" },
];

const MESSAGE_TEMPLATE = (code: string) =>
  `これはスコアボの復元の鍵です\n${code}\nなくすと記録が戻りません\nhttps://scorebo.vercel.app/restore`;

export default function KeyDisplayPage() {
  const router = useRouter();
  const user = useAnonymousAuth();
  const [code] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("scorebo:new_key") : null,
  );
  const [methods, setMethods] = useState<SaveMethods>(getSaveMethods());
  const [screenshotCountdown, setScreenshotCountdown] = useState<number | null>(null);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) router.replace("/keys/new");
  }, [code, router]);

  async function patchSaveMethod(method: keyof SaveMethods, done: boolean) {
    setSaveMethod(method, done);
    setMethods(getSaveMethods());
    track("save_method_marked", { method });
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/keys/me/save-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ method, done }),
      });
    } catch {
      /* non-critical */
    }
  }

  async function handleScreenshot() {
    if (!code) return;
    setScreenshotCountdown(3);
    for (let i = 2; i >= 0; i--) {
      await new Promise((r) => setTimeout(r, 1000));
      setScreenshotCountdown(i === 0 ? null : i);
    }
    await patchSaveMethod("screenshot", true);
  }

  function handleLine() {
    if (!code) return;
    const msg = encodeURIComponent(MESSAGE_TEMPLATE(code));
    window.open(`https://line.me/R/share?text=${msg}`, "_blank");
    patchSaveMethod("line", true);
  }

  function handleEmail() {
    if (!code) return;
    const subject = encodeURIComponent("スコアボ · あなたの復元の鍵");
    const body = encodeURIComponent(MESSAGE_TEMPLATE(code));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    patchSaveMethod("email", true);
  }

  function handlePrint() {
    if (!code) return;
    const printWin = window.open("", "_blank", "width=400,height=300");
    if (printWin) {
      printWin.document.write(`<html><body style="font-family:monospace;text-align:center;padding:40px">
        <h2 style="font-size:14px;margin-bottom:8px;">スコアボ · 復元の鍵</h2>
        <p style="font-size:28px;letter-spacing:.04em;font-weight:500;">${code}</p>
        <p style="font-size:11px;color:#666;margin-top:12px;">このカードを大切に保管してください</p>
        <script>window.onload=()=>{window.print();window.close()}</script>
      </body></html>`);
      printWin.document.close();
    }
    patchSaveMethod("print", true);
  }

  function handleSaveOption(opt: SaveOption) {
    if (opt.key === "screenshot") handleScreenshot();
    else if (opt.key === "line") handleLine();
    else if (opt.key === "email") handleEmail();
    else if (opt.key === "print") handlePrint();
  }

  const hasSaved = Object.values(methods).some(Boolean);

  function handleFinish() {
    if (!hasSaved) {
      setShowSaveWarning(true);
      return;
    }
    sessionStorage.removeItem("scorebo:new_key");
    router.push("/games");
  }

  function handleForceFinish() {
    sessionStorage.removeItem("scorebo:new_key");
    router.push("/games");
  }

  if (!code) return <div className="flex min-h-screen items-center justify-center bg-paper text-[13px] text-ink-mute">読み込み中…</div>;

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const timeStr = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen bg-paper px-5 pt-4 pb-40">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/keys/new" className="flex items-center gap-1 text-[13px] text-ink-mute">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          戻る
        </Link>
        <span className="font-mono text-[10px] tracking-[0.16em] text-stamp">STEP 2 / 2</span>
      </div>

      {/* Key Certificate Card */}
      <div
        ref={cardRef}
        className="relative mb-6 rounded-xl border-[1.5px] border-stamp bg-white px-[18px] py-[16px] shadow-[0_10px_24px_-16px_rgba(80,40,10,.4)]"
      >
        {/* Stamp */}
        <div className="absolute top-3 right-3">
          <KeyStamp />
        </div>

        <p className="mb-1 font-mono text-[9.5px] tracking-[0.16em] text-stamp">
          SCOREBO · 復元の鍵
        </p>
        <p className="font-serif text-[16px] font-bold text-ink">あなただけの鍵</p>
        <p className="mt-0.5 font-mono text-[9px] text-ink-mute">
          ISSUED · {dateStr} ({dayNames[today.getDay()]}) {timeStr}
        </p>

        <div className="my-4 border-t border-dashed border-rule" />

        <CodeDisplay code={code} />

        <div className="my-4 border-t border-dashed border-rule" />

        <div className="flex justify-center">
          <div className="rounded border border-rule-soft p-1.5">
            <QRCodeSVG value={code} size={120} aria-label={`QRコード: ${code}`} />
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] leading-[1.7] text-ink-sub">
          この鍵を保管していれば、
          <br />
          別の端末でも、すべての記録が戻ります。
        </p>
      </div>

      {/* Screenshot countdown overlay */}
      {screenshotCountdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <p className="text-[80px] font-bold text-white">{screenshotCountdown}</p>
        </div>
      )}

      {/* Save options */}
      <div className="mb-4">
        <p className="mb-1 font-mono text-[9.5px] tracking-[0.16em] text-stamp-deep">
          鍵を保存する · 1つ以上選んでください
        </p>
        <div className="flex flex-col gap-1.5">
          {SAVE_OPTIONS.map((opt) => {
            const checked = methods[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSaveOption(opt)}
                className={`grid grid-cols-[32px_1fr_22px] items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  checked
                    ? "border-stamp bg-paper-warm"
                    : "border-rule-soft bg-white"
                }`}
              >
                <span className="text-[18px]">{opt.icon}</span>
                <span>
                  <span className="block text-[12.5px] font-semibold text-ink">{opt.label}</span>
                  <span className="block text-[10px] text-ink-mute">{opt.sub}</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${
                    checked ? "border-stamp bg-stamp text-white" : "border-rule"
                  }`}
                >
                  {checked && "✓"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save warning */}
      {showSaveWarning && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 px-4 pb-8">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-2 text-[15px] font-bold text-ink">鍵をまだ保存していません</p>
            <p className="mb-5 text-[12.5px] leading-relaxed text-ink-sub">
              鍵を保存しないと、新しい端末で戻ってこれません。
              本当にこのまま進みますか？
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSaveWarning(false)}
                className="flex-1 rounded-lg border border-rule py-2.5 text-[13px] font-semibold text-ink"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={handleForceFinish}
                className="flex-1 rounded-lg bg-stamp py-2.5 text-[13px] font-bold text-white"
              >
                このまま進む
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] bg-paper/90 px-5 pb-8 pt-4 backdrop-blur-sm">
        {!hasSaved && (
          <p className="mb-2 text-center text-[11px] text-red-500">
            鍵をまだ保存していません
          </p>
        )}
        <button
          type="button"
          onClick={handleFinish}
          className={`block w-full rounded-xl py-3.5 text-center text-[13.5px] font-bold text-white transition-opacity ${
            hasSaved
              ? "bg-brand shadow-[0_4px_12px_rgba(26,122,53,0.3)]"
              : "bg-ink-mute opacity-60"
          }`}
        >
          保存できた · ホームへ
        </button>
      </div>
    </div>
  );
}
