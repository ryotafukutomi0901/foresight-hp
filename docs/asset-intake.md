# 車両素材の受け入れ手順

> **CEOが画像を1枚渡すたびに、この手順だけで組み込みまで完了する状態を維持する。**
> 素材の仕様そのものは [asset-production-guide.md](./asset-production-guide.md) が正本。
> ここは「届いてから配信されるまで」の手順に限る。

## 3行でまとめ

```bash
# 1. 原本を置く（4096px PNG）
cp <生成画像>.png assets-src/vehicle/V-02-side.png

# 2. 検査して配置（検査に落ちたら配置されない）
node scripts/intake-vehicle.mjs V-02

# 3. 検証（この4本は必ず通す）
node scripts/capture-baseline.mjs --check
npm run build && npm start
node scripts/measure-fps.mjs
node scripts/measure-transfer.mjs
```

**コードの変更は不要。** `lib/content.ts` のパスは既に正しく、同名のWebPを上書きすれば反映される。

---

## 1. 置き場所と命名

| | |
|---|---|
| 原本の置き場 | `assets-src/vehicle/` |
| 命名 | **`<素材ID>` で始まれば以降は自由**。例: `V-02-side.png` / `V-02.png` / `V-02_final_v3.png` |
| 形式 | PNG（可逆） |
| 解像度 | **4096×4096 以上**。正方形 |

`assets-src/` は **gitignore 済み**。原本は配信もコミットもされない。
**PNG原本を `public/` に置かないこと。** `public/` はビルド成果物にそのまま入るため、
参照されないまま毎回デプロイされる（過去に15.3MBの原本がこれで載っていた → [D-013](./decision-log.md)）。

再変換に必要なので**原本は手元に残す**。

## 2. 素材IDと回廊スロットの対応

`lib/content.ts` の `NARRATIVE_SHOTS` と1対1で対応する。**この対応は変えない。**

| ID | Shot | 配信先 | Kicker | 内容 |
|---|---|---|---|---|
| V-01 | W-04 | `01-suv-whole.webp` | THE WHOLE | 3/4 前方 ✅受領済み |
| V-02 | W-04 | `02-suv-side.webp` | THE FORM | 真横 |
| V-03 | W-04 | `03-front-face.webp` | THE FACE | 真正面 |
| M-02 | W-05 | `04-tire-suspension.webp` | THE GROUND | ホイール |
| M-03 | W-05 | `05-engine.webp` | THE CORE | エンジン |
| D-01 | W-06 | `06-damaged.webp` | THE DAMAGE | 損傷 |
| D-02 | W-07 | `07-transport.webp` | THE JOURNEY | 積載車 |
| D-03 | W-07 | `08-repair.webp` | THE REBUILD | 整備 |
| D-04 | W-07 | `09-parts-reuse.webp` | THE PARTS | パーツ群 |
| D-05 | W-08 | `10-next-journey.webp` | THE NEXT | 夜明けの道 |

現在の受け入れ状況は `node scripts/intake-vehicle.mjs`（引数なし）で確認できる。

## 3. 検査項目

`scripts/intake-vehicle.mjs` が自動で測る。**✕が1つでもあれば配置しない。**

| 判定 | 項目 | 基準 | なぜ |
|---|---|---|---|
| ✕ | 解像度 | 4096×4096 以上 | 回廊で寄っても破綻しない最低要件 |
| ✕ | 彩度 | チャンネル差 ≤2 | 完全なモノクロ。色が1滴でも入ると全体が壊れる |
| ✕ | 背景 | 四隅の明度 ≤12/255 | **加算合成では黒＝透明。** 純黒でないと矩形の板として見える |
| ⚠ | 正方形 | W=H | V-01が正方形。違うと板の縦横比が変わりBaselineに影響する |
| ⚠ | 余白 | 各辺 12%以上 | 回廊の `edgeFeather 0.34` が外周を削る。`--pad` で黒を足せる |
| ⚠ | 白の面積 | ≤8% | V-01は1.2%。超えていたら塗りつぶしている（線画指定の違反） |
| ⚠ | 黒の面積 | V-01(88.7%)から±12%以内 | 線の密度がマスターと大きく違うと世界が揃わない |

⚠ は配置されるが**報告する**。V-01との一貫性が疑わしい場合は勝手に補正せずCEOへ報告する。

### 余白が足りない場合

```bash
node scripts/intake-vehicle.mjs V-02 --pad
```

**被写体を縮めず、キャンバスを広げて黒を足す**（絵そのものは変えない）。
ただし板に対する被写体の相対サイズが変わる＝**回廊での見え方が変わる**ため、
既に配信中の素材に後から `--pad` を掛ける場合は**CEO判断を仰ぐこと。**

