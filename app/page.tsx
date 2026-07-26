import Hero from "@/components/sections/Hero";
import BrandMessage from "@/components/sections/BrandMessage";
import Buy from "@/components/sections/Buy";
import Sell from "@/components/sections/Sell";
import Auction from "@/components/sections/Auction";
import Contact from "@/components/sections/Contact";

/*
 * 単一ページ構成。
 * 「見る → 状態を超えて考える → 可能性を見つける → BUY → SELL → AUCTION → 次の人へつなぐ」
 * という線形のストーリーを、ページ分割で分断しない。
 *
 * 実績・買取台数・お客様の声等のセクションは意図的に作らない
 * (存在しない情報を創作しない)。
 */
export default function Page() {
  return (
    <>
      <Hero />
      <BrandMessage />
      <Buy />
      <Sell />
      <Auction />
      <Contact />
    </>
  );
}
