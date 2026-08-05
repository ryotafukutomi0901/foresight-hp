import Image from "next/image";

/*
 * ロゴ。背景を透過させたPNG(logo-mark-trim.png)を使う。
 *
 * ═══════════════════════════════════════════════════════════════
 *  なぜ合成をやめたのか
 *
 *  以前は logo2.svg(黒い矩形にロゴが穴として抜かれた素材)の背後に
 *  白を敷き、mix-blend-mode: lighten で黒を透過させていた。
 *
 *  この方式は**ヘッダーを透過にした時点で破綻する**。
 *  ブレンドは stacking context の中でしか効かず、ヘッダーは
 *  fixed + z-index で自前の context を作る。結果、ロゴの黒地が
 *  そのまま黒い矩形として残り、スクロールすると切り抜きだと分かる
 *  (実測。ヘッダー左上に 110×80px の黒い箱が見えていた)。
 *
 *  素材側の黒をアルファに落としてしまえば、合成モードにも
 *  祖先の構造にも依存しなくなる。線画で使ったのと同じ判断。
 *  (ffmpeg の lumakey で logo2.PNG から生成)
 * ═══════════════════════════════════════════════════════════════
 *
 * data-header-logo は Opening → Header のロゴ着地点の目印。
 */
export default function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      data-header-logo
      className={`relative block ${className}`}
      /* トリム後の実寸比。余白を削ってあるので元SVGとは比率が違う */
      style={{ aspectRatio: "952 / 564" }}
    >
      <Image
        src="/logo-mark-trim.png"
        alt="Foresight"
        fill
        sizes="200px"
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
