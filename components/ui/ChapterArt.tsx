"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useScopedGsap } from "@/hooks/useGsap";

/*
 * 章の絵。線画を1枚、スクロールに合わせて現す。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜ「フェードイン」ではなく「ワイプ」なのか
 *
 *  素材は黒地に白い線の製図。フェードだと線全体が一様に薄れて
 *  現れるため、「印刷が滲んで出てくる」ように見える。
 *
 *  clip-path で端から開くと、線が**引かれていく**ように読める。
 *  製図というモチーフに対して、これが正しい現れ方になる。
 * ═══════════════════════════════════════════════════════════════
 *
 * 動きの駆動はスクロール位置のみ。時間で勝手に animate しない。
 */

type Props = {
  src: string;
  /** 装飾なので既定は空。意味を持つ図なら必ず渡すこと */
  alt?: string;
  /** ワイプが開く向き */
  from?: "left" | "right" | "bottom";
  /** 視差の移動量(%)。0で視差なし */
  parallax?: number;
  /** 最終的な不透明度。地に沈めたいときは下げる */
  opacity?: number;
  className?: string;
};

export default function ChapterArt({
  src,
  alt = "",
  from = "left",
  parallax = 6,
  opacity = 1,
  className = "",
}: Props) {
  const inner = useRef<HTMLDivElement>(null);

  const scope = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        /*
         * reduced-motion では最終状態を即座に置く。
         * 「動かさない」であって「見せない」ではない。
         */
        if (ctx.conditions?.reduced) {
          gsap.set(inner.current, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: opacity });
          return;
        }

        const closed =
          from === "left"
            ? "inset(0% 100% 0% 0%)"
            : from === "right"
              ? "inset(0% 0% 0% 100%)"
              : "inset(100% 0% 0% 0%)";

        gsap.fromTo(
          inner.current,
          { clipPath: closed, autoAlpha: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            autoAlpha: opacity,
            duration: 1.6,
            ease: "brandInOut",
            scrollTrigger: {
              trigger: scope.current,
              start: "top 82%",
              once: true,
            },
          },
        );

        if (parallax !== 0) {
          gsap.fromTo(
            scope.current,
            { yPercent: parallax },
            {
              yPercent: -parallax,
              ease: "none",
              scrollTrigger: {
                trigger: scope.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        }
      },
    );
  }, []);

  return (
    <div ref={scope} className={className}>
      <div
        ref={inner}
        style={{
          willChange: "clip-path, opacity",
          /*
           * 素材は背景を透過済みのPNG(*-alpha.png)を使う。
           *
           * 元の webp は「黒っぽいグレー」の地を持っており、
           * そのまま重ねると矩形が明るい四角として浮いた(実測)。
           * mix-blend-mode: screen で消す手もあるが、視差や
           * 出現アニメが祖先に transform / opacity を作るため、
           * ブレンドがその中に閉じ込められて効かない。
           *
           * 素材側の地をアルファに落としてしまえば、
           * 合成モードにも祖先の構造にも依存しなくなる。
           */
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          className="h-auto w-full"
          sizes="(max-width: 1024px) 90vw, 45vw"
        />
      </div>
    </div>
  );
}
