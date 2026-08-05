"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/hooks/useGsap";

/*
 * 各章の頭にある横線(`[data-chapter-rule]`)を、スクロールに連動して
 * 左から右へ伸ばす。
 *
 * ═══════════════════════════════════════════════════════════════
 *  以前は他の本文と同じ `data-reveal`(フェード+微妙な浮き上がり)に
 *  乗せていたが、線は「現れる」ものではなく「引かれる」ものとして
 *  見せたい、というフィードバックだった。
 *
 *  useReveal と分けているのは、あちらが once のタイムベースの
 *  tween(触れたら最後まで再生)なのに対し、こちらは scrub で
 *  スクロール量そのものに進捗を直結させる必要があるため。
 * ═══════════════════════════════════════════════════════════════
 */
export function useDrawRule(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const rules = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-chapter-rule]"),
    );
    if (!rules.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(rules, { scaleX: 1 });
      return;
    }

    gsap.set(rules, { scaleX: 0, transformOrigin: "left center" });

    const triggers = rules.map((rule) =>
      gsap.to(rule, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rule,
          start: "top 90%",
          end: "top 55%",
          scrub: 0.3,
        },
      }).scrollTrigger,
    );

    return () => {
      triggers.forEach((t) => t?.kill());
      gsap.set(rules, { clearProps: "transform" });
    };
  }, [scope]);
}
