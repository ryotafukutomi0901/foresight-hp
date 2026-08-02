# ANTIGRAVITY 作業指示書 — foresight-hp

> このファイルはそのまま ANTIGRAVITY（または他のコーディングエージェント）に渡せる形式で書いてある。
> ツール非依存。前提知識ゼロで着手できるようにしてある。

---

## 1. あなたがやること

このプロジェクト（Next.js製の中古車ブランドサイト）を、
リファレンスサイトの**視覚的構造**に合わせて実装・改修する。

**リファレンス**: https://izanami-official.com/ja/

**重要**: 「なんとなく似た雰囲気」で終わらせない。
**元サイトの視覚構造を可能な限り正確に再現する。**

---

## 2. 絶対に守ること（法的な線引き）

### 模倣してよい（アイデア。著作権保護の対象外）
- ページ構造・セクションの順番
- レイアウトパターン・グリッド・余白の取り方
- タイポグラフィのスケールと行間の比率
- スクロール・ホバー・遷移のモーション設計

### 絶対にコピーしない（著作物）
- リファレンスサイトの**テキスト・文言**
- **画像・SVG・動画**などのアセット
- **ロゴ**
- **フォントファイル**

文言は `lib/content.ts` の既存コピーを使う。
アセットは `public/` にある自前のものだけを使う。

---

## 3. 技術スタック（厳守）

```
Next.js 16 (App Router) / React 19 / TypeScript
Tailwind CSS v4
GSAP 3.15 + ScrollTrigger + ScrollSmoother
React Three Fiber + three.js（背景の霧・塵・光条のみ）
```

### 禁止事項
- **新しいライブラリを追加しない。** 特にアニメーション系
  （anime.js / Framer Motion / Lenis 等）は入れない。
  GSAP + ScrollSmoother で全て実現できる。二重に入れると
  スクロール駆動が競合し、同期ズレの温床になる
- 既存コンポーネントで代替できるものを新規作成しない

---

## 4. 作業の順番（この順で進める）

### Step 1: 分析（実装より先）
`docs/DESIGN_ANALYSIS.md` を読む。**採寸済みの実測値が全て入っている。**
生データは `docs/reference/measured.json`、
スクリーンショットは `docs/reference/{desktop,tablet,mobile}-{fold,full}.png`。

再採寸が必要なら:
```bash
node scripts/analyze-reference.mjs
```

### Step 2: 実装
`docs/DESIGN_ANALYSIS.md` 末尾の「Foresight への適用方針」に従う。

### Step 3: スクリーンショット比較ループ（**最重要**）

**「それっぽい」で終了しない。以下を最低2周する。**

1. ローカルで起動: `npm run dev`
2. 3つのビューポートで自分の実装を撮影
   - Desktop 1440×900
   - Tablet 834×1112
   - Mobile 390×844
3. `docs/reference/` の同条件のスクリーンショットと**並べて比較**
4. 以下の観点で差分を洗い出す:
   - レイアウト / サイズ / 位置 / 余白
   - Typography（サイズ・行間・字間）
   - 色
   - 画像の比率と配置
   - アニメーション
   - レスポンシブ挙動
5. **差分が大きい箇所から順に**修正
6. 再撮影 → 2 に戻る

### Step 4: 残差分の報告
最後に、まだ差が大きい箇所を**列挙して報告する**。
「完了しました」だけで終わらせない。

---

## 5. コマンド

```bash
npm run dev     # 開発サーバ（http://localhost:3000）
npm run build   # 本番ビルド。型エラーもここで出る
npm run lint    # ESLint。React Compiler の不変条件チェックも走る

node scripts/analyze-reference.mjs   # リファレンス採寸
node scripts/measure-fps.mjs         # fps実測（要 dev サーバ）
node scripts/capture-opening.mjs     # オープニング演出の確認
```

---

## 6. ファイルマップ

| パス | 役割 |
|---|---|
| `app/page.tsx` | セクションの並び順 |
| `app/globals.css` | **デザイントークンの正本**（色・余白・タイポ） |
| `lib/tokens.ts` | 数値トークン（カメラ・モーション・ディザ） |
| `lib/content.ts` | **全ての文言**。ハードコードしない |
| `components/sections/` | 各セクション |
| `components/layout/Header.tsx` | 固定ヘッダー |
| `components/ui/SectionHead.tsx` | セクション見出し（横組み/縦組みsticky） |
| `components/opening/OpeningSequence.tsx` | ローディング演出 |
| `components/three/Atmosphere.tsx` | 常設3D背景（霧・塵・光条） |
| `public/video/` | 生成済みの動画素材 |
| `docs/DESIGN_ANALYSIS.md` | **リファレンスの採寸結果** |

---

## 7. 受け入れ条件

- [ ] `npm run build` が通る
- [ ] `npm run lint` が通る
- [ ] Desktop / Tablet / Mobile の3サイズで破綻がない
- [ ] `prefers-reduced-motion: reduce` で全内容が静止状態で読める
- [ ] スクロール中の fps が **desktop 55 / tablet 40 / mobile 40** 以上
      （`node scripts/measure-fps.mjs` で実測）
- [ ] リファレンスとの残差分を列挙して報告済み

---

## 8. 踏みやすい罠（実測で判明済み）

| 罠 | 対処 |
|---|---|
| `mix-blend-mode` は**親の背景**に対して解決される。親が透明だと黒い矩形が残る | 親に地の色を薄く敷く |
| 自前のフラグメントシェーダーに `texture.repeat/offset` は効かない | UV変換用の uniform を自分で持つ |
| `EffectComposer` は中間バッファに alpha ごと書き込む。`alpha=1.0` 固定だと矩形が残る | alpha を明度に連動させる |
| MSAA（`multisampling`）は fps を大きく削る。4で18fps、0で58fps | 0 のまま使う |
| 動画の `object-contain` は要素比率が合わないと上下に黒帯が出る | `aspect-video` で比率を一致させる |
| `container-x` は `margin-inline: auto`。幅を狭めるだけでは中央に寄る | 内側にラッパーを置く |
| 文言を追加・変更したら**フォントのサブセット再生成が必須** | `node scripts/build-font-subset.mjs` |

---

## 9. 判断に迷ったら

- **実装より先に画で確認する。** コードを読んでも分からない不具合が多い
- 数値は推測せず `docs/DESIGN_ANALYSIS.md` の実測値を使う
- ブランドの根幹（明朝体・モノクロ・車両の線画）は変えない
- 迷ったら停止して確認する。独断で大きな設計変更をしない
