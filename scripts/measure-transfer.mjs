/*
 * 初期転送量の実測。docs/performance-budget.md の予算(1229KB)に対して検証する。
 *
 * Resource Timing の transferSize(実際に線を流れた圧縮後のバイト数)で測る。
 * Response.body() で測ると解凍後のサイズになり、JSが3倍に見える。
 *
 * 使い方:
 *   node scripts/measure-transfer.mjs            初期表示のみ
 *   node scripts/measure-transfer.mjs --scroll   Narrative まで送って追加取得も見る
 */
import { chromium } from "playwright-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BUDGET_KB = 1229;
const withScroll = process.argv.includes("--scroll");

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const collect = () =>
  page.evaluate(() => {
    const rows = [];
    let total = 0;
    for (const e of performance.getEntriesByType("resource")) {
      const n = e.transferSize || e.encodedBodySize || 0;
      total += n;
      rows.push({ url: e.name.replace(location.origin, ""), size: n });
    }
    const nav = performance.getEntriesByType("navigation")[0];
    const html = nav?.transferSize || 0;
    return { total: total + html, html, rows };
  });

const initial = await collect();

const bucket = (rows) => {
  const by = {};
  for (const r of rows) {
    const path = r.url.split("?")[0];
    const k = path.startsWith("/_next/image")
      ? "next/image"
      : (path.match(/\.(\w+)$/) || [, "other"])[1];
    by[k] = (by[k] || 0) + r.size;
  }
  return by;
};

const kb = (n) => (n / 1024).toFixed(0) + "KB";

console.log(`初期転送: ${kb(initial.total)} / 予算 ${BUDGET_KB}KB`);
console.log(
  initial.total / 1024 <= BUDGET_KB
    ? "  ✓ 予算内"
    : `  ✕ ${(initial.total / 1024 - BUDGET_KB).toFixed(0)}KB 超過`,
);
console.log("\n種別:");
for (const [k, v] of Object.entries(bucket(initial.rows)).sort(
  (a, b) => b[1] - a[1],
))
  console.log("  " + k.padEnd(12) + kb(v));

console.log("\n30KB超の個別リソース:");
for (const r of initial.rows.filter((r) => r.size > 30720).sort((a, b) => b.size - a.size))
  console.log("  " + kb(r.size).padStart(7) + "  " + r.url.slice(0, 90));

if (withScroll) {
  const before = initial.rows.length;
  const y = await page.evaluate(() => {
    const el = document.getElementById("narrative");
    let t = 0;
    let n = el;
    while (n) {
      t += n.offsetTop;
      n = n.offsetParent;
    }
    return t;
  });
  // 一気に飛ばさず段階的に送る(先読みが撃たれるかを実際の進み方で見る)
  for (let i = 1; i <= 10; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), (y * i) / 10);
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(2500);
  const after = await collect();
  console.log(
    `\nNarrative到達後: ${kb(after.total)}  (追加 ${kb(after.total - initial.total)} / ${after.rows.length - before}件)`,
  );
  console.log("  追加分の種別:");
  const delta = after.rows.slice(before);
  for (const [k, v] of Object.entries(bucket(delta)).sort((a, b) => b[1] - a[1]))
    console.log("    " + k.padEnd(12) + kb(v));
}

await browser.close();
process.exit(initial.total / 1024 <= BUDGET_KB ? 0 : 1);
