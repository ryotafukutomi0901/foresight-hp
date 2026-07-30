"use client";

import { heroGaze as G } from "@/lib/tokens";

/*
 * SILENT GAZE — 決定事項1のHero側での実体。
 *
 * 鷹を実体として見せず、「見通す視線」だけを一本の線として置く
 * (docs/hero-bible.md / shot-list H-01・H-05・H-06)。
 *
 * 幾何は hero-bible.md の Hero Layout のASCII図が正本で、
 * 数値は lib/tokens.ts の heroGaze 経由で受け取る。ここに直書きしないこと(Token Freeze)。
 *
 * Three.jsを使わない理由は decision-log D-008。
 * Heroはファーストビューで、2つ目のWebGLコンテキストを起こすとLCPとGPUの
 * 両方を圧迫する。ここで要るのは奥行きではなく「にじみ」なので、
 * SVGフィルタで十分かつ高品質に作れる。
 *
 * ■ レイアウトに影響を与えないこと（重要）
 *   このコンポーネントは absolute + inset-0 で、フローに一切参加しない。
 *   Heroの高さが1pxでも変わるとページ全体の高さが変わり、
 *   pin区間の進行度がズレて **Vision の Baseline が壊れる**。
 *   実際に過去、キャプションの padding を変えただけで Vision に47.8%の
 *   差分が出た事故がある(decision-log)。ここは絶対に配置に関与させない。
 *
 * ■ アニメーションは持たない
 *   H-01(描画) / H-05(明滅・パララックス) / H-06(右へ収束) は
 *   すべて Hero.tsx のタイムラインが駆動する。
 *   この階層は「何を描くか」だけを持ち、「いつどう動くか」は持たない。
 */

/** 線の全長。dash計算に使う（pathLength=1で正規化するため実寸は不要だが、傾きの算出に使う） */
export default function SilentGaze() {
  return (
    /*
     * lg 未満では描画しない。
     *
     * hero-bible の Hero Layout は「左50%: 文字 / 右50%: 空白と視線」という
     * **2カラムの構図**として視線を定義している。狭い画面では本文が全幅になり
     * 「空白の右半分」が存在しないため、同じ線を置くと本文とCTAを横切る
     * （実測: 390×844で線が本文とCTAを貫通して事故のように見えた）。
     *
     * 縮小して置く／角度を変えて置くという案もあるが、これは
     * hero-bible に記載の無い**新しい構図の決定**になるため独断で決めない。
     * decision-log D-020 に候補として記録し、CEO判断を待つ。
     *
     * ScrollSmoother や Opening の雲(data-cloud-desktop)も lg 境界で
     * 出し分けており、この境界は既存の慣例に沿っている。
     */
    <div
      data-gaze-layer
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block"
    >
      <svg
        data-gaze
        // viewBoxを0 0 100 100にして、トークンの%座標をそのまま座標として使う。
        // preserveAspectRatio="none" で親の比率に追従させ、
        // どの画面比でも「右半分を横切る対角線」という関係を保つ。
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ opacity: 0 }}
      >
        <defs>
          {/*
            にじみ。線の周囲に微かな光を置く(hero-bible Hero Lighting)。
            ぼかした自分自身を下に重ねるだけの構成にして、
            フィルタ領域を線の近傍に限定する(全画面をぼかすと負荷が跳ねる)。
          */}
          <filter
            id="gaze-bleed"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={G.glowBlur} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/*
          dash の単位について（ここを間違えると線が破線になる）

          `pathLength="1"` で正規化する手も試したが、
          `vectorEffect="non-scaling-stroke"` と併用すると dash がスクリーン空間で
          計算され、pathLength の正規化が効かずに「1ユーザー単位ごとの破線」になった（実測）。

          そこで dash はスクリーン空間のpxで扱う。
          Hero.tsx が線の実描画長を getBoundingClientRect から測り、
          `s`→`e` の区間をpxへ変換して渡す。resize でも測り直す。

          non-scaling-stroke は外さない。viewBoxを preserveAspectRatio="none" で
          引き伸ばしているため、これが無いと線幅が画面比で歪む。
        */}
        <line
          data-gaze-line
          x1={G.x1}
          y1={G.y1}
          x2={G.x2}
          y2={G.y2}
          stroke="var(--color-ink-strong)"
          strokeWidth={G.strokeWidth}
          /*
           * butt を使う。round にすると、H-06 で長さが0へ収束したときに
           * 丸いキャップが点として残り、画面右上に光の粒が残留する。
           */
          strokeLinecap="butt"
          filter="url(#gaze-bleed)"
          vectorEffect="non-scaling-stroke"
          // 初期状態は「長さ0」= まだ引かれていない。実値は Hero.tsx が入れる
          strokeDasharray="0 99999"
        />
      </svg>
    </div>
  );
}
