import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import OpeningSequence from "@/components/opening/OpeningSequence";
import AtmosphereMount from "@/components/three/AtmosphereMount";
import "./globals.css";

/*
 * 和文: 明朝。
 * ゴシックは均一で力強いが、余白を主役にした静かな画面では硬く平板に見えた。
 * 明朝は縦画と横画の抑揚があり、大きな余白と組んだときに「静けさ」と品が出る。
 *
 * Google Fonts配信ではなく自前のサブセットを使う。
 * Shippori Mincho は約120のunicode-rangeに分割配信されるため、preload:false でも
 * 和文ページでは実測63ファイル・865KB落ちてきて、総転送量予算(1229KB)の7割を
 * 1書体が占めていた。このサイトの文言は静的なので、実際に出る文字だけを
 * 1ファイルへ焼いて自己ホストする。**書体そのものは同一なので見た目は変わらない。**
 *
 * 生成: node scripts/build-font-subset.mjs（SIL OFL 1.1・自己ホスト可）
 * ⚠️ 本文を追加・変更したら再生成すること。未収録の字はフォールバック書体で出る。
 */
const shippori = localFont({
  variable: "--font-shippori",
  display: "swap",
  fallback: ["Hiragino Mincho ProN", "Yu Mincho", "serif"],
  src: [
    {
      path: "../public/fonts/shippori-mincho-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/shippori-mincho-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
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

/*
 * `viewport`をカスタム定義すると、Next.jsは width/initialScale を
 * 自動追加しない。省略すると `<meta name="viewport">` に
 * width=device-width が入らず、モバイルブラウザが既定の広い仮想ビューポート
 * (端末幅と無関係な値)で描画してしまい、fixed要素の実寸がずれて
 * 横スクロールが発生する(実測で確認)。既存V1から潜在していた不具合。
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${shippori.variable} ${archivo.variable}`}>
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
        {/*
          常設の3D空間。全セクションの背面に敷きっぱなしにすることで、
          セクションが「並んだ平面」ではなく「同じ空間の中の出来事」になる。
          本文側は背景を透過させ、この空間が透けて見える構造にしている。
        */}
        <AtmosphereMount />
        <Header />
        <SmoothScrollProvider>
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
