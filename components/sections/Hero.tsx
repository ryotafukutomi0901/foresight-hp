"use client";

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import { CTA, HERO } from "@/lib/content";

/*
 * HERO — 説明ではなく第一印象。
 * 情報は詰め込まない。「この会社は車を普通とは違う視点で見ている」と直感させる。
 *
 * 入場アニメーションはマウント時ではなく、Openingの「雲が晴れる」合図で再生する。
 * 即再生すると雲の下で演出が終わってしまい、静止した画面しか見えなくなる。
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
        背景はマークを敷かず、常設の3D空間(霧・光条・塵)そのものに見せる。
        静止した図版を置くより、空気が流れている方が没入感が高い。
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
