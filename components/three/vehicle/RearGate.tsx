"use client";

import { forwardRef } from "react";
import * as THREE from "three";
import type { VehicleMaterialSet } from "./VehicleMaterials";

/*
 * リアハッチ。Philosophyで開き、Sellで閉じる。
 *
 * Pivotは**ヒンジ位置**(車体後端の上端・幅方向中央)に置く。
 * group自体の原点がヒンジなので、rotation.x を負の値にすると
 * 下端が弧を描いて跳ね上がる = 実車と同じ開き方になる。
 *
 * ジオメトリはPivotより下(-Y)に配置する。ここを間違えると
 * 「ヒンジを中心に板が回る」だけの不自然な動きになる。
 *
 * ⚠️ 回転はここでは行わない。開閉角は viewProgress.rearGateOpen から
 *    Vehicle.tsx 側の useFrame が書き込む。
 */

type Props = {
  /** ヒンジのワールド位置(= このgroupの原点) */
  position: readonly [number, number, number];
  materials: VehicleMaterialSet;
  width?: number;
  height?: number;
  thickness?: number;
};

const RearGate = forwardRef<THREE.Group, Props>(function RearGate(
  { position, materials, width = 1.72, height = 1.05, thickness = 0.08 },
  ref,
) {
  return (
    <group ref={ref} position={position as unknown as THREE.Vector3Tuple}>
      {/*
        ヒンジ(原点)から下へ伸ばす。中心を -height/2 に置くことで
        板の上端がヒンジに一致する。
      */}
      <mesh position={[0, -height / 2, 0]} material={materials.body}>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      {/* リアガラス。ハッチ上部にはめ込む */}
      <mesh
        position={[0, -height * 0.3, thickness * 0.6]}
        material={materials.glass}
      >
        <boxGeometry args={[width * 0.84, height * 0.42, thickness * 0.3]} />
      </mesh>
    </group>
  );
});

export default RearGate;
