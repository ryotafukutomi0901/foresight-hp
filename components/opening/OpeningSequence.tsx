"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/hooks/useGsap";
import { registerBrandEases } from "@/lib/motion";
import {
  markOpeningDone,
  markOpeningSeen,
  shouldPlayOpening,
} from "@/lib/sequence";
import { settleOpeningStage } from "@/lib/openingStage";

/*
 * OPENING v4 — ヘッドライトが未来を照らす
 *
 * 「見通す」というブランドの意味を、光の運動そのもので表す。
 * 闇の中で車のヘッドライトが灯り、こちらへ前進し、
 * 光がレンズを埋めた瞬間にTOPへ抜ける。
 *
 *  0.0–0.4  闇
 *  0.4–4.4  動画本編（点灯 → 前進 → ヘッドライトへズーム）
 *  4.0–4.8  白へ収束。動画の終端はまだ光が画面を覆いきらないため、
 *           ここだけコード側のフラッシュで繋いで完全な白にする
 *  4.8–5.4  白が引いてTOPが現れる。Heroのテキストがこの間に立ち上がる
 *
 * 動画は Higgsfield で生成し public/video/hero-ignition.mp4 に置いている。
 * 素材の元画像は public/images/foresight/vehicle-parts/03-front-face.webp。
 *
 * ⚠️ テキストは動画に焼き込まない。コード側で描くことで、
 *    文言変更・多言語化・フォント差し替えが動画の再生成なしに行える。
 */

const TOTAL = 5.4;

export default function OpeningSequence() {
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      registerBrandEases();

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced || !shouldPlayOpening()) {
        settleOpeningStage();
        markOpeningSeen();
        markOpeningDone();
        setMounted(false);
        return;
      }

      markOpeningSeen();

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const finish = () => {
        document.body.style.overflow = prevOverflow;
        markOpeningDone();
        setMounted(false);
      };

      const curtain = root.current;
      const clip = video.current;
      const flash = root.current?.querySelector("[data-flash]");
      if (!curtain || !clip || !flash) return;

      gsap.set(clip, { autoAlpha: 0, scale: 1.04 });
      gsap.set(flash, { autoAlpha: 0 });
      /*
       * 動画は自動で走らせず、必ず先頭で待たせる。
       * preload="auto" でメタデータ取得中に再生が進むことがあり、
       * タイムラインが点灯を見せる前に終端まで行ってしまう（実測）。
       */
      clip.pause();
      clip.currentTime = 0;

      const tl = gsap.timeline({ onComplete: finish });

      /* ---- 0.0–0.4 闇。呼吸を整える間 ---- */
      tl.addLabel("silence", 0);

      /* ---- 0.4 動画の再生開始 ---- */
      tl.addLabel("play", 0.4)
        .to(clip, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "play")
        .add(() => {
          clip.currentTime = 0;
          void clip.play();
        }, "play")
        /*
         * 再生中もわずかに寄せ続ける。動画自体のズームに
         * CSS側の拡大を重ね、最後の加速を強くする。
         */
        .to(clip, { scale: 1.16, duration: 4, ease: "power2.in" }, "play");

      /* ---- 3.9–4.8 白へ収束 ----
         動画は4.05秒。終端はヘッドライトが光っているが画面を覆いきらないため、
         その手前からフラッシュを重ね始めて完全な白へ繋ぐ。
         動画の最後のフレームで切り替えると、光が消えた瞬間が見えてしまう。 */
      tl.addLabel("flash", 3.9)
        .to(
          flash,
          { autoAlpha: 1, duration: 0.6, ease: "power2.in" },
          "flash",
        )
        /* ---- 4.8–5.4 白が引き、TOPが現れる ---- */
        .addLabel("reveal", 4.8)
        // 下のページが見えるよう、動画を先に消す
        .to(clip, { autoAlpha: 0, duration: 0.2 }, "reveal")
        // Heroのテキスト入場と白の後退を重ねる
        .add(() => markOpeningDone(), "reveal")
        .to(
          flash,
          { autoAlpha: 0, duration: 0.6, ease: "power2.out" },
          "reveal+=0.05",
        );

      tl.totalDuration(TOTAL);

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __openingTl?: gsap.core.Timeline }).__openingTl =
          tl;
      }

      /* ---- スキップ ---- */
      const skip = () => {
        tl.pause();
        clip.pause();
        gsap.to(curtain, {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.inOut",
          onComplete: () => {
            tl.kill();
            finish();
          },
        });
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") skip();
      };
      document.addEventListener("keydown", onKey);
      const btn = root.current?.querySelector("[data-skip]");
      btn?.addEventListener("click", skip);

      return () => {
        document.removeEventListener("keydown", onKey);
        btn?.removeEventListener("click", skip);
        document.body.style.overflow = prevOverflow;
      };
    },
    { scope: root },
  );

  if (!mounted) return null;

  return (
    <div
      ref={root}
      data-opening
      className="fixed inset-0 z-[100] overflow-hidden bg-void"
    >
      {/*
        object-cover で縦横比の違いを吸収する設計だったが、素材は
        16:9(1280×720)。縦長のスマホ画面(例: 390×844)では高さに
        合わせて拡大されるため、幅は表示領域の1/4程度しか映らず、
        車の全景が failsを失って「白く光る何か」にしか見えなかった
        (実測)。

        object-contain に変え、常に全景を見せる。素材の地は純黒
        (bg-void と同色)なので、余白にできる上下左右の帯は
        ページの地にそのまま溶ける。デスクトップでも比率差はごく
        小さく(1440×900で上下45pxずつ程度)、印象はほぼ変わらない。
      */}
      <video
        ref={video}
        data-opening-video
        className="absolute inset-0 h-full w-full object-contain"
        src="/video/hero-ignition.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden
      />

      {/* 白への収束。動画の終端を受けて画面を光で満たす */}
      <div
        data-flash
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white"
      />

      <button
        data-skip
        type="button"
        className="absolute right-4 top-4 z-[110] min-h-11 px-5 text-[0.65rem] tracking-[0.28em] text-white/70 mix-blend-difference transition-colors duration-300 hover:text-white sm:right-8 sm:top-8"
      >
        SKIP
      </button>
    </div>
  );
}
