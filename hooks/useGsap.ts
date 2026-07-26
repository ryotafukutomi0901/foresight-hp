"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

// プラグイン登録はこのモジュールで一度だけ行う。
// 各コンポーネントが個別に registerPlugin を呼ぶと登録漏れ・重複の温床になるため、
// GSAPの入口をここに一本化し、コンポーネントは必ずこのモジュール経由でimportする。
//
// GSAP 3.15 は旧Club限定プラグインを含め全て無償同梱されている。
// 追加ライセンスや別レジストリは不要。
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollSmoother,
    SplitText,
    CustomEase,
    CustomWiggle,
    MotionPathPlugin,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    Observer,
    Flip,
  );
}

/**
 * useGSAPをスコープ付きで使うための薄いラッパー。
 * 返されたrefを要素に付けると、その配下のセレクタだけが対象になり、
 * アンマウント時にuseGSAPが自動でrevert()するため手動cleanupが不要になる。
 */
export function useScopedGsap<T extends HTMLElement>(
  callback: (context: { scope: RefObject<T | null> }) => void,
  deps: unknown[] = [],
) {
  const scope = useRef<T | null>(null);

  useGSAP(
    () => {
      callback({ scope });
    },
    { scope, dependencies: deps },
  );

  return scope;
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  CustomEase,
  CustomWiggle,
  MotionPathPlugin,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  Observer,
  Flip,
};
