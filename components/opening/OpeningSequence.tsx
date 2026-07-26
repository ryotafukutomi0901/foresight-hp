"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import CloudLayers from "./CloudLayers";
import { gsap, useGSAP } from "@/hooks/useGsap";
import { registerBrandEases } from "@/lib/motion";
import {
  markOpeningDone,
  markOpeningSeen,
  shouldPlayOpening,
} from "@/lib/sequence";

/*
 * OPENING — 約6.0秒
 *
 *  0.0–0.9  ロゴが霧の奥から結像する
 *  0.9–1.5  目が一度だけ瞬く
 *  1.5–3.6  目の中へ入っていく          ← この演出の核
 *  3.6–4.6  瞳の闇を抜けて雲へ
 *  4.6–6.0  雲が晴れ、Heroへ繋がる
 *
 * 「引いて全体を見せる」のではなく「入っていく」。
 * Foresight=見通す、という名前に対して、視点が対象の内側へ入る動きの方が正しい。
 * この"入る"運動はページ本体のスクロール(カメラ前進)にそのまま引き継がれる。
 *
 * 全体を1本のマスターTimelineで管理する。setTimeoutによる時間管理はしない
 * (スキップ・シーク・速度変更ができなくなり、cleanupも保証できないため)。
 */

const TOTAL = 6.0;

/* ロゴ画像内での目の位置(実測)。ここがカメラの進入点になる。 */
const EYE = { x: 53.5, y: 47.5 };

