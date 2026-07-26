import Hero from "@/components/sections/Hero";
import Vision from "@/components/sections/Vision";
import BrandMessage from "@/components/sections/BrandMessage";
import Unseen from "@/components/sections/Unseen";
import Narrative from "@/components/sections/Narrative";
import Buy from "@/components/sections/Buy";
import Sell from "@/components/sections/Sell";
import Auction from "@/components/sections/Auction";
import Contact from "@/components/sections/Contact";

/*
 * 単一ページ構成。1本の映画のようなスクロール体験として並べる。
 *
 *   HERO        車の未来を、見通す。          第一印象
 *   VISION      霧の中から視界が開く(R3F)     「見る」という行為そのもの
 *   PHILOSOPHY  SEE BEYOND THE CONDITION.     視点の提示
 *   UNSEEN      状態を一語ずつ                 状態は価値ではない
 *   NARRATIVE   10枚のビジュアル               見る→その先を見る→価値を戻す→次へ
 *   BUY/SELL/AUCTION                          具体的に何をやれるか
 *   CONTACT                                   行動
 *
 * 認知の変化(車を見る → 理解する → 価値を見つける → 次の可能性を見る)を
 * スクロール順そのもので起こすことを狙っている。
 *
 * 実績・買取台数・お客様の声等のセクションは意図的に作らない
 * (存在しない情報を創作しない)。
 */
export default function Page() {
  return (
    <>
      <Hero />
      <Vision />
      <BrandMessage />
      <Unseen />
      <Narrative />
      <Buy />
      <Sell />
      <Auction />
      <Contact />
    </>
  );
}
