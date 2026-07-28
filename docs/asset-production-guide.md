# Foresight Asset Production Guide

> **このガイドだけを見て、追加質問なしに画像生成を発注できる状態**をゴールとする。
> 曖昧な表現は使わない。制作会社へそのまま渡せる粒度で書く。

## 全体のアートディレクション（全素材共通）

**素材ごとに最適化しない。** サイト全体で1つの世界に見えることを最優先する。
以下は**全プロンプトに必ず織り込む**。

| 項目 | 指定 | なぜ |
|---|---|---|
| 配色 | **完全なモノクロ**(彩度ゼロ)。白 `#FFFFFF` の線 / 黒 `#090909` の地 | High Gloss Mono 5色構成。色が1滴でも入ると全体が壊れる |
| 描画様式 | **白い線画**。塗りつぶさない。輪郭と構造線で形を作る | 加算合成で黒を透過させるため。塗ると板の矩形が出る |
| 背景 | **純黒 `#000000` 単色**。グラデーション・影・地面を描かない | 切り抜き工数をゼロにする。加算合成では黒＝透明 |
| コントラスト | 高。中間調を極力持たない | ディザリングが中間調を点に分解するため |
| 余白 | 被写体の周囲に**最低12%**の黒余白 | 3D平面に貼ったとき端が切れない |
| 解像度 | **4096 × 4096 px** | 回廊で寄っても破綻しない最低要件 |
| 形式 | PNG(可逆) | 線画は非可逆圧縮で輪郭が汚れる |

### 全プロンプトの共通接頭辞

```
Monochrome white line art on pure black background (#000000), no fill, no shading,
no gradient, no ground plane, no text, no watermark, high contrast, clean vector-like
strokes, technical illustration style, subject centered with at least 12% black margin
on all sides, 4096x4096 pixels, industrial precision, cinematic and restrained.
```

**この接頭辞を全ての生成プロンプトの先頭に置く。** 以降の各素材では、これに続く「被写体の指定」のみを記載する。

---

## 車両の基本設定（全車両素材で統一）

**素材ごとに車種が変わると別の会社の話になる。以下を全カットで固定する。**

| 項目 | 指定 |
|---|---|
| **車種** | **ボクシーな本格クロカン4WD SUV**(ラダーフレーム系)。ジムニー / ディフェンダー / Gクラスの系譜 |
| **ブランドイメージ** | 華美でない。道具として信頼できる。無骨で機能的 |
| **なぜこの車種か** | Foresightは「どんな場所へも取りに行く」会社。**丸みのある乗用車では"回収に行く"という事業実態が伝わらない**。角のある実用車が思想と一致する |
| **ボディカラー** | 指定しない(モノクロ線画のため)。**面を塗らず輪郭線で表現** |
| **時間帯 / 天候** | 描かない(背景が純黒のため) |
| **ライティング** | 描かない。**光は線の太さの強弱だけで示す** |
| **タイヤ** | ブロックパターンのオフロードタイヤ |
| **装備** | ルーフラック / 補助灯 / 牽引フック。**過度に飾らない** |

---

# 1. ブランドアセット

## A-01 ロゴ（SVG）★必須・最優先

| 項目 | 内容 |
|---|---|
| **使用セクション** | Loading / Hero / Header / Footer |
| **使用目的** | ブランドマーク。Loadingでは**目の中へ42倍に拡大**する進入点 |
| **必要理由** | 現在PNG(1536px)のため、拡大するとドットが見える。**ぼかして誤魔化す処理が入っている** |
| **優先順位** | **必須(最優先)** |
| **枚数** | 1 |
| **形式** | SVG(`.ai` / `.eps` でも可) |
| **解像度** | ベクター(解像度非依存) |
| **背景** | 透過 |
| **比率** | 現行ロゴ比 1536:1085 |
| **保存先** | `public/logo.svg` |
| **差し替え方法** | ファイルを置き、`OpeningSequence.tsx` / `Logo.tsx` の `src` を `/logo2.PNG` → `/logo.svg` に変更(2箇所) |
| **実装での使われ方** | DOM変形で拡大 / GSAP Flip でヘッダーへ移動 |

**理想**: 「目」「頭部」「文字」がレイヤー分離されていること。
**目が別パスなら、瞳の輪郭に沿って正確に進入でき、瞬きも精密になる。** 1枚のパスでも十分効果はある。

> これは**生成ではなく既存ロゴのベクターデータ**。デザイナーから元データを受領するのが最短。

