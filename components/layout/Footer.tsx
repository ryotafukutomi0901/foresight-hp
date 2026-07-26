import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { BRAND, COMPANY, NAV } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-void">
      {/* 会社情報。セクションとして肥大させず、フッター直上にコンパクトに置く */}
      <section
        id="company"
        aria-labelledby="company-heading"
        className="container-x py-24"
      >
        <h2 id="company-heading" className="label text-ink-faint">
          {COMPANY.label}
        </h2>
        <dl className="mt-10 max-w-3xl border-t border-rule">
          {COMPANY.rows.map((row) => (
            <div
              key={row.k}
              className="flex flex-col gap-1 border-b border-rule py-5 sm:flex-row sm:gap-10"
            >
              <dt className="text-xs tracking-[0.16em] text-ink-faint sm:w-52 sm:shrink-0">
                {row.k}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{row.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-x flex flex-col gap-10 border-t border-rule py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo className="w-32" />
          <p className="text-xs leading-relaxed text-ink-faint">
            {BRAND.core}
            <br />
            {BRAND.enUpper}
          </p>
        </div>

        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label text-ink-soft transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-x border-t border-rule py-6">
        <p className="text-[0.65rem] tracking-[0.2em] text-ink-faint">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  );
}
