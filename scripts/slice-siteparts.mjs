/*
 * public/siteparts.png(10分割のリファレンスシート)から、
 * 作画部分だけを10枚の個別アセットとして切り出す。
 *
 * なぜ切り出すか(元画像をCSSで表示する案を採らない理由):
 *  1. 各セルには番号・タイトル・キャプションの日本語が焼き込まれている。
 *     サイト本体のビジュアルとして使うには、この文字帯を除外する必要がある。
 *  2. 個別ファイルにすると next/image が1枚ずつ最適サイズのAVIFを配信でき、
 *     必要な画像だけを遅延読み込みできる(元画像を毎回1.9MB読ませずに済む)。
 *
 * 切り出し範囲は、セル内の行ごとの平均輝度を測って
 * 「タイトル帯 → 作画 → キャプション帯」の境界を割り出した実測値。
 *
 * 実行: node scripts/slice-siteparts.mjs
 * (sharp は Next.js の依存として既に存在するため追加インストール不要)
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/siteparts.png");
const OUT_DIR = path.join(ROOT, "public/images/foresight/vehicle-parts");

const COLS = 5;
const ROWS = 2;
const CELL_W = 1536 / COLS; // 307.2
const CELL_H = 1024 / ROWS; // 512

// セル内で作画のみが残る範囲(輝度プロファイルによる実測)
const ART_TOP = 92; // タイトル帯の下端
const ART_BOTTOM = 388; // キャプション帯の上端

/*
 * セルの枠線は5等分の境界ちょうどには引かれておらず、
 * 実測では x≈15 / 930 / 1219 / 1520 に明るい縦線がある。
 * 9pxのインセットではこれらが切り出しに残り、画像の縁に
 * 白い直線として現れた(実測で確認)。20pxまで広げると全て範囲外になる。
 */
const SIDE_INSET = 20;

const NAMES = [
  "01-suv-whole",
  "02-suv-side",
  "03-front-face",
  "04-tire-suspension",
  "05-engine",
  "06-damaged",
  "07-transport",
  "08-repair",
  "09-parts-reuse",
  "10-next-journey",
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (let i = 0; i < NAMES.length; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);

  const region = {
    left: Math.round(col * CELL_W + SIDE_INSET),
    top: Math.round(row * CELL_H + ART_TOP),
    width: Math.round(CELL_W - SIDE_INSET * 2),
    height: ART_BOTTOM - ART_TOP,
  };

  const out = path.join(OUT_DIR, `${NAMES[i]}.webp`);

  /*
   * 元の作画はモーションラインがセルの縁まで伸びているため、
   * どこで切っても断面が「直線の白い縁」として残ってしまう。
   * そこで縁のアルファを落として黒へ溶かす(フェザー)。
   *
   * サイト側は mix-blend-mode: lighten で黒背景に合成しているため、
   * アルファが0に近づくほど背景の黒に沈み、切り口が見えなくなる。
   */
  const { data, info } = await sharp(SRC)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const FEATHER = 16;
  const alpha = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      const t = Math.min(1, d / FEATHER);
      // smoothstep で直線的な減衰よりも自然な溶け方にする
      alpha[y * w + x] = Math.round(255 * t * t * (3 - 2 * t));
    }
  }

  // 白黒の線画のため、非可逆圧縮は輪郭を汚す。可逆WebPで元の階調を保つ。
  await sharp(data, { raw: { width: w, height: h, channels: info.channels } })
    .joinChannel(alpha, { raw: { width: w, height: h, channels: 1 } })
    .webp({ lossless: true })
    .toFile(out);

  const { size } = fs.statSync(out);
  console.log(
    `${NAMES[i]}.webp  ${region.width}x${region.height}  ${(size / 1024).toFixed(0)} KB`,
  );
}

console.log(`\n${NAMES.length}枚を ${path.relative(ROOT, OUT_DIR)} に出力しました。`);
