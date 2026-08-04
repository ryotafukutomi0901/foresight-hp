"use client";

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import { viewProgress, vehicleSection } from "@/lib/viewProgress";
import { vehicle as V } from "@/lib/tokens";
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
  const scope = useScopedGsap<HTMLElement>(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    /*
     * 車両の初期状態。画面右の暗闇に、シルエットだけが居る。
     * reduced-motion では3D自体が起動しないが、値は最終状態に
     * しておく(静止画的に「停止した車」の状態で辻褄を合わせる)。
     */
    if (reduced) {
      viewProgress.bodyX = V.hero.toX;
      viewProgress.bodyZ = V.hero.toZ;
      viewProgress.bodyRotationY = V.hero.toRotationY;
      viewProgress.headlightIntensity = 1;
      /* 静止画として辻褄が合う姿勢。傾かず、ハンドルは正面 */
      viewProgress.steerAngle = 0;
      viewProgress.bodyRoll = 0;
      viewProgress.bodyPitch = 0;
      viewProgress.cameraX = V.camera.hero.x;
      viewProgress.cameraY = V.camera.hero.y;
      viewProgress.cameraZ = V.camera.hero.z;
      viewProgress.lookAtY = V.camera.hero.lookY;
    } else {
      viewProgress.bodyX = V.hero.fromX;
      viewProgress.bodyZ = V.hero.fromZ;
      viewProgress.bodyRotationY = V.hero.fromRotationY;
      viewProgress.headlightIntensity = 0;
      viewProgress.cameraX = V.camera.hero.x;
      viewProgress.cameraY = V.camera.hero.y;
      viewProgress.cameraZ = V.camera.hero.z;
      viewProgress.lookAtY = V.camera.hero.lookY;
    }
    vehicleSection.current = "hero";

    const tl = gsap.timeline({ id: "hero-intro", paused: !reduced });

    if (!reduced) {
      /*
       * ── 1〜2. 走行 → 3/4ビューで停止 ──
       * 位置と角度を同時に動かす。ease は最後に減速する brandOut で、
       * 「ブレーキをかけながら停まる」挙動になる。
       */
      tl.to(
        viewProgress,
        {
          bodyX: V.hero.toX,
          bodyZ: V.hero.toZ,
          bodyRotationY: V.hero.toRotationY,
          duration: V.hero.driveDuration,
          ease: "brandOut",
        },
        0,
      );

      /*
       * 走行中はタイヤが回る。停止と同時に回転も止まる。
       * ここは Hero 区間なので時間ベースで良い(唯一の例外)。
       * 角度は累積させ、Philosophy以降はスクロールが引き継ぐ。
       */
      tl.to(
        viewProgress,
        {
          wheelAngle: Math.PI * 4,
          duration: V.hero.driveDuration,
          ease: "brandOut",
        },
        0,
      );

      /*
       * ── 2.5. 転舵と制動 ──
       *
       * 右から入ってきて、こちらへ向き直りながら停まる動き。
       * その間ハンドルは切れている。停止と同時に正面へ戻し、
       * ブレーキで前へ沈み込む。
       *
       * ここだけは時間ベースで良い(Hero はサイト唯一の自動再生)。
       * 以降の区間は全てスクロール位置から姿勢を決めている。
       */
      tl.fromTo(
        viewProgress,
        { steerAngle: -V.posture.steerMax, bodyRoll: V.posture.rollPerSteer * V.posture.steerMax },
        {
          steerAngle: 0,
          bodyRoll: 0,
          duration: V.hero.driveDuration,
          ease: "brandOut",
        },
        0,
      );

      /* 制動によるノーズダイブ。沈んで、水平に戻る */
      tl.to(
        viewProgress,
        {
          bodyPitch: V.posture.brakePitch,
          duration: V.hero.dipDuration / 2,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        },
        V.hero.driveDuration - 0.2,
      );

      /*
       * ── 3. サスペンションの沈み込み ──
       * 停止の瞬間に一度だけ沈んで戻る。yoyo で往復させる。
       */
      tl.to(
        viewProgress,
        {
          suspensionDip: 1,
          duration: V.hero.dipDuration / 2,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        },
        V.hero.driveDuration - 0.12,
      );

      /*
       * ── 4. ヘッドライト点灯 ──
       * 停止してから灯る。じわりと立ち上げる。
       */
      tl.to(
        viewProgress,
        {
          headlightIntensity: 1,
          duration: V.hero.headlightDuration,
          ease: "power2.inOut",
        },
        V.hero.driveDuration + 0.1,
      );
    }

    /*
     * ── 5. コピーの出現 ──
     * ヘッドライトが灯り「光がコピーを照らす」タイミングに重ねる。
     * 車両が主役なので、テキストは車の演出に従属させる
     * (CEO指示「テキストは車両演出を補完する役割」)。
     */
    const copyAt = reduced ? 0 : V.hero.driveDuration + 0.45;

    tl.from(
      "[data-hero-line]",
      { yPercent: 115, duration: 1.15, ease: "brandOut", stagger: 0.1 },
      copyAt,
    )
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
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden pb-24 pt-32"
    >
      {/*
        背景に絵を置かない。車両は layout 直下の VehicleScene(3D)が
        描いており、このセクションはその上にテキストを重ねるだけ。
        セクションごとに車両を持たないことで、Hero→Philosophyの
        繋ぎ目が生まれない。
      */}
      <div className="container-x relative z-10">
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
