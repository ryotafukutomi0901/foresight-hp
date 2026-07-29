"use client";

import { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import { NARRATIVE_SHOTS } from "@/lib/content";
import { corridor as C } from "@/lib/tokens";
import {
  isCorridorArmed,
  isCorridorArmedOnServer,
  subscribeCorridorAssets,
} from "@/lib/corridorAssets";
import {
  createDitherMaterial,
  pixelSizeForDistance,
  type DitherUniforms,
} from "./ditherMaterial";

/*
 * NARRATIVE CORRIDOR — 10枚を3D空間に並べ、カメラがその間を通過する。
 *
 * なぜDOMの<img>ではなく3Dに置くのか:
 *   DOMに置くと、どれだけ動かしても「平面の上を滑るカード」にしかならない。
 *   3Dに置けば、霧・被写界深度・グレインが画像そのものに掛かり、
 *   手前の1枚にピントが合って奥がボケる。これは平面合成では作れない。
 *   結果として「画像を見ている」ではなく「その場所に居る」感覚になる。
 *
 * 合成方法:
 *   素材は白線画/黒背景。DOM側では mix-blend-mode:lighten で黒を透かしていた。
 *   3Dでは AdditiveBlending が同じ役割を果たす(黒=加算0=透明)。
 *   アルファ抜きの前処理は不要。
 *
 * アクセシビリティ:
 *   3Dのcanvasは支援技術から読めないため、
 *   同じ内容を <figure>+<figcaption> としてDOM側(Narrative.tsx)に
 *   視覚的非表示で必ず残している。
 */

/*
 * 配置と可視域の設計。数値は docs/camera-bible.md が正本で、
 * lib/tokens.ts 経由で受け取る。ここに直書きしないこと（Token Freeze）。
 *
 * NEAR_OUT より手前には絶対に来させない。透視投影の式から逆算した値で、
 * ここで頭打ちにすると拡大率が上限1.6倍にちょうど収まる（Bibleに検算あり）。
 *
 * LEAD_IN は、進行度0(=Hero〜Vision)の時点で1枚目が FAR_OUT よりさらに
 * 奥に居るように取る。これにより Hero/Vision では車が一切現れない。
 */
const GAP = C.gap;
const LEAD_IN = C.leadIn;
const NEAR_OUT = C.nearOut;
const NEAR_IN = C.nearIn;
const FAR_IN = C.farIn;
const FAR_OUT = C.farOut;
const TRAVEL = C.travel;

type Slot = {
  src: string;
  z: number;
  x: number;
  y: number;
  scale: number;
  tilt: number;
  spin: number;
};

function Shot({
  slot,
  texture,
}: {
  slot: Slot;
  texture: THREE.Texture;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  /*
   * ディザマテリアルはテクスチャごとに1つ作る。
   * useMemo で保持しないと毎レンダーでシェーダが再コンパイルされ、
   * スクロール中に目に見えるコマ落ちが出る。
   */
  const { material } = useMemo(() => createDitherMaterial(texture), [texture]);

  /*
   * 板の縦横比はテクスチャの実寸から取る。
   * 素材を差し替えると寸法が変わるため(旧267×296 / 新2048×2048)、
   * ここを固定値にすると差し替えのたびに画が歪む。
   */
  const aspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    return img?.width && img?.height ? img.width / img.height : 267 / 296;
  }, [texture]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    /*
     * uniforms は useMemo の戻り値を直接書き換えず、必ず ref(mesh) から辿る。
     * フック由来の値を書き換えると React Compiler の immutability 規則に触れ、
     * また再レンダー時に参照が入れ替わって取りこぼす可能性がある。
     */
    const u = (m.material as THREE.ShaderMaterial).uniforms as DitherUniforms;

    // カメラは0にいて、回廊側が手前へ流れてくる
    const travelled = viewProgress.corridor * TRAVEL;
    const z = slot.z + travelled;
    m.position.z = z;

    // 常に微かに漂わせる。完全に静止した板があると空間が嘘になる。
    m.position.x = slot.x + Math.sin(t * 0.18 + slot.spin) * 0.5;
    m.position.y = slot.y + Math.cos(t * 0.14 + slot.spin) * 0.35;
    m.rotation.z = slot.tilt + Math.sin(t * 0.1 + slot.spin) * 0.015;
    // 常にカメラの方を向かせる(板が斜めから見えると図版に見えてしまう)
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, -m.position.x * 0.012, 0.1);

    /*
     * 手前を通り過ぎたら消し、遠すぎても消す。
     * 素材の実寸が267pxしかないため、NEAR_OUTより近づけると線が潰れて
     * 画質が破綻する。そこに達する前にフェードし切らせ、寄りすぎさせない。
     *
     * smoothstep(x, min, max) は x<=min で0、x>=max で1 を返す。
     *   nearVis … 手前(NEAR_OUT)から近づきすぎ(NEAR_IN)にかけて 1→0
     *   farVis  … 奥(FAR_OUT)から見え始め(FAR_IN)にかけて 0→1
     */
    {
      const farVis = THREE.MathUtils.smoothstep(z, FAR_OUT, FAR_IN);
      const nearVis = 1 - THREE.MathUtils.smoothstep(z, NEAR_OUT, NEAR_IN);

      /*
       * 中景でのみピークまで持ち上げる重み。
       * 全ての板が等しく濃いと「奥行きのある空間」ではなく
       * 「板が並んでいる」に見えるため、遠景は opacityFar で頭打ちにする。
       */
      const mid =
        THREE.MathUtils.smoothstep(z, FAR_IN - 20, FAR_IN + 12) *
        (1 - THREE.MathUtils.smoothstep(z, NEAR_OUT - 18, NEAR_OUT + 4));
      const level = C.opacityFar + (C.opacityPeak - C.opacityFar) * mid;

      // 近景は線形に落とすと消える瞬間が目立つため、先に薄くしておく
      u.uOpacity.value =
        farVis * Math.pow(nearVis, C.nearFalloffPower) * level;

      /*
       * 粒の大きさをカメラ距離に連動させる。
       * 寄るほど粗くなるため、素材の解像度不足が
       * 「意図した粒状感」として読める。
       */
      u.uPixelSize.value = pixelSizeForDistance(
        state.camera.position.z - z,
      );
    }
    m.visible = z < NEAR_IN + 2 && z > FAR_OUT - 5;
  });

  return (
    <mesh
      ref={mesh}
      position={[slot.x, slot.y, slot.z]}
      rotation={[0, 0, slot.tilt]}
      material={material}
    >
      <planeGeometry args={[slot.scale, slot.scale / aspect]} />
    </mesh>
  );
}

