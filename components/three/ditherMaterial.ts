import * as THREE from "three";
import { dither } from "@/lib/tokens";

/*
 * DITHERING — Foresight のブランド視覚言語。
 *
 * Bayer 4×4 の順序ディザで、白線画をモノクロ階調の粒に変換する。
 *
 * なぜディザなのか:
 *   1. ブランド。工業製品の設計図・印刷物の質感に接続する。
 *      グラデーションで滑らかに描くより、粒で構成された方が
 *      「精密に見極めている」というForesightの態度に合う。
 *   2. 実利。pixelSize をカメラ距離に連動させると、寄るほど粒が粗くなる。
 *      素材の実寸が267pxしかない現状、拡大時の粗を
 *      「意図した粒状感」として読ませることができる。
 *      高解像度素材に差し替わった後も、表現として残す価値がある。
 *
 * 数値は docs/art-bible.md / lib/tokens.ts が正本。ここに直書きしない。
 */

/** Bayer 4×4 の閾値行列（0〜15 を 0〜1 に正規化して使う） */
const BAYER_4X4 = `
const float bayer[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uMap;
uniform float uOpacity;
uniform float uPixelSize;   // 粒の大きさ（カメラ距離に連動）
uniform vec2  uResolution;  // 平面のピクセル解像度
/*
 * UVの切り出し。スプライトシートから1コマだけを描くために使う。
 * three.js の texture.repeat/offset はビルトインマテリアル専用で、
 * 自前のフラグメントシェーダーには適用されない（実測で9コマ全部が出た）。
 * 同じ役割を明示的に持たせる。既定は等倍・原点で、単一画像なら影響しない。
 */
uniform vec2  uUvScale;
uniform vec2  uUvOffset;
uniform float uMatrixSize;
uniform float uDarkCutoff;
uniform float uLightCutoff;
uniform float uStrength;
uniform float uEdgeFeather;

varying vec2 vUv;

${BAYER_4X4}

/*
 * 輝度。白線画なので RGB の重み付けは Rec.709 に従う。
 * 素材はモノクロだが、テクスチャ圧縮で僅かに色が乗るため
 * 単純平均ではなく知覚輝度で取る。
 */
float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  /*
   * 1. ピクセル化（ダウンサンプル）
   *    UVを量子化してからサンプリングする。これを先に行わないと
   *    ディザの粒とテクスチャの画素が干渉してモアレになる。
   */
  vec2 pixels = uResolution / max(uPixelSize, 1.0);
  vec2 quantUv = floor(vUv * pixels) / pixels;

  // 量子化した後にコマの矩形へ写す。順序を逆にすると粒がコマ間でズレる
  vec2 sheetUv = uUvOffset + quantUv * uUvScale;

  vec3 texel = texture2D(uMap, sheetUv).rgb;
  float brightness = luma(texel);

  /*
   * 2. Bayer 閾値の取得
   *    画面上の位置から 4×4 行列内の座標を求める。
   *    gl_FragCoord を使うのは、平面が回転・移動しても
   *    粒が画面に固定されて「フィルムの粒子」に見えるため。
   *    UV基準にすると粒が板と一緒に動き、テクスチャに見えてしまう。
   */
  vec2 cell = floor(mod(gl_FragCoord.xy / max(uPixelSize, 1.0), uMatrixSize));
  int index = int(cell.y * uMatrixSize + cell.x);
  float threshold = bayer[index] / (uMatrixSize * uMatrixSize);

  /*
   * 3. 閾値比較
   *    極端な明部・暗部は比較を省いて潰れ・浮きを防ぐ。
   */
  float dithered;
  if (brightness > uLightCutoff) {
    dithered = 1.0;
  } else if (brightness < uDarkCutoff) {
    // 黒は確実に0へ。加算合成では黒=透明なので、ここが透過の前提になる
    dithered = 0.0;
  } else {
    // カットオフ間だけを閾値比較の対象にし、階調を使い切る
    float t = (brightness - uDarkCutoff) / (uLightCutoff - uDarkCutoff);
    dithered = step(threshold, t);
  }

  /*
   * 4. 原画とディザを混ぜる。
   *    完全に2値化すると、アンチエイリアス付きの細い線が
   *    縁の中間調ごと点に分解されて壊れる（実測）。
   *    粒状の質感だけを乗せ、線の連続性は原画側で保つ。
   */
  float base = smoothstep(uDarkCutoff, uDarkCutoff + 0.04, brightness) * brightness;
  float v = mix(base, dithered, uStrength);

  /*
   * 暗部を確実に落とす。
   * dithered は step() の出力なので 0 か 1 しか返さない。
   * 背景が純黒でも threshold が 0 のセルでは step(0.0, 0.0) = 1.0 となり、
   * uStrength の割合だけ白が出る。これが板の矩形が薄い箱として
   * 見える原因だった（素材の黒は実測で luma 0.0 と確認済み）。
   * 原画が暗いところでは合成結果ごと0へ落とす。
   */
  v *= smoothstep(uDarkCutoff, uDarkCutoff + 0.02, brightness);

  /*
   * 5. 加算合成のため、黒はそのまま黒（=透過）にする。
   *    alpha ではなく色の明度で透過を作るのが加算合成の流儀。
   */
  /*
   * 6. 板の端を放射状にフェードさせる。
   *    暗部カットオフだけでは圧縮ノイズが残り、矩形が薄い箱として見える。
   *    境界そのものを消してしまえば、ノイズが残っても箱にはならない。
   */
  vec2 fromCenter = vUv - 0.5;
  float edgeDist = max(abs(fromCenter.x), abs(fromCenter.y));
  float edge = 1.0 - smoothstep(uEdgeFeather, 0.5, edgeDist);

  float a = v * uOpacity * edge;
  /*
   * alpha を明度に連動させる。
   * 加算合成だけを見れば alpha=1.0 でも結果は同じだが、
   * EffectComposer は中間バッファに alpha ごと書き込むため、
   * 1.0 のままだと板の矩形が「不透明な面」として残り、
   * ポストプロセス後に薄い箱として見える（実測）。
   *
   * 色は alpha で割らない値を保つ。両方に a を掛けると
   * 二重に暗くなり、線が沈んで読めなくなる。
   */
  vec3 color = vec3(v) * uOpacity;
  gl_FragColor = vec4(color, a);
}
`;

