# Foresight Design System v1.0

> **このファイルは索引。** 何を決めたか + なぜそう決めたか を述べる。
> **数値は各Bibleにのみ存在する。** ここでは再掲しない(二重管理は必ずズレるため)。

| Bible | 担当 |
|---|---|
| [Motion Bible](./motion-bible.md) | Ease / Duration / Delay / 変形量 / Parallax |
| [Camera Bible](./camera-bible.md) | FOV / Near / Far / Speed / Distance / DOF / Lerp |
| [Lighting Bible](./lighting-bible.md) | Fog / Bloom / Noise / Vignette / Exposure |
| [Art Bible](./art-bible.md) | Contrast / Dithering / 質感 / Spacing / Rhythm / Depth / Visual Weight |
| [Hero Bible](./hero-bible.md) | Hero専用の全設計 |

---

## 1. Brand System

**Core Message**: 車の未来を、見通す。 / *Every car has a next.*

**思想**: 車の現在の状態は、その車の価値ではない。状態の先にある可能性を見て、買取り、運び、整え、次の人へつなぐ。

**語彙**
- 使う: 見通す / 可能性 / 次 / 状態 / つなぐ / 見極める
- **使わない**: 高価買取 / 無料査定 / 即日対応 / 業界最安 — 中古車テンプレートの語彙。使った瞬間にブランドが消える

**禁止表現**
- 実績数値の創作(買取台数・成約率・お客様の声)。**存在しない情報を作らない**
- 煽り・断定的な優位性の主張
- 「次世代の」「革新的な」等の中身のない形容

**トーン**: 静か・断定的・短い。説明しすぎない。

## 2. Art Direction

→ [Art Bible](./art-bible.md)

**一行で言えば**: 見る主体はユーザーではなく Foresight の視線であり、ユーザーはそれを借りる。
**やらないこと**: 鷹を実体で見せる / 落ち影 / リアルタイム反射 / 中間調の本文 / 層を跨いだ要素

## 3. Color System

**High Gloss Mono の5色のみ。中間色を作らない。**

| HEX | DARK | LIGHT |
|---|---|---|
| `#090909` | 地 | 文字(主要) |
| `#2F2F2F` | 面・罫線 | 文字(補助) |
| `#CFCFCF` | 文字(補助) | 罫線・沈んだ面 |
| `#F2F2F2` | 文字(主要) | 地 |
| `#FFFFFF` | 強調 | 持ち上がった面 |

**なぜ5色で足りるのか**: 画面を明暗2モードに分け、**同じ色が両モードで別の役割を担う**構造にしたため。中間色を足す必要がない。

**背景の進行**
```
Loading / Hero / Vision   #090909   暗闇
What We Can Do            #2F2F2F   闇が一段持ち上がる
──────────── 反転 ────────────
Buy    #F2F2F2  →  Sell  #FFFFFF  →  Find  #CFCFCF
CTA                       #090909   静けさへ戻る
```

**なぜ反転させるか**: Buy/Sell/Find は「暗闇で見つけた価値を光の下へ戻す」章。**明度と物語を一致させる。**

**技術的帰結**: 3Dは加算合成のため明部では白い線画が消える。よって **LIGHT区間は3Dをフェードアウトさせ、タイポグラフィだけの章にする。** 制約が結果的に「暗闇=空間と発見 / 光=情報と行動」という役割分担を生み、Buy/Sell/Find の可読性も上がる。

**色温度を振らない**: 完全な中立グレー(R=G=B)。*Sharp / technology-forward* に対し暖色・寒色を混ぜると方向が逆になる。

