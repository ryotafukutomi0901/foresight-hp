"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { PIVOT, type VehicleHandle, type VehicleObjectName } from "@/lib/vehicleRig";
import { useVehicleMaterials } from "./VehicleMaterials";
import Wheel from "./Wheel";
import RearGate from "./RearGate";
import Headlight from "./Headlight";

/*
 * SUVのローポリ代替モデル。
 *
 * ⚠️ これは最終形ではない。Blenderで制作するGLB(docs/vehicle-rig-spec.md)が
 *    届くまでの間、**シーン構成とスクロール連動を検証するため**の暫定実装。
 *
 * 重要なのは見た目ではなく、以下がGLB版と完全に一致していること:
 *   - オブジェクト名(VEHICLE_OBJECT_NAMES)
 *   - Pivot位置(lib/vehicleRig.ts の PIVOT)
 *   - 公開するref(VehicleHandle)の形
 *
 * これが揃っていれば、GLB到着時に Vehicle.tsx の分岐を切り替えるだけで
 * 差し替えが完了し、呼び出し側(VehicleScene / 各セクションのScrollTrigger)は
 * 一切変更しなくて済む(禁止事項「GLB差し替え時にコード変更が必要になる構造を作らない」)。
 *
 * デザインは public/images/foresight/vehicle-parts/ の線画に準拠した
 * 角ばったSUV(Defender系)のプロポーションを、箱の組み合わせで近似する。
 */

/* 車体寸法(m)。実車のSUVに近い比率にする */
const BODY = {
  length: 4.8,
  width: 1.9,
  /** キャビン下端までの高さ(ボンネット面) */
  hoodY: 0.95,
  /** ルーフの高さ */
  roofY: 1.82,
  /** 地上高(シャシー下端) */
  groundY: 0.42,
} as const;

type Props = {
  handleRef?: Ref<VehicleHandle>;
};

