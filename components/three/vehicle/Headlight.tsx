"use client";

import { forwardRef } from "react";
import * as THREE from "three";
import type { VehicleMaterialSet } from "./VehicleMaterials";

/*
 * ヘッドライト（片側）。左右で独立したオブジェクトにする。
 *
 * 発光は emissiveIntensity で表現し、Atmosphereの Bloom が
 * 閾値(luminanceThreshold 0.62)を超えた明部を拾って滲ませる。
 *
 * ⚠️ 明滅はしない。強度は viewProgress.headlightIntensity から
 *    Vehicle.tsx 側の useFrame が書き込む。ここで独自に
 *    時間ベースの点滅を作るとCEO指示に反する。
 *
 * ⚠️ THREE.SpotLight のような実光源は置かない。
 *    lighting-bible の方針(光源オブジェクトを増やさない)に従い、
 *    「光っているように見える面」+ Bloom で表現する。
 *    実光源はDraw Callとシャドウマップのコストが大きい。
 */

type Props = {
  position: readonly [number, number, number];
  materials: VehicleMaterialSet;
  radius?: number;
};

const Headlight = forwardRef<THREE.Mesh, Props>(function Headlight(
  { position, materials, radius = 0.17 },
  ref,
) {
  return (
    <mesh
      ref={ref}
      position={position as unknown as THREE.Vector3Tuple}
      /*
       * 円盤状のレンズ。シリンダーは既定でY軸が高さ方向なので、
       * X軸まわりに90度倒して円面を前方(-Z)へ向ける。
       * 厚みを持たせることで、斜めから見たときも光の面が見える。
       */
      rotation={[Math.PI / 2, 0, 0]}
      material={materials.headlight}
    >
      <cylinderGeometry args={[radius, radius, 0.06, 20]} />
    </mesh>
  );
});

export default Headlight;
