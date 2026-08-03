import Hero from "@/components/sections/Hero";
import BrandMessage from "@/components/sections/BrandMessage";
import Sell from "@/components/sections/Sell";
import Buy from "@/components/sections/Buy";
import Find from "@/components/sections/Find";
import Contact from "@/components/sections/Contact";

/*
 * 単一ページ構成。
 *
 * ═══════════════════════════════════════════════════════════════
 *  Loading終了後からContactまで、**1台のSUVが旅を続ける
 *  一本の映像作品**として設計する。
 *
 *  車両は app/layout.tsx 直下の VehicleSceneMount が持つ単一Canvasに
 *  1インスタンスだけ存在し、セクションを跨いで状態を引き継ぐ。
 *  各セクションは車両を持たず、ScrollTriggerで lib/viewProgress を
 *  書き換えることで「その区間での車の振る舞い」を指示する。
 * ═══════════════════════════════════════════════════════════════
 *
 *   HERO        右から走行 → 3/4ビューで停止 → ヘッドライト点灯
 *               (サイトで唯一の自動再生。以降は全てスクロール連動)
 *   PHILOSOPHY  回転してリアを見せ、ハッチが開き、荷室から光と言葉
 *   SELL        ハッチを閉じ、側面へ。スキャンラインが車体を走る
 *   BUY         カメラが周回し、ホイール/グリル/ライトを見せる
 *   FIND        再び走行姿勢へ。タイヤが回り、光の道が分岐する
 *   CONTACT     減速し、ライトが落ち、静かに停まる
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
      <Sell />
      <Buy />
      <Find />
      <Contact />
    </>
  );
}
