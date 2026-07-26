"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";

/*
 * R3Fの役割は「3Dオブジェクトを見せること」ではない。
 * 視界・遠近感・霧・奥行き・視点の変化を体験として作ることだけを担当する。
 *
 * したがってこのシーンに"モデル"は無い。あるのは
 *   - 指数フォグ(奥へ行くほど black に沈む)
 *   - 手前から奥へ並べた半透明の霧のプレーン
 *   - スクロールに応じて奥へ退いていく霧の群れ
 * だけ。CSSでは作れない「本物の透視投影による奥行き」を得ることが導入理由。
 */

const FOG_COLOR = "#000000";

/** 霧の1枚。放射状グラデーションのテクスチャをコードで生成する(外部アセット不要)。 */
function useFogTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    // 中心が薄く光り、外周に向かって消える。モノクロのみ。
    g.addColorStop(0, "rgba(255,255,255,0.62)");
    g.addColorStop(0.4, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

type Layer = {
  z: number;
  x: number;
  y: number;
  scale: number;
  drift: number;
  opacity: number;
};

function FogVolume({ count }: { count: number }) {
  const texture = useFogTexture();
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Mesh[]>([]);

  // 手前(z=0付近)から奥(z=-60)まで、不規則に霧を配置する。
  // 規則的に並べると「板が並んでいる」と気づかれるため、意図的にばらす。
  const layers = useMemo<Layer[]>(() => {
    const out: Layer[] = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      out.push({
        z: -4 - t * 56,
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1 > 0.5 ? 6 - t * 3 : -6 + t * 3,
        y: ((Math.sin(i * 78.233) * 43758.5453) % 1) * 6 - 3,
        scale: 14 + t * 30,
        drift: 0.06 + (i % 5) * 0.02,
        opacity: 0.66 - t * 0.32,
      });
    }
    return out;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;

    /*
     * カメラを動かす代わりに霧の側を奥へ押しやる。
     * FogExp2はカメラからの距離で効くため、見え方はカメラを引くのと等価。
     * (カメラはuseThreeが返す共有オブジェクトで直接書き換えるべきでないため、
     *  自分で持つgroupのrefを動かす形にしている)
     *
     * 進行度0 = 霧に埋もれている / 1 = 引ききって奥まで見通せる
     */
    if (g) {
      const target = -viewProgress.vision * 26;
      g.position.z += (target - g.position.z) * 0.06;

      // ごく僅かな上下動。完全な静止に見せないための"呼吸"。
      const breathe = Math.sin(t * 0.18) * 0.35;
      g.position.y += (breathe - g.position.y) * 0.02;
    }

    // 霧はゆっくり流れ続ける。スクロール速度で流れが少しだけ強まる。
    const flow = 1 + Math.min(Math.abs(viewProgress.velocity), 3);
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const l = layers[i];
      m.position.x = l.x + Math.sin(t * l.drift * flow + i) * 2.2;
      m.position.y = l.y + Math.cos(t * l.drift * 0.7 + i) * 0.9;
      m.rotation.z = t * l.drift * 0.08 + i;
    });
  });

  if (!texture) return null;

  return (
    <group ref={group}>
      {layers.map((l, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          position={[l.x, l.y, l.z]}
        >
          <planeGeometry args={[l.scale, l.scale]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={l.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function VisionScene({ count = 22 }: { count?: number }) {
  return (
    <Canvas
      // 霧のブロブに対してアンチエイリアスは効果が薄く、負荷だけ増える
      gl={{ antialias: false, powerPreference: "high-performance" }}
      // 高DPR端末で内部解像度が跳ね上がるのを抑える
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 2], fov: 55, near: 0.1, far: 120 }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.FogExp2(FOG_COLOR, 0.032);
        gl.setClearColor(FOG_COLOR, 0);
      }}
    >
      <FogVolume count={count} />
    </Canvas>
  );
}