> **V-01は現在この状態にある。** 実測で余白が左右3.9/3.6%しかなく、
> `edgeFeather` が車両の左右端をわずかに削っている。
> 補正すると回廊での見え方が変わるため、**CEO判断待ちとして未実施**。

## 4. 配信解像度

**1024×1024 / WebP q90。** 原本4096pxから変換する。

透視投影から逆算すると、板が画面上で最大になるのは mobile(844×dpr3) の **798px**。
1024は全端末を上回り、**それ以上は1画素も画面に出ない**（[D-013](./decision-log.md)）。
2048pxで試したが、見た目は同一で転送量だけ351KB増えた。

> ⚠️ `lib/tokens.ts` の `corridor.planeScaleBase` / `camera.fov` / `corridor.nearOut` を
> 変更したら**この逆算をやり直すこと。** 必要解像度が変わる。

## 5. 配置後の検証（4本すべて必須）

| 順 | コマンド | 合格基準 | 落ちたときは |
|---|---|---|---|
| 1 | `node scripts/capture-baseline.mjs --check` | **15/15 が 0px** | 素材のサイズ・縦横比が板の形を変えてVisionに影響している。原因を特定するまで進めない |
| 2 | `npm run build` | 成功 | — |
| 3 | `node scripts/measure-fps.mjs` | desktop ≥55 / tablet・mobile ≥40 | テクスチャが重すぎる。解像度を見直す |
| 4 | `node scripts/measure-transfer.mjs` | 初期転送 ≤1229KB | 回廊テクスチャは遅延ロードなので初期転送には出ないはず。出たら遅延が壊れている |

**Baseline は必ず dev server に対して実行する**（基準画像もdevで撮っている）。
本番ビルドに掛けると、Visionとは無関係なスクロールインジケータのCSSアニメーションが
別位相で撮れて8件落ちる。

### 目視確認

```bash
node scripts/measure-fps.mjs   # の代わりに、回廊を実際に見る場合
```
Narrative セクションまでスクロールし、以下を確認する。

- [ ] 車両が**V-01と同じ車に見える**（丸型ヘッドランプ / 横バーグリル / FORESIGHTワードマーク / 角張ったボディ / フェンダークラッディング / ルーフレール / サイドステップ / マルチスポークホイール / オフロードタイヤ）
- [ ] ディザリングの粒が線を壊していない
- [ ] 板の矩形の縁が見えていない
- [ ] Hero / Vision に車両が**1枚も出ていない**（先行表示の禁止）
- [ ] console にエラーが出ていない

## 6. 素材がV-01と矛盾していた場合

**勝手に補正しない。** 以下を添えてCEOへ報告する。

1. どの意匠が違うか（上のチェックリストの項目名で）
2. 検査スクリプトの実測値（余白・明度分布）
3. 該当箇所のスクリーンショット

補正すると「マスターに寄せたつもりの別の車」が増え、**素材が増えるほど世界が崩れる。**

## 7. まだ素材が無いスロットについて

**プレースホルダを別素材へ差し替えたり、Shot / Motion / Storyboard を変更しない。**
現在9枠は 267×296 の仮素材（`siteparts.png` 由来）で埋まっている。
仮のままでも回廊は成立するため、**届いた順に1枚ずつ差し替えるのが正しい進め方。**

## 8. 未使用ファイルの記録

配信もコミットもしていないが手元に存在するファイル。**判断が出るまで触らない。**

| ファイル | 状態 | 備考 |
|---|---|---|
| `public/logo1.svg` | **未追跡・未参照** | 8,261 bytes。追跡も削除もしない方針（2026-07-30 CEO指示）。正式なロゴは **`public/logo2.svg`** |
| `public/logo1.JPG` | 追跡済み・未参照 | 187KB。ブランドの元素材と思われるため残置 |
| `public/logo2.PNG` | 追跡済み・未参照 | 114KB。`logo2.svg` に置き換わった旧素材 |

**正式なロゴは `public/logo2.svg`。** `Logo.tsx` と `OpeningSequence.tsx` が参照している唯一のロゴ。

## 9. 素材IDを追加したい場合

回廊は10枠で固定されている（`lib/content.ts`）。11枚目を入れるには
**Shot List と Storyboard の変更が必要**なため、素材だけ用意しても組み込めない。
[asset-production-guide.md](./asset-production-guide.md) の M-01 / M-04〜M-10 / V-04 / V-05 /
R-01〜R-03 が該当する（現時点では生成不要）。
