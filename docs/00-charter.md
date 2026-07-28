# Foresight Creative Direction & Implementation Charter v2.0

> プロジェクトの憲章。**全ドキュメントの上位**に位置する。
> 迷ったらここへ戻る。

## Mission

TOPページを「一本の映画を体験するブランドサイト」として設計・実装する。
LoadingからCTAまでが一続きのブランド体験となり、「車の未来を、見通す。」を自然に体感できること。
**完成基準は Awwwards Site of the Day。**

## 決定事項（変更不可）

1. 鷹を実体として見せず **Silent Gaze(見通す視線)** として抽象化する
2. **ディザリング**をブランド全体の視覚言語として扱う
3. **GSAP Flip** による Opening → Hero の自然な接続
4. **CEO指摘4点**を最優先で修正 — Heroで画像を見せない / Opacity調整 / 寄りすぎない / **Visionは変更しない**
5. Color System は **High Gloss Mono の5色のみ**で構成する

この5項目は Creative Override Rule の**対象外**。改善提案の前提条件になるため常に維持する。

## フェーズ

```
Phase 1  Design System      ✅ 完了
Phase 2  Storyboard         ✅ 完了・CEO承認済（2026-07-28）
Phase 3  Shot List          ← 現在地
         ★ Baseline Capture（Phase 4 開始前に必ず実施）
Phase 4  Motion Prototype
Phase 5  Asset Production Guide  ★ CEOが画像生成
Phase 6  Implementation
Phase 7  Optimization
Phase 8  Final QA
```

各フェーズ終了時に**自己レビュー**(改善点 / 懸念点 / 次フェーズへの影響)を提出する。

## Design Freeze（2026-07-28）

**Charter v2.0 をここで凍結する。今後、原則として新しいルールを追加しない。**

改善案は Creative Proposal Rule / Creative Override Rule に従って提案する。
**ルールを増やすのではなく、Storyboard・Shot List・Bible・Asset Guide の品質向上へ注力する。**

## Baseline Capture（Phase 4 開始前に実施）

**目的**: 「Visionを変更しない」を**定量的に保証する**。人の目で「たぶん同じ」と判断しない。

| | |
|---|---|
| 実施時期 | **Phase 4 開始前**(コードに一切手を付ける前) |
| 保存先 | `docs/baseline/` |
| 取得対象 | PNG Screenshot / Playwright Screenshot / 必要に応じて MP4 |
| 取得条件 | `deviceScaleFactor: 2` / desktop 1440×900・tablet 834×1112・mobile 390×844 |
| 取得範囲 | Vision セクションのスクロール進行度 0 / 0.25 / 0.5 / 0.75 / 1.0 の5点 |

**以後、Visionに影響し得る変更(共通トークン・Atmosphere統合など)を行った際は、必ずBaselineとの差分比較を行う。**
差分が出た場合は「意図した変更か」を判断し、意図しない差分なら**その変更を破棄する**。

> Vision は共通の3D空間・共通トークンを使うため、**他セクションの改修で意図せず変わるリスクが構造的にある**。
> Baseline はそのための保険であり、Phase 6 の Atmosphere 統合時に最も効く。

---

## 運用ルール

### Stop Rule（メタルール）

追加ルールは**ブランド品質・実装品質・保守性を合理的に向上させる場合のみ**採用する。
**レビューのためのレビュー / 監査のための監査 / ドキュメントのためのドキュメントは禁止。**

新ルール採用時は 防げる問題 / 発生頻度 / 実装コスト / 維持コスト を比較し、利益が上回る場合のみ採用する。

### Creative Override Rule

本Charterは**品質を保証するための基準であり、遵守そのものが目的ではない。**

より高いブランド体験が実現できると合理的に判断できる場合、および各ドキュメントと矛盾する判断が必要になった場合は、**独断で進めず停止**し、以下を提示してCEOレビューを受ける。

変更理由 / ブランドへの影響 / メリット / デメリット / 代替案

### Creative Proposal Rule

より良い UI / UX / Motion / 演出を思いついたら**遠慮なく提案する。Charter自体の改善提案も歓迎。**
条件: ブランド思想 / 保守性 / パフォーマンス / アクセシビリティ を損なわないこと。

> Override が「衝突時」の手続きなのに対し、Proposal は**衝突がなくても出す積極的な義務**。

### Implementation Decision Rule

