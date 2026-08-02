"use client";

import CtaButton from "@/components/ui/CtaButton";
import SectionHead from "@/components/ui/SectionHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { AUCTION } from "@/lib/content";

/*
 * AUCTION — オークション代行。サービス手順の説明にしない。
 * 「まだ見つかっていない車を探しに行く」価値を表現する。
 *
 * モーションの狙い: 「探す・見つける」の身体化。
 * 走査線が画面を横断し、通過した要素がぼやけた状態から解像していく。
 */
export default function Auction() {
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
            "[data-auction-scan]",
            { scaleX: 0, transformOrigin: "left center", autoAlpha: 1 },
            { scaleX: 1, duration: 1.0, ease: "brandInOut" },
            "-=0.9",
          )
          .to(
            "[data-auction-scan]",
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
            "[data-auction-line]",
            {
              yPercent: 118,
              duration: 1.1,
              ease: "brandSnap",
              stagger: 0.13,
            },
            "-=1.0",
          )
          .from(
            "[data-auction-body]",
            { autoAlpha: 0, y: 22, duration: 0.9, ease: "brandOut", stagger: 0.1 },
            "-=0.6",
          );

        gsap.from("[data-auction-core-line]", {
          yPercent: 115,
          duration: 1.3,
          ease: "brandOut",
          stagger: 0.14,
          scrollTrigger: {
            trigger: "[data-auction-core]",
            start: "top 82%",
            once: true,
          },
        });
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="find"
      aria-labelledby="find-heading"
      // 明転の終わり。地を #CFCFCF まで沈め、次のCTA(#090909)へ向かって暗転していく
      className="section-y relative overflow-hidden"
    >
      <div className="container-x lg:pl-24">
        <SectionHead
          index={AUCTION.index}
          label={AUCTION.label}
          id="find-heading"
          orientation="vertical"
        />

        {/* 走査線 */}
        <span
          data-auction-scan
          aria-hidden
          className="mt-16 block h-px w-full bg-ink opacity-0"
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <h2 className="text-display-l font-normal leading-[1.22] text-ink">
            {AUCTION.headline.map((line) => (
              <span key={line} className="line-mask">
                <span data-auction-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div className="flex flex-col justify-end">
            <p
              data-auction-body
              className="text-display-s font-normal leading-relaxed text-ink"
            >
              {AUCTION.lead[0]}
              <br />
              {AUCTION.lead[1]}
            </p>
            <p
              data-auction-body
              className="mt-8 text-sm leading-loose text-ink-soft"
            >
              {AUCTION.body}
            </p>
          </div>
        </div>

        <div data-auction-core className="mt-32 sm:mt-40">
          <p className="text-display-m font-normal leading-[1.25] text-ink">
            {AUCTION.core.map((line) => (
              <span key={line} className="line-mask">
                <span data-auction-core-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>

          <div className="mt-14">
            <CtaButton href={AUCTION.cta.href} variant="secondary">
              {AUCTION.cta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
