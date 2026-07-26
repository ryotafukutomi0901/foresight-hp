"use client";

import CtaButton from "@/components/ui/CtaButton";
import SectionHead from "@/components/ui/SectionHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { BUY } from "@/lib/content";

/*
 * BUY — サイト内で最も強い行動セクション。
 *
 * モーションの狙い: 「走れなくても、終わりじゃない」を運動で語る。
 * 見出しは重い ease(brandHeavy) で下から立ち上がり、
 * 中核の一行「動かないなら、取りに行く。」だけは別のease・別の速度で
 * 突出させ、セクション内に一段強い階層を作る。
 *
 * 「高価買取」「無料査定」「即日対応」のようなテンプレート表現は使わない。
 */
export default function Buy() {
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
          .from(
            "[data-buy-line]",
            {
              yPercent: 115,
              duration: 1.25,
              ease: "brandHeavy",
              stagger: 0.11,
            },
            "-=0.9",
          )
          .from(
            "[data-buy-body]",
            { autoAlpha: 0, y: 22, duration: 0.9, ease: "brandOut" },
            "-=0.7",
          );

        // 断章は畳みかけるリズムで
        gsap.from("[data-buy-fragment]", {
          autoAlpha: 0,
          x: -14,
          duration: 0.6,
          ease: "brandOut",
          stagger: 0.09,
          scrollTrigger: {
            trigger: "[data-buy-fragments]",
            start: "top 84%",
            once: true,
          },
        });

        // 中核の一行。他とは違う速度と余韻で突出させる
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "[data-buy-core]",
              start: "top 80%",
              once: true,
            },
          })
          .from("[data-buy-core-line]", {
            yPercent: 118,
            duration: 1.5,
            ease: "brandOut",
            stagger: 0.16,
          })
          .from(
            "[data-buy-core-rule]",
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.2,
              ease: "brandInOut",
            },
            "-=1.1",
          );
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="buy"
      aria-labelledby="buy-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <SectionHead index={BUY.index} label={BUY.label} id="buy-heading" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <h2 className="text-display-l font-normal leading-[1.22] text-ink">
            {BUY.headline.map((line) => (
              <span key={line} className="line-mask">
                <span data-buy-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div className="flex flex-col justify-end">
            {/* 状態の断章。仕様表ではなく、畳みかける短文として置く */}
            <ul data-buy-fragments className="flex flex-wrap gap-x-6 gap-y-2">
              {BUY.fragments.map((f) => (
                <li
                  key={f}
                  data-buy-fragment
                  className="text-body-l font-normal text-ink-soft"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p
              data-buy-body
              className="mt-8 text-sm leading-loose text-ink-soft"
            >
              {BUY.body}
            </p>
          </div>
        </div>

        {/* 中核の一行。前後に大きな余白を取り、単独で立たせる */}
        <div data-buy-core className="mt-32 sm:mt-44">
          <span
            data-buy-core-rule
            aria-hidden
            className="mb-12 block h-px w-full origin-left bg-rule-strong"
          />
          <p className="text-display-l font-normal leading-[1.2] text-ink">
            {BUY.core.map((line) => (
              <span key={line} className="line-mask">
                <span data-buy-core-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>
          <p className="mt-10 text-body-l text-ink-soft">{BUY.bridge}</p>

          <div className="mt-14">
            <CtaButton href={BUY.cta.href}>{BUY.cta.label}</CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
