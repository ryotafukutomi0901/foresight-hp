/*
 * Opening の進行状態を、GSAPタイムライン(DOM側)から R3F の描画ループへ渡すための箱。
 *
 * なぜ state ではなくミュータブルなオブジェクトなのか:
 *   GSAPは毎フレーム値を書き換える。これを React state にすると
 *   1秒に60回の再レンダーが起き、Canvas配下が作り直されて破綻する。
 *   R3F の useFrame は毎フレーム走るので、共有オブジェクトを
 *   読むだけで済む。lib/viewProgress.ts と同じ考え方。
 *
 * GSAPは「このオブジェクトのプロパティ」を直接トゥイーンできるため、
 * タイムライン側は tl.to(openingStage, { reveal: 1 }) と書ける。
 */

export const openingStage = {
  /*
   * 闇からの結像。0=何も見えない / 1=完全に見えている。
   * 現在のOpeningは動画が結像を担うため、3D側は既定で1にしておき、
   * 実際の出現は slideIn が制御する。
   */
  reveal: 1,

  /** ディザの収束。0=粗い粒 / 1=像が定まった状態 */
  focus: 1,

  /** アングル巡り。0=最初のカット / 1=最後のカット */
  spin: 1,

  /** カメラの引き。0=寄り(ローディング) / 1=Heroの定位置 */
  dolly: 0,

  /** 右からのスライドイン。0=画面外(右) / 1=Heroの定位置 */
  slideIn: 0,

  /** ポインタ位置（画面中央を0とした -1〜1）。微細な視差に使う */
  pointerX: 0,
  pointerY: 0,
};

/** Opening を再生しない場合の最終状態（Heroの定位置）を即適用する */
export function settleOpeningStage() {
  openingStage.reveal = 1;
  openingStage.focus = 1;
  openingStage.spin = 1;
  openingStage.dolly = 1;
  openingStage.slideIn = 1;
}
