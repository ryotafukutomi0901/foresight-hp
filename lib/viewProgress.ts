/*
 * GSAP(スクロール) → R3F(カメラ・霧・回廊) をつなぐ橋渡し。
 *
 * 毎フレームReactのstateを更新すると、その都度コンポーネントツリーが再描画され
 * スクロール中に確実にコマ落ちする。そこでスクロール進行度は「モジュールスコープの
 * 可変オブジェクト」に書き込み、R3F側は useFrame の中から読むだけにする。
 * これによりReactの再レンダリングを一切発生させずに毎フレーム値を受け渡せる。
 *
 * 書き込み: GSAP ScrollTrigger の onUpdate
 * 読み出し: useFrame(() => { ... viewProgress.page ... })
 */

export const viewProgress = {
  /** ページ全体の進行度 0→1。常設空間のカメラ前進量に対応する。 */
  page: 0,
  /** SCENE「視界が開く」の進行度 0→1。 */
  vision: 0,
  /** Narrative(3D回廊)の進行度 0→1。カメラが10枚の間を通過する量。 */
  corridor: 0,
  /** 直近のスクロール速度(正規化)。霧の流れと色収差の強さに使う。 */
  velocity: 0,
};

export type ViewProgress = typeof viewProgress;
