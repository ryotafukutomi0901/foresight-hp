# SUV GLB 申し送り（Web/R3F 実装向け）

最終更新: 2026-08-04 / 作成: 3D Creator（Blender側）

> このドキュメントは `public/models/SUV.glb`（写実モデル）を R3F に載せる担当者向け。
> **元の発注書 [`vehicle-rig-spec.md`](./vehicle-rig-spec.md) は「手作り低ポリを20部品でリグ化」する前提だが、
> 実際の納品は CEO 指示で方針転換した「写真ベースの写実GLB＋アウトライン(ワイヤーフレーム)ラッピング」である。**
> 食い違う点を本書で上書きする。以下が現物の正。

---

## 0. 最終ビジュアル方針（確定）

**リファレンス `public/images/foresight/vehicle-parts/` のワイヤーフレーム線画のトーンを、写実3Dモデルの上に“ラッピング”する。**

- 下地: 写実的なマット黒SUV（このGLB）
- 上乗せ: **フィーチャーエッジのアウトライン**（輪郭＋折れ線＋深度境界）を白発光で描く → PNG線画そのものの見た目
- **生の三角ワイヤー(`wireframe:true`)は使わないこと。** 写真ベースで三角が多く汚くなる。必ず normal+depth のエッジ検出で「設計線」だけ出す。

Blender の Freestyle で出した参考画像イメージ = 目標トーン（静止デモ）。R3F の normal/depth アウトラインなら、それよりクリーンに出る。

---

## 1. 納品物

| 項目 | 値 |
|---|---|
| ファイル | `public/models/SUV.glb` |
| サイズ | 約 6.4MB（2K JPEG テクスチャ×3 / 非圧縮ジオメトリ） |
| ポリゴン | 約 91,800 tri |
| 圧縮 | **Draco/Meshopt なし**（decoder不要でそのまま `useGLTF` で読める） |
| 座標 | +Y=上 / **前方=-Z** / 原点=4輪接地面の中央（`position=(0,0,0)` で接地・カメラ(-Z側)にフロントが向く） |
| 単位 | 1 unit = 1m（全長約4.8m） |

---

## 2. パーツ契約（★元仕様の20個ではなく、実際は7ノード）

`SUV`(ルート) 直下の実在ノード:

| ノード名 | 種別 | 可動/制御 |
|---|---|---|
| `Body` | Mesh | 車体本体。**グリル/ガラス/ミラー/ドア/バンパー/ルーフレール/FORESIGHTバッジは全てBodyに融合**（個別ノードではない） |
| `Wheel_FL` `Wheel_FR` `Wheel_RL` `Wheel_RR` | Mesh | **`rotation.x` で自軸回転**（原点=各ホイール中心。フェンダーは巻き込まない） |
| `Headlight_L` `Headlight_R` | Mesh | **単一 emissive マテリアル**（`material.emissiveIntensity` を上げると点灯／Bloom核） |

**存在しないノード（＝ `parts.X = null`）**: `RearGate` `Grill` `Glass` `Mirror_L/R` `Door_FL/FR/RL/RR` `RoofRail` `Interior`。

→ 既存 `Vehicle.tsx` の `useFrame` は各パーツを `if (obj)` で存在チェックしてから触る設計なので、**null でも安全に無視される**。ただし以下の演出は「写実GLBには対象物が無い」ため**動かない**ので、シーン設計から外すか代替表現にすること:
- リアハッチ開閉（`RearGate`）→ フォトスキャンに内装が無く、開けても中身が無い。省略推奨。
- 荷室からの光（`Interior`）→ 同上。
- サスペンション沈み込みは `Body.position.y` で可能（Bodyは動く）。ホイールはルート直下なので沈まない＝接地維持。

`VehicleHandle` の `parts` は、存在する7個だけ Object3D を入れ、残りは null で返せばよい。

---

## 3. アウトライン(ワイヤーフレーム)ラッピング実装

`@react-three/postprocessing`（導入済み: `^3.0.4`）でカスタム Effect を作る。**normalバッファ＋depthバッファの Sobel エッジ検出**で白線を描き、既存の `Bloom` で滲ませる。

### 方針
1. `EffectComposer` に `NormalPass` を持たせ、法線バッファを取得。
2. カスタム `Effect`（fragment）で、隣接ピクセルの法線差分＋深度差分を Sobel で取り、閾値超えを「エッジ」として白(発光)出力。
3. `blendFunction = ADD`（またはSCREEN）で元画像に加算 → 白線が乗る。
4. 既存 `Bloom` を後段に置く → 線が発光する。
5. 下地の車体は暗いマット黒なので、線だけが浮く＝PNG線画トーン。

