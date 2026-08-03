"use client";

import { forwardRef } from "react";
import * as THREE from "three";
import type { VehicleMaterialSet } from "./VehicleMaterials";

/*
 * ホイール1本。FL/FR/RL/RR で共通。
 *
 * Pivotは回転中心そのもの(lib/vehicleRig.ts の PIVOT.wheel*)に置く。
 * 呼び出し側は group.rotation.x に角度を代入するだけでよく、
 * 位置補正は一切行わない(仕様書 §3 の必須要件)。
 *
 * ⚠️ 回転はここでは行わない。角度は viewProgress.wheelAngle から
 *    Vehicle.tsx 側の useFrame が一括で書き込む。
 *    このコンポーネント自身が useFrame で回すと「時間経過で
 *    勝手に回るアニメーション」になり、CEO指示に反する。
 */

type Props = {
  position: readonly [number, number, number];
  materials: VehicleMaterialSet;
  /** タイヤ半径(m)。lib/vehicleRig.ts の PIVOT.wheel*.y と一致させる */
  radius?: number;
  width?: number;
};

const Wheel = forwardRef<THREE.Group, Props>(function Wheel(
  { position, materials, radius = 0.35, width = 0.24 },
  ref,
) {
  return (
    <group ref={ref} position={position as unknown as THREE.Vector3Tuple}>
      {/*
        シリンダーは既定でY軸が高さ方向。車軸はX方向なので
        Z軸まわりに90度倒して寝かせる。
        この回転はジオメトリの向きを整えるためのもので、
        アニメーション用の rotation.x とは軸が異なるため干渉しない。
      */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tire}>
        <cylinderGeometry args={[radius, radius, width, 24]} />
      </mesh>

      {/* ホイールリム。タイヤより一回り小さく、外側に僅かに出す */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={materials.chrome}
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[radius * 0.62, radius * 0.62, width * 1.04, 16]} />
      </mesh>
    </group>
  );
});

export default Wheel;
