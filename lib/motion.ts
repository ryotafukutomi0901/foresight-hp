import { gsap, CustomEase, SplitText, ScrollTrigger } from "@/hooks/useGsap";

/*
 * モーションの共通語彙。
 * 「すべてを同じeasingで動かさない」— 用途ごとにカーブを使い分ける。
 * 名前は役割で付ける(brandOut等)。呼び出し側がカーブの数値を直接書かないこと。
 */

let registered = false;

export function registerBrandEases() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  // 入場: 強い減速。速く動き出してゆっくり着地する
  CustomEase.create("brandOut", "0.16, 1, 0.3, 1");
  // 場面転換: 対称的な加速→減速
  CustomEase.create("brandInOut", "0.76, 0, 0.24, 1");
  // 重量感: 動き出しが重く、止まり際に粘る
  CustomEase.create("brandHeavy", "0.34, 0, 0.2, 1");
  // 決定・スナップ
  CustomEase.create("brandSnap", "0.2, 0.9, 0.1, 1");
  // カメラの引き: 中盤を持続させ「頭→胴→翼」の過程を読ませる
  CustomEase.create("brandDolly", "0.45, 0.05, 0.25, 1");
  /*
   * 前進(ダイブ): 最後まで加速し続ける。
   * 「目の中に入っていく」動きは、減速すると"止まって見える"ため
   * 終端に向かって加速し続けるカーブでなければ没入感が出ない。
   */
  CustomEase.create("brandDive", "0.6, 0, 0.9, 0.35");
}

export const EASE = {
  out: "brandOut",
  inOut: "brandInOut",
  heavy: "brandHeavy",
  snap: "brandSnap",
  dolly: "brandDolly",
  dive: "brandDive",
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

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ *
 * テキストアニメーション
 * ------------------------------------------------------------------ */

/**
 * 見出しを文字単位で分割し、奥から起き上がるように出す。
 *
 * 和文の明朝は1文字の面積が大きいため、単純なフェードだと"ぬるっと"見える。
 * X軸で倒れた状態から起こすと、文字に厚みと物理感が出る。
 *
 * SplitTextの戻り値は必ず呼び出し側でrevert()すること
 * (useGSAPのスコープ内で使えば自動でrevertされる)。
 */
export function charsRise(
  target: string | HTMLElement,
  vars: gsap.TweenVars = {},
): { split: SplitText; tween: gsap.core.Tween } {
  const split = SplitText.create(target, {
    type: "chars,words",
    charsClass: "char",
    // 単語の途中で改行させない(和文でも英単語が混ざるため)
    wordsClass: "word",
  });

  const tween = gsap.from(split.chars, {
    yPercent: 60,
    rotateX: -78,
    autoAlpha: 0,
    filter: "blur(8px)",
    transformOrigin: "50% 100% -20px",
    duration: 1.0,
    ease: EASE.out,
    stagger: { each: 0.022, from: "start" },
    ...vars,
  });

  return { split, tween };
}

/**
 * 字間が広い状態から締まっていく。
 *
 * 明朝は字間を開けると空気が生まれ、締めると意志が出る。
 * この「開→締」だけで、動かしていないのに文字が"決まった"感覚を作れる。
 */
export function trackIn(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(target, {
    letterSpacing: "0.5em",
    autoAlpha: 0,
    filter: "blur(6px)",
    duration: 1.6,
    ease: EASE.out,
    ...vars,
  });
}

/** ラベルが解読されるように現れる。 */
export function scrambleIn(
  target: gsap.TweenTarget,
  text: string,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.to(target, {
    duration: 1.1,
    ease: "none",
    scrambleText: {
      text,
      chars: "upperCase",
      speed: 0.4,
      revealDelay: 0.15,
    },
    ...vars,
  });
}

/* ------------------------------------------------------------------ *
 * レイヤー(面)のアニメーション
 * ------------------------------------------------------------------ */

/**
 * 共通の入場則 —「奥から手前へ」。
 *
 * このサイトの背骨は「カメラが奥へ入っていく」こと。
 * したがって要素は下からせり上がるのではなく、
 * 奥(小さく・ぼけている)から手前(原寸・鮮明)へ来る。
 * 全セクションでこの1つの規則に統一することで、
 * ページ全体が同じ空間の中の出来事に見える。
 */
export function layerIn(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  return gsap.from(target, {
    scale: 0.94,
    y: 40,
    autoAlpha: 0,
    filter: "blur(8px)",
    transformOrigin: "50% 50%",
    duration: 1.4,
    ease: EASE.out,
    ...vars,
  });
}

/** 行マスク(overflow:hidden の子)を下から立ち上げる。 */
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

/** 罫線が奥から横に伸びる。セクションの開始を告げる合図。 */
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
