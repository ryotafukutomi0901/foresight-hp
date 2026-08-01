"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/hooks/useGsap";
import { registerBrandEases } from "@/lib/motion";
import {
  markOpeningDone,
  markOpeningSeen,
  shouldPlayOpening,
} from "@/lib/sequence";
import { openingStage, settleOpeningStage } from "@/lib/openingStage";
import { BRAND } from "@/lib/content";

/*
 * OPENING v3 — ローディングからHeroまでの一気通貫
 *
 * 「幕を降ろして、上げたらHeroだった」ではなく、
 * ローディングで結像した車両が、そのままHeroの背景として残り続ける。
 * 幕が落ちるのではなく、幕そのものがHeroになる。
 *
 *  0.0–0.6  闇。粒だけがわずかに息づく
 *  0.6–2.0  正面カットが闇から結像（ディザの粒度 粗→細）
 *  2.0–3.6  アングルが巡る。正面→斜め前→真横→背面→斜め前へ戻る
 *  3.6–4.4  斜め前で静止し、カメラが引いてHeroの定位置へ収まる
 *  4.4–5.2  ロゴがヘッダーへ着地。テキスト幕だけが消え、
 *           車両は画面に残ったままHeroへ引き継がれる
 *
 * 車両の描画は R3F 側(components/three/VehicleReveal.tsx)が担当する。
 * ここは lib/openingStage.ts の値をGSAPで動かすだけで、
 * 描画そのものには関与しない。DOMと3Dの責務を分けている。
 *
 * ⚠️ 3Dは prefers-reduced-motion で起動しない(AtmosphereMount)。
 *    その場合ここも演出を行わず、即座に完了扱いにする。
 */

const TOTAL = 5.2;

