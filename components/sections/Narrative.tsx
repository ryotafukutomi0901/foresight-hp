"use client";

import Image from "next/image";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { NARRATIVE } from "@/lib/content";

/*
 * THE NARRATIVE — 10枚のビジュアルによる物語。
 *
 * 「画像を並べる」のではなく「視点が移り変わっていく」体験にする。
 * そのため以下を禁じ手としている:
 *   - カード化・グリッド化(全部を一度に見せると"一覧"になり物語が消える)
 *   - 単純なopacityフェード(出現ではなく"見えるようになる"を作れない)
 *
 * 素材の実寸は267×296pxしかないため、画面いっぱいには引き伸ばさない。
 * 最大でも表示幅520px程度に留め、周囲の黒と余白を主役にする。
 * 結果として「余白が主役」というブランド方針と、素材の限界が一致する。
 */

export default function Narrative() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 768px)",
      },
      (ctx) => {
        const { reduced, desktop } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;

        // 各楽章の見出し
        gsap.utils.toArray<HTMLElement>("[data-movement]").forEach((mv) => {
          gsap.from(mv.querySelectorAll("[data-movement-line]"), {
            yPercent: 110,
            duration: 1.1,
            ease: "brandOut",
            stagger: 0.1,
            scrollTrigger: { trigger: mv, start: "top 76%", once: true },
          });
        });

        /*
         * 各カットは「霧から像が結ばれる」ように現れる。
         * blur → sharp と、わずかなclip revealを重ねる。
         */
        gsap.utils.toArray<HTMLElement>("[data-shot]").forEach((shot, i) => {
          const media = shot.querySelector("[data-shot-media]");
          const text = shot.querySelectorAll("[data-shot-text]");

          gsap
            .timeline({
              scrollTrigger: { trigger: shot, start: "top 74%", once: true },
            })
            .fromTo(
              media,
              {
                autoAlpha: 0,
                filter: "blur(22px)",
                scale: 1.06,
                clipPath: "inset(14% 14% 14% 14%)",
              },
              {
                autoAlpha: 1,
                filter: "blur(0px)",
                scale: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.5,
                ease: "brandOut",
              },
            )
            .from(
              text,
              {
                autoAlpha: 0,
                y: 20,
                duration: 0.9,
                ease: "brandOut",
                stagger: 0.1,
              },
              "-=0.95",
            );

          // 奥行き。デスクトップのみ、カットごとに逆向きの微パララックス。
          if (desktop && media) {
            gsap.fromTo(
              media,
              { yPercent: i % 2 === 0 ? 5 : -5 },
              {
                yPercent: i % 2 === 0 ? -5 : 5,
                ease: "none",
                scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        });

        // フィナーレ: 道が伸びていくように、横方向へゆっくり流す
        const finale = scope.current?.querySelector("[data-finale-media]");
        if (finale && desktop) {
          gsap.fromTo(
            finale,
            { xPercent: -4 },
            {
              xPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-finale]",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="narrative"
      aria-labelledby="narrative-heading"
      className="relative bg-void"
    >
      <h2 id="narrative-heading" className="sr-only">
        一台の車が次の可能性へ進むまで
      </h2>

      {NARRATIVE.movements.map((mv) => (
        <div key={mv.id} className="section-y">
          <div data-movement className="container-x">
            <div className="flex items-baseline gap-5">
              <span aria-hidden className="label text-ink-faint">
                {mv.index}
              </span>
              <span
                aria-hidden
                className="h-px w-16 shrink-0 bg-rule-strong"
              />
            </div>
            <h3 className="mt-8 text-display-m font-normal leading-[1.25] text-ink">
              <span className="line-mask">
                <span data-movement-line className="block">
                  {mv.title}
                </span>
              </span>
            </h3>
            <p className="mt-6 max-w-md text-body-l leading-loose text-ink-soft">
              {mv.lead}
            </p>
          </div>

          {/* カット。左右交互に置き、単調な中央揃えの連続を避ける */}
          <div className="mt-20 flex flex-col gap-28 sm:gap-36">
            {mv.shots.map((shot, i) => (
              <figure
                key={shot.src}
                data-shot
                className={`container-x flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-16 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  data-shot-media
                  className="relative w-full max-w-[520px] shrink-0 md:w-[46%]"
                  style={{ aspectRatio: "267 / 296" }}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 46vw"
                    className="art-blend object-contain"
                  />
                </div>

                <figcaption className="md:flex-1">
                  <span data-shot-text className="label block text-ink-faint">
                    {shot.kicker}
                  </span>
                  <p
                    data-shot-text
                    className="mt-6 text-display-s font-light leading-relaxed text-ink"
                  >
                    {shot.caption[0]}
                    <br />
                    {shot.caption[1]}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}

      {/* IV — 次の可能性へ */}
      <div data-finale className="section-y">
        <figure className="container-x">
          <div data-movement className="flex items-baseline gap-5">
            <span aria-hidden className="label text-ink-faint">
              {NARRATIVE.finale.index}
            </span>
            <span aria-hidden className="h-px w-16 shrink-0 bg-rule-strong" />
            <span className="label text-ink">{NARRATIVE.finale.kicker}</span>
          </div>

          <div
            data-shot
            className="mt-14 flex flex-col items-start gap-12 md:flex-row md:items-center md:gap-20"
          >
            <div
              data-shot-media
              className="relative w-full max-w-[560px] shrink-0 md:w-1/2"
              style={{ aspectRatio: "267 / 296" }}
            >
              <span data-finale-media className="block h-full w-full">
                <Image
                  src={NARRATIVE.finale.src}
                  alt={NARRATIVE.finale.alt}
                  fill
                  sizes="(max-width: 768px) 90vw, 50vw"
                  className="art-blend object-contain"
                />
              </span>
            </div>

            <figcaption className="md:flex-1">
              <p
                data-shot-text
                className="text-display-m font-normal leading-[1.3] text-ink"
              >
                {NARRATIVE.finale.headline[0]}
                <br />
                {NARRATIVE.finale.headline[1]}
              </p>
              <p
                data-shot-text
                className="mt-10 text-body-l leading-loose text-ink-soft"
              >
                {NARRATIVE.finale.closing}
              </p>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
