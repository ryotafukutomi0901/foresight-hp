"use client";

import { useEffect, useRef, useState } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { SERVICES } from "@/lib/content";

/*
 * SERVICES — 売る / 買う / 探す をタブ1つに束ねた章。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜタブなのか
 *
 *  以前は Sell / Buy / Find が縦に3セクション並んでいた。
 *  1章あたりの情報が薄まる上、スクロールしても
 *  「同じような章がまた来た」としか感じられなかった。
 *
 *  束ねると3つが**並列の選択肢**として一度に見える。
 *  訪問者は自分がどれに当てはまるかを選んでから読める。
 * ═══════════════════════════════════════════════════════════════
 *
 * ナビゲーションとの両立:
 *   NAV は #sell / #buy / #find を指したままにしてある。
 *   タブの手前に不可視のアンカーを置き、hash を読んで該当タブを開く。
 *   統合してもリンクが死なず、外部からの深いリンクも生きる。
 */

/** hash からタブの番号を求める。該当なしは 0(SELL) */
function tabFromHash() {
  if (typeof window === "undefined") return 0;
  const id = window.location.hash.replace("#", "");
  const i = SERVICES.items.findIndex((it) => it.id === id);
  return i >= 0 ? i : 0;
}

export default function Services() {
  /*
   * 初期値を遅延初期化で決める。
   * effect の中で setState すると、初回に一度描いてから
   * すぐ描き直すことになり、タブが一瞬ちらつく。
   */
  const [active, setActive] = useState(tabFromHash);

  /*
   * パネルの中身。タブを切り替えたときにここだけ差し替える。
   * セクション全体を作り直すと、下で作った ScrollTrigger まで
   * 巻き添えで消えるため、参照を分けている。
   */
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * NAV の #sell / #buy / #find を押したときに該当タブを開く。
   *
   * ⚠️ hashchange では拾えない。
   *   SmoothScrollProvider がページ内アンカーを横取りして
   *   preventDefault() するため、hash が書き換わらず
   *   hashchange が発火しない(実測: NAVのBUYを押しても
   *   タブが前のまま動かなかった)。
   *
   * クリックそのものを拾えば、スムーススクロールの有無に関係なく動く。
   * hashchange も残しておく(ブラウザの戻る/進むや外部リンク経由の遷移用)。
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!href?.startsWith("#")) return;
      const i = SERVICES.items.findIndex((it) => `#${it.id}` === href);
      if (i >= 0) setActive(i);
    };
    const onHash = () => setActive(tabFromHash());

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  /*
   * 章の入口のアニメーション。
   *
   * deps を空にしてあるのが重要。active を入れると useGSAP が
   * コンテキストごと作り直し、タブを押すたびに ScrollTrigger が
   * 破棄→再生成される。切替のアニメーションは下の useEffect で
   * 直接 tween し、こちらはスクロール連動だけを持つ。
   */
  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions?.reduced) return;

        gsap
          .timeline({
            scrollTrigger: { trigger: scope.current, start: "top 78%", once: true },
          })
          .from("[data-sv-rule]", {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.2,
            ease: "brandInOut",
          })
          .from(
            "[data-sv-label]",
            { autoAlpha: 0, y: 10, duration: 0.6, ease: "brandOut" },
            "-=0.9",
          )
          .from(
            "[data-sv-headline]",
            { yPercent: 115, duration: 1.1, ease: "brandOut" },
            "-=0.5",
          )
          .from(
            "[data-sv-lead]",
            { autoAlpha: 0, y: 16, duration: 0.8, ease: "brandOut" },
            "-=0.7",
          )
          .from(
            "[data-sv-tab]",
            { autoAlpha: 0, y: 12, duration: 0.6, ease: "brandOut", stagger: 0.08 },
            "-=0.5",
          );
      },
    );
  }, []);

  /*
   * タブ切替。差し替わる側だけを短く animate する。
   *
   * 中身が入れ替わったことが分からないと、押しても反応が無いように
   * 見える。かといって大きく動かすと、読んでいる最中に画面が
   * 揺れる章になる。ごく短いフェードと僅かな上げに留める。
   */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* 動かさないが見せる。初期状態が透明な要素をここで戻す */
      gsap.set(el.querySelectorAll("[data-sv-panel-item]"), { autoAlpha: 1, y: 0 });
      gsap.set(el.querySelectorAll("[data-sv-ghost]"), { opacity: 0.08, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-sv-panel-item]",
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "brandOut",
          stagger: 0.06,
          overwrite: true,
        },
      );

      /* ゴースト数字。薄さを保ったまま出す */
      gsap.fromTo(
        "[data-sv-ghost]",
        { opacity: 0, y: 14 },
        { opacity: 0.08, y: 0, duration: 0.7, ease: "brandOut", overwrite: true },
      );
    }, el);

    return () => ctx.revert();
  }, [active]);

  const item = SERVICES.items[active];
  const others = SERVICES.items.filter((_, i) => i !== active);

  return (
    <section
      ref={scope}
      data-chapter="services"
      id="services"
      aria-labelledby="services-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <span
          data-sv-rule
          aria-hidden
          className="block h-px w-full origin-left bg-rule-strong"
        />

        <p data-sv-label className="label mt-6 text-ink-faint">
          {SERVICES.label}
        </p>

        <h2
          id="services-heading"
          className="mt-8 text-display-l font-normal leading-[1.22] text-ink"
        >
          <span className="line-mask">
            <span data-sv-headline className="block">
              {SERVICES.headline}
            </span>
          </span>
        </h2>

        <p data-sv-lead className="mt-6 text-body-l text-ink-soft">
          {SERVICES.lead}
        </p>

        {/*
          NAVの #sell / #buy / #find の着地点。
          統合してもリンクが死なないように、不可視のまま置いておく。
        */}
        {SERVICES.items.map((it) => (
          <span key={it.id} id={it.id} aria-hidden className="block h-0" />
        ))}

        {/* ── タブ ── */}
        <div
          role="tablist"
          aria-label="サービスの種類"
          className="mt-16 flex items-end gap-8 border-b border-rule sm:gap-12"
        >
          {SERVICES.items.map((it, i) => {
            const on = i === active;
            return (
              <button
                key={it.id}
                data-sv-tab
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="services-panel"
                onClick={() => setActive(i)}
                className={`-mb-px flex items-baseline gap-3 border-b pb-4 transition-colors duration-300 ${
                  on
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span className="label">{it.index}</span>
                <span className="label text-[0.8125rem] tracking-[0.24em]">
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── パネル ── */}
        <div
          ref={panelRef}
          id="services-panel"
          role="tabpanel"
          aria-live="polite"
          className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24"
        >
          <div>
            {/* 「自分の話かどうか」を最初に判断させる一行 */}
            <span
              data-sv-panel-item
              className="inline-block border border-rule-strong px-4 py-2 text-sm text-ink-soft"
            >
              {item.audience}
            </span>

            <p
              data-sv-panel-item
              className="mt-10 text-display-l font-normal leading-[1.22] text-ink"
            >
              {item.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            <p
              data-sv-panel-item
              className="mt-10 max-w-xl text-sm leading-[2.2] text-ink-soft"
            >
              {item.body}
            </p>

            <div data-sv-panel-item className="mt-12">
              <CtaButton href={item.cta.href}>{item.cta.label}</CtaButton>
            </div>
          </div>

          <div>
            {/*
              巨大な番号。読ませる情報ではなく、いま何番目を見ているかを
              一目で示す標識として置く。地に沈む明度に抑える。
            */}
            {/*
              ⚠️ data-sv-panel-item を付けない。
              あちらは autoAlpha を 0→1 に持っていくため、
              クラスで指定した薄さがインラインの opacity:1 に
              上書きされ、ゴーストのはずの数字が真っ白になる(実測)。
              薄さを保ったまま出したいので、専用の属性で別に動かす。
            */}
            <span
              data-sv-ghost
              aria-hidden
              className="block font-latin text-[6rem] leading-none text-ink sm:text-[8rem]"
            >
              {item.index}
            </span>

            <ul className="mt-10 border-t border-rule">
              {item.points.map((pt) => (
                <li
                  key={pt}
                  data-sv-panel-item
                  className="flex items-baseline gap-4 border-b border-rule py-5 text-sm text-ink-soft"
                >
                  <span aria-hidden className="text-ink-faint">
                    ・
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 下部の切替。読み終えた所から次へ移れるようにする ── */}
        <div className="mt-20 flex items-center gap-6 border-t border-rule pt-10">
          <span className="label text-ink-faint">{SERVICES.otherLabel}</span>
          <div className="flex flex-wrap gap-3">
            {others.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() =>
                  setActive(SERVICES.items.findIndex((x) => x.id === it.id))
                }
                className="border border-rule-strong px-5 py-3 text-sm text-ink-soft transition-colors duration-300 hover:border-ink hover:text-ink"
              >
                <span className="label mr-2 text-ink-faint">{it.index}</span>
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
