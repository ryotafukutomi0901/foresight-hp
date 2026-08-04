"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { stage as S } from "@/lib/tokens";

/*
 * 車両を包む環境光。
 *
 * directionalLight だけだと、面の向きが変わっても明るさが
 * 一様に変化するだけで、ボディラインに沿って流れるハイライトが
 * 出ない。環境マップを与えると面の変化が光の帯として読めるようになり、
 * 輪郭線だけでは伝わらない立体の起伏が見えてくる。
 *
 * 床は置かない(下記)。
 */

export default function Stage() {
  return (
    <>
      {/*
        床は置かない。

        当初は MeshReflectorMaterial の床を敷いて接地感を出そうとしたが、
        実測で**平面の地平線が画面を横切る**という致命的な副作用が出た。
        暗闇に浮かぶというアートディレクションが根本から壊れる。

        参照資料 vehicle180.png にも床は無く、車は黒地に浮いている。
        接地は影や反射ではなく「線で描かれた車体そのもの」で成立させる。
      */}

      {/*
        環境マップ。

        drei の preset は外部CDNから .hdr を取りに行くため使わない
        (オフラインで壊れる / 転送量が増える)。Lightformer を並べて
        その場で焼く。frames={1} なので初回1フレームだけの負荷。

        配置はスタジオ撮影の定石に寄せている。真上の大きな面光源で
        ルーフとボンネットを起こし、左右の縦長で「ボディラインに沿って
        流れるハイライト」を作る。この縦の帯が車の面の変化を読ませる。
      */}
      <Environment resolution={S.envResolution} frames={1}>
        {/* トップライト。ルーフとボンネットの面を起こす */}
        <Lightformer
          form="rect"
          intensity={S.envTop}
          position={[0, 6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[14, 14, 1]}
        />

        {/* 左右の縦帯。ボディサイドを縦に流れるハイライトになる */}
        <Lightformer
          form="rect"
          intensity={S.envSide}
          position={[-7, 2.4, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 3.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={S.envSide}
          position={[7, 2.4, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[10, 3.2, 1]}
        />

        {/* 前方の弱い面。フロントガラスとグリルに映り込む */}
        <Lightformer
          form="rect"
          intensity={S.envFront}
          position={[0, 2.2, -8]}
          rotation={[0, 0, 0]}
          scale={[8, 3, 1]}
        />
      </Environment>
    </>
  );
}
