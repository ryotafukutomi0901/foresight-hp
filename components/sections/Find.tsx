"use client";

import CtaButton from "@/components/ui/CtaButton";
import SectionHead from "@/components/ui/SectionHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { useVehicleSegment } from "@/hooks/useVehicleTimeline";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { FIND } from "@/lib/content";

/*
 * FIND — オークション代行。サービス手順の説明にしない。
 * 「まだ見つかっていない車を探しに行く」価値を表現する。
 *
 * モーションの狙い: 「探す・見つける」の身体化。
 * 走査線が画面を横断し、通過した要素がぼやけた状態から解像していく。
 */
export default function Find() {
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
          .timeline({
            scrollTrigger: { trigger: scope.current, ...REVEAL_TRIGGER },
          })
          .from("[data-section-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.3,
            ease: "brandInOut",
          })
          .from(
            "[data-section-head-item]",
            { autoAlpha: 0, y: 10, duration: 0.7, ease: "brandOut", stagger: 0.08 },
            "-=1.2",
          )
          // 走査線が横断する
          .fromTo(
            "[data-find-scan]",
            { scaleX: 0, transformOrigin: "left center", autoAlpha: 1 },
            { scaleX: 1, duration: 1.0, ease: "brandInOut" },
            "-=0.9",
          )
          .to(
            "[data-find-scan]",
            {
              scaleX: 0,
              transformOrigin: "right center",
              duration: 0.8,
              ease: "brandInOut",
            },
            "-=0.15",
          )
          // 走査線の通過後に「見つかる」
          .from(
            "[data-find-line]",
            {
              yPercent: 118,
              duration: 1.1,
              ease: "brandSnap",
              stagger: 0.13,
            },
            "-=1.0",
          )
          .from(
            "[data-find-body]",
            { autoAlpha: 0, y: 22, duration: 0.9, ease: "brandOut", stagger: 0.1 },
            "-=0.6",
          );

        gsap.from("[data-find-core-line]", {
          yPercent: 115,
          duration: 1.3,
          ease: "brandOut",
          stagger: 0.14,
          scrollTrigger: {
            trigger: "[data-find-core]",
            start: "top 82%",
            once: true,
          },
        });
      },
    );
  }, []);

  /*
   * 車両制御。区間定義は hooks/useVehicleTimeline.ts に集約してある。
   * このセクションは「どの区間か」を宣言するだけで、車両の動きは知らない。
   */
  useVehicleSegment(scope, "find");

  return (
    <section
      ref={scope}
      id="find"
      aria-labelledby="find-heading"
      className="section-y relative overflow-hidden"
    >
      <div className="container-x lg:pl-24">
        <SectionHead
          index={FIND.index}
          label={FIND.label}
          id="find-heading"
          orientation="vertical"
        />

        {/* 走査線 */}
        <span
          data-find-scan
          aria-hidden
          className="mt-16 block h-px w-full bg-ink opacity-0"
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <h2 className="text-display-l font-normal leading-[1.22] text-ink">
            {FIND.headline.map((line) => (
              <span key={line} className="line-mask">
                <span data-find-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div className="flex flex-col justify-end">
            <p
              data-find-body
              className="text-display-s font-normal leading-relaxed text-ink"
            >
              {FIND.lead[0]}
              <br />
              {FIND.lead[1]}
            </p>
            <p
              data-find-body
              className="mt-8 text-sm leading-loose text-ink-soft"
            >
              {FIND.body}
            </p>
          </div>
        </div>

        <div data-find-core className="mt-32 sm:mt-40">
          <p className="text-display-m font-normal leading-[1.25] text-ink">
            {FIND.core.map((line) => (
              <span key={line} className="line-mask">
                <span data-find-core-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>

          <div className="mt-14">
            <CtaButton href={FIND.cta.href} variant="secondary">
              {FIND.cta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
