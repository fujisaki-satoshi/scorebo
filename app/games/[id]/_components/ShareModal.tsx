"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

import { track } from "@/lib/analytics";
import { formatGameDateFull } from "@/lib/dates";
import type { Game } from "@/lib/types";

async function fetchShareImage(imageUrl: string, gameId: string): Promise<File | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], `scorebo-${gameId}.png`, { type: blob.type || "image/png" });
  } catch {
    return null;
  }
}

export function ShareModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const origin = window.location.origin;
  const editUrl = `${origin}/games/${game.id}`;
  const viewUrl = game.view_token ? `${origin}/watch/${game.view_token}` : "";
  const v = game.updated_at?.toMillis?.() ?? game.created_at?.toMillis?.() ?? Date.now();
  const imageUrl = `${origin}/games/${game.id}/opengraph-image?v=${v}`;
  const canNativeShare = typeof navigator.share === "function";

  const [shareMode, setShareMode] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasViewUrl = !!viewUrl;
  const activeUrl = shareMode === "edit" ? editUrl : viewUrl || editUrl;
  const dateText = formatGameDateFull(game.date);
  const shareTitle = `${game.team_top} vs ${game.team_bottom} のスコア`;
  const shareText = `${shareTitle}\n${dateText}\n${activeUrl}`;

  async function handleCopy() {
    if (!activeUrl) return;
    try {
      await navigator.clipboard.writeText(shareMode === "edit" ? editUrl : shareText);
      setCopied(true);
      track("qr_share_copy", { sport: game.sport, mode: shareMode });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function handleNativeShare() {
    if (!activeUrl || sharing) return;
    setSharing(true);
    try {
      const file = await fetchShareImage(imageUrl, game.id);
      const canShareFiles =
        file != null &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles && file) {
        await navigator.share({ title: shareTitle, text: shareText, url: activeUrl, files: [file] });
        track("qr_share_native", { sport: game.sport, with_image: true });
      } else {
        await navigator.share({ title: shareTitle, text: shareText, url: activeUrl });
        track("qr_share_native", { sport: game.sport, with_image: false });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(e);
      }
    } finally {
      setSharing(false);
    }
  }

  const lineHref = activeUrl
    ? `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`
    : "#";

  return (
    <div className="fixed inset-0 z-30 mx-auto w-full max-w-[480px] landscape:max-w-[900px] bg-black/50 p-4 landscape:flex landscape:items-center landscape:justify-center">
      <div className="absolute inset-x-4 top-6 bottom-4 overflow-y-auto rounded-2xl bg-card p-5 landscape:static landscape:inset-auto landscape:w-full landscape:max-w-[440px] landscape:max-h-[85vh]">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-base font-bold">試合をシェア</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-base text-ink-sub"
          >
            ×
          </button>
        </div>

        {hasViewUrl && (
          <div className="mb-3.5 flex gap-1.5 rounded-xl bg-canvas p-1">
            <button
              type="button"
              onClick={() => setShareMode("view")}
              className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition-colors ${
                shareMode === "view" ? "bg-card text-ink shadow-sm" : "text-ink-sub"
              }`}
            >
              観客・保護者用
            </button>
            <button
              type="button"
              onClick={() => setShareMode("edit")}
              className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition-colors ${
                shareMode === "edit" ? "bg-card text-ink shadow-sm" : "text-ink-sub"
              }`}
            >
              スコアラー用
            </button>
          </div>
        )}

        {shareMode === "edit" ? (
          <>
            <div className="mb-3.5 rounded-xl border border-live/30 bg-live/5 px-3.5 py-3 text-[12px] leading-relaxed text-live">
              このURLを知っている人はスコアを編集できます。入力担当者のみに共有してください。
            </div>
            <div className="mb-3 flex gap-2">
              <div className="flex-1 truncate rounded-lg border border-line bg-canvas px-3 py-2.5 text-[12px] text-ink-sub">
                {editUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-lg border border-brand bg-card px-3.5 text-[13px] font-semibold text-brand"
              >
                {copied ? "コピー済" : "コピー"}
              </button>
            </div>
            <div className="text-center">
              <div className="mb-1.5 text-[11px] text-ink-sub">またはこの場で見せて読み取ってもらう</div>
              <div className="inline-flex items-center justify-center rounded-lg border border-line bg-white p-2.5">
                <QRCodeCanvas value={editUrl} size={140} level="M" marginSize={2} bgColor="#ffffff" fgColor="#000000" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="relative mb-1.5 overflow-hidden rounded-xl border border-line bg-canvas"
              style={{ aspectRatio: "1200 / 630" }}
            >
              {!imgError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={`${shareTitle} のプレビュー`}
                  className={`h-full w-full object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center text-[11px] text-ink-sub">
                  スコア画像を生成中…
                </div>
              )}
              {imgError && (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[11px] text-ink-sub">
                  画像を読み込めませんでした
                  <br />
                  URL のみ送信できます
                </div>
              )}
            </div>
            <div className="mb-3.5 text-center text-[11px] text-ink-sub">↑ この画像とURLが送られます</div>

            {canNativeShare && (
              <>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={!activeUrl || sharing}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(26,122,53,0.2)] active:bg-brand-dark disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {sharing ? "共有を準備中…" : "みんなに送る"}
                </button>
                <div className="my-2.5 flex items-center gap-2 text-[11px] text-ink-sub before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                  個別に送る
                </div>
              </>
            )}

            <a
              href={lineHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("qr_share_line", { sport: game.sport })}
              className={`mb-2 flex items-center justify-center gap-2 rounded-xl border border-line-green bg-line-green px-1.5 ${canNativeShare ? "py-3" : "py-3.5 text-[14px]"} text-[14px] font-semibold text-white`}
            >
              <svg viewBox="0 0 36 36" className="h-5 w-5">
                <path fill="#fff" d="M18 3C9.16 3 2 8.79 2 15.93c0 6.41 5.81 11.78 13.66 12.79.53.11 1.26.35 1.44.81.17.42.11 1.07.05 1.5l-.23 1.4c-.07.42-.33 1.63 1.42.89 1.75-.74 9.42-5.55 12.85-9.5h-.01C33.55 21.16 35 18.69 35 15.93 35 8.79 27.84 3 18 3z" />
                <path fill="#06c755" d="M14.06 12.66h-1.01a.28.28 0 0 0-.28.28v6.27c0 .15.13.28.28.28h1.01a.28.28 0 0 0 .28-.28v-6.27a.28.28 0 0 0-.28-.28zm6.94 0h-1a.28.28 0 0 0-.28.28v3.73l-2.87-3.88-.02-.03h-1.18a.28.28 0 0 0-.28.28v6.27c0 .15.13.28.28.28h1a.28.28 0 0 0 .28-.28v-3.73l2.88 3.89c.02.03.05.05.08.07h1.11a.28.28 0 0 0 .28-.28v-6.27a.28.28 0 0 0-.28-.28zm-9.4 5.27H8.85v-4.99a.28.28 0 0 0-.28-.28h-1a.28.28 0 0 0-.28.28v6.27c0 .07.03.14.08.19.05.05.12.08.2.08h4.03a.28.28 0 0 0 .28-.28v-1a.28.28 0 0 0-.28-.27zm15.74-3.7a.28.28 0 0 0 .28-.28v-1.01a.28.28 0 0 0-.28-.28h-4.03a.27.27 0 0 0-.19.08.28.28 0 0 0-.08.19v6.26c0 .07.03.14.08.19.05.05.12.08.19.08h4.03a.28.28 0 0 0 .28-.28v-1.01a.28.28 0 0 0-.28-.27h-2.74v-1.06h2.74a.28.28 0 0 0 .28-.28v-1a.28.28 0 0 0-.28-.28h-2.74v-1.06h2.74z" />
              </svg>
              LINEで送る
            </a>

            <div className="mb-1 flex gap-2">
              <div className="flex-1 truncate rounded-lg border border-line bg-canvas px-3 py-2.5 text-[12px] text-ink-sub">
                {activeUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!activeUrl}
                className="shrink-0 rounded-lg border border-brand bg-card px-3.5 text-[13px] font-semibold text-brand disabled:opacity-50"
              >
                {copied ? "コピー済" : "コピー"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="mb-1.5 text-[11px] text-ink-sub">またはこの場で見せて読み取ってもらう</div>
              <div className="inline-flex items-center justify-center rounded-lg border border-line bg-white p-2.5">
                {activeUrl ? (
                  <QRCodeCanvas value={activeUrl} size={140} level="M" marginSize={2} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <div className="h-[140px] w-[140px]" />
                )}
              </div>
            </div>

            {!hasViewUrl && (
              <div className="mt-3.5 text-center text-[10px] text-ink-sub">
                URLを知っている人は誰でも閲覧・編集できます
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