---

# 2. 車両素材

## Hero Vehicle Master（6点）

**用途**: What We Can Do の3D回廊。物語の「見る → 形 → 顔」を担う。
**共通**: 4096×4096 / PNG / 純黒背景 / 保存先 `public/images/foresight/vehicle-parts/`

### V-01 3/4 Front ★必須

| 項目 | 内容 |
|---|---|
| **使用セクション** | What We Can Do（楽章I / THE WHOLE） |
| **優先順位** | **必須** |
| **アングル** | 車両前方左45°から |
| **カメラ位置** | 車高の中央(地上約1.2m)。見下ろさない |
| **レンズ / 焦点距離** | 標準〜中望遠 **85mm相当**。広角は歪んで安っぽくなる |
| **距離** | 車両全長の約2.5倍 |
| **余白率** | 上下左右に各12〜15% |
| **切り取り** | 車両全体。タイヤ接地部まで含む |
| **モーション** | 回廊の最初に通過。奥から手前へ |
| **差し替え先** | `01-suv-whole.webp` を同名の `.webp` で置換(4096pxから変換) |

```
[共通接頭辞] + A boxy body-on-frame 4WD SUV in three-quarter front view, angled 45 degrees
to the left, viewed from mid-vehicle height at eye level, 85mm lens perspective,
roof rack and auxiliary lights, aggressive off-road block-pattern tires, front tow hook,
rugged and utilitarian, drawn only with white outlines and structural lines, no filled surfaces.
```

### V-02 Side ★必須

| **アングル** | 真横(完全な側面) |
|---|---|
| **レンズ** | **135mm相当**。真横は望遠でパースを消す |
| **余白率** | 左右15% / 上下18% |
| **使用セクション** | What We Can Do（楽章I / THE FORM） |
| **モーション** | 水平方向へ流れる |
| **差し替え先** | `02-suv-side.webp` |

```
[共通接頭辞] + A boxy body-on-frame 4WD SUV in perfect side profile view, orthographic-like
flat perspective, 135mm telephoto lens to eliminate distortion, roof rack, off-road tires,
functional and boxy silhouette, drawn only with white outlines and structural lines.
```

### V-03 Front Face ★必須

| **アングル** | 真正面 |
|---|---|
| **レンズ** | 85mm相当 |
| **距離** | 車幅の約2倍。**ヘッドライトが明確に読める距離** |
| **余白率** | 12% |
| **使用セクション** | What We Can Do（楽章I / THE FACE） |
| **重要** | **ヘッドライトが「鋭い眼差し」に見えること。** Silent Gaze と接続する最重要カット |
| **差し替え先** | `03-front-face.webp` |

```
[共通接頭辞] + A boxy 4WD SUV front fascia viewed straight-on, symmetrical, 85mm lens,
sharp narrow headlights resembling a bird of prey's gaze, prominent grille, front bumper
with tow hook, drawn only with white outlines, headlights emphasized with brighter thicker
strokes to read as a piercing stare.
```

### V-04 Rear ／ V-05 Top ／ V-06 Silhouette（推奨）

| ID | アングル | 用途 | 優先 |
|---|---|---|---|
| V-04 | 真後ろ。85mm | 回廊の視点変化を増やす | 推奨 |
| V-05 | 真上。平行投影風 | 「構造を上から見極める」の暗示 | あると良い |
| V-06 | 真横の**輪郭線1本のみ** | **SVG化してストロークで描画**(Loading Scene 04) | **必須** |

**V-06 は SVG で欲しい。** `stroke-dasharray` で「線が描かれていく」演出に使うため、ラスターでは代用できない。
保存先 `public/images/foresight/silhouette.svg`

```
[共通接頭辞] + A single continuous outline silhouette of a boxy 4WD SUV in side profile,
one unbroken contour line only, no interior details, no wheels detail, minimal and clean,
suitable for conversion to a single SVG path.
```

## Macro Pack（10点）

**用途**: 「見えないものを見る」楽章II。ディテールに寄る。
**共通**: 4096×4096 / 純黒背景 / **被写体を画面いっぱいに**(余白12%)

