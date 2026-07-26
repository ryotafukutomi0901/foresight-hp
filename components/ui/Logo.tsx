import Image from "next/image";

/*
 * ロゴ(logo2.PNG)は白抜き/純黒背景で、周囲に大きな余白が焼き込まれている。
 * そのまま小さく置くとマークが潰れるため、マーク部分だけを枠で切り出して拡大表示する。
 * (画像自体は改変せず、クロップと拡大のみで対応している)
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
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: "1.55 / 1" }}
    >
      <Image
        src="/logo2.PNG"
        alt="Foresight"
        fill
        sizes="200px"
        priority={priority}
        className="art-blend scale-[1.85] object-contain"
      />
    </span>
  );
}
