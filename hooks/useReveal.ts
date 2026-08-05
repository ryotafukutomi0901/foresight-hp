"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/hooks/useGsap";
import { stagger as STAGGER } from "@/lib/tokens";

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
  { selector = "[data-reveal]", start = "top 88%", y = 18 }: Options = {},
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
       * 同時に画面へ入った要素だけを順に出す。
       * batch は「まとめて入ってきた分」を配列で渡してくるので、
       * 画面の下の方にある要素まで先走って出ることはない。
       */
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "brandOut",
          stagger: STAGGER.line,
          overwrite: true,
        }),
    });

    return () => {
      for (const t of triggers) t.kill();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, [scope, selector, start, y]);
}
