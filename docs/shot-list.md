# Shot List — 撮影台本

> Shot単位の実装仕様。**数値の意味と根拠は各Bibleにあり、ここでは「どのShotでどの値を使うか」を指定する。**
> 構成と繋がりは [02-storyboard.md](./02-storyboard.md)。

## 表記規約

| 記法 | 意味 |
|---|---|
| `T+0.0` | Loadingは**秒**。タイムライン先頭からの経過 |
| `P0.00` | 本編は**スクロール進行度**(0.0–1.0)。セクション内での相対位置 |
| ease名 | [motion-bible.md](./motion-bible.md) のトークン名 |
| `—` | 該当なし(そのShotでは扱わない) |

**Shot番号**: `L-##`=Loading / `H-##`=Hero / `V-##`=Vision / `W-##`=What We Can Do / `B-##`=Buy / `S-##`=Sell / `F-##`=Find / `C-##`=CTA

---

# Loading（5.0秒 / 全8Shot）

3Dなし。DOM変形のみ。単一GSAP Timelineで管理し、`setTimeout` は使わない。

## L-01 — 暗闇

| | |
|---|---|
| **目的** | 「無」ではなく「まだ見えていない」を作る |
| **開始 / 終了 / Duration** | `T+0.0` / `T+0.5` / `0.5s` |
| **Camera** | — |
| **Lens** | — |
| **Movement** | なし(**意図的な静止**) |
| **Ease** | — |
| **Lighting** | 背景 `#090909` |
| **Fog / Exposure / DOF** | — |
| **Particle** | Canvas2Dのディザ粒子。opacity `0.03`、極低速でゆらぐ |
| **Shader** | — |
| **Transition** | — |
| **Trigger** | ページロード完了 |
| **ScrollTrigger** | — |
| **実装** | `OpeningSequence.tsx` / Canvas2D |
| **受け入れ条件** | プログレスバーが無い。粒子が「動いている」と分かる |

> **なぜ0.5秒も何も起こさないか**: ここで焦らせないことがブランドの態度([emotional-timeline](./emotional-timeline.md) Darkness)。**静止は演出の不在ではなく演出そのもの。**

## L-02 — ロゴ結像

| | |
|---|---|
| **目的** | 粒子からロゴが「結ばれる」。出現ではなく結像 |
| **開始 / 終了 / Duration** | `T+0.5` / `T+1.4` / `0.9s` |
| **Movement** | `blur 24px→0` / `scale 1.08→1` / `autoAlpha 0→1` |
| **Ease** | `out` |
| **Lighting** | `#090909` |
| **Particle** | 粒子がロゴ輪郭へ収束 |
| **Transition** | クロスなし(粒子が実体化する) |
| **Trigger** | L-01 完了 |
| **実装** | `logo.svg`(**Placeholder: 現状 `logo2.PNG`**) |
| **受け入れ条件** | フェードインに見えない。**にじみが晴れて像を結ぶ**ように見える |

## L-03 — 瞬き

| | |
|---|---|
| **目的** | ロゴが「生きている」と気づかせる。**一度だけ** |
| **開始 / 終了 / Duration** | `T+1.4` / `T+1.7` / `0.30s` |
| **Movement** | 瞼 `scaleY 0→1`(閉じ `0.09s`)→ `1→0`(開き `0.16s`)。間に `0.05s` 保持 |
| **Ease** | 閉じ `power3.in` / 開き `power2.out` |
| **実装** | 白い楕円の瞼。**顔面と同色**で虹彩を覆う(黒だと顔に穴が空く) |
| **受け入れ条件** | **2回瞬かない。** 閉じが速く開きが遅い(人間の瞬目) |

> 瞼を白にする理由: ロゴの目は「白い眼球＋黒い虹彩」が**白い顔面に埋まった**構造。実測で確認済み。

## L-04 — 目の中へ入る（核）

| | |
|---|---|
| **目的** | 視点が対象の内側へ入る。**この演出の核** |
| **開始 / 終了 / Duration** | `T+1.7` / `T+3.6` / `1.9s` |
| **Movement** | ロゴ `scale 1→42`、`transform-origin` = **ロゴ座標系の目**(実測 `53.5% 47.5%`) |
| **Ease** | **`dive`**(最後まで加速し続ける) |
| **Lighting** | ビネットが `T+1.9` から `0.8s` で消える(視野が広がる) |
| **Particle** | 放射状ストリーク。中心は**画面上の目の実座標**(`--eye-x/y` を実行時計測でセット) |
| **Transition** | `T+2.4` から瞳の闇が `scale 0.2→9` で画面を飲む |
| **実装** | DOM変形。**全画面基準の%で拡大しない**(中央寄せされたロゴの目とズレて横へ流れる。実測で確認済み) |
| **受け入れ条件** | 目に**まっすぐ**入っていく。横へ流れない。減速して止まって見えない |

