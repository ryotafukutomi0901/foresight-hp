"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { gsap, useScopedGsap, Flip } from "@/hooks/useGsap";
import { useReveal } from "@/hooks/useReveal";
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

  /* 下線を滑らせるための参照 */
  const tablistRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  /*
   * 進んだ/戻ったの向き。出入りの方向を決めるのに使う。
   *
   * ref をレンダー中に書くとReactの規約に反するので、
   * active と一緒に state で持つ。タブを選ぶ関数を1本にまとめ、
   * そこで前後の差を取る。
   */
  const [direction, setDirection] = useState(0);

  const selectTab = useCallback((next: number) => {
    setActive((prev) => {
      setDirection(next - prev);
      return next;
    });
  }, []);

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
      if (i >= 0) selectTab(i);
    };
    const onHash = () => selectTab(tabFromHash());

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, [selectTab]);

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
        if (ctx.conditions?.reduced) {
          gsap.set(scope.current?.querySelectorAll("[data-sv-tab]") ?? [], {
            autoAlpha: 1,
            y: 0,
          });
          return;
        }

        /*
         * タブそのものの出現。
         * 章の文章は useReveal が拾うので、ここはタブだけを見る。
         */
        gsap.from("[data-sv-tab]", {
          autoAlpha: 0,
          y: 12,
          duration: 0.6,
          ease: "brandOut",
          stagger: 0.08,
          scrollTrigger: {
            trigger: "[role=tablist]",
            start: "top 88%",
            once: true,
          },
        });
      },
    );
  }, []);

  /* 章の文章はすべて共通の仕掛けで、上から順に出す */
  useReveal(scope);

  /*
   * タブが切り替わったときの、入ってくる側の動き。
   *
   * ═══════════════════════════════════════════════════════════
   *  **移動の向き**で入る方向を変える。
   *
   *    番号が増える(01→02, 01→03, 02→03) … 下から入る
   *    番号が減る  (03→01, 02→01, 03→02) … 上から入る
   *
   *  3つのどの組み合わせでも成立する。向きは next-prev の符号だけで
   *  決まるので、6通りを個別に書き分ける必要がない。
   *  2つ飛ばし(01→03)でも「先へ跳んだ」ことが体で分かる。
   * ═══════════════════════════════════════════════════════════
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

    const from = direction >= 0 ? 26 : -26;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-sv-panel-item]",
        { autoAlpha: 0, y: from },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "brandOut",
          stagger: 0.06,
          overwrite: true,
        },
      );

      /*
       * ゴースト数字は桁を回してから確定させる。
       * どの番号からどの番号へ跳んでも同じように回るので、
       * 「切り替わった」ことがこの1箇所で必ず伝わる。
       */
      const ghost = el.querySelector<HTMLElement>("[data-sv-ghost]");
      const finalIndex = SERVICES.items[active].index;
      if (ghost) {
        gsap.fromTo(
          ghost,
          { opacity: 0, y: from * 0.6 },
          {
            opacity: 0.08,
            y: 0,
            duration: 0.75,
            ease: "brandOut",
            overwrite: true,
            onUpdate() {
              const p = this.progress();
              ghost.textContent =
                p < 0.7
                  ? String(Math.floor(Math.random() * 90) + 10)
                  : finalIndex;
            },
            onComplete() {
              ghost.textContent = finalIndex;
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [active, direction]);

  /*
   * タブの下線を滑らせる。
   *
   * ボタンごとに border-b を持たせると、切り替わりで下線が瞬間移動する。
   * 独立した1本を Flip で前の位置から新しい位置へ動かすと、
   * 隣り合わないタブ同士(01→03)でも間を滑って移動する。
   * Flip は始点と終点の矩形から補間するので、飛ぶ距離が変わっても実装は同じ。
   */
  useEffect(() => {
    const bar = indicatorRef.current;
    const list = tablistRef.current;
    if (!bar || !list) return;

    const target = list.querySelectorAll<HTMLElement>("[data-sv-tab]")[active];
    if (!target) return;

    const place = () => {
      bar.style.width = `${target.offsetWidth}px`;
      bar.style.transform = `translateX(${target.offsetLeft}px)`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place();
      return;
    }

    const state = Flip.getState(bar);
    place();
    Flip.from(state, { duration: 0.5, ease: "brandInOut", absolute: false });
  }, [active]);

  const item = SERVICES.items[active];

  return (
    <section
      ref={scope}
      data-chapter="services"
      id="services"
      aria-labelledby="services-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <span data-reveal aria-hidden className="block h-px w-full bg-rule-strong" />

        <p data-reveal className="label mt-6 text-ink-faint">
          {SERVICES.label}
        </p>

        <h2
          id="services-heading"
          className="mt-8 text-display-l font-normal leading-[1.22] text-ink"
        >
          <span data-reveal className="block">{SERVICES.headline}</span>
        </h2>

        <p data-reveal className="mt-6 text-body-l text-ink-soft">
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
          ref={tablistRef}
          role="tablist"
          aria-label="サービスの種類"
          className="relative mt-16 flex items-end gap-8 border-b border-rule sm:gap-12"
        >
          {/*
            滑る下線。各ボタンが自前で持つのではなく1本を動かす。
            位置と幅は上の useEffect が実測して当てる。
          */}
          <span
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute -bottom-px left-0 h-px bg-ink"
          />
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
                onClick={() => selectTab(i)}
                className={`flex items-baseline gap-3 pb-4 transition-colors duration-300 ${
                  on ? "text-ink" : "text-ink-faint hover:text-ink-soft"
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

      </div>
    </section>
  );
}
