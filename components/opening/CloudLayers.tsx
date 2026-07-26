import Image from "next/image";

/*
 * 雲。4枚それぞれ役割が違うため、汎用の「雲」として扱わない。
 *
 *  cloud3 (縦長・中央が発光する雲の谷) … 鷹が上昇していく通路。奥に敷く
 *  cloud   (左上に寄った雲塊)          … 画面を上手から覆う
 *  cloud4  (右下に寄った雲塊)          … 画面を下手から覆う(cloudと対で挟み込む)
 *  cloud2  (ほぼ白の雲海)              … 遷移のピーク輝度
 *
 * すべて白抜き/純黒背景のため mix-blend-mode: screen で合成する。
 * 黒画素は背景を素通しするので、切り抜き処理が要らない。
 *
 * モバイルは転送量と合成コストを抑えるため、corridorと2枚だけを使う
 * (data-cloud-desktop は lg 未満で非表示)。
 */
export default function CloudLayers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/*
        上昇通路。飛翔ビートで下方向へ流し、鷹が昇っていく視差を作る。

        中央寄せに Tailwind の -translate-x-1/2 を使わないこと。
        GSAPが yPercent / scale を書き込むとtransformが丸ごと置き換わり、
        -50%の中央寄せが失われてレイヤーの縁が画面内に現れる。
        transformを使わない負のオフセットで中央に置く。
      */}
      <div
        data-cloud-corridor
        className="art-blend absolute -left-[15%] -top-[45%] h-[190%] w-[130%] opacity-0"
      >
        <Image
          src="/cloud3.PNG"
          alt=""
          fill
          sizes="130vw"
          className="object-cover"
        />
      </div>

      {/*
        上手・下手から差し込む雲。
        平行移動させるため、画面ぴったりの大きさだとレイヤー自身の矩形の縁が
        画面内に入り込んでしまう。周囲に30%ずつ余裕を持たせ、動かしても
        常に画面を覆い切るようにしている(はみ出し分は親のoverflow-hiddenで切る)。
      */}
      <div
        data-cloud-in="left"
        className="art-blend absolute -inset-[30%] opacity-0"
      >
        <Image
          src="/cloud.jpg"
          alt=""
          fill
          sizes="160vw"
          className="object-cover object-left-top"
        />
      </div>

      {/* 下手から差し込む雲(デスクトップのみ) */}
      <div
        data-cloud-in="right"
        data-cloud-desktop
        className="art-blend absolute -inset-[30%] hidden opacity-0 lg:block"
      >
        <Image
          src="/cloud4.PNG"
          alt=""
          fill
          sizes="160vw"
          className="object-cover object-right-bottom"
        />
      </div>

      {/* ホワイトアウト。ここが遷移のピーク */}
      <div
        data-cloud-whiteout
        className="art-blend absolute inset-0 opacity-0"
      >
        <Image
          src="/cloud2.PNG"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
