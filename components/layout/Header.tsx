"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import { gsap, useGSAP, ScrollTrigger } from "@/hooks/useGsap";
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
   * Hero の上でだけ透過する。
   *
   * Hero は映像が主役なので、黒い帯が乗ると上端が切られて見える。
   * 逆に Philosophy 以降は地が明るくなったり文章が来たりするので、
   * 帯が無いとナビが読めない。
   *
   * 背景色だけを触る。ヘッダーは Opening 明けに autoAlpha を
   * animate されているので、opacity を奪い合わないようにする。
   */
  useEffect(() => {
    const hero = document.getElementById("top");
    const el = headerRef.current;
    if (!hero || !el) return;

    el.setAttribute("data-at-top", "true");

    const st = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      onToggle: (self) =>
        el.setAttribute("data-at-top", self.isActive ? "true" : "false"),
    });

    return () => st.kill();
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
      data-header
      /*
       * 地の色は globals.css が持つ。
       * Hero の上では透過し、そこを離れると黒くなる(下の ScrollTrigger)。
       * Tailwind の bg-* を置かないのは、透過との切り替えを
       * CSS の transition に任せたいため。
       */
      className="fixed inset-x-0 top-0 z-10"
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 sm:h-20">
        <a
          href="#top"
          aria-label="Foresight ホーム"
          className="shrink-0 py-2"
        >
          <Logo className="w-24 sm:w-28" priority />
        </a>

        {/* Desktop nav */}
        <nav aria-label="メインナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  /*
                   * .label は10px固定で、SectionHeadやFooterと共有している。
                   * あちらを大きくすると章ラベルまで太るので、
                   * ナビ側でだけサイズと字間を上書きする。
                   */
                  className="label text-[0.8125rem] tracking-[0.28em] text-ink-soft transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={CTA.consult.href}
            className="hidden min-h-11 items-center bg-ink px-6 text-sm tracking-[0.14em] text-void transition-colors duration-300 hover:bg-ink-soft sm:inline-flex"
          >
            {CTA.consult.label}
          </a>

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
                <a
                  data-menu-item
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-5 py-3"
                >
                  <span className="label text-ink-faint">{item.label}</span>
                  <span className="text-2xl text-ink">{item.ja}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-item className="mt-12 flex flex-col gap-3">
          <a
            href={CTA.sell.href}
            onClick={() => setOpen(false)}
            className="flex min-h-[3.25rem] items-center justify-center bg-ink px-8 text-sm tracking-[0.12em] text-void"
          >
            {CTA.sell.label}
          </a>
          <a
            href={CTA.find.href}
            onClick={() => setOpen(false)}
            className="flex min-h-[3.25rem] items-center justify-center border border-rule-strong px-8 text-sm tracking-[0.12em] text-ink"
          >
            {CTA.find.label}
          </a>
        </div>
      </div>
    </header>
  );
}
