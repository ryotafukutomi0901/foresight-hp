"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import { NARRATIVE_SHOTS } from "@/lib/content";

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
 * 配置と可視域の設計。
 *
 * NEAR_OUT より手前には絶対に来させない。
 * 素材の実寸は267×296pxしかなく、寄りすぎると線が潰れて画質が破綻するため、
 * 「画面の約半分に収まる距離」で頭打ちにして、そこから先はフェードで消す。
 *
 * LEAD_IN は、進行度0(=Hero〜第2セクション)の時点で1枚目が
 * FAR_OUT よりさらに奥に居るように取る。これで序盤は車が一切現れず、
 * 空気だけの画面になる。
 */
const GAP = 16; // 1枚あたりの奥行き間隔
const LEAD_IN = 128; // 進行度0での1枚目の距離。FAR_OUTより奥に置き、Hero/Visionでは何も見えないようにする
const NEAR_OUT = -48; // これより手前には来させない(素材267pxの画質が保てる最短距離)
const NEAR_IN = -30; // 完全に消えきる位置(NEAR_OUTより少し奥。ここでフェードし切る)
const FAR_IN = -95; // ここまで来たら完全に見える
const FAR_OUT = -125; // これより奥は見えない
/** 最後の1枚が可視域の中央あたりまで来るのに必要な移動量。 */
const TRAVEL = 210;

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
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;

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
    if (mat.current) {
      const nearVis = 1 - THREE.MathUtils.smoothstep(z, NEAR_OUT, NEAR_IN);
      const farVis = THREE.MathUtils.smoothstep(z, FAR_OUT, FAR_IN);
      mat.current.opacity = nearVis * farVis;
    }
    m.visible = z < NEAR_IN + 2 && z > FAR_OUT - 5;
  });

  return (
    <mesh ref={mesh} position={[slot.x, slot.y, slot.z]} rotation={[0, 0, slot.tilt]}>
      <planeGeometry args={[slot.scale, slot.scale * (296 / 267)]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function NarrativeCorridor() {
  const { size } = useThree();
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
        scale: 9.5 + rnd(i + 90) * 1.8,
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
    <group>
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
