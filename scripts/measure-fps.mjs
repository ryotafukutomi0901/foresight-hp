/*
 * FPS 実測。docs/performance-budget.md の予算に対して検証する。
 *
 * ページ先頭から末尾まで一定速度で通しスクロールし、
 *   - 全体の平均fps（予算の判定に使う「スクロール中の平均」）
 *   - 区間ごとのfps（どこで落ちるかの特定）
 * を同時に出す。
 *
 * 特定の1セクションだけを測ると測る場所で結論が変わる。
 * 実測で What We Can Do 56fps / Vision 48fps と別物になった。
 *
 * 実フレーム数 ÷ 実時間で出す。rAFの間隔平均は間引かれたフレームを
 * 1回として数えるため実態より良く出る。
 * 1回の計測はばらつくので既定3回の中央値で判定する。
 *
 * 使い方: node scripts/measure-fps.mjs [--runs 3]
 */
import { chromium } from "playwright-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const runsArg = process.argv.indexOf("--runs");
const RUNS = runsArg > -1 ? Number(process.argv[runsArg + 1]) : 3;

const DEVICES = [
  { name: "desktop", width: 1440, height: 900, dpr: 2, budget: 55 },
  { name: "tablet", width: 834, height: 1112, dpr: 2, budget: 40 },
  { name: "mobile", width: 390, height: 844, dpr: 3, budget: 40 },
];

const PASS_MS = 9000;

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--use-gl=angle", "--ignore-gpu-blocklist"],
});

async function pass(device) {
  const page = await browser.newPage({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.dpr,
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  // Opening(6.8s)を通してから測る
  await page.waitForTimeout(7500);

  const result = await page.evaluate(
    ({ ms }) =>
      new Promise((resolve) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const marks = [...document.querySelectorAll("section[id]")].map((s) => {
          let t = 0;
          let n = s;
          while (n) {
            t += n.offsetTop;
            n = n.offsetParent;
          }
          return { id: s.id, top: t };
        });
        let frames = 0;
        const samples = [];
        let last = performance.now();
        const t0 = last;
        const tick = () => {
          const now = performance.now();
          frames++;
          samples.push({ y: window.scrollY, dt: now - last });
          last = now;
          const p = (now - t0) / ms;
          if (p >= 1) {
            const total = (now - t0) / 1000;
            const per = {};
            for (const s of samples) {
              let id = "top";
              for (const m of marks) if (s.y >= m.top - 100) id = m.id;
              (per[id] ||= []).push(s.dt);
            }
            const region = Object.entries(per)
              .map(([id, dts]) => [
                id,
                dts.length / (dts.reduce((a, b) => a + b, 0) / 1000),
              ])
              .filter(([, f]) => Number.isFinite(f));
            resolve({ fps: frames / total, region });
            return;
          }
          window.scrollTo(0, p * max);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { ms: PASS_MS },
  );

  await page.close();
  return result;
}

console.log(`FPS 実測（先頭→末尾の通しスクロール・各${RUNS}回の中央値）\n`);
let failed = 0;

for (const d of DEVICES) {
  const runs = [];
  const regionRuns = [];
  for (let i = 0; i < RUNS; i++) {
    const r = await pass(d);
    runs.push(r.fps);
    regionRuns.push(r.region);
  }
  const sorted = [...runs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const ok = median >= d.budget;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "✓" : "✕"}  ${d.name.padEnd(8)} 中央値 ${median.toFixed(1)} fps  ` +
      `(${sorted.map((f) => f.toFixed(1)).join(" / ")})  予算 ${d.budget}`,
  );
  if (d.name === "desktop") {
    // 区間別も中央値で出す
    const ids = [...new Set(regionRuns.flat().map(([id]) => id))];
    const line = ids.map((id) => {
      const vals = regionRuns
        .map((r) => r.find(([x]) => x === id)?.[1])
        .filter((v) => v != null)
        .sort((a, b) => a - b);
      return `${id} ${vals[Math.floor(vals.length / 2)].toFixed(0)}`;
    });
    console.log("        区間別: " + line.join(" / "));
  }
}

await browser.close();
console.log(
  failed
    ? `\n*** ${failed}件が予算未達。docs/performance-budget.md の削減順序に従って削ること。 ***`
    : "\nすべて予算内。",
);
process.exit(failed ? 1 : 0);
