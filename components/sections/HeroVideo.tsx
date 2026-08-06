"use client";

import { useEffect, useRef } from "react";
import { onOpeningDone } from "@/lib/sequence";

/*
 * Heroの背景動画。
 *
 * ═══════════════════════════════════════════════════════════════
 *  構図の問題と、その解き方
 *
 *  生成された素材は車両が画面いっぱいに写っており、指示していた
 *  「左に35〜40%の余白」は入っていない。素材を作り直すより、
 *  **CSSで構図を作り直すほうが速く、確実で、可逆**なのでそうしている。
 *
 *    ① object-position を右に寄せ、車の前面を画面右2/3へ送る
 *    ② 左から黒のグラデーションを被せ、文字が乗る面を作る
 *
 *  ②は単なる減光ではない。素材の背景が黒なので、グラデーションは
 *  「暗くする」のではなく「車の線画だけを左端で消す」役割になる。
 * ═══════════════════════════════════════════════════════════════
 *
 * 再生開始はOpening(幕)の終了に同期させる。幕の裏で先に走らせると、
 * 幕が開いた瞬間には停止済みの車が映ってしまい、
 * 「走ってきて停まる」という最初の1カットが失われる。
 *
 * markOpeningDone() は OpeningSequence.tsx 側で、白(flash)が完全に
 * 引ききったタイミングに合わせて呼ばれる(以前は引き始めと同時に
 * 呼んでいたため、幕が開いた瞬間には車がもう到着していた。
 * 指摘を受けて OpeningSequence.tsx 側の発火位置を直した)。
 */

const SRC = "/video/hero-suv.mp4";

export default function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    /*
     * reduced-motion では再生しない。停止したまま先頭フレームが
     * 残るので、静止画を別途用意しなくても絵は成立する。
     * stateにせずここで直接読むのは、この判定が描画に影響せず
     * 再レンダーを起こす必要が無いため。
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return onOpeningDone(() => {
      const el = video.current;
      if (!el) return;
      /*
       * play() は Promise を返し、ユーザー操作前だと reject し得る。
       * muted + playsInline なので通常は通るが、失敗しても
       * 静止したまま最初のフレームが残るだけで害はない。
       */
      void el.play().catch(() => {});
    });
  }, []);

  return (
    <div
      aria-hidden
      /*
       * lg未満: 映像とコピーを上下に分ける(実測: 幅が無い画面では
       * 右寄せの映像とコピーの左寄せが両立せず、字が車体に埋もれて
       * 読めなくなっていた)。ここでは絶対配置をやめ、通常フローの
       * ブロックとしてセクション先頭に置く。
       *
       * lg以上: 従来通り、セクション全体に敷く背景として絶対配置に戻す。
       */
      className="pointer-events-none relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto"
    >
      {/*
        lg以上: 映像は画面いっぱいに敷かず、**右側だけ**に置く。

        素材は車がフレーム全体を占めており、object-cover で敷くと
        左のコピー領域まで車体が侵してくる(実測: 見出しの裏に
        グリルの FORESIGHT が透けた)。

        素材の地が純黒なので、コンテナを小さくしても継ぎ目は見えない。
        レターボックスの黒帯がそのままページの地に溶ける。
        これが「黒地の素材」を扱えるときの一番きれいな解き方。

        lg未満: コピーは映像の下に分けたので「右側だけに置く」構図は
        不要。マスクで縁を透明にフェードさせる作りだと、枠の外側に
        煙(素材に焼き込み済み)がぼんやり滲んで見え、地の黒との境目が
        曖昧な「ボヤっとしたアニメーション」に見えていた(実測)。
        枠いっぱいに敷いてマスクを外し、境界をはっきりさせる。
      */}
      <div className="hero-video-frame absolute inset-0 lg:inset-auto lg:right-0 lg:top-1/2 lg:aspect-[16/9] lg:w-[68%] lg:-translate-y-1/2">
        <video
          ref={video}
          src={SRC}
          muted
          playsInline
          preload="auto"
          /*
           * ループさせない。走ってきて停まる動きなので、
           * 繰り返すと車が瞬間移動して戻ることになる。
           * 停止した最終フレームがそのままHeroの絵になる。
           */
          className="h-full w-full object-cover object-[center_38%] lg:object-center"
        />
      </div>

      {/*
        左からのスクリム。コピーが乗る面を作る。

        濃くすると文字は読みやすいが、車が左半分から完全に消えて
        「黒い帯にテキストが乗っただけ」の絵になる。
        車体の線がうっすら透ける程度まで薄くして、
        映像とコピーが同じ画面に居る状態を保つ。

        lg未満はコピーを映像の下へ分けたので、文字を読ませるための
        減光がそもそも要らない。中途半端に暗い映像になるだけなので外す。
      */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,6,0.92) 0%, rgba(5,5,6,0.78) 20%, rgba(5,5,6,0.42) 34%, rgba(5,5,6,0.08) 50%, rgba(5,5,6,0) 62%)",
        }}
      />

      {/*
        上下の締め。ヘッダーとスクロールキューの可読性を確保しつつ、
        映像の矩形の縁が見えないようにする。
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,9,9,0.8) 0%, rgba(9,9,9,0) 20%, rgba(9,9,9,0) 70%, rgba(9,9,9,0.92) 100%)",
        }}
      />
    </div>
  );
}
