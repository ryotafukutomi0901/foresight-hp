/*
 * 被写体を中央に置いた正方形キャンバスへ整える。
 *
 * 回廊の板は正方形（V-01が正方形）で、シェーダの edgeFeather 0.34 が
 * 外周を削るため、被写体の長辺が全体の76%（=各辺12%の黒余白）に収まる
 * 構図へ正規化する。被写体自体は拡縮しない — キャンバスを足すだけ。
 *
 * 使い方: node scripts/square-pad.mjs <入力> <出力> [出力辺px]
 */
import sharp from "sharp";

const SUBJECT_RATIO = 0.76; // 長辺が占める割合 = 余白12%×2

export async function squarePad(src, out, size = 4096) {
  const meta = await sharp(src).metadata();

  // 被写体のバウンディングボックスを縮小版で測る（全画素走査は遅い）
  const P = 1024;
  const probe = sharp(src, { limitInputPixels: false })
    .greyscale()
    .resize(P, P, { fit: "inside" });
  const { data, info } = await probe.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[y * W + x] > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

  const sx = meta.width / W, sy = meta.height / H;
  const bw = (x1 - x0) * sx, bh = (y1 - y0) * sy;
  const cx = ((x0 + x1) / 2) * sx, cy = ((y0 + y1) / 2) * sy;
  const side = Math.round(Math.max(bw, bh) / SUBJECT_RATIO);

  /*
   * ⚠️ extend と extract を1つのパイプラインに並べない。
   * sharp は呼び出し順ではなく固定の順序で適用するため、
   * extend後の座標系で extract したつもりが元画像の座標で評価され
   * "bad extract area" になる。**必ず2パスに分ける。**
   */
  /*
   * 必要な分だけ黒を足す。全周に side だけ足すと
   * (side*3)^2 が sharp の画素数上限(268M)を超える。
   */
  const wantLeft = Math.round(cx - side / 2);
  const wantTop = Math.round(cy - side / 2);
  const padL = Math.max(0, -wantLeft);
  const padT = Math.max(0, -wantTop);
  const padR = Math.max(0, wantLeft + side - meta.width);
  const padB = Math.max(0, wantTop + side - meta.height);

  const padded = await sharp(src, { limitInputPixels: false })
    .extend({
      top: padT, bottom: padB, left: padL, right: padR,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer();

  await sharp(padded, { limitInputPixels: false })
    .extract({
      left: wantLeft + padL,
      top: wantTop + padT,
      width: side,
      height: side,
    })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);

  return { side, subject: { w: bw, h: bh } };
}

if (process.argv[1]?.endsWith("square-pad.mjs")) {
  const [, , src, out, size] = process.argv;
  const r = await squarePad(src, out, size ? Number(size) : 4096);
  console.log(`  正方形化: 被写体 ${Math.round(r.subject.w)}×${Math.round(r.subject.h)} → キャンバス ${r.side}px → 出力 ${size || 4096}px`);
}