## L-05 — 瞳の闇

| | |
|---|---|
| **目的** | 一度完全に視界を失わせ、次の場面へ切り替える |
| **開始 / 終了 / Duration** | `T+3.6` / `T+3.95` / `0.35s` |
| **Movement** | 暗幕 `autoAlpha 0→1` |
| **Ease** | `power2.in` |
| **Transition** | ここでロゴ・ストリーク・瞳を破棄し、`scale` をリセット |
| **受け入れ条件** | 切り替えの瞬間に前の要素が見えない |

## L-06 — 雲の谷を抜ける

| | |
|---|---|
| **目的** | 闇の先に空間があると分かる |
| **開始 / 終了 / Duration** | `T+3.9` / `T+5.4`(重なり) / `1.5s` |
| **Movement** | `cloud3` を `scale 2.4→1` / `yPercent -14→10` |
| **Ease** | `power1.out` |
| **Lighting** | 暗幕が `T+3.95` から `0.7s` で晴れる |
| **実装** | `CloudLayers.tsx` / `art-blend`(lighten) |
| **受け入れ条件** | 雲を**通過している**感覚(見上げているのではない) |

## L-07 — 雲が晴れる

| | |
|---|---|
| **目的** | Heroへの受け渡し |
| **開始 / 終了 / Duration** | `T+4.6` / `T+5.3` / `0.7s` |
| **Movement** | 左右の雲が対角から差し込み `xPercent ±12→0` / `scale 1.2→1` |
| **Ease** | `inOut` |
| **Trigger** | `T+5.1` で `markOpeningDone()` → **Heroの入場開始** |
| **受け入れ条件** | 雲のレイヤー矩形の縁が見えない(`-inset-[30%]` で余裕を持たせる) |

## L-08 — Flip でヘッダーへ

| | |
|---|---|
| **目的** | **Loadingがページの一部だったと理解させる** |
| **開始 / 終了 / Duration** | `T+5.15` / `T+6.15`(Hero区間へ継続) / `1.0s` |
| **Movement** | **GSAP Flip**: 中央のロゴ → ヘッダー左上のロゴ |
| **Ease** | `out` |
| **Transition** | Loadingオーバーレイは Flip 完了後にアンマウント |
| **実装** | `Flip.getState()` → DOM入れ替え → `Flip.from()` |
| **受け入れ条件** | **ロゴが一度も消えずに移動する。** 継ぎ目が見えない |

> **決定事項3(GSAP Flip)の実体。** ここが繋がらないとLoadingは「別物」になる。

---

# Hero（全6Shot / pinしない）

