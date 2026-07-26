import Image from "next/image";

/*
 * 鷹エンブレム(hawk-master.PNG)を、翼だけ独立して動かせる形で描画する。
 *
 * 素材は1枚のラスター画像で、レイヤー分割されたファイルは存在しない。
 * そこで同じ画像を3回描画し、それぞれ異なる clip-path で領域を切り出す
 * 「2Dカットアウト・パペット」方式を採る。ベクタートレースを挟まないため、
 * 承認済みアートワークを1ピクセルも改変しない。
 *
 * 分割は public/hawk-parts.PNG（パーツ設計図）が規定する構成に従う:
 *   左翼 / 右翼 / 中央(顔・ボディ・尻尾・爪)
 *
 * 継ぎ目が出ない理由:
 *  - 全レイヤーを mix-blend-mode: lighten で合成している。lighten は max(a,b) なので、
 *    同一の画像が重なっても値が変わらず、重複部分に境界が原理的に発生しない。
 *    (screenだと 1-(1-a)(1-b) で中間調が重なると明るくなり、羽根の階調が
 *     白飛びして縦帯状の継ぎ目になる)
 *  - 中央レイヤーを翼より広く取り、翼の切り口を常に覆っている。
 *    lighten では重ねるコストがゼロなので、余分に重ねるほど安全になる。
 *  - 翼の回転支点を「肩」(切り口の位置)に置いているため、中央レイヤーと接する
 *    内側の画素はほとんど動かない。動くのは支点から遠い外側だけ。
 *
 * グラデーションマスクは使わない。マスクを掛けると半透明の帯ができ、
 * それ自体が白い帯として見えてしまう(実測で確認済み)。
 */

const SRC = "/hawk-master.PNG";
const ALT = "";

/* 画像座標(1672×941)に対する各パーツの占有領域から決めたクリップ範囲 */
const CLIP = {
  // 左翼: 画面左半分の上寄り。爪(y65%以降)は含めない
  wingLeft: "polygon(0% 0%, 44% 0%, 44% 65%, 0% 65%)",
  wingRight: "polygon(56% 0%, 100% 0%, 100% 65%, 56% 65%)",
  // 中央: 上は顔と胴、下は爪と尻尾のT字。翼の切り口(44%/56%)を覆えるよう
  // 左右に余裕を持たせている
  core: "polygon(40% 0%, 60% 0%, 60% 65%, 64% 65%, 64% 100%, 36% 100%, 36% 65%, 40% 65%)",
} as const;

function Layer({
  clip,
  attr,
  priority,
}: {
  clip: string;
  attr: string;
  priority?: boolean;
}) {
  return (
    <span
      {...{ [attr]: "" }}
      className="art-blend absolute inset-0 block"
      style={{ clipPath: clip, willChange: "transform" }}
    >
      <Image
        src={SRC}
        alt={ALT}
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}

export default function EagleFigure({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      data-eagle
      aria-hidden
      className={`relative ${className}`}
      style={{ aspectRatio: "1672 / 941" }}
    >
      {/* 奥から: 左翼 → 右翼 → 中央(最前面で翼の切り口を覆う) */}
      <Layer clip={CLIP.wingLeft} attr="data-wing-left" />
      <Layer clip={CLIP.wingRight} attr="data-wing-right" />
      <Layer clip={CLIP.core} attr="data-eagle-core" priority />
    </div>
  );
}
