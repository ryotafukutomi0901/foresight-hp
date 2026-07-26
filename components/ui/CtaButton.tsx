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

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
