import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スコアボ — SCORE SHARING APP",
  description:
    "野球・ソフトボール・キックベースの試合スコアをイニングごとに記録し、QRコードで共有できるスマホ向けWebアプリ",
};

export const viewport: Viewport = {
  themeColor: "#1a7a35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-screen bg-canvas text-ink">
        <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-canvas shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          {children}
        </div>
      </body>
    </html>
  );
}
