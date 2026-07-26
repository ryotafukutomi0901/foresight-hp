"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import EagleFigure from "./EagleFigure";
import CloudLayers from "./CloudLayers";
import { gsap, useGSAP } from "@/hooks/useGsap";
import { registerBrandEases } from "@/lib/motion";
import {
  markOpeningDone,
  markOpeningSeen,
  shouldPlayOpening,
} from "@/lib/sequence";

/*
 * OPENING ANIMATION — 5.0秒
 *
 *  0.00–0.50  LOGO      ロゴが据わる
 *  0.50–1.20  BLINK     目が一度だけ瞬く
 *  1.20–2.30  PULLBACK  カメラが引く(頭 → 胴 → 翼 → 全身)
 *  2.30–3.00  FLAP      翼を一度だけ大きく打ち下ろす
 *  3.00–4.20  FLIGHT    上空へ飛び立つ
 *  4.20–5.00  CLOUD     雲が画面を覆い、Heroへ接続する
 *
 * 全体を1本のマスターTimelineで管理する。setTimeoutによる時間管理はしない
 * (スキップ・巻き戻し・速度変更ができなくなり、cleanupも保証できないため)。
 */

const TOTAL = 5.0;

export default function OpeningSequence() {
  // SSR時は必ず描画し、クライアントのlayout effectで即座に判定する。
  // (useGSAPはlayout effectベースなので、描画前に消せば「一瞬見える」事故が起きない)
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerBrandEases();

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // 2回目以降の訪問、または「視差効果を減らす」設定時は演出を行わない。
      // コンテンツへのアクセスを一切妨げない。
      if (reduced || !shouldPlayOpening()) {
        markOpeningSeen();
        markOpeningDone();
        setMounted(false);
        return;
      }

      markOpeningSeen();

      // 演出中は背面をスクロールさせない
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const vh = window.innerHeight;
      const vw = window.innerWidth;

      const finish = () => {
        document.body.style.overflow = prevOverflow;
        markOpeningDone();
        setMounted(false);
      };

      const tl = gsap.timeline({ onComplete: finish });

      /* ---- 初期状態 ---- */
      gsap.set("[data-logo]", { autoAlpha: 0, scale: 1.02 });
      gsap.set("[data-lid]", {
        scaleY: 0,
        rotation: -12,
        transformOrigin: "50% 0%",
      });
      gsap.set("[data-eagle-camera]", {
        autoAlpha: 0,
        scale: 3.2,
        transformOrigin: "50% 36%",
        filter: "blur(4px)",
      });
      gsap.set("[data-wing-left]", { transformOrigin: "44% 45%" });
      gsap.set("[data-wing-right]", { transformOrigin: "56% 45%" });
      gsap.set("[data-vignette]", { autoAlpha: 1 });

      /* ---- 0.00–0.50 LOGO ---- */
      tl.addLabel("logo", 0).to(
        "[data-logo]",
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: "brandOut" },
        "logo",
      );

      /* ---- 0.50–1.20 BLINK ----
         人間の瞬目は「閉じが速く、開きが遅い」。同じeaseで往復させない。 */
      tl.addLabel("blink", 0.62)
        .to(
          "[data-lid]",
          { scaleY: 1, duration: 0.09, ease: "power3.in" },
          "blink",
        )
        .to(
          "[data-lid]",
          { scaleY: 0, duration: 0.14, ease: "power2.out" },
          "blink+=0.13",
        );

      /* ---- 1.20–2.30 PULLBACK ----
         カメラが空間を後退する。ロゴと鷹を同じ ease(brandDolly) で同時に
         退がらせながら、中盤でマッチディゾルブする(目を一致点にする)。
         引きの過程で 頭 → 胴体 → 翼 の順に視界へ入るよう、
         序盤に溜めのあるカーブを使う。 */
      tl.addLabel("pullback", 1.2)
        .to(
          "[data-logo]",
          { scale: 0.42, duration: 1.1, ease: "brandDolly" },
          "pullback",
        )
        .to(
          "[data-logo]",
          { autoAlpha: 0, duration: 0.36, ease: "power2.inOut" },
          "pullback+=0.42",
        )
        .to(
          "[data-eagle-camera]",
          {
            scale: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "brandDolly",
          },
          "pullback",
        )
        .to(
          "[data-eagle-camera]",
          { autoAlpha: 1, duration: 0.4, ease: "power2.inOut" },
          "pullback+=0.44",
        )
        // 周辺の暗がりが縮んで視界が広がる
        .to(
          "[data-vignette]",
          { autoAlpha: 0, duration: 1.0, ease: "power2.out" },
          "pullback+=0.2",
        );

      /* ---- 2.30–3.00 FLAP ----
         anticipation(構え) → acceleration(打ち下ろし) → follow-through(戻り)。
         3キーで重さと余韻を作る。左右で回転方向が逆になる。 */
      tl.addLabel("flap", 2.3)
        .to(
          "[data-wing-left]",
          { rotation: -5, duration: 0.16, ease: "power2.out" },
          "flap",
        )
        .to(
          "[data-wing-right]",
          { rotation: 5, duration: 0.16, ease: "power2.out" },
          "flap",
        )
        .to(
          "[data-wing-left]",
          { rotation: 11, duration: 0.2, ease: "power3.in" },
          "flap+=0.18",
        )
        .to(
          "[data-wing-right]",
          { rotation: -11, duration: 0.2, ease: "power3.in" },
          "flap+=0.18",
        )
        .to(
          "[data-wing-left]",
          { rotation: 0, duration: 0.34, ease: "brandOut" },
          "flap+=0.4",
        )
        .to(
          "[data-wing-right]",
          { rotation: 0, duration: 0.34, ease: "brandOut" },
          "flap+=0.4",
        )
        // 打ち下ろしの反動で機体がわずかに沈んで戻る(weight)
        .to(
          "[data-eagle-camera]",
          { y: 14, duration: 0.2, ease: "power3.in" },
          "flap+=0.18",
        )
        .to(
          "[data-eagle-camera]",
          { y: 0, duration: 0.4, ease: "brandOut" },
          "flap+=0.4",
        );

      /* ---- 3.00–4.20 FLIGHT ----
         直線的に上へ動かすと「移動」にしか見えない。緩いS字の軌道と、
         一度手前に迫ってから奥へ抜けるスケール変化で上昇感と奥行きを作る。 */
      tl.addLabel("flight", 3.0)
        .to(
          "[data-eagle-camera]",
          {
            motionPath: {
              path: [
                { x: 0, y: 0 },
                { x: vw * 0.05, y: -vh * 0.28 },
                { x: -vw * 0.04, y: -vh * 0.75 },
                { x: vw * 0.02, y: -vh * 1.45 },
              ],
              curviness: 1.4,
            },
            duration: 1.2,
            ease: "power2.in",
          },
          "flight",
        )
        .to(
          "[data-eagle-camera]",
          {
            keyframes: [
              { scale: 1.16, duration: 0.34, ease: "power1.out" },
              { scale: 0.24, duration: 0.86, ease: "power2.in" },
            ],
          },
          "flight",
        )
        .to(
          "[data-eagle-camera]",
          { rotation: -7, duration: 1.2, ease: "power1.inOut" },
          "flight",
        )
        // 雲の谷が下へ流れ、鷹が昇っていく視差になる
        .fromTo(
          "[data-cloud-corridor]",
          { autoAlpha: 0, yPercent: -18, scale: 1.25 },
          {
            autoAlpha: 0.9,
            yPercent: 16,
            scale: 1,
            duration: 1.5,
            ease: "power1.inOut",
          },
          "flight",
        );

      /* ---- 4.20–5.00 CLOUD → HERO ----
         対角から雲が差し込んで画面を挟み込み、ホワイトアウトでピークを作り、
         そこから沈めてHeroの黒へ接続する。 */
      tl.addLabel("cloud", 4.2)
        .fromTo(
          "[data-cloud-in='left']",
          { autoAlpha: 0, xPercent: -14, yPercent: -8, scale: 1.15 },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            duration: 0.62,
            ease: "brandInOut",
          },
          "cloud",
        )
        .fromTo(
          "[data-cloud-in='right']",
          { autoAlpha: 0, xPercent: 14, yPercent: 8, scale: 1.15 },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            duration: 0.62,
            ease: "brandInOut",
          },
          "cloud",
        )
        .to(
          "[data-cloud-whiteout]",
          { autoAlpha: 1, duration: 0.42, ease: "power2.in" },
          "cloud+=0.18",
        )
        // 雲が晴れる合図。Heroの入場はここから始まる(幕の下で終わらせない)
        .add(() => markOpeningDone(), "cloud+=0.42")
        .to(
          root.current,
          { autoAlpha: 0, duration: 0.38, ease: "power2.inOut" },
          "cloud+=0.44",
        );

      tl.totalDuration(TOTAL);

      // 開発時のみ、各ビートを任意の時刻へシークして確認できるようにする。
      // (本番ビルドでは条件ごと除去される)
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __openingTl?: gsap.core.Timeline }).__openingTl =
          tl;
      }

      /* ---- スキップ ---- */
      const skip = () => {
        tl.pause();
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.3,
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

  // 完了後はDOMから外す。合成レイヤーを残さないため display:none にはしない。
  if (!mounted) return null;

  return (
    <div
      ref={root}
      data-opening
      className="fixed inset-0 z-[100] overflow-hidden bg-void"
    >
      {/* 演出そのものは装飾。読み上げ対象にしない */}
      <div aria-hidden className="absolute inset-0">
        {/* 鷹 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            data-eagle-camera
            className="w-[min(96vw,1100px)]"
            style={{ willChange: "transform, filter" }}
          >
            <EagleFigure />
          </div>
        </div>

        {/* ロゴ(最初のビート)。鷹とマッチディゾルブする */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            data-logo
            className="relative w-[min(76vw,620px)]"
            style={{ aspectRatio: "1536 / 1085", willChange: "transform" }}
          >
            <Image
              src="/logo2.PNG"
              alt=""
              fill
              sizes="(max-width: 768px) 76vw, 620px"
              priority
              className="art-blend object-contain"
            />
            {/*
              瞼。ロゴの目は「白い眼球 + 黒い虹彩のアーチ」が白い顔面に埋まった構造。
              したがって瞼は顔と同じ白で、虹彩のアーチを覆うと目が閉じて見える
              (黒を被せると顔に穴が空いたように見えてしまう)。
              楕円・角度(-12°)・寸法はマークの目の実寸に合わせて調整済み。
            */}
            <span
              data-lid
              className="absolute rounded-full bg-ink"
              style={{
                left: "46%",
                width: "15%",
                top: "41%",
                height: "13%",
              }}
            />
          </div>
        </div>

        {/* 雲 */}
        <CloudLayers />

        {/* 視界の周辺を落として「覗いている」状態を作る。引きに合わせて消える */}
        <div
          data-vignette
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, transparent 22%, rgba(0,0,0,0.85) 62%, #000 88%)",
          }}
        />
      </div>

      <button
        data-skip
        type="button"
        className="absolute right-4 top-4 z-[110] min-h-11 px-5 text-[0.65rem] tracking-[0.28em] text-ink-soft transition-colors duration-300 hover:text-ink sm:right-8 sm:top-8"
      >
        SKIP
      </button>
    </div>
  );
}
