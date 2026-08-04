"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import {
  camera as CAM,
  lerp as LERP,
  bloom as BLOOM,
  vignette as VIG,
  edges as EDGES,
} from "@/lib/tokens";
import Vehicle from "./vehicle/Vehicle";
import Edges from "./effects/Edges";
import Stage from "./vehicle/Stage";

/*
 * VEHICLE SCENE — Hero〜Contactを貫く単一のCanvas。
 *
 * ═══════════════════════════════════════════════════════════════
 *  禁止事項(CEO指示)への対応:
 *
 *  - セクションごとにCanvasを作らない
 *    → このCanvasは layout 直下に1つだけ常設し、全区間で使い回す。
 *      Atmosphere と合わせて総数2(性能予算の上限)。
 *  - 車両をセクションごとに作り直さない
 *    → <Vehicle /> はここに1つだけ。mount/unmountしない。
 * ═══════════════════════════════════════════════════════════════
 *
 * 描画の停止: Atmosphereと同じく、画面外では frameloop を切る。
 * ただし車両は「ページのほぼ全域」で見えるため、実質常時描画になる。
 * 代わりに Atmosphere 側が止まる区間があり、同時描画は1に保たれる。
 */

/*
 * カメラリグ。
 *
 * viewProgress のカメラ座標へ lerp で追従する。
 * GSAP側が「目標位置」を書き、ここが「滑らかに近づく」役割を持つ。
 * これが CEO指示「カメラ移動は必ず補間する」の実装。
 *
 * ⚠️ 車体(Vehicle)側は lerp しない。あちらはGSAPのscrub値をそのまま
 *    写す。カメラだけ補間するのは、区間の切り替わりで目標が
 *    不連続に飛ぶ可能性があるため(車体の値は連続なので不要)。
 */
function CameraRig() {
  const lookAt = useRef(new THREE.Vector3(0, 0.9, 0));

  /*
   * カメラは useThree() の戻り値からではなく、useFrame の state から取る。
   * hookの戻り値を書き換えるとReact Compilerの不変条件に反するため
   * (既存 Atmosphere.tsx が「カメラを動かさずRigを動かす」設計なのも同じ理由)。
   * ここでは実際にカメラを動かす必要があるので、state経由で触る。
   */
  useFrame((state) => {
    const cam = state.camera;
    const k = LERP.camera;

    cam.position.x += (viewProgress.cameraX - cam.position.x) * k;
    cam.position.y += (viewProgress.cameraY - cam.position.y) * k;
    cam.position.z += (viewProgress.cameraZ - cam.position.z) * k;

    lookAt.current.x += (viewProgress.lookAtX - lookAt.current.x) * k;
    lookAt.current.y += (viewProgress.lookAtY - lookAt.current.y) * k;
    lookAt.current.z += (viewProgress.lookAtZ - lookAt.current.z) * k;

    cam.lookAt(lookAt.current);
  });

  return null;
}

/*
 * ライティング。
 *
 * lighting-bible の方針(光源オブジェクトを増やさない)に従い、
 * 実光源は最小限にする。ヘッドライトの発光は Emissive + Bloom で
 * 表現しており、ここでは「車体の面を読ませる」ための環境光だけを置く。
 *
 * Hero冒頭は「完全なシルエット」から始まるため、環境光は
 * viewProgress.headlightIntensity に連動させて僅かに持ち上げる。
 */
function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    /*
     * ヘッドライトが点くほど、周囲もわずかに明るくなる。
     * 車が自分の光で自分を照らしているように見せる。
     */
    const lit = viewProgress.headlightIntensity;
    if (ambient.current) ambient.current.intensity = 0.35 + lit * 0.45;
    if (key.current) key.current.intensity = 1.6 + lit * 1.2;
  });

  return (
    <>
      {/*
       * 環境光。Hero冒頭は「シルエット」から始めたいので低めだが、
       * 0に近づけすぎると車体が完全な黒い塊になり造形が読めない。
       * ボディが metalness 0.6 で暗色のため、思ったより光量が要る。
       */}
      <ambientLight ref={ambient} intensity={0.35} />

      {/* キーライト。カメラ側(+Z)の斜め上から当て、フロント面を起こす */}
      <directionalLight
        ref={key}
        position={[4, 7, 8]}
        intensity={1.6}
        color="#ffffff"
      />

      {/* フィル。反対側から弱く当てて、影側が黒潰れするのを防ぐ */}
      <directionalLight position={[-6, 3, 4]} intensity={0.7} color="#dfe4ec" />

      {/* リムライト。背後上方から輪郭を起こし、暗い地から車体を分離する */}
      <directionalLight position={[-2, 5, -7]} intensity={0.9} color="#c8d0dc" />
    </>
  );
}

export default function VehicleScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      gl={{
        /*
         * EffectComposer を通すため Canvas側のMSAAは効かない。
         * コストだけ乗るので false(Atmosphereと同じ判断)。
         */
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      dpr={CAM.dpr as unknown as [number, number]}
      camera={{
        position: [0, 1.6, 9],
        fov: CAM.fov,
        near: CAM.near,
        far: CAM.far,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraRig />
      <Lighting />
      <Stage />
      <Vehicle />

      {/*
        ポストプロセス。

        enableNormalPass は Edges のために必須。これが無いと
        法線バッファが得られず、線が一切出ない。

        順序も意味を持つ:
          Edges(線を描く) → Bloom(その線を光らせる) → Vignette(締める)
        Bloomを先に置くと、後から足した線が滲まず硬いままになる。

        DOF は入れない — 車両が主役で、常にピントが合っている
        べきだから(装飾のための被写界深度は付けない)。
      */}
      <EffectComposer multisampling={0} enableNormalPass>
        <Edges
          normalThreshold={EDGES.normalThreshold}
          depthThreshold={EDGES.depthThreshold}
          strength={EDGES.strength}
        />
        <Bloom
          intensity={BLOOM.intensity}
          luminanceThreshold={BLOOM.luminanceThreshold}
          luminanceSmoothing={BLOOM.luminanceSmoothing}
          mipmapBlur
        />
        <Vignette eskil={false} offset={VIG.offset} darkness={VIG.darkness} />
      </EffectComposer>
    </Canvas>
  );
}
