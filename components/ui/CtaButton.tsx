import Link from "next/link";

/*
 * CTA。完全モノクロのため、優先度は「色」ではなく「面の反転」で表す。
 * primary   = 白面に黒文字(最も強い)
 * secondary = 罫線のみ、ホバーで反転
 */
export default function CtaButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "group inline-flex min-h-[3.25rem] items-center justify-center gap-4 px-8 text-sm tracking-[0.12em] transition-colors duration-300 sm:min-w-[13rem]";

  const styles =
    variant === "primary"
      ? "bg-ink text-void hover:bg-ink-soft"
      : "border border-rule-strong text-ink hover:bg-ink hover:text-void";

  const arrow = (
    <span
      aria-hidden
      className="transition-transform duration-300 group-hover:translate-x-1"
    >
      →
    </span>
  );

  /*
   * ページ内アンカー(#で始まる)は素の <a> にする。
   *
   * next/link の <Link> は要素レベルで自分の onClick を先に発火させ、
   * hash遷移でも preventDefault() を呼ぶ。SmoothScrollProvider は
   * document のバブリングでクリックを拾って慣性スクロールへ横取りするが、
   * <Link> が先に preventDefault 済みだと横取りする前提が崩れ、
   * ボタンを押しても一切スクロールしなくなる(実測で確認した不具合)。
   *
   * #以外(実ページへの遷移)は引き続き next/link の恩恵(prefetch等)を使う。
   */
  if (href.startsWith("#")) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`}>
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      {arrow}
    </Link>
  );
}
