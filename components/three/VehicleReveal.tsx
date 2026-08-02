"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createDitherMaterial, type DitherUniforms } from "./ditherMaterial";
import { openingStage } from "@/lib/openingStage";

/*
 * VEHICLE REVEAL — ローディングからHeroまでを繋ぐ車両の結像。
 *
 * 幕を降ろして別画面に切り替えるのではなく、
 * 「闇 → 結像 → アングルが巡る → Heroの定位置に収まる」までを
 * ひとつの空間の中で連続して見せる。Heroに着いた後もこの車両は
 * 画面に残り続け、背景そのものになる。
 *
 * 素材: public/images/foresight/vehicle180.png
 *   3×4 のスプライトシート（実際に絵があるのは上3行=9セル）。
 *   黒地に白の線画で、加算合成すると黒が透けて霧の中に浮かぶ。
 *
 * ⚠️ 9アングルは等間隔ではない（30〜60度のばらつき）うえ、
 *    中央にトップビューが混ざる。滑らかな連続回転はできないため、
 *    「回転」ではなく「アングルが切り替わる」演出として構成する。
 *    切り替えはクロスディゾルブで繋ぎ、間隔の不均一を吸収する。
 */

const SHEET = "/images/foresight/vehicle180.png";

/** スプライトシートの分割数 */
const COLS = 3;
const ROWS = 3;

/*
 * セル番号（0=左上、右へ+1、次の行へ）と、そこに写っているアングル。
 *
 *   0: 正面        1: 斜め前        2: 斜め後ろ
 *   3: 真横(左)    4: 真上          5: 真横(右)
 *   6: 斜め後ろ(左) 7: 斜め前(寄り)  8: 斜め前(逆光)
 */
const CELL = {
  front: 0,
  frontQuarter: 1,
  rearQuarter: 2,
  sideLeft: 3,
  top: 4,
  sideRight: 5,
  rearLeft: 6,
  frontClose: 7,
  frontAlt: 8,
} as const;

/**
 * 見せる順序。「正面から入り、車体を巡り、斜め前で落ち着く」。
 * トップビュー(4)は回転列に入れない。ヨーではなくピッチが違うため、
 * 列に混ぜると回転が破綻して見える。
 */
const SEQUENCE: number[] = [
  CELL.front,
  CELL.frontQuarter,
  CELL.sideRight,
  CELL.rearQuarter,
  CELL.rearLeft,
  CELL.sideLeft,
  CELL.frontAlt,
  CELL.frontClose,
];

/*
 * セルの内側を少しだけ削ってサンプリングする。
 * ちょうどセル境界で切ると、線形補間が隣のセルの端の画素を拾い、
 * 画面の上下に別アングルの断片が現れる（実測で確認）。
 */
const INSET = 0.012;

/** シート上のセル位置から UV オフセットを求める */
function offsetOf(cell: number): [number, number] {
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  // WebGL の UV は左下原点。行番号は上からなので反転する
  return [col / COLS + INSET, 1 - (row + 1) / ROWS + INSET];
}

/**
 * 2枚重ねの板でクロスディゾルブする。
 * 1枚のテクスチャの offset を切り替えるだけだと、アングルが
 * パッと飛んで「パラパラ漫画」になる。奥に次のカットを準備し、
 * 手前を薄くしながら入れ替えることで、切り替えを繋ぎとして見せる。
 */
