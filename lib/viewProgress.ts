/*
 * GSAP(スクロール) → R3F(カメラ・霧) をつなぐ橋渡し。
 *
 * 毎フレームReactのstateを更新すると、その都度コンポーネントツリーが再描画され
 * スクロール中に確実にコマ落ちする。そこでスクロール進行度は「モジュールスコープの
 * 可変オブジェクト」に書き込み、R3F側は useFrame の中から読むだけにする。
 * これによりReactの再レンダリングを一切発生させずに毎フレーム値を受け渡せる。
 *
 * 書き込み: GSAP ScrollTrigger の onUpdate
 * 読み出し: useFrame(() => { ... viewProgress.vision ... })
 */

export const viewProgress = {
  /** SCENE 02「視界が開く」の進行度 0→1。カメラの後退量に対応する。 */
  vision: 0,
  /** ページ全体の進行度 0→1。霧の濃度をゆるやかに変化させるのに使う。 */
  page: 0,
  /** 直近のスクロール速度(正規化)。霧の流れの強さに使う。 */
  velocity: 0,
};

export type ViewProgress = typeof viewProgress;