| ID | 被写体 | レンズ | 使用セクション | 優先 | 差し替え先 |
|---|---|---|---|---|---|
| M-01 | **ヘッドライト** | マクロ100mm | WhatWeCanDo / Hero補助 | **必須** | 新規 |
| M-02 | **ホイール＋タイヤ** | 100mm | 楽章II / THE GROUND | **必須** | `04-tire-suspension.webp` |
| M-03 | **エンジン** | 50mm | 楽章II / THE CORE | **必須** | `05-engine.webp` |
| M-04 | ドアハンドル | マクロ100mm | 楽章II | 推奨 | 新規 |
| M-05 | ミラー | 85mm | 楽章II | あると良い | 新規 |
| M-06 | ボディライン | 135mm | 楽章II | 推奨 | 新規 |
| M-07 | グリル | 85mm | 楽章II | 推奨 | 新規 |
| M-08 | インテリア | 24mm広角 | 楽章II | あると良い | 新規 |
| M-09 | ステアリング | 50mm | 楽章II | あると良い | 新規 |
| M-10 | シフト | マクロ100mm | 楽章II | あると良い | 新規 |

```
# M-01 ヘッドライト
[共通接頭辞] + Extreme close-up of a rugged SUV headlight unit, macro 100mm lens,
projector lens and internal reflector structure visible, sharp angular housing,
drawn only with white outlines and structural lines, the lens element rendered with
concentric contour lines to suggest depth without shading.

# M-02 ホイール
[共通接頭辞] + Close-up of an off-road wheel and tire, 100mm lens, aggressive block tread
pattern, multi-spoke alloy wheel, brake disc and caliper visible behind spokes,
coil spring suspension partially visible, drawn only with white outlines.

# M-03 エンジン
[共通接頭辞] + A complete engine assembly viewed from a three-quarter angle, 50mm lens,
intake manifold, belts and pulleys, turbocharger piping, cylinder head detail,
mechanical and precise, drawn only with white outlines and structural lines, no shading.
```

## Damage / Journey / Rebuild / Parts / Next（5点）

**用途**: 楽章II後半〜IV。物語の核心。

| ID | 被写体 | 使用セクション | 優先 | 差し替え先 |
|---|---|---|---|---|
| D-01 | **損傷した車両** | 楽章II / THE DAMAGE | **必須** | `06-damaged.webp` |
| D-02 | **積載車で運搬** | 楽章III / THE JOURNEY | **必須** | `07-transport.webp` |
| D-03 | **リフトで整備** | 楽章III / THE REBUILD | **必須** | `08-repair.webp` |
| D-04 | **分解パーツ群** | 楽章III / THE PARTS | **必須** | `09-parts-reuse.webp` |
| D-05 | **夜明けの道へ向かう** | 楽章IV / THE NEXT | **必須** | `10-next-journey.webp` |

> **D-01 の演出上の注意**: 損傷を**「価値がない」ように描かない**。
> 派手な破壊・炎上・スクラップ表現は禁止。**静かに、重く、しかし車体の骨格は保たれている**こと。
> 「それでも、価値はまだ残っている」というコピーと矛盾してはいけない。

```
# D-01 損傷
[共通接頭辞] + A boxy 4WD SUV with visible accident damage on the front left, dented panel
and cracked headlight, three-quarter front view, 85mm lens, the vehicle still structurally
intact and dignified, NOT a wreck, NOT burning, NOT crushed, quiet and heavy in mood,
drawn only with white outlines, damage indicated by broken and displaced contour lines.

# D-02 運搬
[共通接頭辞] + A flatbed tow truck carrying a boxy 4WD SUV on its tilted deck, three-quarter
side view, 50mm lens, winch cable and securing straps visible, the operation careful and
professional, drawn only with white outlines.

# D-03 整備
[共通接頭辞] + A boxy 4WD SUV raised on a two-post automotive lift, a single mechanic in
work uniform standing beneath and working, 35mm lens, tool cart nearby, workshop equipment
minimal, the scene focused and skilled, drawn only with white outlines.

# D-04 パーツ
[共通接頭辞] + An organized flat-lay array of disassembled automobile parts arranged in a grid:
engine block, doors, seats, wheels, suspension struts, battery, headlight units, radiator,
viewed from directly above, catalog-like arrangement, each part clearly separated,
drawn only with white outlines.

# D-05 未来へ
[共通接頭辞] + A boxy 4WD SUV driving away on an open road toward a rising sun on the horizon,
rear three-quarter view, 85mm lens, distant mountain range, the road curving into the distance,
the sun drawn as a simple circle with radiating contour lines, hopeful and forward-looking,
drawn only with white outlines.
```

## Reflection Pack（3点・推奨）

