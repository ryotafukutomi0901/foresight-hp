/*
 * 車両素材の受け入れ。原本PNGを検査してWebPへ変換し、回廊の該当スロットへ置く。
 *
 * CEOが1枚生成するたびにこれ1本で通せるようにしてある。
 * 検査で落ちたものは配置しない（壊れた素材を静かに載せないため）。
 *
 * 使い方:
 *   node scripts/intake-vehicle.mjs            assets-src/vehicle/ を走査して状況を出す
 *   node scripts/intake-vehicle.mjs V-02       1点を検査して配置する
 *   node scripts/intake-vehicle.mjs --all      検査を通る全点を配置する
 *   node scripts/intake-vehicle.mjs V-02 --check-only   検査だけして配置しない
 *   node scripts/intake-vehicle.mjs V-02 --pad  余白不足を黒で補ってから配置する
 *
 * 配置後は必ず以下を実行すること（docs/asset-intake.md）:
 *   node scripts/capture-baseline.mjs --check
 *   node scripts/measure-fps.mjs
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = "assets-src/vehicle";
const OUT_DIR = "public/images/foresight/vehicle-parts";

/*
 * 配信解像度は 1024。
 * 透視投影から逆算すると、板が画面上で最大になるのは mobile(844×dpr3) の 798px。
 * 1024 は全端末を上回り、それ以上は1画素も画面に出ない（decision-log D-013）。
 * ⚠️ corridor の planeScaleBase / nearOut を変えたらこの逆算をやり直すこと。
 */
const DELIVER_PX = 1024;
const DELIVER_QUALITY = 90;

/** 素材ID → 回廊スロット。content.ts の NARRATIVE_SHOTS と1対1で対応する。 */
const SLOTS = [
  { id: "V-01", out: "01-suv-whole.webp", shot: "W-04", kicker: "THE WHOLE", desc: "3/4 前方" },
  { id: "V-02", out: "02-suv-side.webp", shot: "W-04", kicker: "THE FORM", desc: "真横" },
  { id: "V-03", out: "03-front-face.webp", shot: "W-04", kicker: "THE FACE", desc: "真正面" },
  { id: "M-02", out: "04-tire-suspension.webp", shot: "W-05", kicker: "THE GROUND", desc: "ホイール" },
  { id: "M-03", out: "05-engine.webp", shot: "W-05", kicker: "THE CORE", desc: "エンジン" },
  { id: "D-01", out: "06-damaged.webp", shot: "W-06", kicker: "THE DAMAGE", desc: "損傷" },
  { id: "D-02", out: "07-transport.webp", shot: "W-07", kicker: "THE JOURNEY", desc: "積載車" },
  { id: "D-03", out: "08-repair.webp", shot: "W-07", kicker: "THE REBUILD", desc: "整備" },
  { id: "D-04", out: "09-parts-reuse.webp", shot: "W-07", kicker: "THE PARTS", desc: "パーツ群" },
  { id: "D-05", out: "10-next-journey.webp", shot: "W-08", kicker: "THE NEXT", desc: "夜明けの道" },
];

/* ---------------------------------------------------------------- *
 * 検査
 * ---------------------------------------------------------------- */

/**
 * 素材を測る。判定はせず数値だけ返す。
 * 判定基準は verdict() に集約し、「測る」と「決める」を分ける。
 */
