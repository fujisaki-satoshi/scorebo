import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scorebo.vercel.app"),
  title: "スコアボ — SCORE SHARING APP",
  description:
    "野球・ソフトボール・キックベースの試合スコアをイニングごとに記録し、QRコードで共有できるスマホ向けWebアプリ",
  applicationName: "スコアボ",
  appleWebApp: {
    capable: true,
    title: "スコアボ",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "スコアボ",
    title: "スコアボ — SCORE SHARING APP",
    description:
      "野球・ソフトボール・キックベースの試合スコアをイニングごとに記録し、QRコードで共有できるスマホ向けWebアプリ",
  },
  twitter: {
    card: "summary_large_image",
    title: "スコアボ — SCORE SHARING APP",
    description:
      "野球・ソフトボール・キックベースの試合スコアをイニングごとに記録し、QRコードで共有できるスマホ向けWebアプリ",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a7a35",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-screen bg-canvas text-ink">
        <div className="mx-auto flex min-h-screen w-full max-w-[480px] landscape:max-w-[900px] flex-col bg-canvas pb-[env(safe-area-inset-bottom)] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
