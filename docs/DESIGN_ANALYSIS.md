# DESIGN ANALYSIS — izanami-official.com

> リファレンス: https://izanami-official.com/ja/
> 採寸日: 2026-08-02 / 採寸方法: Playwright + computed style の実測
> 生データ: [reference/measured.json](./reference/measured.json)
> スクリーンショット: `reference/{desktop,tablet,mobile}-{fold,full}.png`
>
> **模倣するのは構造・レイアウト・余白・モーション設計（アイデア）。**
> テキスト・画像・SVG・ロゴ・フォントファイルは一切コピーしない。

---

## 1. ページ全体の構造

```
loader(fixed, z=90)        ← 初回のローディング幕
header(fixed, z=80)        ← 常時表示
nav(fixed, z=50)           ← 全画面メニュー(閉時は不可視)
main
 ├ Hero          h=1440   キャッチのみ。雲画像が多層
 ├ Philosophy    h=1816   理念。縦組みラベル + 大見出し + 本文
 ├ Projects      h=3496   3事業。中に sticky セクションが3つ
 │   ├ 01 School    h=675  sticky
 │   ├ 02 Craft     h=677  sticky
 │   └ 03 Retreat   h=677  sticky
 ├ Company       h=1440
 └ Footer        h=811
```

総ページ高 **9003px**（viewport 1440×900 に対し10画面分）。
情報量に対してページが長い＝**余白で読ませる設計**。

## 2. Header / Navigation

| | |
|---|---|
| position | `fixed` / z-index **80** |
| 構成 | ロゴ(左) / ハンバーガー(右) / 言語切替 |
| 高さ | 実測 945px の枠だが、実体は上部の細い帯のみ(残りは透明) |
| 背景 | `rgba(0,0,0,0)` — **透明のまま。スクロールしても色が付かない** |
| メニュー | 別レイヤーの全画面 nav(z=50)。開くと覆う |

**Foresightとの差**: 現行は「スクロールでヘッダーに背景色が付く」。izanamiは**最後まで透明**。

## 3. Hero

- 高さ **1440px**（viewport 900px より大きい ＝ スクロールしないと全部見えない）
- 中央に短いタグライン1行のみ。**説明文を置かない**
- 背景は雲画像を**多層**（`common_fv_cloud01/02.webp` を複数枚重ねる）
- 画像比率は **2.078:1** の横長を `object-fit: fill` で敷く

## 4. セクションの順番

Hero → Philosophy(理念) → Projects(3事業) → Company → Footer

**理念が事業より先**。何をやっているかより、なぜやるかを先に語る構成。

## 5. コンテンツ幅

| 実測値 | 用途 |
|---|---|
| 1440px | 画面全幅(=viewport) |
| **1296px** | **主コンテンツ幅**(左右72pxの余白) |
| 968px | 本文ブロック |
| 648px / 468px / 324px | 分割カラム(1296 ÷ 2/3/4) |

左右マージン **72px**(1440の5%)。**1296 = 1440 - 72×2**。

## 6. Grid / Flex

- 主要なグリッドは **1296px を 2/3/4 分割**（648 / 432 / 324）
- Projects の3項目は **横並びではなく縦積み + sticky**

## 7. Typography

| 役割 | サイズ | 行間 | 実測 |
|---|---|---|---|
| 大見出し(英) | **45px** | 45px (1.0) | `Designing the Dimensions of Life` |
| セクションラベル(h2) | **18px** | 18px | **縦組み**(幅18px × 高さ81〜110px) |
| 本文(和) | **14.4px** | **34.56px (2.4倍)** | 極端にゆったり |
| 小見出し(h3) | 16px | normal | `01 School` |
| Hero タグライン | 16px | normal | 意外に小さい |

**最大の特徴は本文の行間2.4倍。** 通常は1.6〜1.8。これが「静けさ」の正体。

**font-weight は全て 400。** 太字を一切使わない。
**letter-spacing は全て normal。** 字間で演出しない。

## 8. Font family

```
"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif
```

**Webフォントを使わず、OS標準のゴシックのみ。** 和文も明朝ではなくゴシック。

> Foresight は Shippori Mincho(明朝)を自己ホストしている。
> ここは**ブランドの根幹なので追随しない**（明朝の静けさは Foresight の資産）。

## 9. 色