/**
 * 先読みが始まるまで何も描かない。
 *
 * useTexture はサスペンドするため、armされるまでこのコンポーネントを
 * 「テクスチャに触れない状態」で返す必要がある。中身を分けているのは
 * フックの呼び出し順を変えずに取得開始を遅らせるため。
 */
export default function NarrativeCorridor() {
  const armed = useSyncExternalStore(
    subscribeCorridorAssets,
    isCorridorArmed,
    isCorridorArmedOnServer,
  );
  if (!armed) return null;
  return <CorridorBody />;
}

function CorridorBody() {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);

  /*
   * ハードゲート。What We Can Do に入るまで回廊を一切描画しない。
   * 距離設計だけでは板のサイズ変更で破れるため、独立したゲートで守る。
   */
  useFrame(() => {
    const g = group.current;
    if (g) g.visible = viewProgress.corridor >= C.gateProgress;
  });
  const sources = useMemo<string[]>(
    () => NARRATIVE_SHOTS.map((shot) => shot.src),
    [],
  );
  const textures = useTexture(sources);

  const slots = useMemo<Slot[]>(() => {
    const rnd = (n: number) => {
      const v = Math.sin(n * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    return sources.map((src, i) => {
      // 左右交互に振り、まっすぐ並べない。通過するたびに視線が振られる。
      const side = i % 2 === 0 ? -1 : 1;
      return {
        src,
        z: -(LEAD_IN + i * GAP),
        x: side * (3.6 + rnd(i) * 1.6),
        y: (rnd(i + 50) - 0.5) * 3.6,
        scale: C.planeScaleBase + rnd(i + 90) * C.planeScaleVariance,
        tilt: (rnd(i + 130) - 0.5) * 0.1,
        spin: rnd(i + 170) * 6.28,
      };
    });
  }, [sources]);

  // 画面が狭いほど視野に入る幅が減るため、左右の振り幅と大きさだけを詰める。
  // 枚数も演出も削らず、寸法だけを合わせる。
  const fit = Math.min(1, size.width / 1280);
  const spread = 0.45 + fit * 0.55;

  return (
    <group ref={group} visible={false}>
      {slots.map((slot, i) => (
        <Shot
          key={slot.src}
          slot={{
            ...slot,
            x: slot.x * spread,
            scale: slot.scale * (0.62 + fit * 0.38),
          }}
          texture={textures[i]}
        />
      ))}
    </group>
  );
}
