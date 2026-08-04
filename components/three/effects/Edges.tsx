"use client";

import { useContext, useEffect, useMemo } from "react";
import { EffectComposerContext } from "@react-three/postprocessing";
import { EdgesEffect, type EdgesOptions } from "./EdgesEffect";

/*
 * EdgesEffect を EffectComposer の子として使えるようにするラッパー。
 *
 * 法線バッファは EffectComposer が作る NormalPass から受け取る。
 * 親側で <EffectComposer enableNormalPass> を指定しないと
 * normalPass が null になり、線が一切出ないので注意。
 */
export default function Edges({
  normalThreshold,
  depthThreshold,
  strength,
}: EdgesOptions = {}) {
  const { normalPass } = useContext(EffectComposerContext);

  /*
   * NormalPass や閾値が変わったら作り直す。
   *
   * 生成済みのエフェクトのuniformを書き換える方が安そうに見えるが、
   * useMemoの戻り値を後から書き換えるのはReact Compilerの
   * 不変条件に反する。ここで扱う値は起動後に変わらない
   * (tokensの定数と、Composer構築時のNormalPass)ので、
   * 作り直しで困る場面が無い。
   */
  const effect = useMemo(
    () =>
      new EdgesEffect(normalPass?.texture ?? null, {
        normalThreshold,
        depthThreshold,
        strength,
      }),
    [normalPass, normalThreshold, depthThreshold, strength],
  );

  /* 作り直しでシェーダが積み上がらないよう、古い方を解放する */
  useEffect(() => () => effect.dispose(), [effect]);

  return <primitive object={effect} />;
}
