import Image from "next/image";

/*
 * ロゴは logo2.svg(ベクター・確定素材)を使う。
 *
 * このSVGは「黒い矩形にロゴが穴として抜かれた」構造で、単体では
 * 白背景でのみ白ロゴに見える。サイトの地は暗いので、そのまま置くと消える。
 * そこで背後に白を敷いて「白ロゴ/黒背景」の合成を作り、
 * 既存素材と同じ .art-blend(mix-blend-mode: lighten)で黒を透過させる。
 * lighten は max(a,b) なので黒(0)は地をそのまま通し、白だけが残る。
 *
 * data-header-logo は Opening → Header の GSAP Flip 接続先の目印
 * (components/opening/OpeningSequence.tsx から Flip.fit の toEl として参照される)。
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
