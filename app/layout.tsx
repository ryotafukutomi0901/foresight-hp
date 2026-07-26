import type { Metadata, Viewport } from "next";
import { Zen_Kaku_Gothic_New, Archivo } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import OpeningSequence from "@/components/opening/OpeningSequence";
import "./globals.css";

// 和文: 静かで精密なゴシック。明朝より「視野・判断力」の語感に合う。
//
// preload: false は必須。和文フォントは約120のunicode-rangeサブセットに分割されており、
// 既定(preload: true)だと全サブセットを先読みして数MBを転送してしまう。
// falseにすると、ブラウザがページ内の文字に必要なサブセットだけを取得する。
// ウェイトも実際に使う300/400に絞る(1ウェイト増えるごとに全サブセットが増える)。
const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  preload: false,
  fallback: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", "sans-serif"],
});

// 欧文: 大型ラテン見出し(SEE BEYOND THE CONDITION.)とラベル用のグロテスク。
// latinサブセットのみで軽いため、こちらは先読みさせる。
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const SITE_URL = "https://foresight.example.com";
const TITLE = "Foresight（フォーサイト）| 車の未来を、見通す。";
const DESCRIPTION =
  "どんな状態の車にも、次の可能性がある。不動車・事故車・故障車・過走行・車検切れも、状態に関係なく買取ります。中古車の買取、販売、オークション代行。動かないなら、取りに行く。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: "Foresight",
  keywords: [
    "中古車買取",
    "不動車買取",
    "事故車買取",
    "中古車販売",
    "オークション代行",
    "Foresight",
    "フォーサイト",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "ja_JP",
    type: "website",
    siteName: "Foresight",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${archivo.variable}`}>
      <body className="bg-void text-ink">
        {/* キーボード利用者が本文へ直行できるようにする */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:text-void"
        >
          本文へスキップ
        </a>
        {/*
          Openingオーバーレイと固定ヘッダーは、必ずScrollSmootherのwrapperの外に置く。
          ScrollSmootherは #smooth-content に transform を掛けるため、内側に置くと
          position:fixed がその要素基準になり、画面に固定されなくなる。
        */}
        <OpeningSequence />
        <Header />
        <SmoothScrollProvider>
          <main id="main">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
