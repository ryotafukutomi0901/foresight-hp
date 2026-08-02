"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";
import { camera as CAM, dof as DOF } from "@/lib/tokens";
import NarrativeCorridor from "./NarrativeCorridor";

/*
 * ページ全体に常駐する3D空間。
 *
 * R3Fの役割は「3Dオブジェクトを見せること」ではない。
 * 視界・遠近感・霧・奥行き・空気を作ることだけを担当する。
 * したがってここに"モデル"は無く、あるのは霧・塵・光条とカメラだけ。
 *
 * これを固定背景として全ページに敷くことで、セクションが
 * 「並んだ平面」ではなく「同じ空間の中の出来事」になる。
 */

const FOG_COLOR = "#050506";

/* ---------------------------------------------------------------- *
 * 手続き生成テクスチャ
 * 外部画像に依存しないため、どの解像度でも破綻しない。
 * ---------------------------------------------------------------- */

function radialTexture(stops: [number, string][], size = 256) {
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
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------------------------------------------------------- *
 * 体積霧
 * ---------------------------------------------------------------- */

type FogLayer = {
  x: number;
  y: number;
  z: number;
  scale: number;
  drift: number;
  opacity: number;
};

function VolumetricFog({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Mesh[]>([]);

  const texture = useMemo(
    () =>
      radialTexture([
        [0, "rgba(255,255,255,0.16)"],
        [0.4, "rgba(255,255,255,0.05)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    [],
  );

  // 規則的に並べると「板が並んでいる」と気づかれるため、意図的にばらす
  const layers = useMemo<FogLayer[]>(() => {
    const rnd = (n: number) => {
      const v = Math.sin(n * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({ length: count }, (_, i) => {
      const t = i / count;
      return {
        x: (rnd(i) - 0.5) * 26,
        y: (rnd(i + 100) - 0.5) * 14,
        z: -22 - t * 110,
        scale: 16 + rnd(i + 200) * 26,
        drift: 0.05 + rnd(i + 300) * 0.06,
        opacity: 0.13 - t * 0.06,
      };
    });
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flow = 1 + Math.min(Math.abs(viewProgress.velocity), 3);

    // ページ進行でゆっくり奥へ前進し続ける = 常に空間を移動している感覚
    const g = group.current;
    if (g) {
      const target = viewProgress.page * 40;
      g.position.z += (target - g.position.z) * 0.05;
    }

    meshes.current.forEach((m, i) => {
      if (!m) return;
      const l = layers[i];
      m.position.x = l.x + Math.sin(t * l.drift * flow + i) * 2.6;
      m.position.y = l.y + Math.cos(t * l.drift * 0.7 + i) * 1.1;
      m.rotation.z = t * l.drift * 0.06 + i;
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
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- *
 * 奥行き方向に漂う塵
 * 空間に「粒」があると、カメラが動いたときに初めて奥行きが知覚できる。
 * ---------------------------------------------------------------- */

function DustField({ count = 700 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, texture } = useMemo(() => {
    /*
     * Math.random() は使わない。レンダー中の副作用になるうえ、
     * 再レンダーのたびに塵が飛び回ってしまう。
     * 同じ入力から必ず同じ配置になる決定的な擬似乱数を使う。
     */
    const rnd = (n: number) => {
      const v = Math.sin(n * 127.1) * 43758.5453;
      return v - Math.floor(v);
    };
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd(i) - 0.5) * 60;
      pos[i * 3 + 1] = (rnd(i + 1000) - 0.5) * 34;
      pos[i * 3 + 2] = -rnd(i + 2000) * 130;
    }
    return {
      positions: pos,
      texture: radialTexture(
        [
          [0, "rgba(255,255,255,1)"],
          [0.5, "rgba(255,255,255,0.35)"],
          [1, "rgba(255,255,255,0)"],
        ],
        64,
      ),
    };
  }, [count]);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    p.position.z = viewProgress.page * 60;
    p.rotation.y = t * 0.008;
  });

  if (!texture) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------------------------------------------------------- *
 * 光条（god rays）
 * 上方から差し込む細い光。霧に当たって空間の"高さ"を見せる。
 * ---------------------------------------------------------------- */

function LightShafts() {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(
    () =>
      radialTexture([
        [0, "rgba(255,255,255,0.12)"],
        [0.5, "rgba(255,255,255,0.03)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    [],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      c.position.x = Math.sin(t * 0.06 + i * 2) * 8;
      const m = (c as THREE.Mesh).material as THREE.Material;
      if ("opacity" in m) {
        (m as THREE.MeshBasicMaterial).opacity =
          0.06 + Math.sin(t * 0.35 + i) * 0.025;
      }
    });
  });

  if (!texture) return null;

  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[-10 + i * 10, 6, -30 - i * 14]}
          rotation={[0, 0, 0.32 - i * 0.18]}
        >
          <planeGeometry args={[9, 60]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.06}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- *
 * カメラ
 * useThreeが返すカメラを直接書き換えず、シーン側(rig)を動かす。
 * FogExp2はカメラからの距離で効くため見え方は等価。
 * ---------------------------------------------------------------- */

function Rig({ children }: { children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null);
  const { size } = useThree();

  useFrame(() => {
    const r = rig.current;
    if (!r) return;
    // 画面が狭いほど被写体が寄って見えるので、空間ごと少し後ろへ下げる。
    // 機能は削らず、寸法だけを合わせるための調整。
    const narrow = Math.min(1, size.width / 1280);
    const back = (1 - narrow) * 6;
    r.position.z += (back - r.position.z) * 0.05;
  });

  return <group ref={rig}>{children}</group>;
}

/* ---------------------------------------------------------------- *
 * ポストプロセス
 * 「映像に見えるか」を決めるのは実質ここ。
 * 各エフェクトは後から個別に外せるよう独立させてある。
 * ---------------------------------------------------------------- */

function Cinematic() {
  /*
   * multisampling は 0（無効）。
   *
   * 画質のために 4 → 2 と試したが、全画面バッファをサンプル数分だけ
   * 走査するため fps への影響が大きく、desktop が
   *   0 → 58fps / 2 → 47fps / 4 → 18fps
   * と予算(55)を割った（実測）。
   *
   * この画面のエッジは車両の線画だけで、その線は素材側で既に
   * アンチエイリアスが掛かっている。MSAAで得られる改善に対し
   * 支払うコストが見合わない。
   */
  return (
    <EffectComposer multisampling={0}>
      {/* 線画の白を淡く発光させ、黒の中で"光っている"ように見せる */}
      {/* 閾値を上げ、線画の白だけを拾う。霧まで光ると画面が白飛びする */}
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      {/* 奥ほどピントが外れる。平面の集合が"空間"に見える最大の要因 */}
      {/* ぼかしは低解像度でも結果がほぼ変わらない。最も高コストなので半解像度で処理する */}
      {/*
        ぼかしの解像度。等倍にすると車両の線は僅かに締まるが、
        DOFはポストプロセス中で最も高コストで fps を大きく削る（実測）。
        車両への合焦は focusDistance の修正で達成できたため、
        解像度は半分に戻す。
      */}
      <DepthOfField
        focusDistance={DOF.focusDistance}
        focalLength={DOF.focalLength}
        bokehScale={DOF.bokehScale}
        resolutionScale={DOF.resolutionScale}
      />
      {/*
        色収差は Phase 7 で無効化した（Performance Budget の削減順序 第1位）。
        desktop が予算55fpsに対し48fpsで未達だったため。
        モノクロの画づくりでは色収差の寄与が最も小さく、失うものが少ない。
      */}
      {/* フィルムグレイン。これが入るだけでCGが"映像"側に寄る */}
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.2} />
      <Vignette eskil={false} offset={0.22} darkness={0.92} />
    </EffectComposer>
  );
}

export default function Atmosphere({
  fogCount = 26,
  dustCount = 700,
  active = true,
}: {
  fogCount?: number;
  dustCount?: number;
  /** 明転区間で完全に覆われている間は false。描画を止める（見た目は変わらない）。 */
  active?: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      gl={{
        /*
         * false のままにする。
         * EffectComposer を通す構成では最終出力は composer の
         * 中間バッファ経由になるため、Canvas 側の MSAA はほぼ効かず
         * コストだけが乗る。アンチエイリアスは composer 側の
         * multisampling で効かせる。
         */
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      dpr={CAM.dpr as unknown as [number, number]}
      camera={{
        position: CAM.position as unknown as [number, number, number],
        fov: CAM.fov,
        near: CAM.near,
        far: CAM.far,
      }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(FOG_COLOR, 0.014);
      }}
    >
      <Rig>
        <VolumetricFog count={fogCount} />
        <DustField count={dustCount} />
        <LightShafts />
        {/*
          回廊はテクスチャ読み込みでサスペンドする。Suspenseで包まないと
          Canvas配下すべてが巻き添えで描画されず、霧も塵も出なくなる(実測で確認)。
          fallback:null にして、画像が揃うまで空気だけ先に見せる。
        */}
        <Suspense fallback={null}>
          <NarrativeCorridor />
        </Suspense>
      </Rig>
      <Cinematic />
    </Canvas>
  );
}