**用途**: Art Bible の「反射は実行時計算せず素材で表現する」方針の実体。

| ID | 被写体 | 優先 |
|---|---|---|
| R-01 | 塗装面の反射(等高線状のハイライト) | 推奨 |
| R-02 | ガラスの反射(透過を描かず反射だけ) | 推奨 |
| R-03 | 金属の反射(エッジの鋭さ) | あると良い |

```
[共通接頭辞] + Abstract representation of light reflecting off a curved painted car body panel,
shown only as flowing contour lines following the surface curvature, like topographic lines,
no actual gradient or fill, purely linear.
```

---

# 3. 背景・テクスチャ・ノイズ

**これらは生成不要。** シェーダとCanvasで手続き的に生成済み。

| 素材 | 状態 |
|---|---|
| 体積霧 | `Atmosphere.tsx` で生成済み |
| 塵 | 同上 |
| 光条 | 同上 |
| フィルムグレイン | `Noise` ポストプロセスで生成済み |
| ディザパターン | `ditherMaterial.ts` で生成済み |

**外部素材に依存しない分、どの解像度でも破綻しない。** 発注不要。

## 雲（既存・追加不要）

`cloud.jpg` / `cloud2` / `cloud3` / `cloud4` を Loading で使用中。差し替え不要。

---

# 4. アイコン

**発注不要。** 現状アイコンを使っていない。矢印は文字 `→`、罫線はCSSで描画。

> Art Bible の「アイコンの代わりに絵文字を多用しない」に加え、
> **そもそもアイコンを使わない**方針。モノクロ・タイポグラフィ主導のため、
> アイコンを足すと視覚的な重さの順位が崩れる。

---

# 5. 動画

**発注不要。** Loading は DOM変形 + GSAP で構成しており、動画を使っていない。
動画は容量が大きく、モノクロ線画では静止画＋モーションで十分な質が出る。

---

# 制作優先順位（Storyboard順）

**一括制作しない。** 上から順に発注し、届いたものから実装へ組み込む。

| 順 | 素材 | セクション | 点数 | 状態 |
|---|---|---|---|---|
| **1** | **A-01 ロゴSVG** | Loading / Hero | 1 | ★最優先。これだけで Loading の品質が変わる |
| **2** | **V-06 シルエットSVG** | Loading Scene 04 | 1 | 線が描かれる演出に必須 |
| **3** | **V-01 / V-02 / V-03** | WhatWeCanDo 楽章I | 3 | 既存10枚の差し替え |
| **4** | **M-02 / M-03** | 楽章II | 2 | 同上 |
| **5** | **D-01** | 楽章II（核心） | 1 | 同上 |
| **6** | **D-02 / D-03 / D-04** | 楽章III | 3 | 同上 |
| **7** | **D-05** | 楽章IV | 1 | 同上 |
| 8 | M-01 / M-04〜M-10 | 楽章II 拡充 | 8 | 推奨 |
| 9 | V-04 / V-05 | 回廊の視点追加 | 2 | 推奨 |
| 10 | R-01〜R-03 | 質感 | 3 | あると良い |

**1〜7（12点）が揃えば、Storyboard の全セクションが設計通りに成立する。**
8以降は密度を上げるための追加。

---

# 差し替え手順（共通）

1. 生成した 4096×4096 PNG を用意
2. WebP へ変換
   ```bash
   npx sharp-cli -i 生成画像.png -o public/images/foresight/vehicle-parts/01-suv-whole.webp --format webp --lossless
   ```
   または `scripts/slice-siteparts.mjs` を参考に変換スクリプトを書く
3. **既存と同じファイル名で上書きすれば、コード変更ゼロで反映される**
4. `npm run dev` で確認
5. **必ず `node scripts/capture-baseline.mjs --check` を実行**
   — 素材のサイズが変わると回廊のレイアウトが変わり、Vision に影響し得るため

## 高解像度化で可能になること

| | 現行267px | 4096px |
|---|---|---|
| 回廊の寄り | 拡大率1.6倍で頭打ち | **もっと寄れる**(`nearOut` を緩められる) |
| ディザ強度 | `0.18`（線が壊れる手前） | **0.35〜0.5 まで上げられる**。粒状感が明確に出る |
| マクロ演出 | 不可 | **ヘッドライトが画面を覆う**演出が可能 |

**ディザリングの表現力は素材解像度に直接縛られている。** ここが最大の伸びしろ。
