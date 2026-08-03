"use client";

import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { useVehicleSegment } from "@/hooks/useVehicleTimeline";
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

        /*
         * コピーの出現は**荷室の光に連動**させる。
         *
         * scrubで車両の回転・ハッチ開放と同じ進行度に乗せることで、
         * 「リアが見える → ハッチが開く → 光が漏れる → その光の中から
         * 文字が現れる」という因果が画面上で繋がる。
         * 時間駆動(once)にすると、車がまだ回りきる前に文字だけが
         * 出てしまい、車が語っているように見えない。
         *
         * 区間は車両制御(useVehicleSegment)と同じ範囲を指すが、
         * 書き込む対象がDOM(こちら)とviewProgress(あちら)で
         * 完全に分かれているため責務は重複しない。
         */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scope.current,
              /* 車両制御(useVehicleSegment)と同じ範囲。進行度を一致させる */
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1,
            },
          })
          /* ハッチが開き始める頃(進行度0.55)まで、文字は伏せたまま */
          .to({}, { duration: 0.55 })
          .from("[data-bm-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.12,
            ease: "none",
          })
          .from(
            "[data-bm-word]",
            {
              yPercent: 110,
              duration: 0.2,
              ease: "none",
              stagger: 0.04,
            },
            "<",
          )
          .from(
            "[data-bm-sub]",
            { autoAlpha: 0, y: 22, duration: 0.15, ease: "none" },
            "-=0.08",
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

  /*
   * 車両制御。区間定義は hooks/useVehicleTimeline.ts に集約してある。
   * このセクションは「どの区間か」を宣言するだけで、車両の動きは知らない。
   */
  useVehicleSegment(scope, "philosophy");

  return (
    <section
      ref={scope}
      id="philosophy"
      aria-labelledby="philosophy-heading"
      /*
       * この区間だけ縦を長く取る。車が半周回り、リアハッチが開き、
       * 荷室の光からコピーが現れるまでを収める必要があるため。
       * 通常の section-y だと実測でハッチが8%しか開かず、
       * リアビューにも到達しないまま次区間へ渡ってしまった。
       */
      className="section-y relative min-h-[220vh]"
    >
      {/*
        コピーを画面内に留める。
        区間を220vhに伸ばしたことで、通常フローだとテキストが
        最上部に置き去りになり、車が回っている間ずっと画面外にある。
        sticky にすると、車の演出が進む間ずっと同じ位置に文字が在り、
        「車が語っている」構図が保たれる。
      */}
      <div className="container-x sticky top-[18vh]">
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
