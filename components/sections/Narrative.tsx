"use client";

import Image from "next/image";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { charsRise, layerIn, trackIn } from "@/lib/motion";
import { viewProgress } from "@/lib/viewProgress";
import { NARRATIVE, NARRATIVE_SHOTS } from "@/lib/content";

/*
 * THE NARRATIVE — 一台の車が次の可能性へ進むまで。
 *
 * 10枚のビジュアルは **3D空間側(NarrativeCorridor)** にあり、
 * スクロールに合わせてカメラがその間を通過する。
 * このコンポーネントが受け持つのは
 *   1. スクロール進行度の書き出し(3Dへの唯一の受け渡し)
 *   2. 文字の出現
 *   3. 支援技術・検索エンジン向けの図版情報
 * の3つだけで、画像を<img>として画面に並べることはしない。
 *
 * なぜ画像をDOMに置かないか:
 *   DOMに置くと、どれだけ動かしても「平面の上を滑るカード」にしかならない。
 *   3Dに置けば霧・被写界深度・グレインが画像自体に掛かり、
 *   手前にピントが合って奥がボケる。これは平面合成では作れない。
 *
 * ただしcanvasは支援技術から読めないため、同じ内容を
 * <figure>+<figcaption> として視覚的非表示で必ず残している。
 * reduced-motion時は3Dを起動しないため、その場合だけ画像を可視化する。
 */

export default function Narrative() {
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as Record<string, boolean>;
        if (reduced) return;

        /*
         * 3D回廊への唯一の受け渡し点。
         * このセクションを通過するスクロール量が、回廊の全長に対応する。
         */
        const corridorST = gsap.utils.toArray<HTMLElement>([scope.current!]);
        gsap.to(corridorST, {
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              // 端で画像が唐突に消えないよう、前後に余白を持たせて写像する
              viewProgress.corridor = gsap.utils.clamp(
                0,
                1,
                (self.progress - 0.06) / 0.88,
              );
            },
          },
        });

        // 楽章の見出し
        gsap.utils.toArray<HTMLElement>("[data-movement]").forEach((mv) => {
          const title = mv.querySelector<HTMLElement>("[data-movement-title]");
          const index = mv.querySelector<HTMLElement>("[data-movement-index]");

          const tl = gsap.timeline({
            scrollTrigger: { trigger: mv, start: "top 74%", once: true },
          });

          if (index) tl.add(trackIn(index, { duration: 1.2 }), 0);
          if (title) tl.add(charsRise(title).tween, 0.2);
          tl.add(layerIn(mv.querySelectorAll("[data-movement-lead]")), 0.5);
        });

        // 各カットの文字。3D側で画像が近づくのに同期して現れる
        gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((cap) => {
          gsap
            .timeline({
              scrollTrigger: { trigger: cap, start: "top 78%", once: true },
            })
            .add(trackIn(cap.querySelectorAll("[data-caption-kicker]")), 0)
            .add(
              layerIn(cap.querySelectorAll("[data-caption-line]"), {
                stagger: 0.12,
              }),
              0.15,
            );
        });
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      id="narrative"
      aria-labelledby="narrative-heading"
      className="relative"
    >
      <h2 id="narrative-heading" className="sr-only">
        一台の車が次の可能性へ進むまで
      </h2>

      {/*
        図版情報。3D側に描かれる10枚と1対1で対応する。
        通常は視覚的に非表示(3Dが本体)、reduced-motion時のみ可視化して
        画像そのものを静的に読めるようにする。
      */}
      <ul data-narrative-figures className="sr-only">
        {NARRATIVE_SHOTS.map((shot) => (
          <li key={shot.src}>
            <figure>
              <div
                data-narrative-figure-media
                className="relative w-full max-w-[420px]"
                style={{ aspectRatio: "267 / 296" }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="art-blend object-contain"
                />
              </div>
              <figcaption>
                <span className="label text-ink-faint">{shot.kicker}</span>
                <p className="mt-4 text-display-s text-ink">
                  {shot.caption[0]}
                  {shot.caption[1] ? (
                    <>
                      <br />
                      {shot.caption[1]}
                    </>
                  ) : null}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* 楽章の見出しと、3Dの通過に同期する文字 */}
      {NARRATIVE.movements.map((mv) => (
        <div key={mv.id} className="section-y">
          <div data-movement className="container-x">
            <span
              data-movement-index
              aria-hidden
              className="label block text-ink-faint"
            >
              {mv.index}
            </span>
            <h3
              data-movement-title
              className="mt-8 text-display-l font-semibold text-ink-strong [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]"
            >
              {mv.title}
            </h3>
            <p
              data-movement-lead
              className="mt-8 max-w-md text-body-l leading-loose text-ink-soft [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]"
            >
              {mv.lead}
            </p>
          </div>

          {/*
            カットごとの文字。画像は3D空間側にあるため、
            ここは大きく間隔を空けて「通過する時間」を作る。
          */}
          <div className="mt-20 flex flex-col gap-[26vh]">
            {mv.shots.map((shot, i) => (
              <div
                key={shot.src}
                data-caption
                aria-hidden
                className={`container-x flex ${
                  i % 2 === 1 ? "justify-end text-right" : "justify-start"
                }`}
              >
                <div
                  className="max-w-[min(24rem,88vw)] rounded-none px-6 py-5 backdrop-blur-[2px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(5,5,6,0.55), rgba(5,5,6,0.7))",
                  }}
                >
                  <span
                    data-caption-kicker
                    className="label block text-ink-strong"
                  >
                    {shot.kicker}
                  </span>
                  <p
                    data-caption-line
                    className="mt-6 text-display-m font-semibold leading-relaxed text-ink-strong [text-shadow:0_2px_20px_rgba(0,0,0,0.9)]"
                  >
                    {shot.caption[0]}
                  </p>
                  <p
                    data-caption-line
                    className="text-display-m font-semibold leading-relaxed text-ink-strong [text-shadow:0_2px_20px_rgba(0,0,0,0.9)]"
                  >
                    {shot.caption[1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* IV — 次の可能性へ */}
      <div className="section-y">
        <div data-movement className="container-x">
          <span
            data-movement-index
            aria-hidden
            className="label block text-ink-faint"
          >
            {NARRATIVE.finale.index}
          </span>
          <h3 data-movement-title className="mt-8 text-display-l text-ink">
            {NARRATIVE.finale.headline[0]}
          </h3>
          <p
            data-movement-lead
            className="mt-8 max-w-lg text-display-s leading-relaxed text-ink-soft"
          >
            {NARRATIVE.finale.headline[1]}
          </p>
          <p
            data-movement-lead
            className="mt-12 max-w-md text-body-l leading-loose text-ink-soft"
          >
            {NARRATIVE.finale.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
