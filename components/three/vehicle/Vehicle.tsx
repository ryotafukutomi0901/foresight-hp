"use client";

import { Suspense, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import { vehicle as V } from "@/lib/tokens";
import type { VehicleHandle } from "@/lib/vehicleRig";
import VehiclePlaceholder from "./VehiclePlaceholder";
import VehicleGLTF from "./VehicleGLTF";
import ScanLine from "./ScanLine";
import RouteLines from "./RouteLines";
import RearGlow from "./RearGlow";

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

const USE_GLB = true;

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

    /* ── 車体の姿勢 ──
       ロール(旋回で外へ傾く)とピッチ(制動で前へ沈む)。
       ルートに掛けるので、ホイールも含めて車全体が傾く。
       実車は車体だけが傾いてタイヤは接地したままだが、
       この規模の傾き(数度)ではその差は読み取れず、
       むしろ全体が傾いたほうが塊としての重さが出る。 */
    g.rotation.z = viewProgress.bodyRoll;
    g.rotation.x = viewProgress.bodyPitch;

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
      if (!w) continue;

      /*
       * 回転順を YXZ にする。
       *
       * 既定の XYZ だと転舵(Y)より先に転がり(X)が適用され、
       * ハンドルを切ったときにタイヤが傾いて見える。
       * YXZ なら「まず向きを変え、その向きのまま転がる」順になり、
       * 実車と同じ挙動になる。
       */
      w.rotation.order = "YXZ";
      w.rotation.x = angle;

      /* 転舵するのは前輪だけ */
      const isFront = name === "Wheel_FL" || name === "Wheel_FR";
      w.rotation.y = isFront ? viewProgress.steerAngle : 0;
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
         * GLBの読み込み中は何も描かない(fallback={null})。
         * ローディング画面は別に存在するので、ここでスピナーを
         * 出すと二重になる。
         */
        <Suspense fallback={null}>
          <VehicleGLTF handleRef={handle} />
        </Suspense>
      ) : (
        <VehiclePlaceholder handleRef={handle} />
      )}

      {/*
        車両に付随する光の演出。GLBに差し替えても、これらは
        車両の子として同じように動く(モデル実装に依存しない)。
      */}
      <ScanLine />
      <RouteLines />
      <RearGlow />
    </group>
  );
}