実装に複数の選択肢があった場合、**採用案だけでなく比較した案も** [decision-log.md](./decision-log.md) に記録する。
記録項目: 比較案 / 採用理由 / **却下理由** / 将来見直す可能性 / 性能影響 / 保守性影響

### Consistency Rule

**各セクションを単体で完成させない。** 前後2セクションとの繋がりを常に確認し、
Motion / Camera / Typography / Spacing / Rhythm / Lighting が映画として自然に繋がることを優先する。
**局所最適より全体最適。**

担保: Storyboard・Shot List に「前からの受け」「次への渡し」を必須項目として持たせる / 実装検証は前後2セクションを含めた通しで行う。

### Internal Design Review Rule

各フェーズ内の区切りで**自身を第三者レビューアとして監査する。**
**25% / 75% は Design + Engineering の2監査**、**50% / 100% は5監査すべて。**

| 監査 | 確認項目 |
|---|---|
| Design | Silent Gaze の一貫性 / 演出過多でないか / 映画として流れているか / 情報量とスクロール量の一致 / **前後の繋がり** / 格好良さのためだけの演出が無いか |
| Engineering | コンポーネント構成 / Three.jsの責務分離 / GSAP Timelineの冗長 / ScrollTrigger設計 / State肥大化 / 再利用性 |
| Performance | GPU負荷 / Textureサイズ / Draw Calls / Canvas数 / FPS / Core Web Vitals |
| Accessibility | reduced-motion / キーボード / コントラスト / フォーカス順 / aria |
| Maintainability | 保守性 / 命名 / ディレクトリ / コメント / 技術的負債 |

**評価は `問題なし` / `要改善` / `要CEO判断` の3段階。**
- `要CEO判断` が1件でもあれば**フェーズを完了扱いにせず停止**
- `要改善` のみなら改善後に再監査し、**全項目 `問題なし` で次工程へ**

> **自己監査を「通す」ことが目的化しないよう注意する。** 自分の実装を自分で採点する以上、甘くなるバイアスがかかる。**迷ったら `要改善` に倒す。**
> 既に判明している設計負債(WebGL Canvas 2重起動など)は監査項目に常設する。

---

## 実装ポリシー

- 演出のための演出は禁止
- ブランド体験を最優先
- **スクロール量と情報量を一致させる**
- **静止時間を恐れない**
- 余白を積極的に使う
- **アニメーションよりリズムを優先する**
- HeroからCTAまで一本の映画として設計する

---

## ドキュメント地図

| | |
|---|---|
| [00-charter.md](./00-charter.md) | **本書**。憲章と運用ルール |
| [01-design-system.md](./01-design-system.md) | 10システムの索引 |
| [02-storyboard.md](./02-storyboard.md) | 全8セクションの構成と繋がり |
| [motion-bible.md](./motion-bible.md) | モーション数値の**唯一の出典** |
| [camera-bible.md](./camera-bible.md) | カメラ数値の**唯一の出典** |
| [lighting-bible.md](./lighting-bible.md) | 光・質感数値の**唯一の出典** |
| [art-bible.md](./art-bible.md) | 視覚ルール |
| [hero-bible.md](./hero-bible.md) | Hero専用の全設計 |
| [emotional-timeline.md](./emotional-timeline.md) | 感情曲線 |
| [experience-kpi.md](./experience-kpi.md) | 体験ベースの成功基準 |
| [performance-budget.md](./performance-budget.md) | 性能予算 |
| [decision-log.md](./decision-log.md) | 採用・却下の記録 |
| [shot-list.md](./shot-list.md) | Shot単位の撮影台本 |
| `asset-production-guide.md` | Phase 5 で作成 |
| `baseline/` | Vision の変更禁止を保証する基準画像（Phase 4 前に取得） |

## 素材の前提（CEO指示・2026-07-28）

| 項目 | 決定 |
|---|---|
| **車両素材の解像度** | **4096px級を推奨・最低要件とする。** 現行267pxでは What We Can Do の受け入れ条件「寄っても破綻しない」を満たせない。**Asset Guide のOpenAIプロンプトも4096px前提で作成する** |
| **logo.svg** | Loading / Hero の基盤素材。**未提供のためPlaceholder構成で進める。** 差し替えポイントを実装側で明確にし、SVGが届いた時点で**1ファイル差し替えるだけで反映される**構造にする |

**数値はBibleにのみ存在する。** 他のドキュメントは参照するだけで再掲しない(二重管理は必ずズレるため)。