export default function OpeningSequence() {
  // SSR時は必ず描画し、クライアントのlayout effectで即座に判定する
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerBrandEases();

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // 2回目以降の訪問、または「視差効果を減らす」設定時は演出を行わない
      if (reduced || !shouldPlayOpening()) {
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

      const tl = gsap.timeline({ onComplete: finish });

      /* ---- 初期状態 ---- */
      /*
       * 拡大の原点は「ロゴ画像の中の目」。
       * 舞台(全画面)に対する%で指定すると、中央寄せされたロゴの目の実際の位置と
       * ずれてしまい、目に入っていかず横へ流れる(実測で確認)。
       * ロゴ要素自身をロゴ座標系の%で拡大すれば幾何学的に正確になる。
       */
      gsap.set("[data-logo]", {
        autoAlpha: 0,
        scale: 1.08,
        filter: "blur(24px)",
        transformOrigin: `${EYE.x}% ${EYE.y}%`,
      });

      // 速度線・瞳・周辺減光の中心を、画面上での目の実座標に合わせる
      const logoEl = root.current?.querySelector<HTMLElement>("[data-logo]");
      if (logoEl && root.current) {
        const r = logoEl.getBoundingClientRect();
        const cx = ((r.left + (r.width * EYE.x) / 100) / window.innerWidth) * 100;
        const cy = ((r.top + (r.height * EYE.y) / 100) / window.innerHeight) * 100;
        root.current.style.setProperty("--eye-x", `${cx}%`);
        root.current.style.setProperty("--eye-y", `${cy}%`);
      }
      gsap.set("[data-lid]", {
        scaleY: 0,
        rotation: -12,
        transformOrigin: "50% 0%",
      });
      gsap.set("[data-streak]", { autoAlpha: 0, scale: 0.6 });
      gsap.set("[data-pupil]", { autoAlpha: 0, scale: 0.2 });
      gsap.set("[data-blackout]", { autoAlpha: 0 });
      gsap.set("[data-vignette]", { autoAlpha: 1 });

      /* ---- 0.0–0.9 ロゴが結像する ---- */
      tl.addLabel("logo", 0).to(
        "[data-logo]",
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "brandOut",
        },
        "logo",
      );

      /* ---- 0.9–1.5 瞬き ----
         人間の瞬目は「閉じが速く、開きが遅い」。同じeaseで往復させない。 */
      tl.addLabel("blink", 0.95)
        .to("[data-lid]", { scaleY: 1, duration: 0.09, ease: "power3.in" }, "blink")
        .to(
          "[data-lid]",
          { scaleY: 0, duration: 0.16, ease: "power2.out" },
          "blink+=0.14",
        );

      /* ---- 1.5–3.6 目の中へ入る ----
         ロゴ内の目を原点に据えて指数的に拡大する。
         easeは brandDive(最後まで加速し続ける)。減速させると"止まって見え"、
         入っていく感覚が消えるため、ここだけは他と違うカーブを使う。 */
      tl.addLabel("dive", 1.5)
        .to(
          "[data-logo]",
          { scale: 42, duration: 2.1, ease: "brandDive" },
          "dive",
        )
        // 速度線。中心から放射状に流れて速さを可視化する
        .to(
          "[data-streak]",
          { autoAlpha: 0.55, scale: 3.4, duration: 1.5, ease: "power2.in" },
          "dive+=0.25",
        )
        // 拡大でロゴの粗が出る前に、瞳の闇へ意識を移す
        .to(
          "[data-logo]",
          { filter: "blur(14px)", duration: 1.2, ease: "power2.in" },
          "dive+=0.7",
        )
        // 瞳(暗部)が画面を飲み込む
        .to(
          "[data-pupil]",
          { autoAlpha: 1, scale: 9, duration: 1.4, ease: "power2.in" },
          "dive+=0.6",
        )
        .to(
          "[data-vignette]",
          { autoAlpha: 0, duration: 0.8, ease: "power1.out" },
          "dive+=0.2",
        );

      /* ---- 3.6–4.6 瞳の闇を抜けて雲へ ---- */
      tl.addLabel("through", 3.55)
        .to(
          "[data-blackout]",
          { autoAlpha: 1, duration: 0.35, ease: "power2.in" },
          "through",
        )
        .set(["[data-logo]", "[data-streak]", "[data-pupil]"], { autoAlpha: 0 })
        .set("[data-logo]", { scale: 1 })
        // 雲の谷を手前へ通過する
        .fromTo(
          "[data-cloud-corridor]",
          { autoAlpha: 0, scale: 2.4, yPercent: -14 },
          {
            autoAlpha: 0.95,
            scale: 1,
            yPercent: 10,
            duration: 1.5,
            ease: "power1.out",
          },
          "through+=0.3",
        )
        .to(
          "[data-blackout]",
          { autoAlpha: 0, duration: 0.7, ease: "power1.out" },
          "through+=0.35",
        );

      /* ---- 4.6–6.0 雲が晴れHeroへ ---- */
      tl.addLabel("clear", 4.6)
        .fromTo(
          "[data-cloud-in='left']",
          { autoAlpha: 0, xPercent: -12, scale: 1.2 },
          {
            autoAlpha: 1,
            xPercent: 0,
            scale: 1,
            duration: 0.7,
            ease: "brandInOut",
          },
          "clear",
        )
        .fromTo(
          "[data-cloud-in='right']",
          { autoAlpha: 0, xPercent: 12, scale: 1.2 },
          {
            autoAlpha: 1,
            xPercent: 0,
            scale: 1,
            duration: 0.7,
            ease: "brandInOut",
          },
          "clear",
        )
        .to(
          "[data-cloud-whiteout]",
          { autoAlpha: 0.9, duration: 0.5, ease: "power2.in" },
          "clear+=0.2",
        )
        // 雲が晴れる合図。Heroの入場はここから始まる(幕の下で終わらせない)
        .add(() => markOpeningDone(), "clear+=0.5")
        .to(
          root.current,
          { autoAlpha: 0, duration: 0.75, ease: "power2.inOut" },
          "clear+=0.55",
        );

      tl.totalDuration(TOTAL);

      // 開発時のみ、各ビートを任意の時刻へシークして確認できるようにする
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

  // 完了後はDOMから外す。合成レイヤーを残さない。
  if (!mounted) return null;

  return (
    <div
      ref={root}
      data-opening
      className="fixed inset-0 z-[100] overflow-hidden bg-void"
    >
      <div aria-hidden className="absolute inset-0">
        {/* 舞台。目を原点に、ここごと拡大して「中へ入る」 */}
        <div data-stage className="absolute inset-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              data-logo
              className="relative w-[min(74vw,600px)]"
              style={{ aspectRatio: "1536 / 1085", willChange: "transform, filter" }}
            >
              <Image
                src="/logo2.PNG"
                alt=""
                fill
                sizes="(max-width: 768px) 74vw, 600px"
                priority
                className="art-blend object-contain"
              />
              {/*
                瞼。ロゴの目は「白い眼球＋黒い虹彩」が白い顔面に埋まった構造のため、
                瞼は顔と同じ白で虹彩を覆うと閉じて見える(黒を被せると顔に穴が空く)。
              */}
              <span
                data-lid
                className="absolute rounded-full bg-ink"
                style={{ left: "46%", width: "15%", top: "41%", height: "13%" }}
              />
            </div>
          </div>

          {/* 瞳の闇。進入先。目の位置に置く */}
          <div
            data-pupil
            className="absolute h-[14vmin] w-[14vmin] rounded-full"
            style={{
              left: "var(--eye-x, 50%)",
              top: "var(--eye-y, 50%)",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, #000 38%, rgba(0,0,0,0.85) 62%, transparent 100%)",
            }}
          />
        </div>

        {/* 速度線。目に向かって吸い込まれる流れ */}
        <div
          data-streak
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at var(--eye-x,50%) var(--eye-y,50%), rgba(255,255,255,0.09) 0deg 1.1deg, transparent 1.1deg 5deg)",
            maskImage:
              "radial-gradient(circle at var(--eye-x,50%) var(--eye-y,50%), transparent 5%, #000 30%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(circle at var(--eye-x,50%) var(--eye-y,50%), transparent 5%, #000 30%, transparent 78%)",
          }}
        />

        <CloudLayers />

        {/* 覗いている状態を作る周辺減光。引き込みに合わせて消える */}
        <div
          data-vignette
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at var(--eye-x,50%) var(--eye-y,50%), transparent 20%, rgba(0,0,0,0.82) 60%, #000 90%)",
          }}
        />

        {/* 瞳の内側の闇 */}
        <div data-blackout className="absolute inset-0 bg-void" />
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
