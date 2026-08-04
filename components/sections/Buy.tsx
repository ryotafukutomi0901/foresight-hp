"use client";

import CtaButton from "@/components/ui/CtaButton";
import ChapterHead from "@/components/ui/ChapterHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { REVEAL_TRIGGER } from "@/lib/motion";
import { BUY } from "@/lib/content";

/*
 * BUY — 中古車販売。お客様が「買う」セクション。ポータルサイトの大量カードUIにはしない。
 * 実在の在庫データが無いため車両一覧は作らない(存在しない情報を作らない)。
 *
 * モーションの狙い: 「渡す」という行為の身体化。
 * 要素が左から右へ引き継がれるように出現する。
 * モバイルでは横移動が破綻するため、縦方向の受け渡しに置き換える。
 */
export default function Buy() {
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
            "[data-buy-line]",
            { yPercent: 115, duration: 1.15, ease: "brandOut", stagger: 0.1 },
            "-=0.95",
          )
          .from(
            "[data-buy-lead]",
            { autoAlpha: 0, y: 20, duration: 0.9, ease: "brandOut", stagger: 0.1 },
            "-=0.7",
          );

        /*
         * 積み重ねる各枚は、自分が画面に入るときに個別に立ち上がる。
         * まとめてstaggerで出すと、下敷きになる枚まで先に animate され、
         * 重なった状態で見えてしまう。
         */
        gsap.utils.toArray<HTMLElement>("[data-buy-step]").forEach((step) => {
          gsap.from(step, {
            autoAlpha: 0,
            y: desktop ? 32 : 22,
            duration: 0.9,
            ease: "brandOut",
            scrollTrigger: { trigger: step, start: "top 88%", once: true },
          });
        });
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      data-chapter="buy"
      id="buy"
      aria-labelledby="buy-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <ChapterHead
          index={BUY.index}
          label={BUY.label}
          id="buy-heading"
          plain={BUY.plain}
          services={BUY.services}
        />

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
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
            <p
              data-buy-lead
              className="text-display-s font-normal leading-relaxed text-ink"
            >
              {BUY.lead[0]}
              <br />
              {BUY.lead[1]}
            </p>
            <p
              data-buy-lead
              className="mt-8 text-sm leading-[2.2] text-ink-soft"
            >
              {BUY.body}
            </p>
          </div>
        </div>

        {/*
          在庫一覧の代わりに「渡すまでの姿勢」を置く。
          将来、実在庫を掲載する場合もここを拡張し、
          ポータル型の大量カードUIは採らない。
        */}
        <div className="mt-20 sm:mt-24">
        {/*
          手順を**stickyで積み重ねる**。

          横に3枚並べると一目で終わってしまい、
          「一台ずつ手をかけている」という話が伝わらない。
          1枚ずつ画面に留まると、それぞれに滞在時間が生まれる。
          リファレンス(izanami)のProjectsと同じ構造。
        */}
        <ol data-buy-steps className="relative z-10">
          {BUY.steps.map((step) => (
            <li
              key={step.n}
              data-buy-step
              className="sticky top-[22vh] border-t border-rule-strong bg-[#131318] pb-24 pt-10 sm:pb-32 sm:pt-12"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-baseline sm:gap-12">
                <span className="label shrink-0 text-ink-faint">{step.n}</span>
                <div>
                  <h3 className="text-display-m font-normal text-ink">
                    {step.t}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-[2.2] text-ink-soft">
                    {step.d}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

          {/* 章の結び。Sell/Findと同じく罫線を全幅に引いてから置く */}
          <div className="mt-20">
            <span aria-hidden className="mb-12 block h-px w-full bg-rule-strong" />
            <CtaButton href={BUY.cta.href} variant="secondary">
              {BUY.cta.label}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
