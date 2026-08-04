"use client";

import { useRef } from "react";
import { gsap, useScopedGsap, SplitText } from "@/hooks/useGsap";

/*
 * 章の入口。全ての章がこの形で始まる。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜ統一するのか
 *
 *  以前は章ごとに構造がバラバラで、スクロールしていても
 *  「章が変わった」ことに気づけなかった。入口だけを同じリズムで
 *  揃えると、中身が違っても切れ目が体感できる。
 *
 *  並びには意味がある:
 *    罫線   … 章の開始を宣言する
 *    番号+英 … 装飾。読まなくても困らない
 *    plain  … **普通の言葉での説明。ここだけ読めば何を頼めるか分かる**
 *    services … 用語。plainで説明済みなので、ここでは業界語でよい
 *
 *  「オークション代行」を知らない人が読んでも意味が通るよう、
 *  必ず plain を先に置く。
 * ═══════════════════════════════════════════════════════════════
 */

/** スクランブルに使う字。数字と大文字だけにすると製図的な見え方になる */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Props = {
  index: string;
  label: string;
  /** 見出しのid。section の aria-labelledby から参照される */
  id?: string;
  /** 普通の言葉での説明。1〜2行 */
  plain: readonly string[];
  /** サービス名の箇条書き */
  services: readonly string[];
};

export default function ChapterHead({ index, label, id, plain, services }: Props) {
  const scanRef = useRef<HTMLSpanElement>(null);

  const scope = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const root = scope.current;
        if (!root) return;

        /*
         * reduced-motion では最終状態を置く。
         * 走査線と箇条書きは初期状態が透明なので、
         * ここで戻さないと何も見えないまま終わる。
         */
        if (ctx.conditions?.reduced) {
          gsap.set(root.querySelectorAll("[data-ch-service]"), { autoAlpha: 1, x: 0 });
          gsap.set(root.querySelectorAll("[data-ch-plain]"), { autoAlpha: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        });

        /* 罫線が引かれ、章が始まる */
        tl.from("[data-ch-rule]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "brandInOut",
        });

        tl.from(
          "[data-ch-meta]",
          { autoAlpha: 0, y: 8, duration: 0.6, ease: "brandOut" },
          "-=0.9",
        );

        /*
         * 英字ラベルをスクランブルで収束させる。
         *
         * ScrambleTextPlugin は過去に意図的に登録から外されている
         * (lib/motion.ts の注記)。SplitText の chars を自前で回して
         * 同じ絵を作る。文字数分の setTimeout を積まず、
         * 1本の tween の onUpdate で全文字を面倒みるので軽い。
         */
        const labelEl = root.querySelector<HTMLElement>("[data-ch-label]");
        if (labelEl) {
          const split = SplitText.create(labelEl, { type: "chars" });
          const chars = split.chars as HTMLElement[];
          const finals = chars.map((c) => c.textContent ?? "");

          tl.to(
            { p: 0 },
            {
              p: 1,
              duration: 0.9,
              ease: "none",
              onUpdate() {
                const p = (this.targets()[0] as { p: number }).p;
                /* 左から順に確定させる。確定していない字は毎フレーム引き直す */
                const settled = Math.floor(p * chars.length);
                chars.forEach((c, i) => {
                  if (i < settled) {
                    c.textContent = finals[i];
                  } else {
                    c.textContent =
                      GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                  }
                });
              },
              onComplete() {
                chars.forEach((c, i) => (c.textContent = finals[i]));
              },
            },
            "-=0.5",
          );
        }

        /* 説明文。ここが一番読ませたい所なので、単独で入る */
        tl.from(
          "[data-ch-plain]",
          { autoAlpha: 0, y: 16, duration: 0.9, ease: "brandOut", stagger: 0.12 },
          "-=0.4",
        );

        /*
         * 線が左から引かれ、それを追いかけるように箇条書きが点灯する。
         *
         * 引ききった線はそのまま区切りとして残す。
         * 一度引いて消す案も試したが、消える途中で次の章へ
         * スクロールすると線が中途半端な長さで固まった。
         * 残す方が挙動が単純で、区切りとしても働く。
         */
        tl.fromTo(
          scanRef.current,
          { scaleX: 0, transformOrigin: "left center", autoAlpha: 1 },
          { scaleX: 1, duration: 0.8, ease: "brandInOut" },
          "-=0.3",
        ).from(
          "[data-ch-service]",
          { autoAlpha: 0, x: -12, duration: 0.6, ease: "brandOut", stagger: 0.11 },
          "-=0.5",
        );
      },
    );
  }, []);

  return (
    <div ref={scope}>
      <span
        data-ch-rule
        aria-hidden
        className="block h-px w-full origin-left bg-rule-strong"
      />

      <div data-ch-meta className="mt-6 flex items-baseline gap-4">
        <span aria-hidden className="label text-ink-faint">
          {index}
        </span>
        <span id={id} data-ch-label className="label text-ink">
          {label}
        </span>
      </div>

      {/* 普通の言葉での説明。章で唯一、必ず読ませたい部分 */}
      <p className="mt-8 max-w-2xl text-display-s font-normal leading-relaxed text-ink">
        {plain.map((line) => (
          <span key={line} data-ch-plain className="block">
            {line}
          </span>
        ))}
      </p>

      {/* 箇条書きの上を左から引かれる線。引ききって区切りとして残る */}
      <span
        ref={scanRef}
        aria-hidden
        className="mt-10 block h-px w-full max-w-xl bg-rule-strong opacity-0"
      />

      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
        {services.map((s) => (
          <li
            key={s}
            data-ch-service
            className="text-sm tracking-[0.04em] text-ink-soft"
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
