/*
 * FPS 実測。docs/performance-budget.md の予算に対して検証する。
 *
 * 計測区間は「What We Can Do 以降」= 回廊が発火し、霧・塵・光条・
 * ポストプロセスが全て同時に走る最も重い区間。ここが通れば他は通る。
 *
 * requestAnimationFrame の間隔ではなく実フレーム数/実時間で出す。
 * rAF間隔の平均は、間引かれたフレームを1回として数えるため実態より良く出る。
 *
 * 使い方: node scripts/measure-fps.mjs
 */
import { chromium } from "playwright-core";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const DEVICES = [
  { name: "desktop", width: 1440, height: 900, dpr: 2, budget: 55 },
  { name: "tablet", width: 834, height: 1112, dpr: 2, budget: 40 },
  { name: "mobile", width: 390, height: 844, dpr: 3, budget: 40 },
];

const SCROLL_MS = 6000;

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--use-gl=angle", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});

let failed = 0;
console.log("FPS 実測（What We Can Do 区間・スクロール中）\n");

for (const d of DEVICES) {
  const page = await browser.newPage({
    viewport: { width: d.width, height: d.height },
    deviceScaleFactor: d.dpr,
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  // Opening を1度通してからでないと計測区間まで進めない
  await page.waitForTimeout(2000);

  const top = await page.evaluate(() => {
    const el = document.getElementById("narrative");
    let t = 0;
    let n = el;
    while (n) {
      t += n.offsetTop;
      n = n.offsetParent;
    }
    return t;
  });
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(1500);

  const fps = await page.evaluate(
    ({ from, ms }) =>
      new Promise((resolve) => {
        let frames = 0;
        const t0 = performance.now();
        const tick = () => {
          frames++;
          const p = (performance.now() - t0) / ms;
          if (p >= 1) {
            resolve((frames / ((performance.now() - t0) / 1000)));
            return;
          }
          window.scrollTo(0, from + p * 2200);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { from: top, ms: SCROLL_MS },
  );

  const ok = fps >= d.budget;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "✓" : "✕"}  ${d.name.padEnd(8)} ${fps.toFixed(1).padStart(5)} fps  (予算 ${d.budget})`,
  );
  await page.close();
}

await browser.close();
console.log(
  failed
    ? `\n*** ${failed}件が予算未達。docs/performance-budget.md の削減順序に従って削ること。 ***`
    : "\nすべて予算内。",
);
process.exit(failed ? 1 : 0);
