"use client";

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import { CTA, HERO } from "@/lib/content";
import { heroGaze as G, lerp } from "@/lib/tokens";

/*
 * HERO — 説明ではなく第一印象。
 * 情報は詰め込まない。「この会社は車を普通とは違う視点で見ている」と直感させる。
 *
 * 背景の車両は Opening から連続して存在し続けている(components/three/VehicleReveal)。
 * Heroが独自に絵を持たないのは、ローディングとの継ぎ目を作らないため。
 * ここが担うのはテキストの入場だけ。
 *
 * 入場は Opening の完了合図で再生する。即再生すると幕の下で
 * 演出が終わってしまい、幕が上がったときには静止画になる。
 */
export default function Hero() {
  const scope = useScopedGsap<HTMLElement>(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const tl = gsap.timeline({ id: "hero-intro", paused: !reduced });

    tl.from("[data-hero-line]", {
      yPercent: 115,
      duration: 1.15,
      ease: "brandOut",
      stagger: 0.1,
    })
      .from(
        "[data-hero-en]",
        { autoAlpha: 0, y: 14, duration: 0.9, ease: "brandOut" },
        "-=0.85",
      )
      .from(
        "[data-hero-sub]",
        { autoAlpha: 0, y: 20, duration: 0.9, ease: "brandOut" },
        "-=0.7",
      )
      .from(
        "[data-hero-cta]",
        {
          autoAlpha: 0,
          y: 18,
          duration: 0.8,
          ease: "brandOut",
          stagger: 0.08,
        },
        "-=0.6",
      )
      .from(
        "[data-hero-cue]",
        { autoAlpha: 0, duration: 0.7, ease: "power1.out" },
        "-=0.4",
      );

    if (reduced) return;

    // スクロールキューの上下動
    gsap.to("[data-hero-cue-bar]", {
      scaleY: 0.3,
      transformOrigin: "50% 100%",
      duration: 1.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    /*
     * 見出しのポインタ追従。背景の車両側も同じポインタで動くが、
     * 振れ幅を変えて視差を作る(車両=大きく / 見出し=わずかに)。
     * lerp は camera-bible の lerp.pointer に揃え、Heroだけ違う
     * 追従感にしない。
     */
    const headX = gsap.quickTo("[data-hero-heading]", "x", {
      duration: lerp.pointer * 4,
      ease: "power2.out",
    });

    const onPointer = (e: PointerEvent) => {
      // 画面中央を0とした -1〜1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      headX(nx * G.parallaxHeadline);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  useEffect(
    () => onOpeningDone(() => gsap.getById("hero-intro")?.play()),
    [],
  );

  return (
    <section
      ref={scope}
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden pb-24 pt-32"
    >
      {/*
        背景に絵を置かない。Openingから連続している3D空間(霧・光条・塵と、
        そこに結像した車両)がそのまま背景になる。
        Heroが独自のビジュアルを持つと、ローディングとの継ぎ目が生まれる。
      */}
      <div className="container-x relative z-10">
        <p
          data-hero-en
          className="label text-ink-faint"
        >
          {HERO.en}
        </p>

        <h1
          id="hero-heading"
          data-hero-heading
          className="mt-8 text-display-xl font-normal tracking-[0.01em] text-ink"
        >
          {HERO.headline.map((line) => (
            <span key={line} className="line-mask">
              <span data-hero-line className="block">
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          data-hero-sub
          className="mt-10 max-w-xl text-body-l leading-loose text-ink-soft"
        >
          {HERO.sub[0]}
          <br />
          {HERO.sub[1]}
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <div data-hero-cta>
            <CtaButton href={CTA.sell.href} className="w-full sm:w-auto">
              {CTA.sell.label}
            </CtaButton>
          </div>
          <div data-hero-cta>
            <CtaButton
              href={CTA.find.href}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {CTA.find.label}
            </CtaButton>
          </div>
        </div>
      </div>

      <div
        data-hero-cue
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="label text-ink-faint">{HERO.scrollCue}</span>
        <span
          data-hero-cue-bar
          className="block h-10 w-px origin-bottom bg-rule-strong"
        />
      </div>
    </section>
  );
}
