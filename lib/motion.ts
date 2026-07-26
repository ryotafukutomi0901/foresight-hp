import { gsap, CustomEase, ScrollTrigger } from "@/hooks/useGsap";

/*
 * モーショントークン。
 * 「すべてを同じeasingで動かさない」— 用途ごとにカーブを使い分ける。
 * 名前は役割で付ける(brandOut等)。呼び出し側がカーブの数値を直接書かないこと。
 */

let registered = false;

export function registerBrandEases() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  // 入場: 強い減速。速く動き出してゆっくり着地する(expo.outに近い)
  CustomEase.create("brandOut", "0.16, 1, 0.3, 1");
  // 場面転換: 対称的な加速→減速
  CustomEase.create("brandInOut", "0.76, 0, 0.24, 1");
  // 重量感: 動き出しが重く、止まり際に粘る(BUYセクション用)
  CustomEase.create("brandHeavy", "0.34, 0, 0.2, 1");
  // 決定・スナップ: 一気に到達して微かに落ち着く
  CustomEase.create("brandSnap", "0.2, 0.9, 0.1, 1");
  // カメラの引き: 動き出しに溜めを作り、中盤を持続させ、最後に静かに着地する。
  // brandOutのような強い前寄りのカーブだと序盤で一気に退がってしまい、
  // 「頭 → 胴体 → 翼」と視界が広がる過程が読めなくなるため専用に分ける。
  CustomEase.create("brandDolly", "0.45, 0.05, 0.25, 1");
}

export const EASE = {
  out: "brandOut",
  inOut: "brandInOut",
  heavy: "brandHeavy",
  snap: "brandSnap",
  dolly: "brandDolly",
  linear: "none",
} as const;

export const DUR = {
  micro: 0.3,
  ui: 0.6,
  enter: 1.0,
  cine: 1.6,
} as const;

/** スクロール連動の既定値。once:true で再生成を抑える。 */
export const REVEAL_TRIGGER = {
  start: "top 78%",
  once: true,
} as const;

/** ユーザーが「視差効果を減らす」を有効にしているか。 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 定番の「下から立ち上がる」入場。
 * .line-mask(overflow:hidden)の子要素に当てる前提。
 */
export function revealUp(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(targets, {
    yPercent: 110,
    duration: DUR.enter,
    ease: EASE.out,
    stagger: 0.08,
    ...vars,
  });
}

/** 淡く浮かび上がる入場(本文・補助テキスト向け)。 */
export function fadeUp(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(targets, {
    opacity: 0,
    y: 24,
    duration: DUR.enter,
    ease: EASE.out,
    stagger: 0.1,
    ...vars,
  });
}

/** 罫線が横に伸びる。セクションの開始を告げる合図として使う。 */
export function drawRule(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(targets, {
    scaleX: 0,
    transformOrigin: "left center",
    duration: DUR.cine,
    ease: EASE.inOut,
    ...vars,
  });
}

/** 画像の読み込み完了後に一度だけ位置を再計算する。 */
export function refreshScrollTriggers() {
  if (typeof window === "undefined") return;
  ScrollTrigger.refresh();
}