export default function OpeningSequence() {
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerBrandEases();

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced || !shouldPlayOpening()) {
        // 車両は最終状態(Heroの定位置)で静止させ、幕は出さない
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
      const brand = root.current?.querySelector("[data-opening-brand]");
      const tagline = root.current?.querySelector("[data-opening-tagline]");
      const logoWrap = root.current?.querySelector("[data-opening-logo]");
      if (!curtain || !brand || !tagline || !logoWrap) return;

      /* ---- 初期状態 ---- */
      Object.assign(openingStage, {
        reveal: 0,
        focus: 0,
        spin: 0,
        dolly: 0,
      });
      gsap.set(brand, { autoAlpha: 0, y: 10 });
      gsap.set(tagline, { autoAlpha: 0, y: 8 });
      gsap.set(logoWrap, { autoAlpha: 0, scale: 0.94 });

      const tl = gsap.timeline({ onComplete: finish });

      /* ---- 0.0–0.6 闇 ----
         何も起きない時間を意図的に置く。ここで呼吸が整う。 */
      tl.addLabel("silence", 0);

      /* ---- 0.6–2.0 結像 ----
         粒が集まって車が像を結ぶ。reveal(不透明度)より
         focus(粒の収束)をわずかに遅らせると、
         「輪郭が先に出て、後からディテールが定まる」順序になる。 */
      tl.addLabel("form", 0.6)
        .to(
          openingStage,
          { reveal: 1, duration: 1.1, ease: "brandOut" },
          "form",
        )
        .to(
          openingStage,
          { focus: 1, duration: 1.6, ease: "power2.out" },
          "form+=0.2",
        )
        // ブランド名は車の結像に少し遅れて出す
        .to(
          brand,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "brandOut" },
          "form+=0.5",
        );

      /* ---- 2.0–3.6 アングルが巡る ----
         等間隔でない素材なので、linearだと切り替えの粗さが目立つ。
         inOutで入りと終わりを丸め、「巡って落ち着く」運動にする。 */
      tl.addLabel("orbit", 2.0)
        .to(
          openingStage,
          { spin: 1, duration: 1.6, ease: "brandInOut" },
          "orbit",
        )
        .to(
          tagline,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "brandOut" },
          "orbit+=0.3",
        );

      /* ---- 3.6–4.4 Heroの定位置へ引く ----
         ここで車両はHeroの背景としての位置・大きさに収まる。
         この後もう動かない。 */
      tl.addLabel("settle", 3.6)
        .to(
          openingStage,
          { dolly: 1, duration: 1.5, ease: "brandOut" },
          "settle",
        )
        // 文字は退場。車両だけが残る
        .to(
          [brand, tagline],
          {
            autoAlpha: 0,
            y: -12,
            duration: 0.5,
            ease: "power2.in",
            stagger: 0.06,
          },
          "settle+=0.1",
        )
        // ロゴが中央に結像してからヘッダーへ向かう
        .to(
          logoWrap,
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: "brandOut" },
          "settle+=0.35",
        );

      /* ---- 4.4–5.2 ロゴ着地 + 幕の解除 ----
         幕は元から透明で、持っているのは文字とロゴだけ。
         ロゴがヘッダーへ着いたら幕を畳む。車両は3D側に残るため、
         ここで画面から消えるものは何も無い。 */
      tl.addLabel("handoff", 4.4)
        .add(() => {
          const from = root.current?.querySelector<HTMLElement>(
            "[data-opening-logo]",
          );
          const to = document.querySelector<HTMLElement>("[data-header-logo]");
          if (!from || !to) return;

          const fromRect = from.getBoundingClientRect();
          const toRect = to.getBoundingClientRect();
          const dx =
            toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
          const dy =
            toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

          gsap.to(from, {
            x: dx,
            y: dy,
            scale: toRect.width / fromRect.width,
            duration: 0.6,
            ease: "brandOut",
          });
        }, "handoff")
        // Heroのテキスト入場と重ねる
        .add(() => markOpeningDone(), "handoff+=0.2")
        .to(
          curtain,
          { autoAlpha: 0, duration: 0.3, ease: "power1.out" },
          "handoff+=0.45",
        );

      tl.totalDuration(TOTAL);

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __openingTl?: gsap.core.Timeline }).__openingTl =
          tl;
      }

      /* ---- ポインタ追従（車両の微細な視差） ---- */
      const onPointer = (e: PointerEvent) => {
        openingStage.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
        openingStage.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      /* ---- スキップ ----
         車両は最終状態へ送る。スキップしても
         「Heroに車が居る」状態は保たれなければならない。 */
      const skip = () => {
        tl.pause();
        gsap.to(openingStage, {
          reveal: 1,
          focus: 1,
          spin: 1,
          dolly: 1,
          duration: 0.4,
          ease: "power2.out",
        });
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
        window.removeEventListener("pointermove", onPointer);
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
      className="fixed inset-0 z-[100] overflow-hidden"
      /*
       * 地は透明。車両は背後の3D空間が描いており、
       * 不透明な幕を敷くと隠れてしまう(実測で確認)。
       * 暗さは3D側のフォグとビネットが既に作っているため、
       * ここで黒を重ねる必要はない。
       */
      style={{ backgroundColor: "transparent" }}
    >
      {/*
        幕はテキストとロゴだけを持つ。車両は背後の3D空間が描いている。
        幕の地を透明にすれば、そのまま車両が見える構造にしてある。
      */}
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <p
          data-opening-brand
          className="text-ink-strong"
          style={{
            fontFamily: "var(--font-latin)",
            fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
            fontWeight: 600,
            letterSpacing: "0.32em",
            textIndent: "0.32em",
            willChange: "opacity, transform",
          }}
        >
          {BRAND.name.toUpperCase()}
        </p>

        <p
          data-opening-tagline
          className="mt-6 text-ink-soft"
          style={{
            fontFamily: "var(--font-jp)",
            fontSize: "clamp(0.8125rem, 1.5vw, 1.0625rem)",
            letterSpacing: "0.2em",
            willChange: "opacity, transform",
          }}
        >
          {BRAND.core}
        </p>

        {/* ロゴマーク: 最後にヘッダーへ着地する */}
        <div
          data-opening-logo
          className="art-blend absolute bg-white"
          style={{
            width: "min(40vw, 220px)",
            aspectRatio: "1536 / 1085",
            willChange: "transform, opacity",
          }}
        >
          <Image
            src="/logo2.svg"
            alt=""
            fill
            sizes="(max-width: 768px) 40vw, 220px"
            priority
            className="object-contain"
          />
        </div>
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
