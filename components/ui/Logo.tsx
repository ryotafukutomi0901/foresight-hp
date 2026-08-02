import Image from "next/image";

/*
 * ロゴは logo2.svg(ベクター・確定素材)を使う。
 *
 * このSVGは「黒い矩形にロゴが穴として抜かれた」構造で、単体では
 * 白背景でのみ白ロゴに見える。サイトの地は暗いのでそのままでは消える。
 * そこで背後に白を敷いて「白ロゴ/黒地」の合成を作り、
 * mix-blend-mode:lighten で黒を透過させる。lighten は max(a,b) なので
 * 黒(0)は地をそのまま通し、白いロゴだけが残る。
 *
 * ⚠️ invert(1) だけで済ませようとすると、SVGの地が白に反転して
 *    白い矩形として残る(実測)。ブレンドは必須。
 *
 * data-header-logo は Opening → Header のロゴ着地点の目印
 * (components/opening/OpeningSequence.tsx から参照される)。
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
      className={`art-blend relative block bg-white ${className}`}
      style={{ aspectRatio: "1536 / 1085" }}
    >
      <Image
        src="/logo2.svg"
        alt="Foresight"
        fill
        sizes="200px"
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