コントラストは → [Art Bible](./art-bible.md#contrast)

## 4. Typography System

| 用途 | フォント | なぜ |
|---|---|---|
| 和文 | **Shippori Mincho** (400/600) | 明朝は縦画と横画に抑揚があり、大きな余白と組んだとき「静けさ」が出る。ゴシックは均一で力強いが、この画づくりでは硬く平板に見えた |
| 欧文 | **Archivo** (500/600) | 和文の情緒に対し、欧文は精度で受ける。対比が緊張を生む |

**スケール**(約1.25の等比)

| トークン | 値 |
|---|---|
| `display-xl` | `clamp(2.125rem, 4.4vw, 3.5rem)` |
| `display-l` | `clamp(1.75rem, 3.2vw, 2.625rem)` |
| `display-m` | `clamp(1.375rem, 2.2vw, 1.875rem)` |
| `display-s` | `clamp(1.0625rem, 1.5vw, 1.3125rem)` |
| `body-l` | `clamp(0.9375rem, 1vw, 1.0625rem)` |
| `label` | `0.625rem` |

**最大3.5remに抑えている理由**: 以前は7remまで振っていたが、**大きさで階層を作ろうとして画面が雑然とした。** 階層は大きさではなく**字間と余白**で作る。

**字間・行間**

| | 値 |
|---|---|
| 本文 letter-spacing | `0.06em` |
| 見出し letter-spacing | `0.1em` |
| 本文 line-height | `2` |
| 見出し line-height | `1.55` |
| ラベル letter-spacing | `0.42em` |

**ウェイトは400と600のみ**。和文フォントはunicode-rangeで約120分割されるため、1ウェイト増やすごとに全サブセットが増える。`preload: false` と併せて転送量を守る。

## 5. Motion Design System

→ [Motion Bible](./motion-bible.md)

**原則**: すべてを同じeaseで動かさない / 名前は役割で付ける / **奥から手前へ**(下からせり上がらせない)

## 6. Camera System

→ [Camera Bible](./camera-bible.md)

**原則**: カメラは常に奥へ入っていく(引かない) / カメラ自体を書き換えずシーン側のgroupを動かす / **FOVは全セクションで固定**

## 7. Lighting System

→ [Lighting Bible](./lighting-bible.md)

**原則**: 光源オブジェクトを置かない(全て自発光+加算合成) / 黒を潰さない / **白飛びさせない**

## 8. Material & Texture System

→ [Art Bible](./art-bible.md#ditheringブランドの視覚言語)

**ディザリング(Bayer 4×4)がブランドの視覚言語。** `pixelSize` をカメラ距離に連動させ、寄るほど粒が粗くなる。
これにより**素材の解像度不足が「意図した粒状感」に変換される。**

## 9. Scroll Experience System

**スクロール = カメラの前進距離。** この対応を全セクションで守る。

| 規則 | 内容 |
|---|---|
| scrub | スクロール連動は必ず `ease: none`。easeを掛けるとスクロールと画面がズレて酔う |
| pin | 1セクションにつき最大1つ。入れ子にしない |
| 情報量 | **スクロール量と情報量を一致させる。** 動きのためだけに長いpinを作らない |
| 受け渡し | GSAP → R3F は `lib/viewProgress.ts` の**refのみ**。毎フレームReact stateを更新しない |
| 慣性 | ScrollSmoother(GSAP純正)。ScrollTriggerと同一tickerで動くため同期のグルーコードが要らない |

**セクション間の受け渡し**: 各セクションは「前からの受け」と「次への渡し」を必ず持つ。単体で閉じない([Consistency Rule](../../.claude/plans/))。

## 10. Component Design System

| コンポーネント | 状態設計 |
|---|---|
| CTA Button | default / hover(背景反転) / focus-visible(2px outline + 3px offset) / active / disabled(opacity 0.5) |
| Label | default のみ(非対話) |
| 罫線 | default / 出現時(scaleX 0→1, origin left) |
| Form Field | default / focus(border → `#F2F2F2`) / error(下部にテキスト + `aria-invalid`) / disabled |

**共通規則**
- **radius: 0**(全要素)。角の鋭さをブランド規律とする
- **shadow: 使わない**。奥行きは重なり・ぼかし・不透明度で作る
- フォーカスリングを消さない。**見た目のためにアクセシビリティを犠牲にしない**
- 色だけで状態を伝えない(モノクロなので原理的に不可能。必ずテキストか形状を併用)