export default function VehicleReveal() {
  const texture = useLoader(THREE.TextureLoader, SHEET);

  const group = useRef<THREE.Group>(null);
  const frontMesh = useRef<THREE.Mesh>(null);
  const backMesh = useRef<THREE.Mesh>(null);

  /*
   * useLoader が返す texture はコンポーネント間で共有されるキャッシュ済み
   * インスタンスで、React Compiler の不変条件により書き換えられない。
   * clone を1つ作り、設定はその場(useMemo内)で完結させる。
   *
   * 2枚の板でテクスチャ自体は共有してよい。コマの切り出しは
   * texture.repeat/offset ではなくシェーダーの uniform で行うため
   * (自前のフラグメントシェーダーには repeat/offset が効かない)。
   */
  const { tex, layers } = useMemo(() => {
    const tex = texture.clone();
    tex.colorSpace = THREE.SRGBColorSpace;
    /*
     * ミップマップを有効にする。
     * 無効だと、縮小表示時に線画の1px線がサンプリングで飛び飛びになり
     * 「ちらつく・ジャギる」画になる（実測）。異方性フィルタも上げて、
     * 斜めから見たときの線の解像を保つ。
     */
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 8;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;

    const build = () => {
      const { material, uniforms } = createDitherMaterial(tex);
      // 1コマ分だけを描くようUVを縮める。INSETで両端を少し詰める
      uniforms.uUvScale.value.set(
        1 / COLS - INSET * 2,
        1 / ROWS - INSET * 2,
      );
      /*
       * uResolution は「1セルの実寸」でなければならない。
       * createDitherMaterial はシート全体の寸法を読むため、
       * そのままだとディザの粒がセル数分だけ細かくなる。
       */
      const img = tex.image as { width?: number; height?: number } | undefined;
      uniforms.uResolution.value.set(
        (img?.width ?? 1536) / COLS,
        (img?.height ?? 1024) / ROWS,
      );

      /*
       * ⚠️ 回廊向けの既定値のままだと車が消える（実測）。
       *
       * darkCutoff 0.24 は回廊素材(白線が太い)の前提。この車両線画は
       * 線が1px・アンチエイリアス付きで、大半の画素が輝度0.1〜0.2に入る。
       * 既定値ではそれらが全て黒として捨てられ、
       * 最も明るいヘッドライトとロゴ文字だけが残った。
       *
       * 背景の黒を透過させる役割は残しつつ、線を拾える位置まで下げる。
       * edgeFeather も、セル境界の隣接絵が覗くのを防ぐため強くする。
       */
      uniforms.uDarkCutoff.value = 0.045;
      /*
       * 線を白く出しきる。既定(0.94)はこの素材には高すぎ、
       * 線の大半が中間調のまま沈んで車が霞んで見えた。
       */
      uniforms.uLightCutoff.value = 0.42;
      /*
       * ディザの混合比。既定(0.18)より上げて粒状感を出す。
       * 線が1pxなので上げすぎると分解するが、
       * 0.3 までは連続性が保てることを実測で確認。
       */
      uniforms.uStrength.value = 0.16;
      /*
       * 端のフェード開始位置。0.5が板の端なので、0.30 だと
       * 中心から6割の位置で減衰が始まる。既定(0.34)では
       * PNGの黒背景に残る僅かなノイズが矩形の箱として見えた（実測）。
       */
      uniforms.uEdgeFeather.value = 0.3;

      return { material, uniforms };
    };
    return { tex, layers: { a: build(), b: build() } };
  }, [texture]);

  // 破棄。Canvasのアンマウントでリークさせない
  useEffect(() => {
    const { a, b } = layers;
    return () => {
      a.material.dispose();
      b.material.dispose();
      tex.dispose();
    };
  }, [layers, tex]);

  /** 現在表示中のシーケンス位置 */
  const cursor = useRef(-1);

  useFrame(() => {
    const g = group.current;
    const front = frontMesh.current;
    const back = backMesh.current;
    if (!g || !front || !back) return;

    const s = openingStage;

    /*
     * uniforms と texture は useMemo の戻り値を直接書き換えず、
     * 必ず ref(mesh) から辿る。レンダー中に作った値をレンダー後に
     * 書き換えると React Compiler の不変条件に反するため
     * (NarrativeCorridor と同じ規則に揃えている)。
     */
    const fm = front.material as THREE.ShaderMaterial;
    const bm = back.material as THREE.ShaderMaterial;
    const fu = fm.uniforms as unknown as DitherUniforms;
    const bu = bm.uniforms as unknown as DitherUniforms;

    /*
     * 1. アングルの切り替え
     *    progress(0→1) を SEQUENCE の長さに写像する。
     *    整数部が「今のカット」、小数部が「次への遷移率」。
     */
    const span = (SEQUENCE.length - 1) * s.spin;
    const index = Math.floor(span);
    const frac = span - index;

    if (index !== cursor.current) {
      cursor.current = index;
      const cur = SEQUENCE[Math.min(index, SEQUENCE.length - 1)];
      const nxt = SEQUENCE[Math.min(index + 1, SEQUENCE.length - 1)];
      fu.uUvOffset.value.set(...offsetOf(cur));
      bu.uUvOffset.value.set(...offsetOf(nxt));
    }

    /*
     * 2. 不透明度
     *    reveal は「闇からの結像」、frac は「次カットへの移り」。
     *    両者を掛けることで、結像しきる前の切り替えも自然に繋がる。
     */
    /*
     * 1.0 を超える値を入れているのは、加算合成では uOpacity が
     * そのまま線の明るさになるため。1.0 だと素材の中間調が
     * 霧に埋もれて車が沈む（実測）。線を持ち上げて主役にする。
     */
    /*
     * ローディング中(動画再生中)は3Dの車を出さない。
     * 動画自体が車を映しているため、二重に出ると画面が破綻する。
     * slideIn が動き出してから姿を現す。
     */
    const revealed = s.reveal * s.slideIn * 2.2;
    fu.uOpacity.value = revealed * (1 - frac);
    bu.uOpacity.value = revealed * frac;

    /*
     * 3. ディザの粒度
     *    結像前は粗く、定まるにつれて細かくする。
     *    「粒子が集まって像を結ぶ」という運動をディザ自体で表現する。
     */
    /*
     * 粒の大きさ。uPixelSize は「何画素を1粒に潰すか」なので、
     * 大きいほど絵が粗くなる。結像の演出として粗さから入るが、
     * 定まった後は 1.0(=潰さない)まで戻し、素材の解像度をそのまま出す。
     * 以前は終端が0.9でも開始が4.2と粗すぎ、
     * 結像途中のほとんどの時間が低画質に見えていた。
     */
    const grain = THREE.MathUtils.lerp(2.4, 1, s.focus);
    fu.uPixelSize.value = grain;
    bu.uPixelSize.value = grain;

    /*
     * 4. カメラワーク（板の側を動かす）
     *    寄った状態から始まり、Heroの定位置へ向けて引いていく。
     *    引ききった位置がHeroの背景としての車両の居場所になる。
     *
     *    カメラは z=6 / fov=58 に固定(camera-bible)。距離 d での視野高は
     *      h = 2 * d * tan(fov/2) = 2 * d * 0.5543
     *    板は 7.2 四方なので、d=5 のとき視野高 5.54 に対し板が 7.2 で
     *    画面からはみ出す。Heroでは車が画面内に収まっている必要があるため、
     *    奥に置いて視野高を稼ぐ。d=9 で h≒9.98 となり、板 7.2 は
     *    画面高の約72%に収まる。
     */
    /*
     * 霧は z -22〜-132 に配置されている(fogPlacement)。
     * 車両をその中に置くと、背後の霧が板の矩形を透かして
     * 明るい箱として浮かび上がる。霧より手前に置く。
     * 板が 7.2 四方なので、カメラ z=6 / fov=58 で全景が入る距離を取る。
     */
    g.position.z = THREE.MathUtils.lerp(-2.6, -5.2, s.dolly);
    g.position.y = THREE.MathUtils.lerp(0, 0.25, s.dolly);
    /*
     * 右からスライドインして定位置へ。
     * Heroは左半分がテキストなので、車両は右に寄せて構図を分ける。
     * slideIn=0 で画面外(右)、1 で定位置。
     */
    g.position.x = THREE.MathUtils.lerp(9, 2.6, s.slideIn);
    const scale = THREE.MathUtils.lerp(0.82, 0.72, s.dolly);
    g.scale.setScalar(scale);

    // ポインタに対する微細な視差。「止まっているが生きている」状態を作る
    g.rotation.y += (s.pointerX * 0.05 - g.rotation.y) * 0.06;
    g.rotation.x += (-s.pointerY * 0.03 - g.rotation.x) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh ref={backMesh} material={layers.b.material}>
        <planeGeometry args={[7.2, 7.2]} />
      </mesh>
      <mesh ref={frontMesh} material={layers.a.material} position={[0, 0, 0.01]}>
        <planeGeometry args={[7.2, 7.2]} />
      </mesh>
    </group>
  );
}