### スケルトン（要調整）
```tsx
// EdgesEffect.ts — normal+depth エッジ検出（概略）
import { Effect, EffectAttribute } from 'postprocessing'
import { Uniform } from 'three'

const frag = /* glsl */`
  uniform sampler2D uNormalBuffer;
  uniform float uThreshold;   // 0.2〜0.6 で調整
  uniform vec3  uLineColor;   // 白 (1,1,1)
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 px = 1.0 / resolution;
    // 近傍4点の法線
    vec3 n  = texture2D(uNormalBuffer, uv).rgb;
    vec3 nx = texture2D(uNormalBuffer, uv + vec2(px.x,0.)).rgb;
    vec3 ny = texture2D(uNormalBuffer, uv + vec2(0.,px.y)).rgb;
    // 深度（GBufferのdepthを使う場合は readDepth を利用）
    float ed = (1.0 - dot(n,nx)) + (1.0 - dot(n,ny));       // 法線差
    float edge = smoothstep(uThreshold, uThreshold+0.15, ed);
    outputColor = vec4(mix(inputColor.rgb, uLineColor, edge), inputColor.a);
  }
`
export class EdgesEffect extends Effect {
  constructor(normalBuffer, { threshold = 0.35, color = [1,1,1] } = {}) {
    super('EdgesEffect', frag, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map([
        ['uNormalBuffer', new Uniform(normalBuffer)],
        ['uThreshold', new Uniform(threshold)],
        ['uLineColor', new Uniform(color)],
      ]),
    })
  }
}
```
```tsx
// VehicleScene.tsx のコンポーザ（概略）
<EffectComposer>
  <N8AO ... />            {/* 任意 */}
  <primitive object={new EdgesEffect(normalPass.texture, { threshold: 0.35 })} />
  <Bloom intensity={1.2} luminanceThreshold={0.2} mipmapBlur />
  <Vignette />
</EffectComposer>
```
- `NormalPass` は `EffectComposer` に `enableNormalPass` 相当で持たせるか、drei `<RenderTexture>`/`postprocessing` の `NormalPass` を明示追加。
- 閾値 `uThreshold` を上げるとノイズ線が減る（法線マップは弱めに焼いてあるので、まずは 0.35 付近）。
- **wire→solid 演出**にするなら `edge` に uniform で `uMix`（0..1）を掛け、スクロールで 1→0 にフェード。solid側は下地の写実マテリアルをそのまま見せる。

### 代替（もっと手軽）
`postprocessing` の既存エフェクトだけで済ませたい場合、**depthベースのアウトライン**（`OutlineEffect`は選択オブジェクト用なので不可）ではなく、上記カスタムが最短。どうしても自前シェーダを避けたいなら、モデルに **`MeshStandardMaterial` + 別レイヤーで `wireframe` の細メッシュ** を重ねる手もあるが、写真ジオメトリでは線が過密になるため非推奨。

---

## 4. マテリアル

| マテリアル | 用途 | 備考 |
|---|---|---|
| `Material.001` | 車体全体（写実PBR, 2K base/roughness-metallic/normal） | 法線は弱め(0.1)に調整済み＝エッジのノイズ低減のため |
| `Headlight` | ヘッドライトL/R | emissive。`emissiveIntensity` を実行時に 0→N で点灯。初期は暗いレンズ |
| `Badge`/`BadgePlate` | FORESIGHT ワードマーク | Bodyに融合済み。クリアな立体文字 |

- ヘッドライト点灯は `parts.Headlight_L/R.material.emissiveIntensity = viewProgress.headlightIntensity * MAX` で既存コードのまま動く（単一マテリアルにしてある）。

---

## 5. チェック / 性能

- `npm run dev` で `Vehicle.tsx` の `USE_GLB = true`（＋`VehicleGLTF.tsx` 実装）に切替。
- 91k tri + 2K×3テクスチャ + Bloom + Edges。**`node scripts/measure-fps.mjs` でモバイル実機相当のFPSを実測**。
- 重い場合の逃し: テクスチャ1K化 / `EdgesEffect` の解像度half / デシメートで60k tri へ。
- 元の高精細版（150万tri, 94MB）は `public/images/foresight/vehicle-parts/vehicle.glb`（CEO支給の原本、配信不可）。編集可能マスターは `assets-src/vehicle/SUV_photoreal_master.blend`。

---

## 6. 既知の残課題（提案）

- ヘッドライト発光部の形がややジャギー（フォトスキャン切り出しのため）。Bloomで滲むので実用上は問題少。気になれば Blender 側でクリーンな円形発光ディスクへ差し替え可。
- ドア横などフラットな面で、テクスチャ由来の微小エッジがアウトラインに乗ることがある → `uThreshold` を上げて抑制。
- リアハッチ/内装の演出が必要なら、Blender 側で写実モデルの尾部を分割 or 手作り低ポリ版（`assets-src/vehicle/SUV.blend`, リグ20部品済み）との併用を検討。
