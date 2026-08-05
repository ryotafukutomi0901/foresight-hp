import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/content";

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${BRAND.name}`,
};

/*
 * プライバシーポリシー。
 *
 * ═══════════════════════════════════════════════════════════════
 *  内容は「実際にこのサイトがやっていること」だけに絞ってある。
 *
 *  Contact.tsx のフォームが集める項目(お名前・メールアドレス・
 *  電話番号(任意)・車の状態やご相談内容)以外は書いていない。
 *  Cookie計測やアクセス解析は現状導入していないので、
 *  「導入していません」と書く(将来入れたらここを更新する)。
 *
 *  事業者の所在地・古物商許可番号などの実在情報は
 *  lib/content.ts の COMPANY で TODO(CEO) のまま。
 *  この文書でも同じ扱いにし、実在しない情報を作らない。
 * ═══════════════════════════════════════════════════════════════
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-svh bg-void pb-32 pt-40 text-ink">
      <div className="container-x">
        <p className="label text-ink-faint">LEGAL</p>
        <h1 className="mt-6 text-display-l font-normal text-ink">
          プライバシーポリシー
        </h1>

        <div className="mt-16 flex max-w-2xl flex-col gap-12 text-sm leading-[2.2] text-ink-soft">
          <section>
            <h2 className="text-display-s font-normal text-ink">
              取得する情報
            </h2>
            <p className="mt-4">
              お問い合わせフォームの送信時に、お名前・メールアドレス・
              電話番号（任意）・車の状態やご相談内容をお預かりします。
              これ以外の情報を取得することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-display-s font-normal text-ink">利用目的</h2>
            <p className="mt-4">
              お預かりした情報は、お問い合わせへの回答・買取や販売のご相談の
              対応にのみ使用します。ご本人の同意なく第三者へ提供することは
              ありません。
            </p>
          </section>

          <section>
            <h2 className="text-display-s font-normal text-ink">
              Cookie・アクセス解析
            </h2>
            <p className="mt-4">
              現時点で、アクセス解析や広告配信のためのCookieは導入して
              いません。今後導入する場合は、この文書を更新してお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-display-s font-normal text-ink">
              保有個人データの開示・削除
            </h2>
            <p className="mt-4">
              お預かりした情報の開示・訂正・削除をご希望の場合は、
              お問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <p className="text-xs text-ink-faint">
            制定日: 2026年8月
            <br />
            TODO(CEO):
            事業者名・所在地・連絡先等の確定情報が決まり次第、本文へ追記する。
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
