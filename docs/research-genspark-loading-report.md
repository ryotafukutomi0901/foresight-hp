# [参考資料] Foresight ローディング体験 デザインリサーチレポート（Genspark）

> **本書の位置付け**: これは外部ツール(Genspark)が作成した**リサーチ資料**であり、[00-charter.md](./00-charter.md) 配下の意思決定文書(Bible群・[decision-log.md](./decision-log.md))とは**別枠**として保存する。
>
> - 数値・仕様の**唯一の出典は各Bible**（[motion-bible.md](./motion-bible.md) 等）。本書の数値は再掲・参照のみで上書きしない。
> - 本書の提案と決定事項が食い違う場合、**決定事項が優先**する。特に [00-charter.md](./00-charter.md) の「決定事項（変更不可）」5項目は本書の内容によっても変更しない。
> - 本書の提案を新たに採用/却下する場合は、[decision-log.md](./decision-log.md) に記録すること（Implementation Decision Rule）。
> - 既にこのレポートを踏まえて判断済みの項目がある: [D-001](./decision-log.md#d-001-鷹を実体として見せないsilent-gaze)（Silent Gaze、本書のD-001相当を採用）、[D-005](./decision-log.md#d-005-theaterjs-を採用しない)（Theater.jsは却下）、[D-004](./decision-log.md#d-004-lenis-ではなく-scrollsmoother)（Lenisは却下、ScrollSmootherを採用）。
>
> 取得日: 2026-07-31 / 出典: Genspark AI Agent（URLはユーザー提供、本文はチャットで貼付されたテキストをそのまま保存）

---

「車の未来を、見通す。」を、世界水準のデジタル体験に翻訳するための実践的リサーチ

調査対象時期: 2024年〜2026年のWeb / モーション表現 調査ソース数: 30以上のケーススタディ、Awwwards / Codrops / Locomotive / Immersive Garden / Utsubo等の一次資料 対象読者: Foresightのデザイナー・開発者・ブランドディレクター 想定読了時間: 約40分

## 序章:このレポートの読み方

ユーザーから提示された 「BLACK → LOGO → 鷹の目 → 鷹 → 車 → HERO」 のアイデアは、方向性としては正しい部分がある一方で、そのまま実装すると 「AI生成トレーラー動画」的な安っぽさ に落ちる危険性を強く孕んでいます。

このレポートでは、単に「かっこいいサイト10選」を並べる代わりに、以下のプロセスで議論を進めます。

世界水準のローディング/ヒーロー体験を、異なる10のアプローチで解剖
各サイトから Foresightに移植可能な要素と、移植すべきでない要素を分離
Foresight案を 批判的に再評価 し、鷹モチーフの是非を再考
最終的なローディング設計案 を、実装可能性まで含めて具体化
Next.js + R3F + GSAP + Lenis という現在の技術環境で 本当に実装できる形 に落とし込む

## 第1部|参考サイト10選 — 異なる10のアプローチで解剖する

### 【Site 01】Scout Motors ★★★★★

**基本情報**

- サイト名:Scout Motors
- URL:https://www.scoutmotors.com/
- 運営:Scout Motors Inc.(Volkswagen Group傘下、米国EV)
- 業種:自動車ブランドサイト(EV / SUV / トラック)
- 制作:Locomotive(モントリオール) locomotive.ca
- 受賞:Awwwards SOTD、E-commerce of the Year 2025、SOTD Score 7.60/10

**なぜForesightの参考になるのか**

Scout Motorsは 「歴史ある自動車ブランドの再解釈」 を、シネマティックかつ現代的なWeb体験に落とし込んだ稀有な例です。Foresightのブランド課題である「中古車=安っぽい」というカテゴリー認識を 「Every car has a next」 という物語に転換する上で、Scoutが1961〜1980年の伝説を電気時代に再文脈化した手法は完全な参照点になります。Locomotiveは「adventure, freedom, connection の精神を、没入的にインタラクティブに、そして人を招き入れる形で伝えるサイト」と定義しています。

**最も参考になるモーション**

- フルスクリーンのシネマティック映像が、UIチップと同じレイヤーで機能している(動画=ただの背景ではなく、UIの構成要素)
- 車両のディテールが徐々にレイヤー的に露出するスクロール構成
- モノクロ〜アースカラーへ移行するカラースクリプト
- ヘッダーのタイポはEditorialな佇まいで、自動車雑誌のカバーに近い

**技術スタック(確認+推測)**

- 確認:Locomotive制作(=GSAP、Lenis(Locomotive Scrollの後継)、Next.js/Nuxtが常用スタック)、Three.js活用可能性
- 推測:高品質PBR動画のプリレンダー+WebGLのシェーダーオーバーレイの併用
- Animations / Transitions評価 = 7.80/10(Awwwards Dev Award)

**Foresightへの応用方法**

- 「HERO=1本の完成された映像」ではなく「HERO=映像+UI+テキストが同時に呼吸する構成」 を採用する
- Foresightのロゴ露出後、車両の全体像を最初に見せず、"ドアハンドル" "ヘッドライトの反射" "ホイールリム"などのマクロ・ディテールを積み重ねる導入
- Scout流の "Born from a legend, retooled for a new era" の翻案として、Foresightでは "Every car has a next chapter." といったコピーを、ローディング終端でタイポで組む
- HEROへの接続は、ローディングの最終シーンをそのまま静止画のHEROへseamless dissolve(継ぎ目のない溶暗)

**優先度・実装難易度**

- 優先度:★★★★★(最優先で参考にすべき)
- 実装難易度:中〜高。動画+UIレイヤリングはNext.js + Framer Motion/GSAPで十分実装可能。Foresightの環境で現実的。

### 【Site 02】GQ × Audemars Piguet: The Extraordinary Lab ★★★★★

**基本情報**

- サイト名:GQ × Audemars Piguet — The Extraordinary Lab
- 運営:Condé Nast(GQ) × Audemars Piguet
- 業種:ラグジュアリー時計のブランドキャンペーン
- 制作:Immersive Garden(パリ)
- 受賞:Awwwards Site of the Month

**なぜForesightの参考になるのか**

このサイトは、単一の連続したシネマティック・タイムラインを、まるでメディアプレイヤーのように前後にスクラブできる構造で設計されています。「バラバラのシーンやチャプターを分ける代わりに、体験全体を1本の映像の中を移動する感覚に統一した」と制作側は述べています。Foresightが目指す「1本のシネマティックなブランド世界観」に最も近い構造です。

**最も参考になるモーション**

- 反射素材、大気照明、工業的な精密感、大型プロジェクション、シネマティックな遷移を組み合わせ、「製品を"見せる"のではなく、製品の周囲に生きた宇宙を作る」設計
- スクロール/ドラッグでタイムラインを前後に操作でき、そのスクロール速度に音声のフェード・ポーズ・連続性が動的に追従する
- ビルボードリフレクション、パララックスマッピング、平面反射を、リアルタイムのWebGLレンダリングと組み合わせている

**技術スタック(確認)**

Awwwardsで明記された公式スタック:

- Front End:HTML / CSS / JavaScript
- Rendering & Interaction:WebGL / Three.js / Theater.js / GSAP
- 3D Pipeline:Blender / PBRワークフロー / HDRライティング
- Rendering Techniques:カスタムシェーダー / billboard reflections / parallax mapping / planar reflections
- Motion Systems:スクロール同期タイムライン / ドラッグベースナビゲーション
- AI:AIによるプロジェクション生成・合成実験

**Foresightへの応用方法**

- Foresightのローディングを"1本の映画の1シーン"として設計し、体験全体と地続きにする(=ローディングだけ切り離さない)
- Theater.jsは正にこの用途(=シーンとカメラを時間軸で編集する)に設計された強力なツール。Foresightのローディングタイムライン管理に採用推奨
- 音声レイヤー:ローディング中に低音のアンビエント、車のドアが遠くで閉まる音、風切り音などを スクロール速度と同期させフェード させる
- HEROへの接続:ローディング終端でカメラが「車両の運転席側面」を通過し、そのままHEROの静止フレームに着地する

**優先度・実装難易度**

- 優先度:★★★★★
- 実装難易度:高〜非常に高。フルWebGLタイムラインは工数大。ただしTheater.js + GSAPの組み合わせは学習コストが下がっており、Claude Codeとの相性も比較的良い。

### 【Site 03】Igloo Inc(by Abeto / Bureaux) ★★★★☆

**基本情報**

- サイト名:Igloo Inc(igloo.inc)
- 運営:Igloo Inc(Pudgy Penguins・OverpassIPの親会社)
- 業種:Web3/オンチェーンコミュニティ企業
- 制作:Abeto(テクニカルアート)× Bureaux(クリエイティブディレクション)
- 受賞:Awwwards SOTD、FWA of the Day

**なぜForesightの参考になるのか**

Igloo Incは、「外的な自然シーンで始めると、企業のfuture-forwardなトーンに合わない」 という懸念を、リアルタイムレンダリングのイントロアニメーションでtechnical vibeを付加することで解決しました。これはForesightが直面する 「中古車=汚い/古い」というカテゴリバイアス を、シェーダーとテクノロジー感で"知的な未来"に転換する 上で決定的な参照点です。イントロは実写ではなく in-engineでコード+カスタムシェーダー により作られ、そこから体験全体にseamlessに繋がっています。

**最も参考になるモーション**

- 手続き的に成長する氷結晶(procedural crystal growth):立方体や円柱の"種"を選び、その内部にディテールを成長させるカスタムアルゴリズム
- UIまでWebGLで実装:テキストのグリッチ(シンプルなシェーダー)と、テキストスクランブル(SDFテクスチャのオフセット変更で実現)
- リアルタイムなイントロアニメが、そのままインタラクティブ体験にseamlessに接続

**技術スタック(確認)**

- 3D & Textures:Houdini + Blender
- Programming:Three.js / three-mesh-bvh / Svelte / GSAP / Vite / vanilla JS
- Sound:DaVinci Resolve

**Foresightへの応用方法**

- 鷹を"リアルに描く"のではなく、"視線" "光" "気配"として抽象化する方針を採用するなら、Iglooのシェーダー駆動UIは強力なリファレンス
- Foresightロゴを起点に、手続き的に線が広がり → 車のシルエットの輪郭が浮かび上がる シェーダー表現(=氷結晶成長のロジックを"光の視線"に転用)
- HEROへの接続:シェーダーの粒度が徐々にfineになり、そのままHEROの背景ノイズ・粒子として残留する

**優先度・実装難易度**

- 優先度:★★★★☆
- 実装難易度:非常に高。カスタムシェーダーとSDFテキストは、Claude Codeでもかなり難しいレベル。ただし発想と方向性は極めて有用で、実装は簡易版で十分効果的。

### 【Site 04】Lusion(lusion.co) ★★★★☆

**基本情報**

- サイト名:Lusion Studio
- 運営:Lusion(Bristol、英国)
- 業種:クリエイティブスタジオ(WebGL/インタラクティブ)
- 受賞:FWA / Awwwards / CSSDAの3冠でSite of the Year

**なぜForesightの参考になるのか**

Lusionは「real-time visuals」を前提に、Houdiniで事前計算した物理シミュレーションをArrayBufferに焼き込み、リアルタイムでユーザーのインタラクションによってブレンドするという、映画品質とWebのパフォーマンスを両立させる手法を体系化しています。Foresightで「本物の映画のような車の登場」を実現しつつ、Web上で60fpsで動かすには、この考え方が不可欠です。

**最も参考になるモーション**

- Vertex Animation Technique:66フレームのアニメーションを、キーフレーム11枚+実時間補間で表現。16bit整数化+PNG LZW圧縮でファイルサイズを削減
- Houdini FXでcloth simulationを焼き、ArrayBufferに格納 → リアルタイムでインタラクションによって値をブレンド
- Redshift3Dで動画をレンダリングし、リアルタイムアニメと組み合わせる hybridアプローチ

**技術スタック(確認)**

Tools:Houdini FX / Redshift3D / three.js / TweenLite(GSAP) / budo / webpack / less

**Foresightへの応用方法**

- Foresightの「鷹の羽ばたき」や「車のリフレクション」を、Houdiniで焼いた頂点アニメをWebGLで再生する方式で、映画品質+Webパフォーマンスを両立
- HEROの車両を全ポリゴンモデルで動かす代わりに、Vertex Animation Texture(VAT)を使う発想は、モバイル対応でも極めて有効

**優先度・実装難易度**

- 優先度:★★★★☆
- 実装難易度:非常に高(Houdiniパイプラインが必要)。ただし**発想として"焼き込み+リアルタイム補間"**は、Blender+GSAP+Three.jsでも簡易版として応用可能。

### 【Site 05】Stas Bondar '25(stabondar.com) ★★★★★

**基本情報**

- サイト名:Stas Bondar '25 Portfolio
- 運営:Stas Bondar(個人ポートフォリオ)
- 業種:クリエイティブディベロッパーのポートフォリオ
- 受賞:Awwwards Loading + Hero Animation選出、Codropsで技術解剖記事

**なぜForesightの参考になるのか**

Stas Bondar '25は、現代Webローディング + Hero設計の教科書と呼べる作品です。特に 「ロード完了 → Hero露出 → ユーザー操作」の遷移を、Barba.js + GSAP Flip + Three.jsで完全に接続しており、Foresightが求める "seamlessなローディング→HERO移行" のブループリントとして完璧です。

**最も参考になるモーション**

- ディザリング(dithering)効果:Bayer 8×8マトリクスとフラグメントシェーダーで、動画・画像を モノクローム階調のノイズ質感 に変換。この質感はForesightの「Editorial × Cinematic × Monochrome」に完璧に一致
- GSAP FlipでプロジェクトサムネイルをHero画像へ duration 1.3s / power3.inOut で連続変形
- スクロール速度をclampし、フラグメントシェーダーに渡してテクスチャを歪ませるmotion
- gsap.quickTo() をマウス追従などパフォーマンス重視領域に使用
- Matter.jsでテキスト文字にphysicsを付与し、ScrollTriggerで発火

**技術スタック(確認)**

Astro Build + GSAP(SplitText, ScrollTrigger, Flip, MorphSVG, Draggable) + Three.js + Barba.js + Matter.js

**Foresightへの応用方法**

- ディザリング表現をForesight全体のビジュアル言語として採用:モノクロ写真・車両映像に Bayer 8×8のシェーダーオーバーレイ を薄く重ね、印刷物・エディトリアルの質感を獲得
- ローディングの黒地の中で、Foresightロゴがディザリングパーティクルから収束し、そのままHeroへGSAP FlipでMorph
- Easing規約:power3.inOut(遷移)、power2.out(ホバー)、duration 1〜1.3sを全体規約として採用

**優先度・実装難易度**

- 優先度:★★★★★
- 実装難易度:中。Foresightの想定スタック(Next.js/GSAP/R3F)と極めて相性が良く、Claude Codeで再現しやすい。このサイトは真似する価値が最も高い。

### 【Site 06】Locomotive(locomotive.ca) ★★★★☆

**基本情報**

- サイト名:Locomotive Studio
- 運営:Locomotive(モントリオール、Awwwards Agency of the Year受賞歴)
- 業種:デジタルエージェンシー
- 受賞:Awwwards Site of the Month(自作サイトで複数回)

**なぜForesightの参考になるのか**

Locomotiveは自社サイトを "playground" と定義し、smooth-scroll + lerpベースの動き で、モーションの心地よさをブランドの本質そのものにしています。Lenis(旧Locomotive Scroll)の生みの親として、Foresightが採用予定のLenisの本家的レファレンス。

**最も参考になるモーション**

- Fluid Flag Effect:画像+グラデーションのブライトネスに応じて頂点座標を歪ませるシェーダー
- lerpによる全体の滑らかさ:マウス追従、スクロールインジケータ、カメラなど、あらゆる要素に加重平均補間
- GSAP ThrowPropsでドラッグ/スワイプの慣性を心地よく
- Native Canvasによる弾性線をヘッダーやplay grid背景に使用

**技術スタック(確認)**

GSAPスイート(TweenMax, TimelineMax) / Three.js / Native Canvas / Hammer.js / Swiper / Vimeo Player API / PHP + Charcoal CMS

**Foresightへの応用方法**

- Lenis + GSAP ScrollTriggerの組み合わせを、"体験を滑らかに繋げるOS"として全域に適用
- Foresightのローディングでも、**「マウスの位置に応じて視線(=カメラ)がわずかにパララックス」**する演出を、lerp(current, target, 0.08)で常時稼働
- HEROの背景に、Locomotive流のFluid Flag Effectを モノクロで薄く重ねる ことで、Editorialな静けさに動的な呼吸を与える

**優先度・実装難易度**

- 優先度:★★★★☆
- 実装難易度:中。Lenis + GSAPはForesightの想定スタックに完全一致。Foresightにとって最も基礎的なリファレンス。

### 【Site 07】Immersive Garden(immersive-g.com) ★★★★☆

**基本情報**

- サイト名:Immersive Garden Studio
- 運営:Immersive Garden(パリ)
- 業種:デジタルエクスペリエンススタジオ
- 受賞:Awwwards SOTD、Case Study(2025年3月4日)

**なぜForesightの参考になるのか**

「minimalism vs complexity のバランス」「機能性を損なわないミニマル美学」を追求し、"引き算に時間を費やした" と明言している点が、Foresightのミニマル・ソフィスティケイティッド路線と完全に一致します。バス・レリーフ(浅浮彫)3Dデザインというアプローチは、"3Dだが派手ではない、彫刻のような質感"を実現する上で重要。

**最も参考になるモーション**

- バス・レリーフ3D:立体だが、フルレンダリングされたモデルほど"押しつけがましくない"、絵画的・彫刻的な奥行き感
- KTX GPU圧縮によるアセット最適化 + channel packingによるテクスチャ効率化
- gltf-transform + Blender scriptsでエクスポート自動化のパイプライン

**技術スタック(確認)**

Three.js / Blender / Houdini / ZBrush / Vue.js / Nuxt / GSAP / Lenis / Strapi / Node.js / Vercel

**Foresightへの応用方法**

- 車両をフル3Dで見せる代わりに、"バス・レリーフ的な浅い立体感" に留めることで、AI生成トレーラーっぽさを排除
- Foresightロゴを Roman numeralsのような浅浮彫として最初に露出 → 車両の輪郭が同じレリーフスタイルで浮上 → HEROではリアルな写真/映像へ、というグレイン差分による段階的リアリティ
- KTX圧縮 + Vercel配信は Foresightにそのまま採用可能な最適化パターン

**優先度・実装難易度**

- 優先度:★★★★☆
- 実装難易度:中〜高。バス・レリーフ質感はマテリアルシェーダー(Depth+RimLight+Fresnel)で近似可能。Foresight想定スタックで十分実装可能。

### 【Site 08】Longbow Motors(longbowmotors.com) ★★★★☆

**基本情報**

- サイト名:Longbow Motors
- 運営:Longbow Motors(英国、featherweight EV sports cars)
- 業種:高級電気スポーツカーブランド
- 制作:Digital Butlers + Denis Poluhovich(Webflow製)
- 受賞:Awwwards SOTD(2025年)

**なぜForesightの参考になるのか**

Longbowは "heritage × high-tech" を、Webflowという限られた技術基盤で 実現した好例です。「clean UI、smooth animations、bold typography」で "軽さの速度" を反映するアート・ディレクションは、Foresightが目指す Cinematic × Editorial × Minimal の同一路線です。特に ロードスターやスピードスターといった英国自動車の遺産を、モダンに翻訳 する構成は、Foresightの「中古車の可能性を再発見する」思想と符合します。

**最も参考になるモーション**

- ヘッドライン級のBoldタイポが、車両ビジュアルとの並列でHEROの主役になる構成
- スクロール速度に応じたわずかな車両パララックス
- プライスと予約UIの静けさ:騒がしいCTAを排除し、静かな高級感

**技術スタック(推測)**

- Webflow ベース(=GSAP相当のInteractions 2.0、および JSカスタム)
- Awwwardsで Animations/Transitions 7.20/10

**Foresightへの応用方法**

- Foresightの Web環境ではなく"タイポグラフィとレイアウトのアート・ディレクション" としてのリファレンスに位置付ける
- 「BLACK + WHITE + WARM ACCENT(温かみのあるアクセント色1色のみ)」の2色構成
- HEROに Serif × Sansのミックス(Editor Serif見出し + Neue Haas Grotesk本文相当)を採用し、"モダン雑誌の表紙"の空気感を目指す

**優先度・実装難易度**

- 優先度:★★★★☆(タイポ/AD参考)
- 実装難易度:低〜中。Foresightスタックで完全に再現可能。

### 【Site 09】Ponpon Mania(ponpon-mania.com) ★★★☆☆

**基本情報**

- サイト名:Ponpon Mania — An Interactive Comic
- 運営:Justine Soulié × Patrick Heng(仏)
- 業種:インタラクティブ・コミック(実験プロジェクト)
- 受賞:Awwwards SOTD、Codrops Case Study

**なぜForesightの参考になるのか**

Ponpon Maniaは、Foresightと真逆のトーン(ポップ・カラフル)ですが、「GSAPタイムラインで各要素を順に発火し、smoothでcohesiveなイントロを作る」 という手法そのものが極めて参考になります。微細なマウス反応(マスクが変形、風船が衝突、雲が離れる) で世界を"tangible"にする発想は、Foresightに移植する価値があります。

**最も参考になるモーション**

- GSAP timelineによる各要素の順次露出(sequenceで cohesive reveal)
- マウスに応じたマイクロインタラクション:キャラクターの微妙な変形、衝突、離散
- OGL(軽量WebGLフレームワーク) で描画

**技術スタック(確認)**

OGL(WebGL framework) / Nuxt.js / GSAP / Matter.js / TexturePacker / Tweakpane

**Foresightへの応用方法**

- Foresight版のマイクロインタラクション:HEROの車両写真が、マウスに応じて 0.5°〜1°の微細な回転、ヘッドライトが極めてわずかに輝度変化、背景ノイズがマウス方向に0.5%遅延して追随
- ローディング中も、マウスがある位置に応じて視線(カメラ)が0.05〜0.1°の範囲でパララックスすることで、"停止しているが生きている"感を出す
- ただし、Ponponのカラフルさは絶対に真似しない

**優先度・実装難易度**

- 優先度:★★★☆☆(発想と技術規範として)
- 実装難易度:低〜中。Foresightスタックで容易に実装可能。

### 【Site 10】Utsubo(utsubo.com) ★★★☆☆

**基本情報**

- サイト名:Utsubo
- 運営:Utsubo(technology-first creative studio)
- 業種:クリエイティブ/テクノロジースタジオ
- 受賞:Awwwards SOTD、SOTD Score 7.58 / 10、Creativity 7.96、Animations 8.60

**なぜForesightの参考になるのか**

Utsuboは、"technology-first" を宣言しつつも、決して騒がしくなく、Editorialで知的な静けさを保っています。AnimationsのDev Award 8.60という極めて高スコアは、"派手な動きではなく、緻密な動きで勝つ"サイトの好例です。

**最も参考になるモーション**

- タイポグラフィが動く際の 微細なマスクとブラー
- ホバー時の軽やかなdisplacement
- BLACK基調のUIに、動きだけで階層を作る規範

**技術スタック(推測)**

- Three.js + GSAP、モダンなJSフレームワーク(Nuxt/Next系)
- Utsuboの2026年ブログによると、Three.jsパイプライン最適化とWebGL SEOに強い

**Foresightへの応用方法**

- "静かなモーション設計"の教典として位置付ける
- Foresightのローディングでも、大きな動き1つに、微細な動き10個を重ねる(=マイクロと マクロの二重構成)
- ホバー = ブラー0.5px + 0.98 scaleなどの繊細さ

**優先度・実装難易度**

- 優先度:★★★☆☆(哲学として参考)
- 実装難易度:低。CSSとGSAPで完全に再現可能。

## 第2部|10サイト総合ランキング

| 順位 | サイト | ブランド相性 | ローディング完成度 | モーション | 技術参考価値 | 実装可能性 | 高級感 | 独自性 | 総合 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Stas Bondar '25 | ◎ | ◎ | ◎ | ◎ | ◎ | ○ | ◎ | ★★★★★ |
| 2 | Scout Motors | ◎ | ◎ | ◎ | ○ | ○ | ◎ | ◎ | ★★★★★ |
| 3 | GQ × Audemars Piguet | ◎ | ◎ | ◎ | ◎ | △ | ◎ | ◎ | ★★★★★ |
| 4 | Igloo Inc | ○ | ◎ | ◎ | ◎ | △ | ◎ | ◎ | ★★★★☆ |
| 5 | Immersive Garden | ◎ | ○ | ◎ | ◎ | ○ | ◎ | ○ | ★★★★☆ |
| 6 | Locomotive | ○ | ○ | ◎ | ◎ | ◎ | ○ | ○ | ★★★★☆ |
| 7 | Lusion | ○ | ○ | ◎ | ◎ | △ | ◎ | ◎ | ★★★★☆ |
| 8 | Longbow Motors | ◎ | ○ | ○ | △ | ◎ | ◎ | ○ | ★★★★☆ |
| 9 | Utsubo | ○ | ○ | ○ | ○ | ◎ | ○ | ○ | ★★★☆☆ |
| 10 | Ponpon Mania | △ | ○ | ◎ | ○ | ◎ | △ | ◎ | ★★★☆☆ |

◎=特に優れる / ○=優れる / △=部分的

## 第3部|Foresightに最も参考になるBEST 3

### 🥇 BEST 1|Stas Bondar '25

**なぜ選んだか**

Foresightの技術スタック(Next.js + GSAP + Three.js + Lenis)と最も相性が良く、ローディングからHeroへの接続を単一サイトで完結 している唯一の例。ディザリングというシェーダー技法 が、Foresightの「モノクローム × Editorial × Cinematic × Sophisticated」の質感を、動画にも画像にも一貫して付与できる。

**何を真似るべきか**

- ディザリング(Bayer 8x8マトリクスのフラグメントシェーダー) をブランド全体の視覚言語として採用
- GSAP FlipによるMorph遷移でローディング終端の要素をHEROへ変形接続
- Easing規約:power3.inOut(遷移)/ power2.out(ホバー)/ duration 1〜1.3s
- gsap.quickTo() をマウス追従・パララックスに使用

**何を真似してはいけないか**

- ポートフォリオゆえの個性的すぎる遊び心(Foresightは信頼性が第一)
- Matter.jsによる物理落下テキスト(Foresightにはノイズになる)

**Foresightへの応用**

ローディング初期の黒地の中に、ディザリング粒子が渦を巻き、それが徐々にForesightロゴの形状へ収束。その後、同じディザリング粒子が拡散し、車両のシルエットの輪郭を先に描く(=まだ実体は見えない)。実体の車両写真は最後に GSAP FlipでHERO位置へMorph。全体1.3s × 6セクション ≒ 合計7.8秒程度。

### 🥈 BEST 2|Scout Motors

**なぜ選んだか**

自動車ブランドが"歴史ある文脈"を"未来"に翻訳した、直近最高峰の事例。E-commerce of the Year 2025を獲得しており、単なる美しさではなく ビジネス成果と両立するデザイン の証明。Foresightのカテゴリ課題(=中古車という文脈)を、"物語"で乗り越えるためのAD参照点。

**何を真似るべきか**

- フルスクリーンのシネマティック映像 + UIチップの共存
- 車両ディテールから全体へ、というマクロ→マクロの露出
- モノクロ〜アースカラーの限定パレット
- エディトリアルなタイポ扱い(見出しは大きく静かに)

**何を真似してはいけないか**

- Scoutの持つ "アメリカン・アドベンチャー"の色気(Foresightには合わない)
- 背景動画の常時再生(パフォーマンスへの負荷が高い)

**Foresightへの応用**

Foresightのローディング最終シーンで 車両の運転席サイドを、シネマティックなカメラでパンする映像を1.5s流し、それがそのままHEROの静止画にfreeze-frameで着地する。動画は モノクロ + ディザリング で加工し、AI生成っぽさを完全に排除。

### 🥉 BEST 3|GQ × Audemars Piguet

**なぜ選んだか**

"ローディング=体験の一部" という思想を、最も先鋭的に体現した例。Theater.js + GSAPの組み合わせは、Foresightのタイムライン管理の直接の設計指針になる。「連続したシネマティックタイムライン」 という発想は、Foresightで「ローディング → HERO → スクロール開始 → 車両詳細」を1本の映像に統合するための決定的な参照。

**何を真似るべきか**

- Theater.jsによるタイムラインベースのシーン設計
- 反射材質 + 大気照明 + カスタムシェーダー + planar reflection
- スクロール速度と音声フェードの同期(=Foresightに音声を採用する場合の設計)
- 1本の映画のように、"チャプター分け"せずシームレスに繋げる

**何を真似してはいけないか**

- AI生成のプロジェクション(Foresightのブランド原則で禁止)
- 過度な光沢と工業感(Audemars特有の"時計工房"の質感で、車には合わない)

**Foresightへの応用**

Foresightのローディングと HEROを 1つのTheater.js Timelineで管理し、Sheet を「00:00〜04:00(BLACK)」「04:00〜18:00(LOGO)」「18:00〜35:00(視線)」「35:00〜55:00(車両輪郭)」「55:00〜78:00(車両実体)」「78:00〜85:00(HERO)」と分割。ユーザーは体験を"再生"する感覚を、無意識に持つ。

> **[本書の注記] このTheater.js採用案は却下済み。** [decision-log.md D-005](./decision-log.md#d-005-theaterjs-を採用しない) を参照。GSAP Timeline + label で同等のことができ、既に導入済みのため新規ライブラリを足す理由がないと判断された。

## 第4部|Foresight案の批判的再評価

### 現在の案:「目が開く → 鷹 → 車 → HERO」の解剖

**✅ 良い点**

- 物語構造(見つける→出会う→つなぐ)がForesightのブランド思想と一致
- 視線=見通すのメタファーは、"Every car has a next"の翻案として意味論的に強い

**❌ 危険な点**

1. **鷹を実写的に見せた瞬間、AI生成トレーラーになる**

現代のWeb体験では、"鷹の実写映像 → 車の実写映像" はまさに MidJourneyやSoraで大量生産される映像文法そのもので、"AI生成っぽい" と受け取られるリスクが極めて高い。

2. **鷹と自動車ブランドの直接的な結びつきは弱い**

Cadillac、Aston Martin、Chryslerなど、猛禽類・翼のエンブレムを持つブランドは多く、Foresightが鷹を前面に出すと 「既存の自動車ブランドの模倣に見える」 危険。

3. **"目が開く"はSF映画のクリシェ**

『ブレードランナー 2049』『GITS』などで既に決定版があり、Web上で追随するとブランドを弱く見せる。

4. **鷹という具象を出した瞬間、Foresightは"猛禽類の会社"に見える**

中古車ビジネスの本質(=買取、整備、次の所有者への橋渡し)から視覚が離れすぎる。

### 🔄 推奨する再解釈

鷹を"実体"としては見せず、"視線(gaze)そのもの"として抽象化する。

- 具体的な鷹の姿 → 視線の速度と精度(=鋭利さ)
- 目のアップ → 点から線へ、線から輪郭へ、輪郭から実体へ、という段階的な発見のリズム

これによりForesightは、

- 鷹という単体アイコンに閉じない
- "見通す力"を、視覚言語そのものとして提示できる
- AI生成感を回避できる

> **[本書の注記] この再解釈(Silent Gaze)は既に採用済み。** [decision-log.md D-001](./decision-log.md#d-001-鷹を実体として見せないsilent-gaze) を参照。「決定事項（変更不可）」の1項目。

## 第5部|Foresight ローディングアニメーション 最終提案(レポート側の原案)

> **[本書の注記]** 本パートは Genspark レポートが提示した原案。Foresight側の実装は Charter・各Bible・decision-log を正としており、本パートと数値・構成が異なる場合がある(特に音声・映像・全体尺は現行方針と不一致)。史料として原文のまま残す。

### 🎬 全体コンセプト

「Silent Gaze — 見通す者の視点」

ユーザーは Foresightのカメラの目線を借りて、 暗闇の中から車両を"発見する"。 鷹は登場しない。 存在するのは "見通す視線" だけ。

### 全体タイムライン(合計 7.5秒)

| Scene | 時間 | 内容 | 音 |
|---|---|---|---|
| 01 | 0.0-1.0s | BLACK。ディザリング粒子が微かに揺れる | 静寂+低音アンビエント |
| 02 | 1.0-2.0s | FORESIGHT ロゴがディザ粒子から収束 | 深いLow-Freqスウェル |
| 03 | 2.0-3.5s | ロゴの中央から光が横方向にパン(=視線が動く) | 空気の切り裂き音(遠く) |
| 04 | 3.5-5.0s | ディザ粒子が車両のシルエット輪郭を先に描く(実体はまだ見えない) | 金属のresonance |
| 05 | 5.0-6.5s | 輪郭内側に車両写真がディザリング越しに立ち上がる | エンジン起動音の残響 |
| 06 | 6.5-7.5s | HEROへ:「車の未来を、見通す。」タイポが最後にfade in | 完全な静寂 |

### 詳細設計

**【シーン01】BLACK(0.0-1.0s)**

- 完全な #0A0A0A(pure blackではなく僅かにwarm)
- 画面全体に Bayer 8×8ディザリングのノイズが、0.3%オパシティで揺らぐ
- カーソル位置に応じて、ノイズがlerp(0.03)で0.5%だけ濃くなる
- ロードのプログレスは表示しない(Foresightのブランドは"急がない")

**【シーン02】ロゴの登場(1.0-2.0s)**

- 画面中央に、ディザ粒子が渦を巻きながら収束
- 粒子は Fragment Shader で描画(GPU効率)
- 粒子1500〜3000個、それぞれ cubic-bezier(0.65, 0, 0.35, 1) で最終位置へ
- 収束後、FORESIGHT のワードマークがmaskで下から2%露出
- タイポは Serif(例:GT Sectra Fine 相当)+ Sans(Neue Haas Grotesk 相当)のミックス

**【シーン03】視線の露出(2.0-3.5s)**

- ロゴ中央の1文字(例えば "O")の空洞から、細い光の線が横に伸びる
- 光は width 1px → 3px → 1px で幅が変動しつつ、画面幅の80%を横断
- これは "鷹の目" ではなく、"視線そのもの"
- 光の先端は、僅かにカーソル位置に対して0.05°角度が反応
- BGMがここで かすかな金属resonance を混ぜる

**【シーン04】車両輪郭のドロー(3.5-5.0s)**

- 光の線の先で、車両のプロファイル(横向きシルエット)がSVGパスで描画
- SVGパスは stroke-dasharray で 1200ms、power3.inOut でドローされる
- 車種は特定モデルではなく、"車という概念のシルエット"(セダンの一般形)
- パスの色は #F2E9D8(warm off-white)、1pxのstroke

**【シーン05】実体の立ち上がり(5.0-6.5s)**

- SVG輪郭の内側に、**車両の実写(モノクロ・ディザリング加工)**が opacityで露出
- 車両写真はヘッドライトが僅かに輝度変化(0.9 → 1.05 → 1.0 のsubtle pulse)
- 背景はまだ暗く、車両だけが浮かぶ状態
- 光の線はここで消える(fadeOut 400ms)

**【シーン06】HEROへ(6.5-7.5s)**

- 車両写真が GSAP Flip で、HEROのfinal positionへduration 1000ms、power3.inOutでMorph
- 同時に、コピー 「車の未来を、見通す。」 が、下から16pxの範囲でmask reveal
- Sub copy "Every car has a next." が英字で小さく下に露出
- ここで完全な静寂に戻る(音声UIの[🔊 unmute]ボタンだけが右下に表示)

### 各要素の設計判断(レポート側の原案)

| 要素 | 判断 | 根拠 |
|---|---|---|
| 鷹を実際に見せるか | NO | AI生成感、既存自動車ブランド模倣リスク回避 |
| 完全3Dか | NO | シルエット輪郭のみSVGパス、実体は写真+シェーダー |
| WebGL/Shader使用 | YES(部分) | ディザリング粒子と車両質感のみ |
| 音を使うか | YES(オプトイン) | 初期は無音、右下[🔊]でユーザーが選択 |
| 映像を使うか | NO(静止画+マイクロ動作) | 動画ローディングは"手抜き"に見える |
| タイポグラフィ | Serif見出し + Sans本文 | Editorial × Modernの証明 |
| カメラの動き | 微細なlerpパララックス | Locomotive流 |
| 背景 | #0A0A0A warm black | Pure blackではなく僅かに温度 |
| 色数 | 2色のみ(warm-black + warm-off-white) | Longbow / Utsubo流の禁欲 |

> **[本書の注記]** 色数は現行の [D-006](./decision-log.md#d-006-color-system-を-high-gloss-mono-5色のみに)「High Gloss Mono 5色」と不一致(レポート原案は2色)。現行はDARK/LIGHT2モード×5色で決定済み・変更不可。

### モバイル対応(レポート側の原案)

- タイムライン短縮:7.5s → 5.0s(Scene 03の視線露出を1.5s → 0.8sに短縮)
- 粒子数:3000 → 800
- ディザリングシェーダー:1/2解像度でレンダリング後アップスケール
- GSAP FlipのMorph:モバイルでは静止画のcross-fadeに簡略化

### 低スペック端末Fallback(レポート側の原案)

- `navigator.hardwareConcurrency < 4` または `matchMedia('(prefers-reduced-motion: reduce)')` を検出したら:
  - シェーダー粒子 → 静止画1枚に置換
  - Scene 03-05を **単一cross-fade(600ms)**に短縮
  - 全体2.0sで完了
- Client Hints + WebGL Capability Detectionで分岐

## 第6部|実装方式比較

| 方式 | 品質上限 | 実装難易度 | パフォーマンス | Claude Code現実性 | Foresight相性 | おすすめ度 |
|---|---|---|---|---|---|---|
| A. 完全3D(R3F + GLB車両) | ◎最高 | 非常に高 | △(モバイル重い) | △ | ○ | ★★☆☆☆ |
| B. 2.5D / Parallax | ○中 | 中 | ◎軽い | ◎ | ○ | ★★★☆☆ |
| C. Video / Cinematic | ○中 | 低 | △(動画重い) | ◎ | △(手抜き感) | ★★☆☆☆ |
| D. WebGL / Shader | ◎高 | 高 | ○(工夫必要) | ○(部分) | ◎ | ★★★★☆ |
| E. SVG / Canvas | ○中 | 低〜中 | ◎軽い | ◎ | ◎ | ★★★★☆ |
| F. ハイブリッド(D+E+一部C) | ◎最高 | 高 | ○(調整必要) | ○ | ◎ | ★★★★★ |

**推奨:F. ハイブリッド**

- D. WebGL(GLSL Shader):ディザリング粒子、車両質感(Fresnel + Depth)
- E. SVG:車両プロファイルの輪郭ドロー
- 一部C. Video:HEROの背景に5秒ループのモノクロ動画を1本だけ使用
- GSAP で全体のタイムライン制御
- Lenis でスクロールに接続
- Theater.js(オプション):時間軸編集を視覚的に管理

> **[本書の注記]** 現行実装はE(SVG+CSS+Canvas2D)を中心に、Vision以降でR3F(3D)を採用するハイブリッド。Hero単体はWebGL不使用（[D-008](./decision-log.md#d-008-hero-に-threejs-を使わない)）。スクロールは Lenis ではなく GSAP ScrollSmoother（[D-004](./decision-log.md#d-004-lenis-ではなく-scrollsmoother)）。Theater.jsは不採用（D-005）。

## 第7部|制作ロードマップ(レポート側の原案・9 Phases)

> **[本書の注記]** 現行の [00-charter.md](./00-charter.md) は独自の8フェーズ構成（Phase 1 Design System 〜 Phase 8 Final QA）で**既に完了・CEO承認済み**。本パートはレポート側の原案として史料保存する。

### Phase 1|ブランド・アートディレクション(1週間)

作るもの: ムードボード(10サイト調査結果からの抽出) / カラーパレット(warm-black #0A0A0A + warm-off-white #F2E9D8 + アクセント#8B5A3C相当を1色) / タイポシステム(見出しSerif × 本文Sans) / ディザリングの参照テクスチャ集

決めるもの: 鷹モチーフを"視線"に抽象化する意思決定 / 動画使用の是非(=ローディングは静止画+シェーダー、HEROのみ5秒動画) / 音声のON/OFFデフォルト(=OFF、ユーザーがON選択)

完成条件: ADドキュメント10ページ以上 / 3人以上のステークホルダー承認

次Phaseへ進む条件:AD承認 + Foresightロゴのバリエーション完成

### Phase 2|Storyboard(1週間)

作るもの: Figmaでフレームバイフレームのストーリーボード(合計40枚以上) / 各シーンのDuration、Easing、Trigger条件を明記 / 音声トラック(オプトイン)のwaveform設計

決めるもの: 全体タイムライン7.5秒の確定 / 各シーンの遷移カーブ(power3.inOut基準)

完成条件:ストーリーボードで通しでプレゼンできる状態

次Phaseへ進む条件:Motion Directorの承認

### Phase 3|マスター素材制作(2週間)

作るもの: 車両写真(モノクロ、ディザリング加工前の高解像度4枚以上) / 車両プロファイルSVG(3種、セダン/SUV/クーペ) / ディザリングテクスチャ(Bayer 8×8, 16×16, 32×32) / 音声素材:低音アンビエント(30秒ループ)、金属resonance(3秒)

決めるもの: 車両の"主役"シルエット確定 / テクスチャの粒度感

完成条件:全アセットがWebfriendlyフォーマット(WebP, KTX2, MP3)

次Phaseへ進む条件:モーションプロトタイプに必要な素材が揃う

### Phase 4|モーションプロトタイプ(2週間)

作るもの: React Three Fiberでシェーダーパーティクルのプロトタイプ / GSAP + Lenisでタイムラインのプロトタイプ / モバイル版のプロトタイプ(縮約版) / FramerやTheater.jsでシーンの微調整

決めるもの: Theater.js採用の是非 / モバイルの短縮ロジック

完成条件: デスクトップで60fps安定 / モバイル(iPhone SE相当)で30fps以上 / Lighthouse Performance Score 80以上

次Phaseへ進む条件:プロトタイプが本番同等のクオリティに到達

### Phase 5|技術方式の決定(1週間)

決めるもの: 最終スタック確定(推奨:Next.js 14 App Router + R3F + drei + GSAP + Lenis + Theater.js + Zustand) / KTX2圧縮の採用(Immersive Garden方式) / Sound: Howler.js を採用してオプトイン制御 / 分析:Vercel Analytics + Sentry(パフォーマンスモニタリング)

完成条件:ADR(Architecture Decision Record)ドキュメント化

次Phaseへ進む条件:CTO/リード開発者の承認

### Phase 6|実装(3週間)

作るもの: ローディングコンポーネント(`<ForesightLoader />`) / HEROコンポーネント(`<ForesightHero />`) / 音声制御コンポーネント(`<SoundToggle />`) / Reduced Motion対応(Fallback)

決めるもの: コンポーネントのpropsインターフェース / Storybookでの管理単位

完成条件: 全ブラウザ(Chrome, Safari, Firefox, Edge)で表示確認 / 実機デバイス3種以上で確認

次Phaseへ進む条件:機能テスト全パス

### Phase 7|パフォーマンス最適化(1.5週間)

作るもの: WebGLメモリプロファイリング / KTX2テクスチャ変換パイプライン(Immersive Garden流) / Vertex Animation Texture化(Lusion流、必要な場合のみ) / Progressive Loading(先にlight版、後で high版に置換)

決めるもの: 目標FPS(デスクトップ60、モバイル45以上) / Time to Interactive(TTI)目標2.5s以内

完成条件: Core Web VitalsでLCP < 2.5s、CLS < 0.1、INP < 200ms / Lighthouse Performance 90以上(デスクトップ)、75以上(モバイル)

次Phaseへ進む条件:CWV基準クリア

### Phase 8|モバイル対応(1週間)

作るもの: Touch操作最適化(スクロールとMorphの調整) / Notchセーフエリア対応(iPhone) / Landscape縦持ちの別レイアウト / 電池セーバーモード検出

決めるもの: モバイル短縮タイムラインの最終Duration / 低スペック端末Fallbackのトリガー条件

完成条件: iPhone 12以降、Pixel 6以降、Galaxy S21以降で確認 / 5G/4G/3Gそれぞれで通信量目標クリア

次Phaseへ進む条件:実機QA全パス

### Phase 9|KPI計測(継続)

作るもの: ローディング完遂率のトラッキング / HERO到達までの離脱率 / 音声ONにしたユーザーの割合 / Time on Site、Bounce Rateの前後比較

決めるもの: A/Bテスト計画(ローディング短縮版 vs フル版) / KPIしきい値(ローディング完遂率90%以上、離脱10%以下)

完成条件: Vercel Analytics + Google Analytics 4のダッシュボード完成 / 週次レポート自動化

次Phaseへ進む条件:継続改善サイクルの確立

## 結論|Foresightのローディングは、"沈黙で語る"(レポート側の結び)

10サイトの調査を通して見えたのは、現代の最高水準のブランドサイトは、"派手な演出"ではなく"沈黙と精度"で勝負しているという一貫した事実です。Scout Motorsのシネマティックな静けさ、Audemars Piguetの連続タイムライン、Stas Bondarのディザリング、Igloo Incのシェーダー駆動UI — すべてに共通するのは、"技術を見せびらかさない技術" の徹底です。

Foresightが目指すべきは、「鷹が飛ぶローディング」ではなく、「見通す者の視線に、一瞬なる体験」 です。ユーザーは Foresight のカメラに"憑依"し、暗闇の中から車両を"発見"する主体になる。この主体の変換こそが、"Every car has a next" の哲学を、体験として翻訳する唯一の方法です。

具体的な実装は、Next.js + React Three Fiber + GSAP + Lenis + Theater.js というClaude Codeで現実的に到達可能な構成で、約7.5秒のシネマティックな沈黙を作り上げること。これがForesightのローディング体験の設計上の結論です。

### 参考文献(主要ケーススタディ)

- Stas Bondar '25 Case Study — Codrops
- Scout Motors — Locomotive / Awwwards
- GQ × Audemars Piguet — Awwwards Case Study
- Igloo Inc — Awwwards Case Study
- Immersive Garden — Awwwards Case Study
- Locomotive Studio — Awwwards Case Study
- Lusion — Codrops / Awwwards
- Longbow Motors — Awwwards
- Ponpon Mania — Codrops
- Utsubo — Awwwards

---

## この資料をForesightで使う際の指針(未決事項・要検討)

このレポートのうち、**現行の実装・決定事項でまだカバーされていない、今後の検討候補**を以下に整理する。着手する場合は Creative Override Rule に従い、変更理由・影響・代替案を提示した上で CEO レビューを経ること。

| レポートの提案 | 現状 | 検討の余地 |
|---|---|---|
| 音声レイヤー(GQ×AP、Site 02) | 未実装。decision-logに記載なし | ローディング〜Heroへのオプトイン音声演出は、Hero Performance Rule（追加JS 10KB以下・WebGLコンテキスト0）と両立するかの検討が必要 |
| マクロディテール先行の車両露出(Scout Motors、Site 01) | Hero規律1「車両を一切見せない」と方向性が異なる。What We Can Do 以降の車両ストーリーで検討余地 | shot-list.md / asset-production-guide.md 側で、車両初出時の"寄りのカット"を先に見せる演出が既にあるか要確認 |
| バス・レリーフ的な浅い立体感(Immersive Garden、Site 07) | Vision以降のR3F実装がどの立体感で作られているか要確認 | 3Dの見え方の質感チューニングとして参考になる可能性 |
| Vertex Animation Texture(Lusion、Site 04) | 現行はHoudini等の3Dパイプラインを使わず、SVG中心 | 導入コストが高く、現行の性能予算達成状況（達成済み）を踏まえると優先度は低い |
