"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";

/*
 * PHILOSOPHY区間で、車両の後方に満ちる光。
 *
 * ═══════════════════════════════════════════════════════════════
 *  当初の演出は「リアハッチが開き、荷室から光が漏れる」だった。
 *  しかし納品された写実GLBには RearGate も Interior も無い
 *  (docs/vehicle-glb-handoff.md §2 — フォトスキャンなので
 *   開けても中身が存在しない)。
 *
 *  そこで「開く」ではなく「灯る」に置き換えた。
 *  車が背を向けたところで内側から光が満ち、その光の中から
 *  コピーが現れる。**価値は車の内側から生まれる**という
 *  Philosophyの核は変えていない。
 * ═══════════════════════════════════════════════════════════════
 *
 * viewProgress.cargoLightIntensity(0→1)だけを読む。時間では光らない。
 */

/** 車体後端(+2.4)より少し後ろ。車に隠れず、かつ密着して見える距離 */
const OFFSET_Z = 2.9;

/** 光の中心高さ(m)。荷室のあたり */
const OFFSET_Y = 1.15;

/** 最大時の直径(m)。車幅1.9に対して広めに取り、後光のように見せる */
const SIZE = 4.4;

export default function RearGlow() {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    /*
     * 中心から緩やかに、かつ最後まで落としきる。
     *
     * 落とし方が急だと輪郭の見える「白い球」になり、
     * 車の後ろにボールが浮いているように見える(実測)。
     * 光は形を持たず、闇に溶けて終わる必要がある。
     */
    grad.addColorStop(0, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.15, "rgba(255,255,255,0.45)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.14)");
    grad.addColorStop(0.7, "rgba(255,255,255,0.03)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;

    const i = viewProgress.cargoLightIntensity;
    const mat = m.material as THREE.MeshBasicMaterial;

    if (i <= 0.001) {
      m.visible = false;
      return;
    }
    m.visible = true;
    mat.opacity = i * 0.5;

    /*
     * 光が満ちるにつれて広がる。
     * 不透明度だけを上げると「板が明るくなる」ように見え、
     * 光が湧いている感じが出ない。
     */
    const s = 0.55 + i * 0.45;
    m.scale.set(s, s, 1);

    /*
     * 車両グループの子なので、車が回ると光も一緒に回ってしまう。
     * 板は真横を向くと消えるため、車の回転を打ち消して
     * 常にカメラ側(-Z)を向かせる。
     */
    m.rotation.y = -viewProgress.bodyRotationY;
  });

  return (
    <mesh
      ref={mesh}
      position={[0, OFFSET_Y, OFFSET_Z]}
      material={material}
      visible={false}
    >
      <planeGeometry args={[SIZE, SIZE]} />
    </mesh>
  );
}
