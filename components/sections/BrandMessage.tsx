"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useScopedGsap, SplitText } from "@/hooks/useGsap";
import { useReveal } from "@/hooks/useReveal";
import { useDrawRule } from "@/hooks/useDrawRule";
import { BRAND_MESSAGE } from "@/lib/content";

/*
 * PHILOSOPHY — 事業説明の前に「視点」を置く章。
 *
 * ═══════════════════════════════════════════════════════════════
 *  構造はリファレンス(izanami)の Philosophy に倣う。
 *
 *    ・章の前に1画面分近い余白を取り、速度を落としてから読ませる
 *    ・行間を広く取る(2.4倍)
 * ═══════════════════════════════════════════════════════════════
 *
 * 車両は線画を1枚だけ、本文の背後に沈めて置く。主張させない。
 * ここは思想を語る章であって、車を見せる章ではない。
 */
export default function BrandMessage() {
  /* タイプライターの各行の流し込み先と、行を渡り歩くカーソル */
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLSpanElement>(null);

  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const lines = lineRefs.current;

        if (ctx.conditions?.reduced) {
          /*
           * 動かさないが、見せないわけではない。
           * タイプライターは初期値が空なので、ここで全文を入れる。
           */
          lines.forEach((el, i) => {
            if (el) el.textContent = BRAND_MESSAGE.headline[i];
          });
          caretRef.current?.setAttribute("data-done", "true");
          return;
        }

        /*
         * 大見出しを**1行ずつ**タイプライターで打つ。
         *
         * ═══════════════════════════════════════════════════════
         *  文字数分の setTimeout を積まず、行ごとに1本のtweenの
         *  onUpdate で文字列を切り出す。ScrollTriggerに乗るので、
         *  スクロールを戻せば巻き戻り、タイマーが取り残されない。
         *
         *  カーソルは打っている行の末尾に付く。行が変わったら
         *  一緒に降りるので、「改行して打ち続けている」ように見える。
         * ═══════════════════════════════════════════════════════
         */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: scope.current, start: "top 72%", once: true },
        });

        BRAND_MESSAGE.headline.forEach((full, i) => {
          tl.to(
            { p: 0 },
            {
              p: 1,
              /* 1文字あたりの速さを揃える。行の長さが違っても打鍵の速度は同じ */
              duration: full.length * 0.055,
              ease: "none",
              onStart() {
                /* カーソルをこの行へ移す */
                const host = lines[i]?.parentElement;
                if (host && caretRef.current) host.appendChild(caretRef.current);
              },
              onUpdate() {
                const el = lines[i];
                if (!el) return;
                const p = (this.targets()[0] as { p: number }).p;
                el.textContent = full.slice(0, Math.ceil(p * full.length));
              },
              onComplete() {
                const el = lines[i];
                if (el) el.textContent = full;
              },
            },
            /* 行の切り替わりで一拍おく。続けて打つと2行が1行に見える */
            i === 0 ? 0 : ">+=0.22",
          );
        });

        /* 打ち終わったらカーソルを消す。残すと入力欄に見える */
        tl.call(() => caretRef.current?.setAttribute("data-done", "true"));

        /*
         * 背後の線画。
         *
         * 以前はスクロールに連動して上下に流していたが、
         * 章に着いた時点では絵がまだ途中までしか出ておらず、
         * 「全部見えている」状態にならなかった。
         *
         * 章に入ったら一度だけ、全体をそのまま出す。
         * 位置も動かさない。画は読ませるものではなく、
         * 文章の後ろに在るものなので、動かす必要が無い。
         */
        gsap.fromTo(
          "[data-bm-art]",
          { autoAlpha: 0, scale: 1.02 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.6,
            ease: "brandOut",
            scrollTrigger: {
              trigger: scope.current,
              start: "top 70%",
              once: true,
            },
          },
        );

        /*
         * 日本語の文章(小見出し・2行の一文・本文)だけは、共通の
         * useReveal(文章1本ごとにフェード)ではなく行ごとに出す。
         *
         * ═══════════════════════════════════════════════════════
         *  「文章ごとじゃなく行ごとに」というフィードバック。
         *  この章はタイプライターで1文字ずつ打つ大見出しの直後に
         *  和文が続くので、和文だけ塊でフェードすると急に雑に見える。
         *
         *  SplitText の type:"lines" + mask:"lines" で行ごとに
         *  overflow:hidden のマスクを自動で被せ、下から1行ずつ
         *  現れるようにする。行数は表示幅で変わる(実際に描画された
         *  行を割るので、レスポンシブでも崩れない)。
         * ═══════════════════════════════════════════════════════
         */
        const lineTargets = gsap.utils.toArray<HTMLElement>(
          scope.current?.querySelectorAll("[data-bm-line]") ?? [],
        );
        lineTargets.forEach((el) => {
          const split = SplitText.create(el, { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 110,
            autoAlpha: 0,
            duration: 1.3,
            ease: "sine.out",
            stagger: 0.22,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
      },
    );
  }, []);

  /* 本文はすべて共通の仕掛けで、上から順に出す */
  useReveal(scope);
  /* 章頭の罫線はスクロールに連動して左→右に伸ばす */
  useDrawRule(scope);

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
        /*
         * マスクで文章側を透明にする案は、車体そのものが素材の
         * 左寄り(横幅の15〜53%あたり)にあるため、マスクの境界と
         * 車体が被って車の前半分ごと消えてしまっていた(実測: 車が
         * 欠けて見えると指摘を受けた)。
         *
         * lg以上: マスクはやめ、素材ごと右へ寄せて「車の中心が画面の
         * 72%あたり」に来るよう left を計算し直した。文章の列
         * (概ね〜45%)より右側に車が完全に収まるので、マスクなしで
         * 車の全体像が欠けずに見える。右側の道・陽光が section の
         * overflow-hidden で切れるのは意匠として許容する。
         *
         * lg未満: 文章が画面幅いっぱいに広がり、image を隣に置く
         * 余白が無い(実測: 同じ絶対配置のままだと mobile/tablet でも
         * 文章と車が重なっていた)。背景として敷くのをやめ、
         * 見出しの上に独立した挿絵として通常フローに置く。
         */
        className="pointer-events-none relative mx-auto mb-10 w-full max-w-sm opacity-0 lg:absolute lg:left-[85%] lg:top-1/2 lg:mb-0 lg:w-[82%] lg:max-w-[1400px] lg:-translate-x-1/2 lg:-translate-y-1/2"
      >
        {/*
          素材は黒い線 / 背景透過(ffmpegのcolorkeyで白を抜いてある)。
          クリームの地にそのまま置けるので、反転も合成モードも要らない。
        */}
        <Image
          src="/images/foresight/vehicle-parts/vehiclenext-alpha.png"
          alt=""
          width={1672}
          height={941}
          className="h-auto w-full opacity-[0.7] lg:opacity-[0.4]"
        />
      </div>

      <div className="container-x relative z-10">
        <div className="flex items-center gap-5">
          <span data-reveal id="philosophy-heading" className="label text-ink">
            {BRAND_MESSAGE.label}
          </span>
          <span
            data-chapter-rule
            aria-hidden
            className="h-[2px] flex-1 bg-ink-faint"
          />
        </div>

        <div className="mt-14">
          {/* 日本語の小見出し。英字の大見出しの上に置いて、章の主題を先に伝える */}
          <p data-bm-line className="text-display-s font-normal text-ink-soft">
            {BRAND_MESSAGE.lead}
          </p>

          {/*
            タイプライターで打つ見出し。
            aria-label に完成形を持たせ、打っている途中の断片が
            読み上げられないよう中身は aria-hidden にする。
          */}
          <h2
            aria-label={BRAND_MESSAGE.headline.join(" ")}
            className="mt-6 font-latin text-display-l font-semibold leading-[1.15] tracking-[-0.01em] text-ink"
          >
            {BRAND_MESSAGE.headline.map((line, i) => (
              <span key={line} aria-hidden className="block">
                <span
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                />
                {/* カーソルは打っている行へ移し替える(上のonStart) */}
                {i === 0 ? (
                  <span
                    ref={caretRef}
                    data-bm-caret
                    className="ml-1 inline-block w-[0.06em] bg-ink align-[-0.08em]"
                    style={{ height: "0.86em" }}
                  />
                ) : null}
              </span>
            ))}
          </h2>

          <p
            data-bm-line
            className="mt-12 max-w-lg text-body-l leading-loose text-ink-soft"
          >
            {BRAND_MESSAGE.sub[0]}
            <br />
            {BRAND_MESSAGE.sub[1]}
          </p>
        </div>

        {/* 行間2.4倍は読む速度そのものを落とすための値 */}
        <p
          data-bm-line
          className="mt-14 max-w-xl text-base leading-[2.4] text-ink-soft lg:mt-16"
        >
          {BRAND_MESSAGE.body}
        </p>
      </div>
    </section>
  );
}
