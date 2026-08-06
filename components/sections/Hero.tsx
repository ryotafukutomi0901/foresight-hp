"use client";

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap, ScrollTrigger } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import HeroVideo from "./HeroVideo";
import { CTA, HERO } from "@/lib/content";
import { heroGaze as G, lerp } from "@/lib/tokens";

/*
 * HERO — 車両との最初の出会い。
 *
 * ═══════════════════════════════════════════════════════════════
 *  **サイトで唯一、時間ベースで自動再生される区間。**
 *
 *  Hero以降(Philosophy〜Contact)は全てスクロール連動で、
 *  時間経過だけで進むアニメーションは存在しない。
 *  ここだけは「ユーザーが何もしていない状態で車が走ってくる」
 *  必要があるため、GSAP Timeline で viewProgress を直接tweenする。
 * ═══════════════════════════════════════════════════════════════
 *
 * 演出:
 *   1. 画面右の暗闇から車両が走行して中央へ
 *   2. 3/4フロントビューで停止
 *   3. 停止と同時にサスペンションが僅かに沈む
 *   4. ヘッドライトが徐々に点灯
 *   5. 光が左のコピー領域を照らす(=コピーがフェードイン)
 *
 * 終了時の車両状態(位置・角度・ライト)は viewProgress に残り、
 * そのままPhilosophy区間の開始値になる。リセットしない。
 */
export default function Hero() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /*
     * Hero区間だけスクロールをスナップさせる。
     *
     * ═══════════════════════════════════════════════════════════
     *  「一スクロールでPhilosophyへ飛ぶ」の実装。
     *
     *  snapTo: [0, 1] は「Heroの先頭」か「Heroの終わり(=Philosophyの頭)」
     *  のどちらかにしか止まらないという意味。途中で指を離しても、
     *  近い方へ引き寄せられる。
     *
     *  Observerプラグインを足して自前でホイールを捌く手もあるが、
     *  ScrollSmootherが既にスクロールを掌握しているので、
     *  同じ系統(ScrollTrigger)の中で完結させたほうが競合しない。
     * ═══════════════════════════════════════════════════════════
     *
     * reduced-motion では掛けない。意図しない自動スクロールは
     * 前庭障害のある人にとって最も負担が大きい種類の動きなので。
     */
    if (!reduced) {
      ScrollTrigger.create({
        id: "hero-snap",
        trigger: scope.current,
        start: "top top",
        end: "bottom top",
        snap: {
          snapTo: [0, 1],
          duration: { min: 0.35, max: 0.7 },
          delay: 0.06,
          ease: "brandInOut",
        },
      });
    }

    /*
     * コピーの出現。
     *
     * 車の動きは背景の映像(HeroVideo)が持っているので、ここは
     * 「映像のどこでテキストが現れるか」だけを決める。
     * 映像は 約2.6秒で停止し、その後ヘッドライトが灯る。
     * テキストはその光に合わせて現れる。
     */
    const tl = gsap.timeline({ id: "hero-intro", paused: !reduced });

    tl.from("[data-hero-en]", {
      autoAlpha: 0,
      y: 12,
      duration: 0.9,
      ease: "brandOut",
    }, reduced ? 0 : 2.2)
      .from(
        "[data-hero-line]",
        { yPercent: 110, duration: 1.2, ease: "brandOut", stagger: 0.12 },
        "-=0.5",
      )
      .from(
        "[data-hero-sub]",
        { autoAlpha: 0, y: 20, duration: 1.0, ease: "brandOut" },
        "-=0.7",
      )
      .from(
        "[data-hero-cta]",
        { autoAlpha: 0, y: 18, duration: 0.8, ease: "brandOut", stagger: 0.08 },
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
     * 見出しのポインタ追従。ごく僅かに視差を作る。
     * 車両側には効かせない(車はスクロールだけで動く)。
     */
    const headX = gsap.quickTo("[data-hero-heading]", "x", {
      duration: lerp.pointer * 4,
      ease: "power2.out",
    });

    const onPointer = (e: PointerEvent) => {
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
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden pb-24 pt-32 lg:justify-center"
    >
      {/*
        lg未満: 映像とコピーが同じ画面で重なると、狭い幅では
        スクリムだけでは読めなくなる(実測)。HeroVideo側で
        通常フローのブロックに切り替えており、ここでは並び順が
        そのまま「映像→コピー」の上下2段になる。

        lg以上: HeroVideo が絶対配置の背景に戻るので、
        このコピーだけが実質的な flex item として中央に来る。
      */}
      <HeroVideo />
      <div className="container-x relative z-10 mt-10 lg:mt-0">
        <div className="lg:max-w-[52%]">
          <p data-hero-en className="label text-ink-faint">
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
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
      >
        <span
          data-hero-cue-bar
          className="block h-10 w-px origin-bottom bg-rule-strong"
        />
      </div>
    </section>
  );
}
