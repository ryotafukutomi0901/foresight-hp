/*
 * Reference Analysis — リファレンスサイトの視覚構造を実測する。
 *
 * 目視や推測ではなく、実際の computed style と矩形から採寸する。
 * 「なんとなく似ている」を避けるために、数値で押さえるのが目的。
 *
 * 出力:
 *   docs/reference/<vp>-full.png   フルページ
 *   docs/reference/<vp>-fold.png   ファーストビュー
 *   docs/reference/measured.json   採寸結果
 *
 * 使い方: node scripts/analyze-reference.mjs
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs/reference");
const URL = "https://izanami-official.com/ja/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 834, height: 1112, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const measured = {};

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  // 遅延読み込みとイントロ演出の完了を待つ
  await page.waitForTimeout(4000);

  // 全体をスクロールして遅延要素を確定させてから戻す
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1800);

  await page.screenshot({
    path: path.join(OUT, `${vp.name}-fold.png`),
  });
  await page.screenshot({
    path: path.join(OUT, `${vp.name}-full.png`),
    fullPage: true,
  });

  measured[vp.name] = await page.evaluate(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    };
    const typo = (el) => {
      const s = cs(el);
      if (!s) return null;
      return {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        color: s.color,
        textTransform: s.textTransform,
      };
    };

    /* 固定・粘着要素 */
    const sticky = [...document.querySelectorAll("*")]
      .filter((el) => {
        const p = getComputedStyle(el).position;
        return p === "fixed" || p === "sticky";
      })
      .slice(0, 12)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 80),
        position: getComputedStyle(el).position,
        zIndex: getComputedStyle(el).zIndex,
        box: box(el),
      }));

    /* セクションの並びと縦の余白 */
    const sections = [...document.querySelectorAll("section, main > div, header, footer")]
      .filter((el) => el.getBoundingClientRect().height > 120)
      .slice(0, 24)
      .map((el) => {
        const s = cs(el);
        return {
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 80),
          box: box(el),
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          background: s.backgroundColor,
          heading: el.querySelector("h1,h2,h3")?.textContent?.trim().slice(0, 60) ?? null,
        };
      });

    /* 見出し階層 */
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")]
      .slice(0, 20)
      .map((el) => ({
        level: el.tagName.toLowerCase(),
        text: el.textContent.trim().slice(0, 60),
        typo: typo(el),
        box: box(el),
      }));

    /* 本文の代表 */
    const paras = [...document.querySelectorAll("p")]
      .filter((el) => el.textContent.trim().length > 12)
      .slice(0, 8)
      .map((el) => ({ text: el.textContent.trim().slice(0, 50), typo: typo(el) }));

    /* 画像の比率 */
    const images = [...document.querySelectorAll("img")]
      .filter((el) => el.getBoundingClientRect().width > 40)
      .slice(0, 14)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          src: (el.currentSrc || el.src || "").split("/").pop()?.slice(0, 48),
          w: Math.round(r.width),
          h: Math.round(r.height),
          ratio: r.height ? +(r.width / r.height).toFixed(3) : null,
          objectFit: cs(el).objectFit,
          borderRadius: cs(el).borderRadius,
        };
      });

    /* コンテンツ幅の推定: 本文を持つ要素の最頻値 */
    const widths = {};
    for (const el of document.querySelectorAll("div,section,main,article")) {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      if (w > 200 && w <= window.innerWidth && r.height > 100) {
        widths[w] = (widths[w] || 0) + 1;
      }
    }
    const commonWidths = Object.entries(widths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w, count]) => ({ width: +w, count }));

    const bodyStyle = cs(document.body);
    const html = cs(document.documentElement);

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      docHeight: document.body.scrollHeight,
      body: {
        background: bodyStyle.backgroundColor,
        color: bodyStyle.color,
        fontFamily: bodyStyle.fontFamily,
        fontSize: bodyStyle.fontSize,
        lineHeight: bodyStyle.lineHeight,
      },
      scrollBehavior: html.scrollBehavior,
      commonWidths,
      sticky,
      sections,
      headings,
      paras,
      images,
      /* 使われている色の分布 */
      colors: (() => {
        const map = {};
        for (const el of [...document.querySelectorAll("*")].slice(0, 2500)) {
          const s = getComputedStyle(el);
          for (const key of ["color", "backgroundColor"]) {
            const v = s[key];
            if (v && v !== "rgba(0, 0, 0, 0)") map[v] = (map[v] || 0) + 1;
          }
        }
        return Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 14)
          .map(([color, count]) => ({ color, count }));
      })(),
    };
  });

  console.log(`measured ${vp.name}`);
  await ctx.close();
}

fs.writeFileSync(
  path.join(OUT, "measured.json"),
  JSON.stringify(measured, null, 2),
);
await browser.close();
console.log(`\n→ ${path.relative(ROOT, OUT)} に出力しました`);
