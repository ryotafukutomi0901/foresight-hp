/*
 * 和文フォントのサブセット生成。
 *
 * Google Fonts の Shippori Mincho は約120のunicode-rangeに分割されて配信される。
 * 和文ページは多数の部分集合にまたがるため、preload:false でも実測63ファイル/865KB
 * 落ちてきていた。これは総転送量の予算(1229KB)の7割を1書体が占めている状態。
 *
 * このサイトの本文は lib/content.ts 等に静的に持っているので、
 * 「実際に出る文字」だけを含む1ファイルへ焼き直せる。書体は同一なので見た目は変わらない。
 *
 * 安全側の余裕として、本文から集めた文字に加えて
 * ASCII・ひらがな・カタカナ・約物の全域を必ず含める。
 * 想定外の文字(フォームのエラー文言など)が来ても和文が崩れないようにするため。
 * 漢字だけは全域を入れると意味が無くなるので、実際に使う字のみ。
 *
 * 使い方: node scripts/build-font-subset.mjs
 * 出力:   public/fonts/shippori-mincho-{400,600}.woff2
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const PY = "/tmp/fontenv/bin/pyftsubset";
const OUT_DIR = join(ROOT, "public/fonts");

/* ---------------------------------------------------------------- *
 * 1. サイト内の文字を集める
 * ---------------------------------------------------------------- */

const SCAN_DIRS = ["app", "components", "lib"];
const SCAN_EXT = new Set([".ts", ".tsx", ".css", ".json", ".md"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (SCAN_EXT.has(extname(p))) out.push(p);
  }
  return out;
}

const chars = new Set();

// ASCII 可視域
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCodePoint(c));
// ひらがな・カタカナ（全域）
for (let c = 0x3040; c <= 0x30ff; c++) chars.add(String.fromCodePoint(c));
// CJK 約物・記号（、。「」・…〜 など）
for (let c = 0x3000; c <= 0x303f; c++) chars.add(String.fromCodePoint(c));
// 全角英数（ラベルや電話番号で混ざりうる）
for (let c = 0xff00; c <= 0xff60; c++) chars.add(String.fromCodePoint(c));
// よく使う記号
for (const c of "→←↑↓×÷±§¶©®™°′″№±—–‐‑ ")
  chars.add(c);

/*
 * コメントは除外する。
 * このリポジトリはコメントを日本語で厚く書いているため、素朴に全文を走査すると
 * 画面に一度も出ない漢字が大量に混ざる（実測 1148字 中 855字がコメント由来だった）。
 * サブセットの意味が薄れるので、文字列リテラルとJSXテキストだけを対象にする。
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ") // ブロックコメント
    .replace(/^\s*\/\/.*$/gm, " "); // 行頭からの行コメント（URL中の // を巻き込まない）
}

let scanned = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    scanned++;
    for (const ch of stripComments(readFileSync(file, "utf8"))) {
      const cp = ch.codePointAt(0);
      // 漢字・かな・記号のみ拾う（ASCIIは上で全域を入れてある）
      if (cp > 0x2000) chars.add(ch);
    }
  }
}

const unicodes = [...chars]
  .map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase())
  .join(",");

console.log(`走査 ${scanned} ファイル → ${chars.size} 文字`);

/* ---------------------------------------------------------------- *
 * 2. サブセット生成
 * ---------------------------------------------------------------- */

mkdirSync(OUT_DIR, { recursive: true });

const SOURCES = {
  400: join(ROOT, ".font-src/ShipporiMincho-Regular.ttf"),
  600: join(ROOT, ".font-src/ShipporiMincho-SemiBold.ttf"),
};

for (const [weight, src] of Object.entries(SOURCES)) {
  const out = join(OUT_DIR, `shippori-mincho-${weight}.woff2`);
  /*
   * --layout-features は指定しない。
   * 明示指定すると pyftsubset の既定集合を「置き換える」ため、
   * 既定で有効な calt / ccmp / locl / mark などが落ちて字形と字間が変わる。
   * 実測で本文2要素が最大6.5%の画素差を出した（原本と比較）。
   * 既定のまま残せば画素単位で一致する。
   *
   * ヒンティングも残す。削ると数KB縮むが、ラスタライズが変わる可能性を負う。
   * ここは「見た目を一切変えない」ことが最優先。
   */
  execFileSync(PY, [
    src,
    `--unicodes=${unicodes}`,
    "--flavor=woff2",
    `--output-file=${out}`,
  ]);
  const kb = (statSync(out).size / 1024).toFixed(1);
  console.log(`  weight ${weight}: ${kb}KB  → public/fonts/shippori-mincho-${weight}.woff2`);
}

writeFileSync(
  join(OUT_DIR, "SUBSET.txt"),
  `Shippori Mincho / SIL Open Font License 1.1\n` +
    `scripts/build-font-subset.mjs で生成。${chars.size} 文字を収録。\n` +
    `本文を追加・変更したら再生成すること（未収録の字はフォールバック書体で出る）。\n`,
);
