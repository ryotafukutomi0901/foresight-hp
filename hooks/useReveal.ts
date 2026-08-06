"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/hooks/useGsap";

/*
 * 文章をスクロールに合わせて上から順に出す、共通の仕掛け。
 *
 * ═══════════════════════════════════════════════════════════════
 *  以前は BrandMessage / Services / Contact が同じことを
 *  それぞれ手書きしていた。フックも data-bm-* / data-sv-* /
 *  data-contact-* とバラバラで、要素を1つ足すたびに
 *  そのセクションのタイムラインを書き換える必要があった。
 *
 *  `data-reveal` を付けるだけで出るようにする。
 *  「上から順に出る」のは順番を組んでいるからではなく、
 *  上にあるものが先に画面へ入るという当たり前の帰結。
 * ═══════════════════════════════════════════════════════════════
 *
 * 要素ごとに ScrollTrigger を作らず batch を使う。
 * このページは文章が数十個あり、1つずつトリガーを立てると
 * スクロールのたびに全件の判定が走る。batch なら
 * IntersectionObserver 1つにまとまる。
 */

type Options = {
  /** 拾う要素のセレクタ */
  selector?: string;
  /** 出はじめる位置。画面下から何割の所で発火するか */
  start?: string;
  /** 持ち上げる距離(px) */
  y?: number;
};

export function useReveal(
  scope: RefObject<HTMLElement | null>,
  { selector = "[data-reveal]", start = "top 88%", y = 26 }: Options = {},
) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector));
    if (!items.length) return;

    /*
     * reduced-motion では最終状態を置く。
     * 「動かさない」のであって「見せない」のではない。
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(items, { autoAlpha: 0, y });

    const triggers = ScrollTrigger.batch(items, {
      start,
      once: true,
      /*
       * batch のデフォルト interval(0.1s)だと、要素同士が画面へ
       * 入るタイミングがそれより離れているだけで別々の onEnter 呼び出しに
       * 割れてしまい、下の stagger が一切効かなくなる
       * (実測: opacityを100msおきに計測して確認。要素間の間隔が
       * スクロール速度まかせになり、stagger の値を変えても
       * 見た目が変わらなかった)。
       *
       * 0.4s まで広げ、通常のスクロール速度なら章内の data-reveal が
       * 確実に同じ batch へまとまるようにする。まとまった上で
       * 下の stagger が「上から順に、間を置いて」の間隔を作る。
       */
      interval: 0.4,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          /*
           * brandOut(0.16,1,0.3,1)は立ち上がりが鋭く、「動いた」ことが
           * 先に伝わる硬い出方だった。sine.out は加速も減速も緩やかで、
           * 「フワッと」というフィードバック通りの柔らかい着地になる。
           */
          ease: "sine.out",
          /*
           * ease が視覚的に収束するのにかかる時間より
           * stagger を大きく取り、「1つ出て、少し間があって、次が出る」を
           * はっきり体感できるようにする。
           */
          stagger: 0.42,
          overwrite: true,
        }),
    });

    return () => {
      for (const t of triggers) t.kill();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, [scope, selector, start, y]);
}
