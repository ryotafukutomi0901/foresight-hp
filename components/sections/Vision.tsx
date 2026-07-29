"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { viewProgress } from "@/lib/viewProgress";
import { VISION } from "@/lib/content";

/*
 * SCENE 02 — THE VISION OPENS
 *
 * 「何かわからない」→「一部が見える」→「全体が見える」を、
 * 文章で説明せずスクロールそのもので体験させるセクション。
 *
 * 責務の分離:
 *   GSAP … このセクションをpinし、スクロール量を進行度(0→1)に変換して書き出す
 *   R3F  … その進行度を読み、カメラを後退させ霧を抜けていく
 * 進行度の受け渡しはrefベース(lib/viewProgress)で、Reactのstateは毎フレーム触らない。
 */

// three.js は重いため初期バンドルから外し、クライアントでのみ読み込む
const VisionScene = dynamic(() => import("@/components/three/VisionScene"), {
  ssr: false,
});

export default function Vision() {
  const [canRender3D, setCanRender3D] = useState(false);

  /*
   * 画面外では描画そのものを止める。
   *
   * Visionは1画面分(h-100svh)しかないのに、R3Fは既定で常時描画し続けるため、
   * ユーザーが何セクションも先に居る間もフルビューポート(実測2520×1575)を
   * 毎フレーム塗り続けていた。常設のAtmosphereと合わせて毎フレーム
   * 6.9M画素を描いている状態で、これがdesktopのfps未達の主因。
   *
   * 見えていない間だけ止めるので見た目は変わらない。
   *
   * rootMargin は 25%。1画面分(100%)取ると Hero を表示している間ずっと
   * Vision も描画され、Atmosphereと二重に塗ることになる
   * （実測で Hero/Vision 区間だけ 49fps、他区間は 59〜60fps だった）。
   * 25% あれば入る手前で再開が済み、復帰の瞬間は見えない。
   */
  const shell = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
        mobile: "(max-width: 767px)",
      },
      (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;

        // 動きを減らす設定では3Dを描画せず、静止したコピーだけを見せる
        if (reduced) {
          setCanRender3D(false);
          gsap.set("[data-vision-step]", { autoAlpha: 1, y: 0, filter: "none" });
          viewProgress.vision = 1;
          return;
        }

        setCanRender3D(true);

        const steps = gsap.utils.toArray<HTMLElement>("[data-vision-step]");

        /*
         * 語ごとに個別のScrollTriggerを作ると、区間の境界がわずかにずれて
         * 「どの語も表示されていない空白」ができる(実測で確認済み)。
         * pinに1本のタイムラインをscrubさせ、語の出入りを連続させる。
         */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            // モバイルはpin区間を短くして、延々スクロールさせられる感覚を避ける
            end: mobile ? "+=180%" : "+=280%",
            pin: true,
            // pinした要素自体はアニメートしない。子要素だけを動かす。
            pinSpacing: true,
            scrub: true,
            onUpdate: (self) => {
              // ここがGSAP → R3F の唯一の受け渡し点
              viewProgress.vision = self.progress;
              viewProgress.velocity = self.getVelocity() / 900;
            },
          },
        });

        // 1語 = タイムライン上の1単位。前の語が抜けきる前に次が入り始める。
        steps.forEach((step, i) => {
          tl.fromTo(
            step,
            { autoAlpha: 0, filter: "blur(18px)", y: 26 },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.4,
              ease: "none",
            },
            i,
          );
          if (i < steps.length - 1) {
            tl.to(
              step,
              {
                autoAlpha: 0,
                filter: "blur(14px)",
                y: -18,
                duration: 0.3,
                ease: "none",
              },
              i + 0.72,
            );
          }
        });
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="vision"
      aria-labelledby="vision-heading"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* 3D霧。装飾のため支援技術からは隠す */}
      <div ref={shell} aria-hidden className="absolute inset-0">
        {canRender3D ? <VisionScene active={onScreen} /> : null}
      </div>

      {/* 3Dの上に重ねる暗幕。文字の可読性を担保する */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,0.45) 82%)",
        }}
      />

      <div className="container-x relative z-10 flex h-full flex-col justify-center">
        <h2 id="vision-heading" className="sr-only">
          {VISION.a11yHeading}
        </h2>

        <div className="relative min-h-[9rem] sm:min-h-[12rem]">
          {VISION.steps.map((step) => (
            <p
              key={step}
              data-vision-step
              className="absolute inset-x-0 top-0 text-display-l font-normal leading-[1.2] text-ink"
            >
              {step}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
