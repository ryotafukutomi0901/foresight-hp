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
Phase 1  Design System
Phase 2  Storyboard        ★ CEOレビュー（必ず停止）
Phase 3  Shot List
Phase 4  Motion Prototype
Phase 5  Asset Production Guide  ★ CEOが画像生成
Phase 6  Implementation
Phase 7  Optimization
Phase 8  Final QA
```

各フェーズ終了時に**自己レビュー**(改善点 / 懸念点 / 次フェーズへの影響)を提出する。

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
| `shot-list.md` | Phase 3 で作成 |
| `asset-production-guide.md` | Phase 5 で作成 |

**数値はBibleにのみ存在する。** 他のドキュメントは参照するだけで再掲しない(二重管理は必ずズレるため)。