| 色 | 用途 | 出現数 |
|---|---|---|
| `rgb(217,215,212)` | 文字(オフホワイト、僅かに暖色) | 563 |
| `rgb(10,8,1)` | 背景(ほぼ黒、僅かに暖色) | 3 |
| `rgb(0,0,0)` | 純黒 | 29 |
| `rgb(255,255,255)` | 純白 | 2 |

**実質2色。** ダークテーマで、Foresight と同系統。
両者とも「黒地にオフホワイト」なので、**配色の大幅な変更は不要**。

| | izanami | Foresight |
|---|---|---|
| 地 | `#0A0801` | `#090909` |
| 文字 | `#D9D7D4` | `#F2F2F2` |

izanami の方が**僅かに暖色**（茶が入る）で、文字も**少し暗い**（コントラストが穏やか）。

## 10. Border / Radius / Shadow

- `border-radius: 0px` — **全ての要素が角丸なし**
- shadow なし
- 罫線もほぼ使わない（余白で区切る）

## 11. 画像の配置・比率

- Hero の雲: **2.078:1**（横長）、`object-fit: fill`
- 実寸は 3366×1620 / 2430×1170 と**巨大**（Retina対応）
- **角丸なし・枠線なし**

## 12. Background

セクションの背景色は全て `rgba(0,0,0,0)` = **透明**。
body の地(`#0A0801`)が最後まで透けている。**セクションごとに色を変えない。**

> Foresight は現在 Buy/Sell/Find で明転している。izanami は**一切明転しない**。

## 13. Scroll animation

- **`position: sticky` が主役。** セクション見出し(h2)と Projects の各項目に付く
- 見出しは**画面左端(x=72)に貼り付いたまま**、本文がスクロールしていく
- Projects の3項目は**同じ位置に重なって切り替わる**（675px ずつ）

## 14. Hover animation

計測範囲では控えめ。リンクの下線・不透明度程度。

## 15. Page transition

初回に `loader`(fixed, z=90) が全画面を覆う。

## 16-18. Responsive / Mobile / Desktop

| | desktop | tablet | mobile |
|---|---|---|---|
| viewport | 1440×900 | 834×1112 | 390×844 |
| docHeight | 9003 | (measured.json参照) | (同左) |

左右マージンは viewport の **5%** で共通。

## 19. 要素間の余白

| 箇所 | 実測 |
|---|---|
| Philosophy の上 | **padding-top 990px** |
| Projects の各項目 | padding **90px** 上下 |
| Footer 上 | 27px |

**990px の余白**は特筆に値する。1画面分以上を空白にしている。

## 20. Sticky / Fixed 要素

| 要素 | position | z-index |
|---|---|---|
| loader | fixed | 90 |
| header | fixed | 80 |
| nav | fixed | 50 |
| セクション見出し h2 | **sticky** | auto |
| Projects の各 section | **sticky** | auto |

---

## Foresight への適用方針

### 採用する（構造・レイアウト）

1. **コンテンツ幅 1296px / 左右マージン 5%**
2. **本文の行間 2.4倍** — 最も効く。静けさはここから来る
3. **font-weight 400 のみ・letter-spacing normal**
4. **角丸ゼロ・影ゼロ**
5. **セクション見出しの縦組み + sticky**
6. **Projects 型の sticky スタック** → Foresight の Buy/Sell/Auction に適用
7. **セクション背景を透明にし、地を最後まで通す**
8. **理念を事業より先に置く**構成順
9. **ヘッダーを最後まで透明に保つ**

### 採用しない（ブランドの根幹に関わる）

| 項目 | 理由 |
|---|---|
| OS標準ゴシック | Foresight は Shippori Mincho(明朝)が資産。追随しない |
| 雲の画像 | Foresight は車両の線画が主役 |
| 暖色寄りの黒 | 現行の `#090909` を維持 |
| テキスト・画像 | **著作物のためコピー禁止** |

### 現行との差分（要改修）

| 項目 | 現行 Foresight | izanami | 対応 |
|---|---|---|---|
| コンテンツ幅 | 1440px | **1296px** | 狭める |
| 本文行間 | leading-loose(≈1.8) | **2.4** | 広げる |
| セクション見出し | 横組み | **縦組み sticky** | 変更 |
| Buy/Sell/Find | 明転(白背景) | **透明のまま** | 暗いまま統一 |
| ヘッダー | スクロールで着色 | **透明のまま** | 透明を維持 |
| 事業の見せ方 | 順に並ぶ | **sticky スタック** | 変更 |