**WebGLを使わない**(→ [decision-log D-008](./decision-log.md#d-008-hero-に-threejs-を使わない))。SVG + Canvas2D + CSS。

## H-01 — Silent Gaze 出現

| | |
|---|---|
| **目的** | 「視線」が空間に引かれる |
| **開始 / 終了** | Flip完了直後 / `+1.2s` |
| **Movement** | SVG `stroke-dasharray` で中央から左右へ伸びる |
| **Ease** | `inOut` |
| **Lighting** | 線の周囲に `radial-gradient` の微かなにじみ |
| **Shader** | — (SVGフィルタ `feGaussianBlur`) |
| **実装** | SVG。`aria-hidden` |
| **受け入れ条件** | 装飾ではなく「視線」に見える |

## H-02 — 英文リード

| | |
|---|---|
| **開始 / Duration** | `H-01 +0.3s` / `1.6s` |
| **Movement** | `trackIn`(字間 `0.5em→0.42em`) |
| **Ease** | `out` |
| **受け入れ条件** | 字間が締まって「決まる」感覚がある |

## H-03 — 主見出し

| | |
|---|---|
| **目的** | ブランドの一行 |
| **開始 / Duration** | `H-02 +0.2s` / `1.0s` × 2行 stagger `0.08` |
| **Movement** | 行マスク `yPercent 110→0` |
| **Ease** | `out` |
| **Typography** | `display-xl` / 2行 |
| **実装** | **文字単位アニメは使わない**(技巧が先に見える) |
| **受け入れ条件** | 5秒以内に何の会社か伝わる |

## H-04 — 補助文 + CTA

| | |
|---|---|
| **開始 / Duration** | `H-03 +0.4s` / `1.4s` stagger `0.12` |
| **Movement** | `layerIn`(`scale 0.94→1` / `blur 8px→0` / `y 40→0`) |
| **Ease** | `out` |
| **受け入れ条件** | 主CTAと副CTAが同じ強さに見えない |

## H-05 — 常時微動

| | |
|---|---|
| **目的** | 「停止しているが生きている」 |
| **Duration** | 無限ループ / 周期 `6s` |
| **Movement** | Silent Gaze の明滅(振幅 `0.06`)/ ポインタ追従パララックス |
| **Ease** | `sine.inOut` |
| **Parallax** | 線 `±12px` / 見出し `±4px` / 粒 `±20px`、lerp `0.08` |
| **実装** | CSS `@keyframes` + `gsap.quickTo` |
| **受け入れ条件** | 動きに気づかないが、止めると寂しくなる程度 |

## H-06 — Visionへの受け渡し

| | |
|---|---|
| **目的** | **視界を閉じる**(Visionで開くため) |
| **Trigger / ScrollTrigger** | `trigger: #top` / `start: "top top"` / `end: "bottom top"` / `scrub: true` |
| **Movement** | Silent Gaze が右へ収束して消える |
| **Ease** | `linear`(scrub連動のため必須) |
| **受け入れ条件** | **Visionに入る前に線が消えている。** 閉じてから開く順序 |

---

# Vision（変更しない）

## V-00 — 現状維持

**Shotを定義しない。** 既にCEO評価済みのため、現行実装をそのまま維持する。

| | |
|---|---|
| **受け入れ条件** | **`docs/baseline/` との差分がゼロであること** |
| **検証** | Phase 4 前に Baseline Capture を取得。以後の全変更で差分比較 |

> Vision は共通トークン・共通3D空間を使うため、**他セクションの改修で意図せず変わる構造的リスクがある。** Baseline がその保険。

---

# What We Can Do（全9Shot / 最長区間）

3楽節構成。**宣言 → 発見 → 実証**。

## W-01 — 宣言

| | |
|---|---|
| **目的** | 視点の提示。サービス説明ではない |
| **ScrollTrigger** | `start: "top 74%"` / `once: true` |
| **Movement** | `charsRise`(`rotateX -78°→0` / `yPercent 60→0` / `blur 8px→0`)stagger `0.022` |
| **Ease** | `out` |
| **Typography** | `SEE BEYOND THE CONDITION.` — `display-l` / Archivo |
| **Lighting** | 背景が `#090909`→`#2F2F2F` へ(scrub) |
| **受け入れ条件** | 文字が「起き上がる」。単純フェードでない |

## W-02 — 発見（一語ずつ）

| | |
|---|---|
| **目的** | 状態を情報ではなく断章として置く |
| **ScrollTrigger** | pin `+=380%`(mobile `+=280%`)/ `scrub: true` |
| **Movement** | 1語 = タイムライン1単位。`blur 20px→0`(0.34)→ 保持 →`blur 0→16px`(0.28) |
| **Ease** | `linear`(scrub) |
| **Transition** | 語が重ならないよう**単一タイムラインに集約**(個別ScrollTriggerだと境界がズレる) |
| **受け入れ条件** | 1画面に1語だけ。リストに見えない |

## W-03 — 結び

| | |
|---|---|
| **Movement** | 「—— それでも、次がある。」が `blur 14px→0` / `y 26→0` |
| **開始** | 語の数 `-0.1` の位置 |
| **受け入れ条件** | 4語を見せ切ってから出る |

## W-04〜W-08 — 実証（3D回廊 / 10枚）

| | |
|---|---|
| **目的** | 見る → その先を見る → 価値を戻す → 次へ |
| **Camera Position** | `[0, 0, 6]` 固定。**回廊側が手前へ流れる** |
| **Camera Rotation** | メッシュが `lerp 0.1` でカメラを向く |
| **Lens (FOV)** | `58`(全セクション固定) |
| **Movement** | `corridor.depth 150` を進行度0→1で通過 |
| **Ease** | `linear`(scrub) |
| **Lighting** | `#2F2F2F` |
| **Fog** | `FogExp2` density `0.014` |
| **Exposure** | ACESFilmic / `1.0` |
| **DOF** | `focusDistance 0.022` / `focalLength 0.08` / `bokehScale 3.2` |
| **Particle** | 塵 opacity `0.3` / 霧 opacity `0.13→0.07` |
| **Shader** | **ディザリング(Bayer 4×4)**。`pixelSize` を距離連動 |
| **Trigger** | `trigger: #narrative` / `start: "top bottom"` / `end: "bottom top"` / `scrub: true` |
| **実装** | `NarrativeCorridor.tsx` |
| **受け入れ条件** | **`nearCut -14` を超えて寄らない** / **拡大率1.6倍以下** / 画像ギャラリーに見えない |

**W-04**=全体・形・顔 / **W-05**=足回り・内部 / **W-06**=損傷 / **W-07**=運搬・整備・再利用 / **W-08**=未来

> **W-06(損傷)の演出上の注意**: 暗く静かに重く見せる。ただし**「価値がない」に見せない。** 派手な破壊エフェクトは禁止。

## W-09 — 明転

| | |
|---|---|
| **目的** | 暗闇で見つけた価値を光の下へ |
| **ScrollTrigger** | `scrub: true` |
| **Movement** | 背景 `#2F2F2F`→`#F2F2F2` / **3Dキャンバス `autoAlpha 1→0`** |
| **Ease** | `linear` |
| **受け入れ条件** | 反転が**1回だけ**起きる。3Dが完全に消えている |

---

# Buy / Sell / Find（LIGHT区間 / 3D停止）

**共通**: Camera・Fog・DOF・Particle・Shader = **すべて `—`(3D停止中)**。タイポグラフィだけの章。

## B-01 — 見出し

| | |
|---|---|
| **Movement** | 行マスク `yPercent 115→0` stagger `0.11` |
| **Ease** | **`heavy`**(動き出しが重く止まり際に粘る) |
| **Lighting** | 地 `#F2F2F2` / 文字 `#090909` |
| **受け入れ条件** | 「走れなくても、終わりじゃない。」に重量感がある |

## B-02 — 核の一行

| | |
|---|---|
| **目的** | **サイト全体で最も強い約束** |
| **ScrollTrigger** | `start: "top 80%"` / `once: true` |
| **Movement** | 罫線 `scaleX 0→1` → 「動かないなら、取りに行く。」が `yPercent 118→0` |
| **Ease** | `out` / duration `1.5`(他より**遅く**) |
| **受け入れ条件** | 前後に大きな余白。他の情報に埋もれない |

## S-01 — 受け渡し

| | |
|---|---|
| **Movement** | 要素が左→右へ引き継がれる(`x -48→0`)。**モバイルは縦(`y 28→0`)へ置換** |
| **Ease** | `out` stagger `0.18` |
| **Lighting** | `#FFFFFF` — **サイト中で最も明るい** |
| **受け入れ条件** | 台数を競って見えない |

## F-01 — 走査線

| | |
|---|---|
| **目的** | 「探す」の身体化 |
| **Movement** | 走査線が `scaleX 0→1`(origin left)→ `1→0`(origin right)。通過後に要素が `blur→sharp` |
| **Ease** | **`snap`** |
| **Lighting** | `#CFCFCF`(明部で最も沈み、暗転へ橋渡し) |
| **受け入れ条件** | 手順説明に見えない |

---

# CTA（全2Shot）

## C-01 — 暗転

| | |
|---|---|
| **目的** | 静けさへ戻る。**Loadingと呼応し円環が閉じる** |
| **ScrollTrigger** | `scrub: true` |
| **Movement** | 背景 `#CFCFCF`→`#090909` / **3D再開**(軽量構成) |
| **Ease** | `linear` |
| **受け入れ条件** | 反転が滑らか。3Dが戻っている |

## C-02 — 静止

| | |
|---|---|
| **Movement** | 罫線 → 見出し → 断章 → 結び → フォーム の順に `out` で減速 |
| **Ease** | `out` / 最後は**完全静止**(`hold` 0.4s) |
| **Particle** | 最小限 |
| **受け入れ条件** | 査定を強要される感じがしない / キーボードで送信まで完走できる |

---

## Shot間の依存関係（Consistency Rule）

```
L-08 ──Flip──> H-01     ロゴが消えずに移動する
H-06 ──閉じる─> V-00     視界を閉じてから開く
W-09 ──明転──> B-01     3Dを消してから明転
F-01 ──暗転──> C-01     3Dを戻してから暗転
```

**この4つの継ぎ目が「一本の映画」の実体。** 各Shot単体が完璧でも、ここが繋がらなければ失敗とみなす。

## 未確定（Phase 4 で実測して確定）

| ID | 論点 |
|---|---|
| P-002 | ディザリング `pixelSize` と距離の対応カーブ |
| P-003 | Loading各ビートの微調整(実機で体感確認) |
| P-005 | Flip の DOM入れ替えタイミング(Loadingアンマウントとの競合) |