async function measure(file) {
  const img = sharp(file);
  const meta = await img.metadata();

  // 彩度: R=G=B か（モノクロ指定の確認）
  const stats = await img.stats();
  const [r, g, b] = stats.channels;
  const chroma =
    r && g && b
      ? Math.max(
          Math.abs(r.mean - g.mean),
          Math.abs(g.mean - b.mean),
          Math.abs(r.mean - b.mean),
        )
      : 0;

  // 以降はグレースケールの縮小版で測る（4096pxを全画素走査すると遅い）
  const S = 1024;
  const { data } = await sharp(file)
    .greyscale()
    .resize(S, S, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 被写体のバウンディングボックス（閾値24以上をインクとみなす）
  let x0 = S, y0 = S, x1 = -1, y1 = -1;
  const hist = [0, 0, 0, 0];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const v = data[y * S + x];
      if (v < 32) hist[0]++;
      else if (v < 96) hist[1]++;
      else if (v < 192) hist[2]++;
      else hist[3]++;
      if (v > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const total = S * S;

  // 四隅の地の明るさ（純黒背景の確認）
  const corner = (cx, cy) => {
    let sum = 0;
    let n = 0;
    for (let y = cy; y < cy + 24; y++)
      for (let x = cx; x < cx + 24; x++) {
        sum += data[y * S + x];
        n++;
      }
    return sum / n;
  };
  const corners = [
    corner(0, 0),
    corner(S - 24, 0),
    corner(0, S - 24),
    corner(S - 24, S - 24),
  ];

  const pct = (v) => (v / S) * 100;
  return {
    width: meta.width,
    height: meta.height,
    format: meta.format,
    chroma,
    margin: {
      left: pct(x0),
      right: pct(S - 1 - x1),
      top: pct(y0),
      bottom: pct(S - 1 - y1),
    },
    subject: { w: pct(x1 - x0), h: pct(y1 - y0) },
    tone: {
      black: (hist[0] / total) * 100,
      mid: ((hist[1] + hist[2]) / total) * 100,
      white: (hist[3] / total) * 100,
    },
    bgMax: Math.max(...corners),
  };
}

/** V-01 マスターの実測値。新素材の一貫性判定の基準にする。 */
const MASTER_TONE = { black: 88.7, mid: 10.1, white: 1.2 };

function verdict(m) {
  const fail = [];
  const warn = [];

  if (m.width < 4096 || m.height < 4096)
    fail.push(`解像度 ${m.width}×${m.height}。4096×4096 以上が必要`);
  if (m.width !== m.height)
    warn.push(
      `正方形でない（${m.width}×${m.height}）。V-01は正方形。板の縦横比が変わりBaselineに影響する`,
    );
  if (m.format !== "png")
    warn.push(`形式が ${m.format}。線画は可逆のPNGが望ましい`);
  if (m.chroma > 2)
    fail.push(`色が乗っている（チャンネル差 ${m.chroma.toFixed(1)}）。完全なモノクロが必要`);
  if (m.bgMax > 12)
    fail.push(
      `背景が純黒でない（四隅の最大 ${m.bgMax.toFixed(1)}/255）。加算合成では黒が透過の前提`,
    );

  const minMargin = Math.min(
    m.margin.left,
    m.margin.right,
    m.margin.top,
    m.margin.bottom,
  );
  if (minMargin < 12)
    warn.push(
      `余白が最小 ${minMargin.toFixed(1)}%（要 12%以上）。回廊の edgeFeather 0.34 が端を削る。--pad で黒を足せる`,
    );

  if (m.tone.white > 8)
    warn.push(
      `白の面積が ${m.tone.white.toFixed(1)}%（V-01は1.2%）。塗りつぶしている可能性。線画指定を確認`,
    );
  const toneGap = Math.abs(m.tone.black - MASTER_TONE.black);
  if (toneGap > 12)
    warn.push(
      `黒の面積が ${m.tone.black.toFixed(1)}%（V-01は${MASTER_TONE.black}%）。線の密度がマスターと大きく違う`,
    );

  return { fail, warn };
}

/* ---------------------------------------------------------------- *
 * 変換
 * ---------------------------------------------------------------- */

async function convert(file, outPath, { pad }) {
  let pipeline = sharp(file);

  if (pad) {
    // 被写体を縮めず、キャンバスを広げて余白を作る（絵そのものは変えない）
    const m = await measure(file);
    const minMargin = Math.min(
      m.margin.left,
      m.margin.right,
      m.margin.top,
      m.margin.bottom,
    );
    const need = Math.max(0, 12 - minMargin) / 100;
    if (need > 0) {
      const add = Math.ceil(m.width * need);
      pipeline = pipeline.extend({
        top: add,
        bottom: add,
        left: add,
        right: add,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      });
    }
  }

  const info = await pipeline
    .resize(DELIVER_PX, DELIVER_PX, { fit: "inside" })
    .webp({ quality: DELIVER_QUALITY, effort: 6 })
    .toFile(outPath);
  return info;
}

/* ---------------------------------------------------------------- *
 * 実行
 * ---------------------------------------------------------------- */

const args = process.argv.slice(2);
const checkOnly = args.includes("--check-only");
const pad = args.includes("--pad");
const all = args.includes("--all");
const ids = args.filter((a) => !a.startsWith("--"));

if (!existsSync(SRC_DIR)) {
  mkdirSync(SRC_DIR, { recursive: true });
  console.log(`${SRC_DIR}/ を作成した。ここに4096px PNGを置くこと。`);
}

/** assets-src/vehicle/ から素材IDに対応するファイルを探す（接頭辞一致） */
function findSource(id) {
  const files = readdirSync(SRC_DIR).filter((f) => /\.(png|PNG)$/.test(f));
  return files.find((f) => f.toUpperCase().startsWith(id.toUpperCase()));
}

// 引数なし → 状況一覧
if (ids.length === 0 && !all) {
  console.log("車両素材の受け入れ状況\n");
  console.log("  ID     Shot   スロット                    原本        配信中");
  console.log("  " + "─".repeat(72));
  for (const s of SLOTS) {
    const src = findSource(s.id);
    const outPath = join(OUT_DIR, s.out);
    let live = "—";
    if (existsSync(outPath)) {
      const meta = await sharp(outPath).metadata();
      live = `${meta.width}×${meta.height}`;
      if (meta.width <= 300) live += " ⚠仮";
    }
    console.log(
      `  ${s.id}   ${s.shot}   ${s.out.padEnd(26)} ${(src ? "あり" : "—").padEnd(11)} ${live}`,
    );
  }
  console.log(
    `\n  原本を ${SRC_DIR}/ に置いてから:  node scripts/intake-vehicle.mjs <ID>`,
  );
  console.log("  受け入れ手順の全体: docs/asset-intake.md");
  process.exit(0);
}

const targets = all ? SLOTS.map((s) => s.id) : ids;
let placed = 0;
let failed = 0;

for (const id of targets) {
  const slot = SLOTS.find((s) => s.id.toUpperCase() === id.toUpperCase());
  if (!slot) {
    console.log(`✕ ${id}: 未知のID。有効なID: ${SLOTS.map((s) => s.id).join(" ")}`);
    failed++;
    continue;
  }
  const srcName = findSource(slot.id);
  if (!srcName) {
    if (!all) {
      console.log(`✕ ${slot.id}: ${SRC_DIR}/ に原本が無い`);
      failed++;
    }
    continue;
  }
  const src = join(SRC_DIR, srcName);

  console.log(`\n── ${slot.id} ${slot.desc}（${slot.kicker} / ${slot.shot}）`);
  console.log(`   原本: ${srcName}`);

  const m = await measure(src);
  console.log(
    `   ${m.width}×${m.height} ${m.format} / 余白 左${m.margin.left.toFixed(1)} 右${m.margin.right.toFixed(1)} 上${m.margin.top.toFixed(1)} 下${m.margin.bottom.toFixed(1)}%`,
  );
  console.log(
    `   被写体 ${m.subject.w.toFixed(1)}×${m.subject.h.toFixed(1)}% / 明度 黒${m.tone.black.toFixed(1)} 中間${m.tone.mid.toFixed(1)} 白${m.tone.white.toFixed(1)}%`,
  );

  const { fail, warn } = verdict(m);
  for (const w of warn) console.log(`   ⚠ ${w}`);
  for (const f of fail) console.log(`   ✕ ${f}`);

  if (fail.length) {
    console.log(`   → 配置しない。原本を直してから再実行すること`);
    failed++;
    continue;
  }
  if (checkOnly) {
    console.log(`   → 検査のみ（--check-only）`);
    continue;
  }

  const out = join(OUT_DIR, slot.out);
  const before = existsSync(out) ? await sharp(out).metadata() : null;
  const info = await convert(src, out, { pad });
  console.log(
    `   ✓ 配置: ${slot.out} ${info.width}×${info.height} ${(info.size / 1024).toFixed(0)}KB${pad ? "（余白を補正）" : ""}`,
  );
  if (before && (before.width !== info.width || before.height !== info.height))
    console.log(
      `   ⚠ 縦横比が変わった（${before.width}×${before.height} → ${info.width}×${info.height}）。板の形が変わるので Baseline --check を必ず実行`,
    );
  placed++;
}

console.log(
  `\n${placed}点を配置${failed ? ` / ${failed}点が失敗` : ""}。`,
);
if (placed) {
  console.log("\n次にこの順で実行すること:");
  console.log("  1. node scripts/capture-baseline.mjs --check   Visionへの影響を確認（0pxが必須）");
  console.log("  2. npm run build && npm start");
  console.log("  3. node scripts/measure-fps.mjs               fpsが予算内か");
  console.log("  4. node scripts/measure-transfer.mjs          初期転送が予算内か");
}
process.exit(failed ? 1 : 0);
