"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { viewProgress } from "@/lib/viewProgress";

/*
 * SELL区間のスキャンライン。
 *
 * 「傷や年式を測る査定」ではなく「車全体を解析し、可能性を見つける」
 * 演出。だから赤や警告色は使わず、白い光の面が車体を端から端へ
 * 一度だけ通り抜ける。通過後に何も残さないのは、
 * 「評価を下す」のではなく「見た」だけだから。
 *
 * viewProgress.scanProgress(0→1)だけを読み、時間では動かない。
 * スクロールを止めれば面も止まる。
 */

/** 車体を余裕をもって覆う面の大きさ(m)。車幅1.9 / 車高2.0 に対して取る */
const PLANE_W = 2.8;
const PLANE_H = 2.4;

/**
 * 面の中心高さ(m)。原点は接地面なので、ここを0のままにすると
 * 半分が地面の下に埋まり、切り取られた板のように見える(実測)。
 */
const PLANE_Y = 1.05;

/** 面が移動する範囲(m)。車体前端(-2.4)〜後端(+2.4)を少し超えて通す */
const FROM_Z = -3.2;
const TO_Z = 3.2;

export default function ScanLine() {
  const mesh = useRef<THREE.Mesh>(null);

  /*
   * 中央だけが明るく、縁に向かって消えるグラデーション。
   * 単色の板だと「白い壁が通る」ようにしか見えず、
   * 光が舐めている感じが出ない。
   */
  const material = useMemo(() => {
    /*
     * 四方へ減衰する光。
     *
     * 縦方向だけのグラデーションだと、左右の縁が直線のまま残り、
     * 「白い板が通っている」ようにしか見えない(実測)。
     * 楕円の放射グラデーションにすると輪郭が消え、
     * 光そのものが車体を舐めているように読める。
     */
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
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      /*
       * 加算合成。車体の上に乗せて「光が当たっている」ように見せる。
       * NormalBlendingだと不透明な板が car を隠してしまう。
       */
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }, []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;

    const p = viewProgress.scanProgress;
    const mat = m.material as THREE.MeshBasicMaterial;

    /* 進行度0または1では完全に消す。区間外で残らないようにする */
    if (p <= 0 || p >= 1) {
      mat.opacity = 0;
      m.visible = false;
      return;
    }

    m.visible = true;
    m.position.z = FROM_Z + (TO_Z - FROM_Z) * p;

    /*
     * 両端でフェードさせる。突然現れて突然消えると
     * 「板が出た」ことに気づかれてしまう。
     */
    mat.opacity = Math.sin(p * Math.PI) * 0.5;
  });

  return (
    <mesh ref={mesh} position={[0, PLANE_Y, 0]} material={material} visible={false}>
      {/*
        面は車体の断面(幅×高さ)。これが車の前から後ろへ通り抜ける。
        回転は掛けない。掛けるとテクスチャのグラデーション方向が
        90度ずれ、上下のフェードが左右のフェードになってしまう。
      */}
      <planeGeometry args={[PLANE_W, PLANE_H]} />
    </mesh>
  );
}
