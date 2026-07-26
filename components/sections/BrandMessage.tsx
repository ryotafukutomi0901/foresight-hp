"use client";

import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { BRAND_MESSAGE } from "@/lib/content";

/*
 * BRAND MESSAGE — サービス説明ではなく「視点」の提示。
 * 余白と文字が主役。状態の列挙は仕様ではなく断章として、
 * 読み手に考える間を与える速度で1行ずつ置いていく。
 */
export default function BrandMessage() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions?.reduced) return;

        gsap
          .timeline({ scrollTrigger: { trigger: scope.current, ...REVEAL_TRIGGER } })
          .from("[data-bm-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.4,
            ease: "brandInOut",
          })
          .from(
            "[data-bm-word]",
            {
              yPercent: 110,
              duration: 1.1,
              ease: "brandOut",
              stagger: 0.09,
            },
            "-=1.1",
          )
          .from(
            "[data-bm-sub]",
            { autoAlpha: 0, y: 22, duration: 0.9, ease: "brandOut" },
            "-=0.6",
          );

        gsap.from("[data-bm-body]", {
          autoAlpha: 0,
          y: 20,
          duration: 1.1,
          ease: "brandOut",
          scrollTrigger: {
            trigger: "[data-bm-body]",
            start: "top 88%",
            once: true,
          },
        });
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="section-y relative bg-base"
    >
      <div className="container-x">
        <div className="flex items-center gap-5">
          <span id="philosophy-heading" className="label text-ink">
            {BRAND_MESSAGE.label}
          </span>
          <span
            data-bm-rule
            aria-hidden
            className="h-px flex-1 origin-left bg-rule-strong"
          />
        </div>

        {/* 大型ラテン。単語ごとにマスクを解いていく */}
        <h2 className="mt-16 font-latin text-display-l font-semibold leading-[1.05] tracking-[-0.01em] text-ink">
          {BRAND_MESSAGE.headline.split(" ").map((word) => (
            <span key={word} className="line-mask">
              <span data-bm-word className="block">
                {word}
              </span>
            </span>
          ))}
        </h2>

        <p
          data-bm-sub
          className="mt-12 max-w-lg text-body-l leading-loose text-ink-soft"
        >
          {BRAND_MESSAGE.sub[0]}
          <br />
          {BRAND_MESSAGE.sub[1]}
        </p>

        <p
          data-bm-body
          className="mt-24 max-w-xl text-sm leading-loose text-ink-soft"
        >
          {BRAND_MESSAGE.body}
        </p>
      </div>
    </section>
  );
}