export type DitherUniforms = {
  uMap: { value: THREE.Texture | null };
  uOpacity: { value: number };
  uPixelSize: { value: number };
  uResolution: { value: THREE.Vector2 };
  uMatrixSize: { value: number };
  uDarkCutoff: { value: number };
  uLightCutoff: { value: number };
  uStrength: { value: number };
  uEdgeFeather: { value: number };
  uUvScale: { value: THREE.Vector2 };
  uUvOffset: { value: THREE.Vector2 };
};

/**
 * ディザリング用のマテリアルを1枚分作る。
 * 加算合成・深度書き込みなしは、既存の回廊と同じ合成規則に揃えている。
 */
export function createDitherMaterial(texture: THREE.Texture) {
  const uniforms: DitherUniforms = {
    uMap: { value: texture },
    uOpacity: { value: 0 },
    uPixelSize: { value: dither.pixelSizeFar },
    /*
     * テクスチャの実寸。素材の差し替えで変わるため画像から読む。
     * ピクセル化の量子化グリッドがこの値を基準にするので、
     * 固定値にすると素材を替えた瞬間に粒の細かさが意図とズレる。
     */
    uResolution: {
      value: new THREE.Vector2(
        (texture.image as { width?: number } | undefined)?.width ?? 267,
        (texture.image as { height?: number } | undefined)?.height ?? 296,
      ),
    },
    uMatrixSize: { value: dither.matrixSize },
    uDarkCutoff: { value: dither.darkCutoff },
    uLightCutoff: { value: dither.lightCutoff },
    uStrength: { value: dither.strength },
    uEdgeFeather: { value: dither.edgeFeather },
    /* 既定は画像1枚をそのまま使う。スプライトシートの場合だけ上書きする */
    uUvScale: { value: new THREE.Vector2(1, 1) },
    uUvOffset: { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    /*
     * シーンのフォグを適用しない。
     * ShaderMaterial は fog を自動では受けないが、既定の false を
     * 明示しておく。加算合成では黒=透明なので、フォグで持ち上がると
     * 板の矩形がそのまま薄い箱として見えてしまう。
     */
    fog: false,
  });

  return { material, uniforms };
}

/**
 * カメラ距離から粒の大きさを求める。
 * 近いほど粗く（pixelSizeNear）、遠いほど細かい（pixelSizeFar）。
 *
 * 寄ったときに素材の粗が出るのを、粒の粗さとして先回りで見せることで
 * 「解像度が足りない」ではなく「そういう表現」として読ませる。
 */
export function pixelSizeForDistance(distance: number): number {
  const t = THREE.MathUtils.smoothstep(
    distance,
    dither.distanceNear,
    dither.distanceFar,
  );
  return THREE.MathUtils.lerp(dither.pixelSizeNear, dither.pixelSizeFar, t);
}
