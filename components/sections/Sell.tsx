"use client";

import CtaButton from "@/components/ui/CtaButton";
import ChapterHead from "@/components/ui/ChapterHead";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
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

        /*
         * 断章を**同じ位置で1語ずつ入れ替える**。
         *
         * ═══════════════════════════════════════════════════════
         *  横に並べると6語が一目で入り、読み飛ばされる。
         *  同じ場所で切り替えると、1語ずつ順に読むしかなくなる。
         *  「不動車」「事故車」…と挙げていく畳みかけが、
         *  リストではなく体験として届く。
         *
         *  区間をピン留めしてスクロール量を語数に割り当てる。
         *  scrub なので、戻せば逆順に巻き戻る。
         * ═══════════════════════════════════════════════════════
         */
        const fragments = gsap.utils.toArray<HTMLElement>("[data-sell-fragment]");

        /*
         * ピン留めはしない。
         *
         * 最初は pin:true で画面に留める案を試したが、この要素は
         * 2カラムグリッドの中にあり、pin-spacing が列の高さを狂わせて
         * 章の下に数百pxの空白ができた(実測)。
         *
         * ピンなしでも、区間を長めに取って scrub すれば
         * 「1語ずつしか読めない」効果は十分に出る。
         */
        const fragTl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-sell-fragments]",
            start: "top 78%",
            end: "bottom 15%",
            scrub: 0.6,
          },
        });

        fragments.forEach((word, i) => {
          fragTl
            .fromTo(
              word,
              { autoAlpha: 0, filter: "blur(18px)", y: 20 },
              {
                autoAlpha: 1,
                filter: "blur(0px)",
                y: 0,
                duration: 0.34,
                ease: "none",
              },
              i,
            )
            /* 最後の1語だけは消さずに残す。次の本文へ繋ぐ足場になる */
            .to(
              word,
              {
                autoAlpha: i === fragments.length - 1 ? 1 : 0,
                filter: i === fragments.length - 1 ? "blur(0px)" : "blur(14px)",
                y: i === fragments.length - 1 ? 0 : -14,
                duration: 0.28,
                ease: "none",
              },
              i + 0.72,
            );
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

  return (
    <section
      ref={scope}
      data-chapter="sell"
      id="sell"
      aria-labelledby="sell-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <ChapterHead
          index={SELL.index}
          label={SELL.label}
          id="sell-heading"
          plain={SELL.plain}
          services={SELL.services}
        />

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
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
            {/*
              状態の断章。**全て同じ位置に重ねて置く**。
              スクロールに合わせて1語ずつ入れ替わる(上のfragTl)。
              高さは最も背の高い語に合わせて固定し、
              入れ替わりでレイアウトが揺れないようにする。
            */}
            <ul
              data-sell-fragments
              className="relative h-[4.5rem] sm:h-[5.5rem]"
            >
              {SELL.fragments.map((f) => (
                <li
                  key={f}
                  data-sell-fragment
                  className="absolute inset-x-0 top-0 text-display-m font-normal text-ink"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p
              data-sell-body
              className="mt-8 text-sm leading-[2.2] text-ink-soft"
            >
              {SELL.body}
            </p>
          </div>
        </div>

        {/*
          章の結び。罫線をコンテナ全幅に引き、その下に
          「一行 + CTA」を横に並べる。

          以前は max-w-[46rem] の左寄せで、画面の右半分が丸ごと
          空いていた(実測)。罫線を全幅にすると、そこが余白ではなく
          「章の下端」として読める。
        */}
        <div data-sell-core className="mt-28 sm:mt-36">
          <span
            data-sell-core-rule
            aria-hidden
            className="mb-14 block h-px w-full origin-left bg-rule-strong"
          />
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <p className="text-display-l font-normal leading-[1.2] text-ink">
                {SELL.core.map((line) => (
                  <span key={line} className="line-mask">
                    <span data-sell-core-line className="block">
                      {line}
                    </span>
                  </span>
                ))}
              </p>
              <p className="mt-8 text-body-l text-ink-soft">{SELL.bridge}</p>
            </div>

            <div className="shrink-0">
              <CtaButton href={SELL.cta.href}>{SELL.cta.label}</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
