"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * 常設3D空間のマウント点。
 *
 * three.js + postprocessing は重いため初期バンドルから外し、
 * クライアントでのみ読み込む。SSRでは何も描画しない。
 *
 * 「視差効果を減らす」設定のときは3Dを一切起動しない。
 * 動きを止めるのではなく、そもそも動くものを作らないことで
 * 内容だけが静かに読める状態にする。
 */
const Atmosphere = dynamic(() => import("./Atmosphere"), { ssr: false });

export default function AtmosphereMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      data-atmosphere
    >
      <Atmosphere />
    </div>
  );
}
