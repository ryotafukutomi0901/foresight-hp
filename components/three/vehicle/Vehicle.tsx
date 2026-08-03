"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import { vehicle as V } from "@/lib/tokens";
import type { VehicleHandle } from "@/lib/vehicleRig";
import VehiclePlaceholder from "./VehiclePlaceholder";

/*
 * 車両のルート。
 *
 * ═══════════════════════════════════════════════════════════════
 *  このコンポーネントが**唯一の分岐点**。
 *
 *  GLB(docs/vehicle-rig-spec.md で発注中)が届いたら、下の
 *  USE_GLB を true にして VehicleGLTF を描くだけで差し替わる。
 *  呼び出し側(VehicleScene / 各セクションのScrollTrigger)は
 *  一切変更しない。
 *
 *  両実装は同じ VehicleHandle(= 各パーツへのObject3D参照)を
 *  返す契約なので、下の useFrame もそのまま動く。
 * ═══════════════════════════════════════════════════════════════
 *
 * ここでの useFrame は「viewProgress の値を Object3D に写すだけ」。
 * 時間(delta/elapsedTime)を使った自走アニメーションは**書かない**。
 * スクロールが止まれば車も止まる、というCEO指示の実装上の要。
 */

const USE_GLB = false;

export default function Vehicle() {
  const handle = useRef<VehicleHandle>(null);
  const root = useRef<THREE.Group>(null);

  /*
   * 開発時のみ、実測・デバッグのため状態を露出する。
   * レンダー中に書くとReact Compilerの不変条件に反するため useEffect で。
   */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __vp?: typeof viewProgress }).__vp = viewProgress;
  }, []);

  useFrame(() => {
    const parts = handle.current?.parts;
    const g = root.current;
    if (!parts || !g) return;

    /* ── 車体の位置・向き ──
       viewProgress の値をそのまま写す。lerpを掛けないのは、
       GSAPのscrubが既に滑らかな値を供給しているため。
       ここで更に補間すると、逆スクロール時に「戻りきらない」ズレが出る。 */
    g.position.set(viewProgress.bodyX, viewProgress.bodyY, viewProgress.bodyZ);
    g.rotation.y = viewProgress.bodyRotationY;

    /* ── サスペンションの沈み込み ──
       Bodyだけを下げる。ホイールはBodyの子ではないので沈まず、
       接地したまま車体が沈む = 実車のサスの動きになる。 */
    const bodyObj = parts.Body;
    if (bodyObj) {
      bodyObj.position.y = -viewProgress.suspensionDip * V.hero.dipDepth;
    }

    /* ── リアハッチ ──
       rotation.x のみ。0(閉) → -1.2rad(全開)。
       Pivotがヒンジ位置にあるので、これだけで正しく開く。 */
    const gate = parts.RearGate;
    if (gate) {
      gate.rotation.x = -viewProgress.rearGateOpen * 1.2;
    }

    /* ── ホイール4本 ──
       角度そのものを viewProgress から受け取る。
       ここで delta を積分しないことが重要(積分すると
       スクロールを止めても回り続けてしまう)。 */
    const angle = viewProgress.wheelAngle;
    for (const name of ["Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR"] as const) {
      const w = parts[name];
      if (w) w.rotation.x = angle;
    }

    /* ── ヘッドライト ──
       emissiveIntensity を書き換える。Bloomが閾値を超えた分を拾う。 */
    const hi = viewProgress.headlightIntensity * V.light.headlightMax;
    for (const name of ["Headlight_L", "Headlight_R"] as const) {
      const lamp = parts[name] as THREE.Mesh | null;
      const mat = lamp?.material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.emissiveIntensity = hi;
    }

    /* ── 荷室の光 ──
       リアハッチが開いたとき内部から漏れる。 */
    const cargo = parts.Interior as THREE.Mesh | null;
    const cargoMat = cargo?.material as THREE.MeshStandardMaterial | undefined;
    if (cargoMat) {
      cargoMat.emissiveIntensity =
        viewProgress.cargoLightIntensity * V.light.cargoMax;
    }
  });

  return (
    <group ref={root}>
      {USE_GLB ? (
        /*
         * GLB到着後にここを有効化する。
         * VehicleGLTF は VehiclePlaceholder と同じ handleRef を受け取り、
         * 同じ VehicleHandle を返す契約。
         */
        null
      ) : (
        <VehiclePlaceholder handleRef={handle} />
      )}
    </group>
  );
}
