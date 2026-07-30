"use client";

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import SilentGaze from "@/components/sections/SilentGaze";
import { gsap, ScrollTrigger, useScopedGsap } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import { CTA, HERO } from "@/lib/content";
import { ease, heroGaze as G, lerp } from "@/lib/tokens";

/*
 * HERO — 説明ではなく第一印象。
 * 情報は詰め込まない。「この会社は車を普通とは違う視点で見ている」と直感させる。
 *
 * 入場アニメーションはマウント時ではなく、Openingの「雲が晴れる」合図で再生する。
 * 即再生すると雲の下で演出が終わってしまい、静止した画面しか見えなくなる。
 */
export default function Hero() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /*
     * ── Silent Gaze（H-01 / H-05 / H-06）──
     *
     * 線の「見えている区間」を線上の位置 s→e (0〜1) で表す。
     * pathLength=1 で正規化してあるので、dasharray に長さ、
     * dashoffset に開始位置を渡すだけで区間を指定できる。
     *
     *   H-01: s 0.5→0 / e 0.5→1  中央から両端へ伸びる
     *   H-06: s 0→1              左端が右端へ収束して消える
     *
     * この2つを同じ1本のパスで表現できるため、要素を増やさずに済む。
     */
    const line = scope.current?.querySelector<SVGLineElement>("[data-gaze-line]");
    const seg = { s: 0.5, e: 0.5 };

    /*
     * 線の実描画長(px)。dashはスクリーン空間で計算されるため、
     * 0〜1の区間指定をpxへ変換する必要がある。
     * 画面比で線の長さが変わるので resize で測り直す。
     */
    let len = 0;
    const measure = () => {
      if (!line) return;
      const r = line.getBoundingClientRect();
      len = Math.hypot(r.width, r.height);
    };

    const applySeg = () => {
      if (!line || !len) return;
      const visible = Math.max(0, seg.e - seg.s) * len;
      line.setAttribute("stroke-dasharray", `${visible} ${len}`);
      line.setAttribute("stroke-dashoffset", `${-seg.s * len}`);
    };

    measure();
    applySeg();

    const tl = gsap.timeline({ id: "hero-intro", paused: !reduced });

    // H-01 は position 0 に並列で置く。既存の入場モーションの時間関係は変えない。
    tl.to(
      seg,
      {
        s: 0,
        e: 1,
        duration: G.drawDuration,
        ease: ease.inOut,
        onUpdate: applySeg,
      },
      0,
    ).to(
      "[data-gaze]",
      { opacity: G.opacityBase, duration: G.drawDuration, ease: ease.inOut },
      0,
    );

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

    if (reduced) {
      /*
       * 動きを減らす設定では最終状態を即適用する(hero-bible Accessibility)。
       * 線は引かれた状態で静止し、明滅もパララックスも起こさない。
       */
      seg.s = 0;
      seg.e = 1;
      applySeg();
      gsap.set("[data-gaze]", { opacity: G.opacityBase });
      return;
    }

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
     * ── H-05 常時微動 ──
     *
     * 「停止しているが生きている」状態を作る。
     * 気づかない程度に留めること。振幅を上げると装飾に見え、
     * 「視線」という意味論が壊れる(hero-bible)。
     *
     * ⚠️ paused で作り、H-01 の完了後に再生する。
     * delay で待たせてはいけない。入場タイムラインは Opening 完了まで
     * 一時停止しているため、delay はページ読み込みからの経過で消化され、
     * **Opening中に明滅が走ってH-01と不透明度を奪い合う**
     * （実測で振幅が0.06のはずが0.397になった）。
     *
     * opacityBase を平均値として上下に振る（トークンの定義どおり）。
     */
    const pulse = gsap.fromTo(
      "[data-gaze]",
      { opacity: G.opacityBase - G.pulseAmplitude / 2 },
      {
        opacity: G.opacityBase + G.pulseAmplitude / 2,
        duration: G.pulsePeriod / 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
        /*
         * fromTo は生成時に from 値を即適用するため、これが無いと
         * SVGの初期 opacity:0 を上書きしてH-01のフェードインが消える。
         */
        immediateRender: false,
      },
    );
    tl.eventCallback("onComplete", () => pulse.play());

    /*
     * ポインタ追従パララックス。
     * 層ごとに移動量を変えて視差を作る。lerp は camera-bible の
     * lerp.pointer に揃える（Heroだけ違う追従感にしないため）。
     */
    const gazeX = gsap.quickTo("[data-gaze-layer]", "x", {
      duration: lerp.pointer * 4,
      ease: "power2.out",
    });
    const headX = gsap.quickTo("[data-hero-heading]", "x", {
      duration: lerp.pointer * 4,
      ease: "power2.out",
    });

    const onResize = () => {
      measure();
      applySeg();
    };
    window.addEventListener("resize", onResize);

    const onPointer = (e: PointerEvent) => {
      // 画面中央を0とした -1〜1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      gazeX(nx * G.parallaxGaze);
      headX(nx * G.parallaxHeadline);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /*
     * ── H-06 Visionへの受け渡し ──
     *
     * 線が右へ収束して消える。**Visionに入る前に消えていること。**
     * Visionは「霧の中から視界が開く」セクションなので、
     * Heroは視界が閉じた状態で終わる必要がある(閉じてから開く順序)。
     *
     * scrub連動なので ease は linear 固定。easeを掛けるとスクロールと
     * 画面がズレて酔う(design-system #9)。
     */
    const closing = ScrollTrigger.create({
      trigger: scope.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        seg.s = self.progress;
        applySeg();
      },
    });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      closing.kill();
      pulse.kill();
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
        背景はマークを敷かず、常設の3D空間(霧・光条・塵)そのものに見せる。
        静止した図版を置くより、空気が流れている方が没入感が高い。

        Silent Gaze はその上に一本の線だけを重ねる。
        absolute でフローに参加しないため、Heroの高さは1pxも変わらない
        （高さが変わるとpin区間の進行度がズレてVisionのBaselineが壊れる）。
      */}
      <SilentGaze />

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
