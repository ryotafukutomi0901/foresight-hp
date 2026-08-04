import { Effect, EffectAttribute } from "postprocessing";
import { Uniform, type Texture } from "three";

/*
 * 法線と深度の差分から輪郭線を描くポストエフェクト。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜこれが要るのか
 *
 *  ブランドの参照資料(public/images/foresight/vehicle-parts/)は
 *  黒地に白1pxの線画。一方、納品されたGLBは写真ベースの写実モデル。
 *  この2つを繋ぐのがこのエフェクトで、写実的な車体の上に
 *  「設計線」だけを白く光らせて線画のトーンを被せる。
 *
 *  three.js の wireframe:true は使えない。写真ジオメトリは
 *  9万トライアングルあり、生の三角形を出すと線が過密になって
 *  ただのノイズになる(docs/vehicle-glb-handoff.md §3)。
 *  法線と深度の変化を見て「面の折れ目」と「輪郭」だけを拾う。
 * ═══════════════════════════════════════════════════════════════
 *
 * 出力は加算。後段のBloomが拾って線が発光する。
 */

const fragmentShader = /* glsl */ `
uniform sampler2D uNormalBuffer;
uniform float uNormalThreshold;
uniform float uDepthThreshold;
uniform float uStrength;
uniform vec3 uLineColor;

void mainImage(
  const in vec4 inputColor,
  const in vec2 uv,
  const in float depth,
  out vec4 outputColor
) {
  vec2 px = 1.0 / resolution;

  /* ── 法線の折れ目 ──
     上下左右の4近傍と法線を比べる。2近傍だけだと線が
     片側にしか出ず、輪郭が途切れて見える。 */
  vec3 n  = texture2D(uNormalBuffer, uv).rgb * 2.0 - 1.0;
  vec3 nr = texture2D(uNormalBuffer, uv + vec2(px.x, 0.0)).rgb * 2.0 - 1.0;
  vec3 nl = texture2D(uNormalBuffer, uv - vec2(px.x, 0.0)).rgb * 2.0 - 1.0;
  vec3 nu = texture2D(uNormalBuffer, uv + vec2(0.0, px.y)).rgb * 2.0 - 1.0;
  vec3 nd = texture2D(uNormalBuffer, uv - vec2(0.0, px.y)).rgb * 2.0 - 1.0;

  float dn =
      (1.0 - dot(n, nr))
    + (1.0 - dot(n, nl))
    + (1.0 - dot(n, nu))
    + (1.0 - dot(n, nd));

  /* ── 深度の段差 ──
     法線だけだと、面が連続したまま奥行きだけ変わる箇所
     (車体とその奥の背景の境目など)で線が出ない。 */
  float d  = readDepth(uv);
  float dr = readDepth(uv + vec2(px.x, 0.0));
  float du = readDepth(uv + vec2(0.0, px.y));
  float dd = abs(d - dr) + abs(d - du);

  float edge = smoothstep(uNormalThreshold, uNormalThreshold + 0.2, dn);
  edge = max(edge, smoothstep(uDepthThreshold, uDepthThreshold * 4.0, dd));

  /*
   * 背景では線を出さない。
   * 何も描かれていない領域は深度が最遠(1.0)に張り付いており、
   * そこで深度差を拾うと画面の縁に枠線が出てしまう。
   */
  edge *= step(d, 0.9995);

  outputColor = vec4(inputColor.rgb + uLineColor * edge * uStrength, inputColor.a);
}
`;

export type EdgesOptions = {
  /** 法線差の閾値。上げるとノイズ線が減り、太い折れ目だけ残る */
  normalThreshold?: number;
  /** 深度差の閾値。輪郭(シルエット)の出方を決める */
  depthThreshold?: number;
  /** 線の明るさ。Bloomの閾値を超えると発光する */
  strength?: number;
};

export class EdgesEffect extends Effect {
  constructor(normalBuffer: Texture | null, options: EdgesOptions = {}) {
    const {
      normalThreshold = 0.35,
      depthThreshold = 0.0006,
      strength = 0.85,
    } = options;

    super("EdgesEffect", fragmentShader, {
      /* DEPTH を宣言すると readDepth() が使えるようになる */
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ["uNormalBuffer", new Uniform(normalBuffer)],
        ["uNormalThreshold", new Uniform(normalThreshold)],
        ["uDepthThreshold", new Uniform(depthThreshold)],
        ["uStrength", new Uniform(strength)],
        ["uLineColor", new Uniform([1, 1, 1])],
      ]),
    });
  }
}
