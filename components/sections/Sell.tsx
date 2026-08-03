"use client";

import CtaButton from "@/components/ui/CtaButton";
import SectionHead from "@/components/ui/SectionHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { useVehicleSegment } from "@/hooks/useVehicleTimeline";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { SELL } from "@/lib/content";

/*
 * SELL — 買取。お客様が「売る」セクション。サイト内で最も強い行動セクション。
 *
 * モーションの狙い: 「走れなくても、終わりじゃない」を運動で語る。
 * 見出しは重い ease(brandHeavy) で下から立ち上がり、
 * 中核の一行「動かないなら、取りに行く。」だけは別のease・別の速度で
 * 突出させ、セクション内に一段強い階層を作る。
 *
 * 「高価買取」「無料査定」「即日対応」のようなテンプレート表現は使わない。
 */
export default function Sell() {
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
            "[data-sell-line]",
            {
              yPercent: 115,
              duration: 1.25,
              ease: "brandHeavy",
              stagger: 0.11,
            },
            "-=0.9",
          )
          .from(
            "[data-sell-body]",
            { autoAlpha: 0, y: 22, duration: 0.9, ease: "brandOut" },
            "-=0.7",
          );

        // 断章は畳みかけるリズムで
        gsap.from("[data-sell-fragment]", {
          autoAlpha: 0,
          x: -14,
          duration: 0.6,
          ease: "brandOut",
          stagger: 0.09,
          scrollTrigger: {
            trigger: "[data-sell-fragments]",
            start: "top 84%",
            once: true,
          },
        });

        // 中核の一行。他とは違う速度と余韻で突出させる
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "[data-sell-core]",
              start: "top 80%",
              once: true,
            },
          })
          .from("[data-sell-core-line]", {
            yPercent: 118,
            duration: 1.5,
            ease: "brandOut",
            stagger: 0.16,
          })
          .from(
            "[data-sell-core-rule]",
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

  /*
   * 車両制御。区間定義は hooks/useVehicleTimeline.ts に集約してある。
   * このセクションは「どの区間か」を宣言するだけで、車両の動きは知らない。
   */
  useVehicleSegment(scope, "sell");

  return (
    <section
      ref={scope}
      id="sell"
      aria-labelledby="sell-heading"
      className="section-y relative min-h-[180vh]"
    >
      {/*
        区間を伸ばした分、コピーが画面外に置き去りにならないよう
        sticky で留める。車両の演出が進む間ずっと同じ位置に在り続ける。
      */}
      <div className="container-x sticky top-[16vh] lg:pl-24">
        <SectionHead index={SELL.index} label={SELL.label} id="sell-heading"
          orientation="vertical"
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <h2 className="text-display-l font-normal leading-[1.22] text-ink">
            {SELL.headline.map((line) => (
              <span key={line} className="line-mask">
                <span data-sell-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <div className="flex flex-col justify-end">
            {/* 状態の断章。仕様表ではなく、畳みかける短文として置く */}
            <ul data-sell-fragments className="flex flex-wrap gap-x-6 gap-y-2">
              {SELL.fragments.map((f) => (
                <li
                  key={f}
                  data-sell-fragment
                  className="text-body-l font-normal text-ink-soft"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p
              data-sell-body
              className="mt-8 text-sm leading-loose text-ink-soft"
            >
              {SELL.body}
            </p>
          </div>
        </div>

        {/* 中核の一行。前後に大きな余白を取り、単独で立たせる */}
        <div data-sell-core className="mt-32 sm:mt-44">
          <span
            data-sell-core-rule
            aria-hidden
            className="mb-12 block h-px w-full origin-left bg-rule-strong"
          />
          <p className="text-display-l font-normal leading-[1.2] text-ink">
            {SELL.core.map((line) => (
              <span key={line} className="line-mask">
                <span data-sell-core-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>
          <p className="mt-10 text-body-l text-ink-soft">{SELL.bridge}</p>

          <div className="mt-14">
            <CtaButton href={SELL.cta.href}>{SELL.cta.label}</CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
