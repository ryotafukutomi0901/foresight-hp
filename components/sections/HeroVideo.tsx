"use client";

import { useEffect, useRef } from "react";
import { onOpeningDone } from "@/lib/sequence";

/*
 * Heroの背景動画。
 *
 * ═══════════════════════════════════════════════════════════════
 *  構図の問題と、その解き方
 *
 *  生成された素材は車両が画面いっぱいに写っており、指示していた
 *  「左に35〜40%の余白」は入っていない。素材を作り直すより、
 *  **CSSで構図を作り直すほうが速く、確実で、可逆**なのでそうしている。
 *
 *    ① object-position を右に寄せ、車の前面を画面右2/3へ送る
 *    ② 左から黒のグラデーションを被せ、文字が乗る面を作る
 *
 *  ②は単なる減光ではない。素材の背景が黒なので、グラデーションは
 *  「暗くする」のではなく「車の線画だけを左端で消す」役割になる。
 * ═══════════════════════════════════════════════════════════════
 *
 * 再生開始はOpening(幕)の終了に同期させる。幕の裏で先に走らせると、
 * 幕が開いた瞬間には停止済みの車が映ってしまい、
 * 「走ってきて停まる」という最初の1カットが失われる。
 */

const SRC = "/video/hero-suv.mp4";

export default function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    /*
     * reduced-motion では再生しない。停止したまま先頭フレームが
     * 残るので、静止画を別途用意しなくても絵は成立する。
     * stateにせずここで直接読むのは、この判定が描画に影響せず
     * 再レンダーを起こす必要が無いため。
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return onOpeningDone(() => {
      const el = video.current;
      if (!el) return;
      /*
       * play() は Promise を返し、ユーザー操作前だと reject し得る。
       * muted + playsInline なので通常は通るが、失敗しても
       * 静止したまま最初のフレームが残るだけで害はない。
       */
      void el.play().catch(() => {});
    });
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/*
        映像は画面いっぱいに敷かず、**右側だけ**に置く。

        素材は車がフレーム全体を占めており、object-cover で敷くと
        左のコピー領域まで車体が侵してくる(実測: 見出しの裏に
        グリルの FORESIGHT が透けた)。

        素材の地が純黒なので、コンテナを小さくしても継ぎ目は見えない。
        レターボックスの黒帯がそのままページの地に溶ける。
        これが「黒地の素材」を扱えるときの一番きれいな解き方。
      */}
      <div
        /*
         * コンテナを**映像と同じ比率**にする。
         *
         * 全高のコンテナに object-contain で入れると、上下に
         * レターボックスができる。マスクはコンテナの端に掛かるので
         * 映像の実際の端(帯の境界)には届かず、境界線が残った(実測)。
         *
         * 比率を合わせれば余白が生まれず、マスクが映像の端に一致する。
         */
        className="absolute right-0 top-1/2 aspect-[16/9] w-[104%] -translate-y-1/2 sm:w-[88%] lg:w-[68%]"
        style={{
          /* 上下左を溶かし、ページの地に continuous に繋げる */
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to right, transparent 0%, black 30%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to right, transparent 0%, black 30%, black 100%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <video
          ref={video}
          src={SRC}
          muted
          playsInline
          preload="auto"
          /*
           * ループさせない。走ってきて停まる動きなので、
           * 繰り返すと車が瞬間移動して戻ることになる。
           * 停止した最終フレームがそのままHeroの絵になる。
           */
          className="h-full w-full object-cover"
        />
      </div>

      {/*
        左からのスクリム。コピーが乗る面を作る。

        濃くすると文字は読みやすいが、車が左半分から完全に消えて
        「黒い帯にテキストが乗っただけ」の絵になる。
        車体の線がうっすら透ける程度まで薄くして、
        映像とコピーが同じ画面に居る状態を保つ。
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,6,0.92) 0%, rgba(5,5,6,0.78) 20%, rgba(5,5,6,0.42) 34%, rgba(5,5,6,0.08) 50%, rgba(5,5,6,0) 62%)",
        }}
      />

      {/*
        上下の締め。ヘッダーとスクロールキューの可読性を確保しつつ、
        映像の矩形の縁が見えないようにする。
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,9,9,0.8) 0%, rgba(9,9,9,0) 20%, rgba(9,9,9,0) 70%, rgba(9,9,9,0.92) 100%)",
        }}
      />
    </div>
  );
}
