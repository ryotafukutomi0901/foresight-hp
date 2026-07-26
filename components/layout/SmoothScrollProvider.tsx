"use client";

import { useRef } from "react";
import {
  useGSAP,
  gsap,
  ScrollSmoother,
  ScrollTrigger,
} from "@/hooks/useGsap";
import { registerBrandEases } from "@/lib/motion";
import { viewProgress } from "@/lib/viewProgress";

/*
 * 慣性スクロール。
 *
 * LenisではなくGSAP純正のScrollSmootherを使う。ScrollTriggerと同一のtickerで
 * 駆動されるため、スクロール位置の同期にグルーコード(scrollerProxy等)が一切要らず、
 * 「慣性スクロールとScrollTriggerがずれる」という典型的な不具合が構造的に起きない。
 *
 * ScrollSmootherは #smooth-wrapper > #smooth-content の入れ子を要求する。
 * 固定ヘッダーとOpeningオーバーレイはこのwrapperの外に置くこと(内側だと一緒に流れる)。
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    registerBrandEases();

    // タッチデバイスでは慣性を二重に掛けない(ネイティブスクロールの方が滑らかで軽い)。
    // reduced motion指定時も無効化する。
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.1,
          effects: true,
          normalizeScroll: true,
          ignoreMobileResize: true,
        });

        // ページ内アンカーはScrollSmoother経由で移動させる。
        // 通常のhashジャンプはsmootherの内部位置とずれるため横取りする。
        const onClick = (e: MouseEvent) => {
          if (e.defaultPrevented || e.button !== 0) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

          const anchor = (e.target as HTMLElement | null)?.closest("a");
          const href = anchor?.getAttribute("href");
          if (!href || !href.startsWith("#") || href === "#") return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          smoother.scrollTo(target as HTMLElement, true, "top top");
        };

        document.addEventListener("click", onClick);

        return () => {
          document.removeEventListener("click", onClick);
          smoother.kill();
        };
      },
    );

    /*
     * ページ全体の進行度を3D空間へ渡す唯一の受け渡し点。
     * ここで書き込んだ値を Atmosphere の useFrame が読み、
     * カメラの前進と霧の流れになる。Reactのstateは経由しない。
     */
    const pageST = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        viewProgress.page = self.progress;
        viewProgress.velocity = self.getVelocity() / 900;
      },
    });

    // 画像の読み込み完了で高さが変わるため、位置を再計算する。
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      pageST.kill();
      mm.revert();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