export default function VehiclePlaceholder({ handleRef }: Props) {
  const materials = useVehicleMaterials();

  /*
   * 各パーツへの参照。名前は VEHICLE_OBJECT_NAMES と対応させる。
   * Vehicle.tsx の useFrame がこの参照を辿って rotation/position を書く。
   */
  const body = useRef<THREE.Group>(null);
  const rearGate = useRef<THREE.Group>(null);
  const wheelFL = useRef<THREE.Group>(null);
  const wheelFR = useRef<THREE.Group>(null);
  const wheelRL = useRef<THREE.Group>(null);
  const wheelRR = useRef<THREE.Group>(null);
  const headlightL = useRef<THREE.Mesh>(null);
  const headlightR = useRef<THREE.Mesh>(null);
  const interior = useRef<THREE.Mesh>(null);

  /*
   * 親(Vehicle.tsx)へ公開するハンドル。
   * GLB版も同じ形を返すため、親は実装を意識しない。
   */
  useImperativeHandle(
    handleRef,
    () => ({
      parts: {
        Body: body.current,
        RearGate: rearGate.current,
        Wheel_FL: wheelFL.current,
        Wheel_FR: wheelFR.current,
        Wheel_RL: wheelRL.current,
        Wheel_RR: wheelRR.current,
        Headlight_L: headlightL.current,
        Headlight_R: headlightR.current,
        Interior: interior.current,
        /*
         * プレースホルダーでは独立オブジェクトにしていないパーツ。
         * GLB版では実体を持つ。null でも親のuseFrameは
         * 存在チェックしてから触るため安全。
         */
        FrontBumper: null,
        RearBumper: null,
        Grill: null,
        Glass: null,
        Mirror_L: null,
        Mirror_R: null,
        Door_FL: null,
        Door_FR: null,
        Door_RL: null,
        Door_RR: null,
        RoofRail: null,
      } as Record<VehicleObjectName, THREE.Object3D | null>,
    }),
    [],
  );

  const halfW = BODY.width / 2;
  const halfL = BODY.length / 2;

  return (
    <group>
      {/*
        Body — 車体本体。ホイールは**この子にしない**。
        車体が沈む(サスペンション)ときにホイールまで沈むと
        接地しなくなるため、ルート直下に置く(仕様書 §2)。
      */}
      <group ref={body}>
        {/* シャシー。車体下段。全長にわたる箱 */}
        <mesh
          position={[0, (BODY.groundY + BODY.hoodY) / 2, 0]}
          material={materials.body}
        >
          <boxGeometry
            args={[BODY.width, BODY.hoodY - BODY.groundY, BODY.length]}
          />
        </mesh>

        {/*
          キャビン。**後ろ寄り**に置く。
          これがボンネット(前)とキャビン(後)の差になり、
          前後の判別がつくシルエットになる。
        */}
        <mesh
          position={[0, (BODY.hoodY + BODY.roofY) / 2, 0.78]}
          material={materials.body}
        >
          <boxGeometry
            args={[BODY.width * 0.96, BODY.roofY - BODY.hoodY, BODY.length * 0.62]}
          />
        </mesh>

        {/* フロントガラス。キャビンの前面に傾けて立てる */}
        <mesh
          position={[0, (BODY.hoodY + BODY.roofY) / 2 + 0.02, -0.06]}
          rotation={[-0.34, 0, 0]}
          material={materials.glass}
        >
          <boxGeometry args={[BODY.width * 0.9, 0.82, 0.05]} />
        </mesh>

        {/* サイドガラス(左右)。キャビンの側面に合わせる */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * (halfW * 0.94), BODY.roofY - 0.3, 0.66]}
            material={materials.glass}
          >
            <boxGeometry args={[0.04, 0.5, BODY.length * 0.46]} />
          </mesh>
        ))}

        {/* フロントバンパー */}
        <mesh
          position={[0, BODY.groundY + 0.22, -halfL - 0.04]}
          material={materials.body}
        >
          <boxGeometry args={[BODY.width * 1.02, 0.34, 0.16]} />
        </mesh>

        {/* リアバンパー */}
        <mesh
          position={[0, BODY.groundY + 0.22, halfL + 0.04]}
          material={materials.body}
        >
          <boxGeometry args={[BODY.width * 1.02, 0.34, 0.16]} />
        </mesh>

        {/*
          グリル。フロント中央に横長の面を置く。
          ヘッドライトと同じく車体前端より僅かに前へ出し、
          正面から見たときに「顔」が読めるようにする。
        */}
        <mesh
          position={[0, BODY.hoodY - 0.16, -halfL - 0.05]}
          material={materials.chrome}
        >
          <boxGeometry args={[BODY.width * 0.66, 0.22, 0.06]} />
        </mesh>

        {/* ルーフレール(左右)。キャビン上に載せる */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * (halfW * 0.78), BODY.roofY + 0.04, 0.62]}
            material={materials.chrome}
          >
            <boxGeometry args={[0.07, 0.07, BODY.length * 0.48]} />
          </mesh>
        ))}

        {/* ドアミラー(左右)。フロントガラスの脇に出す */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * (halfW + 0.12), BODY.hoodY + 0.4, -0.02]}
            material={materials.chrome}
          >
            <boxGeometry args={[0.18, 0.11, 0.09]} />
          </mesh>
        ))}

        {/*
          Interior — 荷室。リアハッチが開いたとき内部から光が漏れる。
          emissiveIntensity は viewProgress.cargoLightIntensity で制御する。
        */}
        <mesh
          ref={interior}
          position={[0, BODY.hoodY + 0.28, halfL - 0.5]}
          material={materials.cargoLight}
        >
          <boxGeometry args={[BODY.width * 0.7, 0.5, 0.7]} />
        </mesh>

        {/* ヘッドライト。左右独立 */}
        <Headlight
          ref={headlightL}
          position={[PIVOT.headlightL.x, PIVOT.headlightL.y, PIVOT.headlightL.z]}
          materials={materials}
        />
        <Headlight
          ref={headlightR}
          position={[PIVOT.headlightR.x, PIVOT.headlightR.y, PIVOT.headlightR.z]}
          materials={materials}
        />

        {/* リアハッチ。Pivotはヒンジ位置 */}
        <RearGate
          ref={rearGate}
          position={[
            PIVOT.rearGateHinge.x,
            PIVOT.rearGateHinge.y,
            PIVOT.rearGateHinge.z,
          ]}
          materials={materials}
        />
      </group>

      {/* ホイール4本。Bodyの子にしない(上記の理由) */}
      <Wheel
        ref={wheelFL}
        position={[PIVOT.wheelFL.x, PIVOT.wheelFL.y, PIVOT.wheelFL.z]}
        materials={materials}
      />
      <Wheel
        ref={wheelFR}
        position={[PIVOT.wheelFR.x, PIVOT.wheelFR.y, PIVOT.wheelFR.z]}
        materials={materials}
      />
      <Wheel
        ref={wheelRL}
        position={[PIVOT.wheelRL.x, PIVOT.wheelRL.y, PIVOT.wheelRL.z]}
        materials={materials}
      />
      <Wheel
        ref={wheelRR}
        position={[PIVOT.wheelRR.x, PIVOT.wheelRR.y, PIVOT.wheelRR.z]}
        materials={materials}
      />
    </group>
  );
}
