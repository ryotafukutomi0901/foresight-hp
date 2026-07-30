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

  /*
   * 明転区間(Buy / Sell / Find)では3Dの描画を止める。
   *
   * 明転セクションは不透明な地を持ち、この常設canvasを完全に覆う。
   * つまり描いても1画素も見えない。加算合成は明るい地の上では
   * そもそも成立しないため、ここは意図的にタイポグラフィだけの章にしている
   * (Color System「暗闇=空間と発見 / 光=情報と行動」)。
   *
   * 覆われている間だけ止めるので見た目は変わらない。
   * 判定は「明転セクションが画面を実質的に埋めているか」で行い、
   * 境界をまたぐ最中は描画を続けて、隙間から黒が抜けるのを防ぐ。
   */
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const sections = [
      ...document.querySelectorAll<HTMLElement>('[data-tone="light"]'),
    ];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // 画面の縦幅をほぼ埋めているときだけ「覆われた」とみなす
          const fills = e.intersectionRect.height >= window.innerHeight - 2;
          if (fills) {
            setCovered(true);
            return;
          }
        }
        setCovered(false);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const s of sections) io.observe(s);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      data-atmosphere
    >
      <Atmosphere active={!covered} />
    </div>
  );
}
