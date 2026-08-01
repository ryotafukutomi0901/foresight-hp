/*
 * Opening Capture — ローディングからHeroまでの一気通貫を目視検証する。
 *
 * 開発中にタイムラインを任意の時刻へシークしてスクリーンショットを撮る。
 * 「車両のセルが正しく切り出せているか」「Heroへの継ぎ目が無いか」は
 * コードを読んでも分からないため、必ず画で確認する。
 *
 * 使い方:
 *   node scripts/capture-opening.mjs            # desktop
 *   node scripts/capture-opening.mjs --all      # desktop/tablet/mobile
 *
 * 前提: dev サーバが http://localhost:3000 で起動していること。
 *       window.__openingTl は開発ビルドでのみ公開される。
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "docs/opening");
const URL = "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 834, height: 1112, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

/* タイムライン上の確認ポイント（秒）。OpeningSequence のラベルに対応する */
const MOMENTS = [
  { t: 0.3, label: "00-silence" },
  { t: 1.2, label: "01-forming" },
  { t: 2.0, label: "02-formed" },
  { t: 2.6, label: "03-orbit-a" },
  { t: 3.2, label: "04-orbit-b" },
  { t: 3.9, label: "05-settling" },
  { t: 4.6, label: "06-handoff" },
  { t: 5.2, label: "07-hero" },
];

const all = process.argv.includes("--all");
const targets = all ? VIEWPORTS : [VIEWPORTS[0]];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });

for (const vp of targets) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
  });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: "networkidle" });

  // タイムラインとテクスチャの用意ができるまで待つ
  await page.waitForFunction(() => Boolean(window.__openingTl), null, {
    timeout: 15000,
  });
  await page.waitForTimeout(1200);

  for (const m of MOMENTS) {
    await page.evaluate((time) => {
      const tl = window.__openingTl;
      if (!tl) return;
      tl.pause();
      tl.seek(time);
    }, m.t);

    /*
     * seek はGSAPの値を即座に更新するが、R3Fの描画は次のフレームで走る。
     * 数フレーム待たないと1つ前の絵が撮れる。
     */
    await page.waitForTimeout(400);

    const file = path.join(OUT_DIR, `${vp.name}-${m.label}.png`);
    await page.screenshot({ path: file });
    console.log(`captured ${path.relative(ROOT, file)}`);
  }

  await context.close();
}

await browser.close();
console.log(`\n→ ${path.relative(ROOT, OUT_DIR)} に出力しました`);
