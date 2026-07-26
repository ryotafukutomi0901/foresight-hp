"use client";

import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { UNSEEN } from "@/lib/content";

/*
 * SCENE 04 — THE UNSEEN
 *
 * 「不動車。事故車。長年乗り続けた車。価値がわからない車。」を
 * リストではなく、一語ずつ視界に結んでは霧へ戻る体験として見せる。
 *
 * 語の出方: blur → sharp → 短い静止 → blur → 消失 → 次の語へ。
 * 単純なopacityフェードにしないのは、「出現する」のではなく
 * 「見えるようになる」という体験にしたいため。
 *
 * 実装はセクションをpinし、1本のタイムラインをスクロールにscrubする。
 * 語ごとにScrollTriggerを作ると境界がずれて語が重なるため、1本に集約している。
 */
export default function Unseen() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
        mobile: "(max-width: 767px)",
      },
      (ctx) => {
        const { reduced, mobile } = ctx.conditions as Record<string, boolean>;

        const words = gsap.utils.toArray<HTMLElement>("[data-unseen-word]");
        const closing = "[data-unseen-closing]";

        // 動きを減らす設定では、全語を静的に積んで読めるようにする
        if (reduced) {
          gsap.set(words, {
            autoAlpha: 1,
            filter: "none",
            position: "relative",
            y: 0,
          });
          gsap.set(closing, { autoAlpha: 1, filter: "none", y: 0 });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            // 語数 × 1画面弱。モバイルは短くする。
            end: mobile ? "+=280%" : "+=380%",
            pin: true,
            pinSpacing: true,
            scrub: true,
          },
        });

        // 1語 = タイムライン上の1単位
        words.forEach((word, i) => {
          tl.fromTo(
            word,
            { autoAlpha: 0, filter: "blur(20px)", y: 22 },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.34,
              ease: "none",
            },
            i,
          ).to(
            word,
            {
              autoAlpha: 0,
              filter: "blur(16px)",
              y: -16,
              duration: 0.28,
              ease: "none",
            },
            i + 0.72,
          );
        });

        // 4語を見せ切ったあとに立ち上がる結び
        tl.fromTo(
          closing,
          { autoAlpha: 0, filter: "blur(14px)", y: 26 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.45,
            ease: "none",
          },
          words.length - 0.1,
        );
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      aria-labelledby="unseen-heading"
      className="relative flex h-[100svh] w-full items-center overflow-hidden"
    >
      <h2 id="unseen-heading" className="sr-only">
        {UNSEEN.a11yHeading}
      </h2>

      <div className="container-x relative w-full">
        {/* 語は重ねて置き、1画面に1語だけが見えるようにする */}
        <div className="relative min-h-[8rem] sm:min-h-[11rem]">
          {UNSEEN.words.map((w) => (
            <p
              key={w}
              data-unseen-word
              className="absolute inset-x-0 top-0 text-display-l font-normal leading-[1.2] text-ink-soft"
            >
              {w}
            </p>
          ))}
        </div>

        <p
          data-unseen-closing
          className="mt-16 text-display-m font-normal leading-[1.3] text-ink"
        >
          <span aria-hidden className="mr-4 text-ink-faint">
            ———
          </span>
          {UNSEEN.closing}
        </p>
      </div>
    </section>
  );
}
