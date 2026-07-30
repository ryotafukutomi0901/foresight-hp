"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { gsap, useGSAP } from "@/hooks/useGsap";
import { onOpeningDone } from "@/lib/sequence";
import { CTA, NAV } from "@/lib/content";

export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Openingが終わるまでヘッダーは出さない(演出の上に被せない)。
  useGSAP(
    () => {
      gsap.set(headerRef.current, { autoAlpha: 0, y: -12 });
      return onOpeningDone(() => {
        gsap.to(headerRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "brandOut",
        });
      });
    },
    { scope: headerRef },
  );

  // モバイルメニューの開閉。
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      if (open) {
        gsap.set(panel, { display: "flex" });
        gsap
          .timeline()
          .fromTo(
            panel,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.55,
              ease: "brandInOut",
            },
          )
          .from(
            panel.querySelectorAll("[data-menu-item]"),
            {
              yPercent: 110,
              opacity: 0,
              duration: 0.55,
              ease: "brandOut",
              stagger: 0.06,
            },
            "-=0.25",
          );
      } else {
        gsap.to(panel, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.4,
          ease: "brandInOut",
          onComplete: () => gsap.set(panel, { display: "none" }),
        });
      }
    },
    { dependencies: [open] },
  );

  /*
   * ヘッダーの下にある地が明転しているかを見て、ヘッダー自身も反転させる。
   *
   * ヘッダーは固定で全区間に居座るため、明転セクションの上で暗いままだと
   * 「白い紙に黒い帯が浮いている」状態になり、章の反転が台無しになる。
   * 色クラスは全てトークン参照なので、data-tone を付け替えるだけで
   * 文字・罫線・CTAの前景背景が一括で反転する。
   *
   * 判定はヘッダーの高さ分だけの帯を root にして、
   * 明転セクションがその帯に掛かっているかで行う。
   */
  const [overLight, setOverLight] = useState(false);

  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>('section[data-tone="light"]'),
    ];
    if (!sections.length) return;

    const hit = new Set<Element>();
    let io: IntersectionObserver | null = null;

    const build = () => {
      io?.disconnect();
      hit.clear();
      const h = headerRef.current?.offsetHeight ?? 64;
      const cut = Math.max(0, window.innerHeight - h);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) hit.add(e.target);
            else hit.delete(e.target);
          }
          setOverLight(hit.size > 0);
        },
        { rootMargin: `0px 0px -${cut}px 0px` },
      );
      for (const s of sections) io.observe(s);
    };

    build();
    window.addEventListener("resize", build);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", build);
    };
  }, []);

  // メニュー展開中は背面をスクロールさせない + Escで閉じる。
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      data-tone={overLight ? "light" : undefined}
      /*
       * 明転中は地を不透明にする。
       * 半透明のままだと、ヘッダー自身の背景(F2F2F2)と、下の地(CFCFCF)を
       * 透かした合成色がずれる。ロゴは mix-blend-mode で合成しており
       * ブレンドはヘッダー自身の背景に対して解決されるため、
       * ロゴの周りだけ明るい四角として浮いてしまう(実測で8階調の差)。
       */
      className={`fixed inset-x-0 top-0 z-10 border-b border-rule/60 backdrop-blur-md transition-colors duration-500 ${
        overLight ? "bg-void" : "bg-void/80"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link
          href="#top"
          aria-label="Foresight ホーム"
          className="shrink-0 py-2"
        >
          <Logo className="w-24 sm:w-28" priority />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="メインナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label text-ink-soft transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={CTA.sell.href}
            className="hidden min-h-11 items-center bg-ink px-6 text-xs tracking-[0.14em] text-void transition-colors duration-300 hover:bg-ink-soft sm:inline-flex"
          >
            {CTA.sell.label}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span aria-hidden className="relative block h-3 w-6">
              <span
                className="absolute left-0 block h-px w-full bg-ink transition-all duration-300"
                style={{
                  top: open ? "50%" : 0,
                  transform: open ? "rotate(45deg)" : "none",
                }}
              />
              <span
                className="absolute left-0 block h-px w-full bg-ink transition-all duration-300"
                style={{
                  bottom: open ? "50%" : 0,
                  transform: open ? "rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className="fixed inset-0 z-50 hidden flex-col justify-center bg-void px-8 lg:hidden"
        style={{ display: "none" }}
      >
        <nav aria-label="モバイルナビゲーション">
          <ul className="flex flex-col gap-2">
            {NAV.map((item) => (
              <li key={item.href} className="line-mask">
                <Link
                  data-menu-item
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-5 py-3"
                >
                  <span className="label text-ink-faint">{item.label}</span>
                  <span className="text-2xl text-ink">{item.ja}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-item className="mt-12 flex flex-col gap-3">
          <Link
            href={CTA.sell.href}
            onClick={() => setOpen(false)}
            className="flex min-h-[3.25rem] items-center justify-center bg-ink px-8 text-sm tracking-[0.12em] text-void"
          >
            {CTA.sell.label}
          </Link>
          <Link
            href={CTA.find.href}
            onClick={() => setOpen(false)}
            className="flex min-h-[3.25rem] items-center justify-center border border-rule-strong px-8 text-sm tracking-[0.12em] text-ink"
          >
            {CTA.find.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
