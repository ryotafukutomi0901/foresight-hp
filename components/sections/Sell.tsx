"use client";

import CtaButton from "@/components/ui/CtaButton";
import SectionHead from "@/components/ui/SectionHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { SELL } from "@/lib/content";

/*
 * SELL — 中古車販売。ポータルサイトの大量カードUIにはしない。
 * 実在の在庫データが無いため車両一覧は作らない(存在しない情報を作らない)。
 *
 * モーションの狙い: 「渡す」という行為の身体化。
 * 要素が左から右へ引き継がれるように出現する。
 * モバイルでは横移動が破綻するため、縦方向の受け渡しに置き換える。
 */
export default function Sell() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { desktop, reduced } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;

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
            { yPercent: 115, duration: 1.15, ease: "brandOut", stagger: 0.1 },
            "-=0.95",
          )
          .from(
            "[data-sell-lead]",
            { autoAlpha: 0, y: 20, duration: 0.9, ease: "brandOut", stagger: 0.1 },
            "-=0.7",
          );

        // 受け渡しの動き。デスクトップは横、モバイルは縦
        gsap.from("[data-sell-step]", {
          autoAlpha: 0,
          x: desktop ? -48 : 0,
          y: desktop ? 0 : 28,
          duration: 1.0,
          ease: "brandOut",
          stagger: 0.18,
          scrollTrigger: {
            trigger: "[data-sell-steps]",
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
      id="sell"
      aria-labelledby="sell-heading"
      // 明転の頂点。地を #FFFFFF まで持ち上げる
      data-tone="light"
      data-tone-surface="raised"
      className="section-y relative"
    >
      <div className="container-x">
        <SectionHead index={SELL.index} label={SELL.label} id="sell-heading" />

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
            <p
              data-sell-lead
              className="text-display-s font-normal leading-relaxed text-ink"
            >
              {SELL.lead[0]}
              <br />
              {SELL.lead[1]}
            </p>
            <p
              data-sell-lead
              className="mt-8 text-sm leading-loose text-ink-soft"
            >
              {SELL.body}
            </p>
          </div>
        </div>

        {/*
          在庫一覧の代わりに「渡すまでの姿勢」を置く。
          将来、実在庫を掲載する場合もここを拡張し、
          ポータル型の大量カードUIは採らない。
        */}
        <ol
          data-sell-steps
          className="mt-28 grid gap-px border border-rule bg-rule sm:grid-cols-3"
        >
          {SELL.steps.map((step) => (
            <li
              key={step.n}
              data-sell-step
              className="flex flex-col gap-4 bg-base p-8 sm:p-10"
            >
              <span className="label text-ink-faint">{step.n}</span>
              <h3 className="text-display-s font-normal text-ink">{step.t}</h3>
              <p className="text-sm leading-loose text-ink-soft">{step.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <CtaButton href={SELL.cta.href} variant="secondary">
            {SELL.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
