import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/content";

export const metadata: Metadata = {
  title: `利用規約 | ${BRAND.name}`,
};

/*
 * 利用規約。
 * このサイトは問い合わせフォームのみで、決済や会員登録は行っていない。
 * 実態に合わせて、サイト利用に関する最小限の条項だけを置く。
 * 事業者としての正式な契約条項(準拠法・管轄裁判所等)は
 * COMPANY の情報確定後にCEO確認のうえ追記する。
 */
export default function TermsPage() {
  return (
    <main className="min-h-svh bg-void pb-32 pt-40 text-ink">
      <div className="container-x">
        <p className="label text-ink-faint">LEGAL</p>
        <h1 className="mt-6 text-display-l font-normal text-ink">利用規約</h1>

        <div className="mt-16 flex max-w-2xl flex-col gap-12 text-sm leading-[2.2] text-ink-soft">
          <section>
            <h2 className="text-display-s font-normal text-ink">
              本サイトについて
            </h2>
            <p className="mt-4">
              本サイトは、{BRAND.name}
              が提供する中古車買取・販売・オークション代行に関する
              お問い合わせを受け付けるためのものです。サイト上での決済や
              契約の締結は行っておらず、実際の買取・販売条件は
              お問い合わせいただいた後、個別にご案内します。
            </p>
          </section>

          <section>
            <h2 className="text-display-s font-normal text-ink">禁止事項</h2>
            <p className="mt-4">
              虚偽の情報でのお問い合わせ、本サイトの運営を妨げる行為は
              ご遠慮ください。
            </p>
          </section>

          <section>
            <h2 className="text-display-s font-normal text-ink">免責事項</h2>
            <p className="mt-4">
              本サイトに掲載する情報は正確を期していますが、内容の完全性を
              保証するものではありません。実際の買取価格・販売価格・
              取引条件は、個別のご相談・査定の結果に基づきます。
            </p>
          </section>

          <p className="text-xs text-ink-faint">
            制定日: 2026年8月
            <br />
            TODO(CEO): 事業者としての正式な契約条項は確定情報が決まり次第追記する。
          </p>

          {/*
            #top はこのページに存在しないので、素の <a href="#top"> では
            何も起きない(SmoothScrollProviderがtarget無しで早期returnし、
            ブラウザのネイティブ挙動もマッチする要素が無いため無反応)。
            別ページへの実遷移なので next/link で良い。
          */}
          <Link
            href="/"
            className="label inline-block text-ink-soft transition-colors duration-300 hover:text-ink"
          >
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
