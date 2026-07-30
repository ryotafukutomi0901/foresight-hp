import { gsap, CustomEase, SplitText, ScrollTrigger } from "@/hooks/useGsap";
import {
  duration,
  ease as EASE_TOKEN,
  easeCurves,
  scroll,
  stagger,
  transform,
} from "@/lib/tokens";

/*
 * モーションの共通語彙。
 * 「すべてを同じeasingで動かさない」— 用途ごとにカーブを使い分ける。
 * 名前は役割で付ける(brandOut等)。呼び出し側がカーブの数値を直接書かないこと。
 */

let registered = false;

export function registerBrandEases() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  /*
   * ベジェ値は docs/motion-bible.md が正本で、lib/tokens.ts 経由で受け取る。
   * ここに数値を直書きしないこと（Token Freeze）。
   */
  for (const [name, curve] of Object.entries(easeCurves)) {
    CustomEase.create(name, curve);
  }
}

export const EASE = EASE_TOKEN;

export const DUR = duration;

/** スクロール連動の既定値。once:true で再生成を抑える。 */
export const REVEAL_TRIGGER = {
  start: scroll.revealStart,
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
    rotateX: transform.rotateXCharFrom,
    autoAlpha: 0,
    filter: `blur(${transform.blurLayerFrom}px)`,
    transformOrigin: "50% 100% -20px",
    duration: 1.0,
    ease: EASE.out,
    stagger: { each: stagger.char, from: "start" },
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
    letterSpacing: transform.letterSpacingTrackFrom,
    autoAlpha: 0,
    filter: "blur(6px)",
    duration: 1.6,
    ease: EASE.out,
    ...vars,
  });
}

/*
 * scrambleIn（ラベルが解読されるように現れる）は削除した。
 * 使用箇所が無く、これ1つのために ScrambleTextPlugin を
 * 登録し続けるとバンドルに残り続けるため。
 * 復活させる場合は hooks/useGsap.ts にプラグイン登録を戻すこと。
 */

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
    scale: transform.scaleLayerFrom,
    y: transform.yLayerFrom,
    autoAlpha: 0,
    filter: `blur(${transform.blurLayerFrom}px)`,
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
    yPercent: transform.yPercentMask,
    duration: DUR.enter,
    ease: EASE.out,
    stagger: stagger.line,
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
    stagger: stagger.line,
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
