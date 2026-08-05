"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { BRAND_MESSAGE } from "@/lib/content";

/*
 * PHILOSOPHY — 事業説明の前に「視点」を置く章。
 *
 * ═══════════════════════════════════════════════════════════════
 *  構造はリファレンス(izanami)の Philosophy に倣う。
 *
 *    ・見出しは画面に**貼り付いたまま**、本文だけが流れる
 *    ・章の前に1画面分近い余白を取り、速度を落としてから読ませる
 *    ・行間を広く取る(2.4倍)
 *
 *  貼り付けるのは装飾ではなく読ませ方の設計。見出しが残り続けると、
 *  長い本文を読んでいる間も「何の話か」が視界から消えない。
 * ═══════════════════════════════════════════════════════════════
 *
 * 車両は線画を1枚だけ、本文の背後に沈めて置く。主張させない。
 * ここは思想を語る章であって、車を見せる章ではない。
 */
export default function BrandMessage() {
  /* タイプライターで文字を流し込む先と、点滅するカーソル */
  const typeRef = useRef<HTMLSpanElement>(null);
  const typeCaretRef = useRef<HTMLSpanElement>(null);

  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions?.reduced) {
          /*
           * 動かさないが、見せないわけではない。
           * タイプライターは初期値が空なので、ここで全文を入れる。
           */
          if (typeRef.current) {
            typeRef.current.textContent = BRAND_MESSAGE.headline;
          }
          typeCaretRef.current?.setAttribute("data-done", "true");
          return;
        }

        /*
         * 見出しの出現。単語ごとにマスクを解く。
         * 全体を一度に出すより、読む速度に近い速さで現れるほうが
         * 「読ませる」という意図に合う。
         */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: "top 72%",
              once: true,
            },
          })
          .from("[data-bm-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.4,
            ease: "brandInOut",
          })
          .from(
            "[data-bm-lead]",
            { autoAlpha: 0, y: 14, duration: 0.9, ease: "brandOut" },
            "-=1.1",
          )
          /*
           * 大見出しをタイプライターで打つ。
           *
           * ═══════════════════════════════════════════════════════
           *  文字数分の setTimeout を積まず、1本のtweenの onUpdate で
           *  文字列を切り出す。ScrollTriggerに乗るので、スクロールを
           *  戻せば巻き戻り、タイマーが取り残されることも無い。
           *  ChapterHead のスクランブルと同じ作り。
           * ═══════════════════════════════════════════════════════
           */
          .to(
            { p: 0 },
            {
              p: 1,
              duration: 2.0,
              ease: "none",
              onUpdate() {
                const el = typeRef.current;
                if (!el) return;
                const p = (this.targets()[0] as { p: number }).p;
                const full = BRAND_MESSAGE.headline;
                el.textContent = full.slice(0, Math.ceil(p * full.length));
              },
              onComplete() {
                if (typeRef.current) {
                  typeRef.current.textContent = BRAND_MESSAGE.headline;
                }
                /* 打ち終わったらカーソルを消す。残すと入力欄に見える */
                typeCaretRef.current?.setAttribute("data-done", "true");
              },
            },
            "-=0.6",
          )
          .from(
            "[data-bm-sub]",
            { autoAlpha: 0, y: 24, duration: 1.0, ease: "brandOut" },
            "-=0.6",
          );

        gsap.from("[data-bm-body]", {
          autoAlpha: 0,
          y: 22,
          duration: 1.2,
          ease: "brandOut",
          scrollTrigger: {
            trigger: "[data-bm-body]",
            start: "top 86%",
            once: true,
          },
        });

        /*
         * 背後の線画。スクロールに合わせてゆっくり浮上する。
         * 移動量を小さく取り、視差として感じる程度に留める。
         * 大きく動かすと「動く背景」になり、文章から目が逸れる。
         */
        gsap.fromTo(
          "[data-bm-art]",
          { yPercent: 7, autoAlpha: 0 },
          {
            yPercent: -7,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      },
    );
  }, []);

  return (
    <section
      ref={scope}
      data-chapter="philosophy"
      data-tone="light"
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="section-y relative overflow-hidden"
    >
      {/* 背後の線画。主張させず、地に沈める */}
      <div
        data-bm-art
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/2 w-[86%] max-w-[1100px] -translate-y-1/2 opacity-0 lg:right-[-4%] lg:w-[62%]"
      >
        <Image
          src="/images/foresight/vehicle-parts/10-next-journey-alpha.png"
          alt=""
          width={1024}
          height={1024}
          className="h-auto w-full opacity-[0.85]"
        />
      </div>

      <div className="container-x relative z-10">
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

        {/*
          見出しを sticky で留める。本文がその下を流れていく間、
          「何の話か」が視界から消えない。
        */}
        <div className="mt-14">
          {/* 日本語の小見出し。英字の大見出しの上に置いて、章の主題を先に伝える */}
          <p data-bm-lead className="text-display-s font-normal text-ink-soft">
            {BRAND_MESSAGE.lead}
          </p>

          {/*
            タイプライターで打つ見出し。
            aria-label に完成形を持たせ、打っている途中の断片が
            読み上げられないよう中身は aria-hidden にする。
          */}
          <h2
            aria-label={BRAND_MESSAGE.headline}
            className="mt-6 font-latin text-display-l font-semibold leading-[1.05] tracking-[-0.01em] text-ink"
          >
            <span aria-hidden className="inline">
              <span ref={typeRef} />
              <span
                ref={typeCaretRef}
                data-bm-caret
                className="ml-1 inline-block w-[0.06em] self-stretch bg-ink align-[-0.08em]"
                style={{ height: "0.86em" }}
              />
            </span>
          </h2>

          <p
            data-bm-sub
            className="mt-12 max-w-lg text-body-l leading-loose text-ink-soft"
          >
            {BRAND_MESSAGE.sub[0]}
            <br />
            {BRAND_MESSAGE.sub[1]}
          </p>
        </div>

        {/*
          本文。見出しが留まっている間にこれが流れてくる。
          行間2.4倍は読む速度そのものを落とすための値。
        */}
        <p
          data-bm-body
          className="mt-14 max-w-xl text-sm leading-[2.4] text-ink-soft lg:mt-16"
        >
          {BRAND_MESSAGE.body}
        </p>
      </div>
    </section>
  );
}
