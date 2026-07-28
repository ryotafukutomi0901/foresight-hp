/*
 * Baseline Capture — Vision セクションの「変更しない」を定量的に保証する。
 *
 * なぜ必要か:
 *   Vision は共通トークン(globals.css)と共通3D空間(Atmosphere)を使うため、
 *   他セクションの改修で意図せず変わる構造的リスクがある。
 *   特に Phase 6 の Atmosphere 統合(WebGL Canvas 2重起動の解消)で影響が出やすい。
 *   人の目で「たぶん同じ」と判断せず、画像差分で保証する。
 *
 * 使い方:
 *   node scripts/capture-baseline.mjs          # 基準を取得（docs/baseline/へ）
 *   node scripts/capture-baseline.mjs --check  # 現在の描画を基準と比較
 *
 * 前提: dev サーバが http://localhost:3000 で起動していること。
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE_DIR = path.join(ROOT, "docs/baseline");
const DIFF_DIR = path.join(ROOT, "docs/baseline/_diff");
const URL = "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const isCheck = process.argv.includes("--check");

/* Charter で定義した取得条件 */
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 834, height: 1112, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

/* Vision セクション内のスクロール進行度 5点 */
const PROGRESS = [0, 0.25, 0.5, 0.75, 1.0];

/**
 * Vision セクションの pin 区間を進行度で移動する。
 * ScrollSmoother は transform でスクロールするため scrollIntoView は使えない。
 * レイアウト上の位置(offsetTop累積)からネイティブスクロール位置を算出する。
 */
async function scrollToVisionProgress(page, p) {
  await page.evaluate((progress) => {
    const el = document.getElementById("vision");
    if (!el) return;
    let top = 0;
    let node = el;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    // pin区間ぶん(Shot List W-02 準拠でVisionは +=260%)を進行度で割る
    const pinLength = window.innerHeight * 2.6;
    window.scrollTo(0, top + pinLength * progress);
  }, p);
  // 3Dの補間(lerp)が落ち着くまで待つ。ここを短くすると毎回違う絵になる
  await page.waitForTimeout(2200);
}

async function capture() {
  const outDir = isCheck ? path.join(BASE_DIR, "_current") : BASE_DIR;
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ["--use-gl=angle", "--ignore-gpu-blocklist", "--force-color-profile=srgb"],
  });

  const shots = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 2, // Charter 指定
      reducedMotion: "no-preference",
    });
    const page = await ctx.newPage();

    /*
     * 時間を停止させる。
     *
     * 3D空間は clock.elapsedTime で霧・塵・光条を常時動かしているため、
     * 撮影した実時刻が違うだけで絵が変わる。実測では最大4.5%の差が出た。
     * これでは「コードを変えていないのに差分が出る」状態になり基準として機能しない。
     *
     * performance.now() を定数に固定すると three.js の Clock は delta=0 になり、
     * 時間依存のモーションが t=0 の姿勢で停止する。
     * 一方 scrub 連動のアニメーションはスクロール位置で駆動されるため影響を受けず、
     * lerp による補間も requestAnimationFrame で収束し続ける（rAFは実時間で動くため）。
     * 結果、決定的な1枚が得られる。
     *
     * どのスクリプトより先に差し込む必要があるため addInitScript を使う。
     */
    await page.addInitScript(() => {
      const FROZEN = 0;
      performance.now = () => FROZEN;
    });

    await page.goto(URL, { waitUntil: "networkidle" });
    // 2回目の訪問扱いにして Opening を出さない（Baselineに演出を含めない）
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2500);

    for (const p of PROGRESS) {
      await scrollToVisionProgress(page, p);
      const name = `vision-${vp.name}-p${String(p).replace(".", "_")}.png`;
      await page.screenshot({ path: path.join(outDir, name) });
      shots.push(name);
    }

    await ctx.close();
  }

  await browser.close();
  return shots;
}

/** 2枚のPNGを画素単位で比較し、差分画素数と差分画像を返す */
function comparePng(baselinePath, currentPath, diffPath) {
  const a = PNG.sync.read(fs.readFileSync(baselinePath));
  const b = PNG.sync.read(fs.readFileSync(currentPath));

  if (a.width !== b.width || a.height !== b.height) {
    return { sizeMismatch: true, diffPixels: -1, total: 0 };
  }

  const diff = new PNG({ width: a.width, height: a.height });
  let diffPixels = 0;
  const total = a.width * a.height;

  for (let i = 0; i < total * 4; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    // 3Dは毎フレーム微細に揺れるため、知覚できない差はノイズとして無視する
    const changed = dr > 8 || dg > 8 || db > 8;
    if (changed) {
      diffPixels++;
      diff.data[i] = 255;
      diff.data[i + 1] = 0;
      diff.data[i + 2] = 0;
      diff.data[i + 3] = 255;
    } else {
      diff.data[i] = a.data[i];
      diff.data[i + 1] = a.data[i + 1];
      diff.data[i + 2] = a.data[i + 2];
      diff.data[i + 3] = 60;
    }
  }

  if (diffPixels > 0) fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return { sizeMismatch: false, diffPixels, total };
}

/* ---- 実行 ---- */

const shots = await capture();

if (!isCheck) {
  console.log(`Baseline を ${path.relative(ROOT, BASE_DIR)} に取得しました。`);
  shots.forEach((s) => console.log(`  ${s}`));
  console.log(
    `\n以後、Visionに影響し得る変更のたびに --check で差分を確認すること。`,
  );
} else {
  fs.mkdirSync(DIFF_DIR, { recursive: true });
  let failed = 0;

  console.log("Baseline との差分:\n");
  for (const name of shots) {
    const basePath = path.join(BASE_DIR, name);
    const curPath = path.join(BASE_DIR, "_current", name);
    if (!fs.existsSync(basePath)) {
      console.log(`  ?  ${name} — Baseline が存在しない`);
      continue;
    }
    const r = comparePng(basePath, curPath, path.join(DIFF_DIR, name));
    if (r.sizeMismatch) {
      console.log(`  ✕  ${name} — 画像サイズが異なる`);
      failed++;
      continue;
    }
    const pct = ((r.diffPixels / r.total) * 100).toFixed(3);
    // 3Dの微細な揺れを許容する闘値。これを超えたら「意図しない変更」とみなす
    const ok = r.diffPixels / r.total < 0.001;
    console.log(
      `  ${ok ? "✓" : "✕"}  ${name} — 差分 ${r.diffPixels}px (${pct}%)`,
    );
    if (!ok) failed++;
  }

  console.log(
    failed === 0
      ? "\nVision は Baseline と一致している。"
      : `\n*** ${failed}件が閾値を超えた。docs/baseline/_diff/ を確認し、意図した変更でなければ破棄すること。 ***`,
  );
  process.exit(failed === 0 ? 0 : 1);
}
