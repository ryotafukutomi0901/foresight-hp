"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * 車両シーンのマウント点。
 *
 * three.js は重いため初期バンドルから外し、クライアントでのみ読み込む。
 * (AtmosphereMount.tsx と同じ方針)
 *
 * ⚠️ このコンポーネントは layout 直下に1つだけ置く。
 *    セクション側からマウントすると、セクションを抜けたときに
 *    アンマウントされ「車両がセクションごとに作り直される」ことになり、
 *    CEO指示の禁止事項に該当する。
 *
 * 「視差効果を減らす」設定では3Dを一切起動しない。
 * その場合は各セクションが静止したテキストだけを見せる
 * (既存 Vision.tsx の reduced 分岐と同じ考え方)。
 */
const VehicleScene = dynamic(() => import("./VehicleScene"), { ssr: false });

export default function VehicleSceneMount() {
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
      data-vehicle-scene
    >
      <VehicleScene />
    </div>
  );
}
