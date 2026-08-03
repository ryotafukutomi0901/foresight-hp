"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";

/*
 * FIND区間の、車両の前方へ分岐して伸びる光のライン。
 *
 * 「オークション代行 = 最適な行き先を探す」を、道が枝分かれして
 * いく絵にする。1本だけだと「決まった道を走る」になってしまうので、
 * 複数方向へ同時に伸ばして「まだ選べる」状態を見せる。
 *
 * viewProgress.routeLineProgress(0→1)だけを読む。時間では伸びない。
 */

/** 何本に分岐するか。多すぎると散らかって「迷い」に見える */
const LINE_COUNT = 5;

/** 車体前方(-Z)へ伸びる最大距離(m) */
const REACH = 26;

/** 左右への最大振れ幅(m)。奥へ行くほど広がる */
const SPREAD = 9;

export default function RouteLines() {
  const group = useRef<THREE.Group>(null);

  /*
   * 各ラインは「前方へ伸びる細い板」。Lineプリミティブを使わないのは、
   * WebGLのline widthがほぼ全環境で1pxに固定され、太さを制御できないため。
   */
  const lines = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    return Array.from({ length: LINE_COUNT }, (_, i) => {
      /* -1〜+1 に均等配置。中央の1本は真っ直ぐ前へ伸びる */
      const t = (i / (LINE_COUNT - 1)) * 2 - 1;
      return {
        /** 終端の横位置。奥ほど開く扇形になる */
        endX: t * SPREAD,
        /** 中央ほど明るく、外側ほど淡い(可能性の確度の差) */
        alpha: 1 - Math.abs(t) * 0.55,
        /** 伸び始めるタイミングをずらす。同時だと機械的に見える */
        delay: Math.abs(t) * 0.22,
        material: mat.clone(),
      };
    });
  }, []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    const p = viewProgress.routeLineProgress;

    if (p <= 0) {
      g.visible = false;
      return;
    }
    g.visible = true;

    g.children.forEach((child, i) => {
      const line = lines[i];
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;

      /* delay分を差し引いた自分の進行度 */
      const own = THREE.MathUtils.clamp(
        (p - line.delay) / (1 - line.delay),
        0,
        1,
      );

      /* 根元から先端へ伸びる。scaleYを使い、Pivotは根元側にある */
      mesh.scale.y = own;
      mat.opacity = own * line.alpha * 0.5;
    });
  });

  return (
    <group ref={group} visible={false}>
      {lines.map((line, i) => {
        /* 根元(車両前端)から終端へ向かうベクトル */
        const len = Math.hypot(line.endX, REACH);
        const angle = Math.atan2(line.endX, REACH);

        return (
          <mesh
            key={i}
            material={line.material}
            /* 根元を車両の前端やや下(路面付近)に置く */
            position={[0, 0.12, -2.5]}
            /*
             * -Z方向へ伸ばしたいので、まずX軸に-90度回してplaneを寝かせ、
             * 次にY軸で扇状に振る。
             */
            rotation={[-Math.PI / 2, 0, angle]}
          >
            {/*
             * planeGeometry の原点は中心なので、translate で
             * 「根元が原点、先端が +Y」になるようずらす。
             * これで scale.y が「伸びる」動きになる。
             */}
            <planeGeometry args={[0.06, len]} onUpdate={(geo) => geo.translate(0, len / 2, 0)} />
          </mesh>
        );
      })}
    </group>
  );
}
