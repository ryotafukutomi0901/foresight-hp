import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { BRAND, COMPANY, NAV } from "@/lib/content";

/*
 * 法務ページ。プライバシーポリシー・利用規約は実ページとして存在する
 * (app/privacy, app/terms)。footerだけの定数として持つ理由は、
 * ヘッダーのNAVと違い「ページ内アンカーではない実route」なので
 * lib/content.ts の NAV/CTA(すべて#始まり)とは型が違うため。
 */
const LEGAL_LINKS = [
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
] as const;

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

        {/*
          ヘッダーと着地先を統一する。
          NAV はヘッダーが読んでいる定数と同一のものをそのまま使うので、
          将来ヘッダー側の構成が変わってもフッターだけ古いままにならない。
          ページ内アンカー(#始まり)は素の <a> で。next/link の <Link> は
          クリックを先取りして SmoothScrollProvider の慣性スクロールへの
          横取りを壊す(実測で確認済みの不具合。CtaButton/Header と同じ対策)。
        */}
        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="label text-ink-soft transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-x flex flex-col gap-6 border-t border-rule py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.65rem] tracking-[0.2em] text-ink-faint">
          © {new Date().getFullYear()} {BRAND.name}
        </p>

        {/* こちらは実routeへの遷移なので next/link のまま(prefetchの恩恵を受ける) */}
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[0.65rem] tracking-[0.15em] text-ink-faint transition-colors duration-300 hover:text-ink-soft"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
