import Hero from "@/components/sections/Hero";
import BrandMessage from "@/components/sections/BrandMessage";
import Services from "@/components/sections/Services";
import Contact from "@/components/sections/Contact";

/*
 * 単一ページ構成。
 *
 * ═══════════════════════════════════════════════════════════════
 *   HERO        生成した実映像。車が右から走ってきて停まり、
 *               ヘッドライトが灯って左のコピーを照らす
 *   PHILOSOPHY  ここだけ明転する。暗→明→暗の切り替わりで、
 *               章が変わったことを地の色そのもので伝える
 *   SERVICES    売る / 買う / 探す をタブ1つに束ねた章
 *   CONTACT     問い合わせ
 * ═══════════════════════════════════════════════════════════════
 *
 * SERVICES は以前 Sell / Buy / Find の3セクションに分かれていた。
 * 縦に3つ並ぶと1章あたりの情報が薄まり、スクロールしても
 * 「同じような章がまた来た」としか感じられなかったため統合した。
 * NAV の #sell / #buy / #find は Services 内のアンカーが受けている。
 *
 * SELL = お客様が売る(買取) / BUY = お客様が買う(販売)。
 * 顧客目線の命名で、lib/content.ts の定数と一致させている。
 *
 * 実績・買取台数・お客様の声等のセクションは意図的に作らない
 * (存在しない情報を創作しない)。
 */
export default function Page() {
  return (
    <>
      <Hero />
      <BrandMessage />
      <Services />
      <Contact />
    </>
  );
}
