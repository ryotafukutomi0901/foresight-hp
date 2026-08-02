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
 * 右半分の車両は Higgsfield で生成した動画(public/video/hero-vehicle.mp4)。
 * Openingの白が引くのに合わせて右からスライドインし、以後は
 * カメラがゆっくり回り込み続ける。静止画では出せない「生きている」感を作る。
 *
 * 文言は動画に焼き込まず、すべてここで描く。
 * 文言変更・多言語化を動画の再生成なしに行えるようにするため。
 *
 * 入場は Opening の完了合図で再生する。即再生すると幕の下で
 * 演出が終わってしまい、幕が上がったときには静止画になる。
 */
export default function Hero() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    const tl = gsap.timeline({ id: "hero-intro", paused: !reduced });

    /*
     * 車両の動画が右からスライドインする。
     * テキストより僅かに先行させ、車→文字の順で視線を運ぶ。
     */
    const clip = scope.current?.querySelector<HTMLVideoElement>(
      "[data-hero-video]",
    );
    if (clip) {
      tl.fromTo(
        clip,
        { xPercent: 55, autoAlpha: 0 },
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 1.5,
          ease: "brandOut",
          onStart: () => {
            if (!reduced) void clip.play();
          },
        },
        0,
      );
    }

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
        右半分の車両。Openingの光が引くのに合わせて右からスライドインする。
        object-contain で全景を保つ(cover だと車体が切れる)。
        mix-blend-screen で黒地を透過させ、背景の霧と馴染ませている。
        lg未満では文字と重なるため、背景として薄く敷くに留める。
      */}
      <video
        data-hero-video
        aria-hidden
        /*
         * 動画は16:9。要素の比率をこれに合わせないと object-contain で
         * 上下に余白ができ、その黒地が矩形の縁として見える(実測)。
         * aspect-video で一致させ、高さは幅から決まるようにする。
         */
        className="pointer-events-none absolute right-0 top-1/2 aspect-video w-[96%] -translate-y-1/2 opacity-30 mix-blend-screen lg:-right-[4%] lg:w-[62%] lg:opacity-100"
        style={{
          /*
           * 縁を放射状に溶かす。動画の黒地は完全な0ではないため
           * mix-blend-screen だけでは矩形が枠として見える(実測)。
           * マスクで四辺を落として背景の霧に馴染ませる。
           */
          maskImage:
            "radial-gradient(ellipse 74% 68% at 50% 50%, #000 62%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 74% 68% at 50% 50%, #000 62%, transparent 100%)",
        }}
        src="/video/hero-vehicle.mp4"
        muted
        loop
        playsInline
        preload="auto"
      />
      {/*
        container-x(最大1440px・中央寄せ)は保ったまま、その内側で
        テキストを左半分に閉じ込める。車両(3D)は右半分に着地するため、
        ここを狭めないと文字と車が重なる(実測)。
        lg未満は車両が背景へ回るので全幅で読ませる。
      */}
      <div className="container-x relative z-10">
        <div className="lg:max-w-[52%]">
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
