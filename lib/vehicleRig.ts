/*
 * VEHICLE RIG — SUVの部位ごとのPivot定義・命名規則・型（正本）。
 *
 * この型定義がBlender側モデラーへの発注書(docs/vehicle-rig-spec.md)の
 * 出典であり、VehiclePlaceholder.tsx / VehicleGLTF.tsx 両方が
 * 従うべき唯一の契約(interface)でもある。
 *
 * ═══════════════════════════════════════════════════════════════
 *  Rig Freeze — Pivot位置・命名・単位は、この一覧を確定した後に
 *  変更しない(禁止事項「車両のPivot位置を途中で変更しない」)。
 *  実測で調整が必要になった場合も、Pivotの原点自体は変えず、
 *  モデル側のオフセット(ジオメトリの内部配置)で吸収すること。
 * ═══════════════════════════════════════════════════════════════
 *
 * 座標系:
 *   1 three.js unit = 1 メートル
 *   +X = 車両の右(運転席が左ハンドル相当なら助手席側)
 *   +Y = 上
 *   +Z = 車両の後方(リア側)。したがって前方は -Z
 *   ワールド原点 (0,0,0) = 車両の中心・接地面（4輪接地面の中央、タイヤの一番下）
 *
 * 命名規則: CEO指示の「必要オブジェクト」一覧をそのままオブジェクト名にする。
 * Blender側でこの名前と完全一致させること(大文字小文字・アンダースコア含む)。
 */

export const VEHICLE_OBJECT_NAMES = [
  "Body",
  "FrontBumper",
  "RearBumper",
  "Grill",
  "Headlight_L",
  "Headlight_R",
  "Glass",
  "Mirror_L",
  "Mirror_R",
  "Wheel_FL",
  "Wheel_FR",
  "Wheel_RL",
  "Wheel_RR",
  "RearGate",
  "Door_FL",
  "Door_FR",
  "Door_RL",
  "Door_RR",
  "RoofRail",
  "Interior",
] as const;

export type VehicleObjectName = (typeof VEHICLE_OBJECT_NAMES)[number];

/*
 * 各パーツのPivot原点。
 *
 * 「回転・開閉だけで意図した動きになる」よう、可動パーツは
 * 動きの支点そのものをオブジェクト原点に置く。これによりコード側は
 * group.rotation / group.position を書き換えるだけで良く、
 * オフセット計算をコンポーネント側に持たせない。
 */
export const PIVOT = {
  /** 車体中心・接地面。全体のルート。 */
  body: { x: 0, y: 0, z: 0 },

  /**
   * リアハッチのヒンジ位置。車体後端の上端・幅方向中央。
   * ここを原点にして rotation.x だけで開閉する(下端が弧を描いて開く)。
   * 実測目安: 車体全長4.8m級のSUVで z ≈ +2.4(後端) / y ≈ +1.5(ルーフ高さ)。
   * 確定値は Phase 0 で Blender側と協議し、この値自体は変更しない。
   */
  rearGateHinge: { x: 0, y: 1.5, z: 2.4 },

  /** 4輪の接地点(ホイール中心のワールド座標)。回転はローカルX軸のみ。 */
  wheelFL: { x: -0.85, y: 0.35, z: -1.55 },
  wheelFR: { x: 0.85, y: 0.35, z: -1.55 },
  wheelRL: { x: -0.85, y: 0.35, z: 1.55 },
  wheelRR: { x: 0.85, y: 0.35, z: 1.55 },

  /**
   * ヘッドライトの発光点。EmissiveのBloom核になる。
   * z は車体前端(-2.4)より僅かに前に出す。面と同一平面だと
   * Zファイティングで明滅し、内側だと車体に飲まれて見えない。
   */
  headlightL: { x: -0.62, y: 0.78, z: -2.46 },
  headlightR: { x: 0.62, y: 0.78, z: -2.46 },
} as const;

/**
 * 可動軸の制約。「rotationだけで開閉/回転する」というCEO必須仕様を
 * 型で強制するための定義。VehiclePlaceholder/VehicleGLTF はこの軸以外を
 * 動かしてはならない(位置ズレ・ジオメトリ変形での疑似アニメーションを禁止)。
 */
export const MOTION_AXIS = {
  rearGate: "rotation.x",
  wheel: "rotation.x",
} as const;

/**
 * VehiclePlaceholder / VehicleGLTF が共通で公開するAPI。
 * どちらの実装を使うかは Vehicle.tsx の1箇所だけが知っていればよく、
 * 呼び出し側(VehicleScene.tsx、各セクションのScrollTrigger)は
 * このrefの型だけを見て操作する(GLB差し替え時にコード変更が要らない構造)。
 */
export type VehicleHandle = {
  /** VEHICLE_OBJECT_NAMES で名指しした各パーツへの THREE.Object3D 参照。 */
  parts: Record<VehicleObjectName, import("three").Object3D | null>;
};

/**
 * マテリアル方針。デザイン資料(public/images/foresight/vehicle-parts/)は
 * 黒地に白1px線画だが、これは「印刷図面」的な参照画像であり、
 * 3Dモデル自体を線画マテリアルにするという意味ではない。
 * 実体はPBRのボディカラー(黒〜ダークグレー基調)とし、
 * 既存のブランド意匠(High Gloss Mono)に合わせる。
 */
export const MATERIAL_POLICY = {
  body: { type: "pbr", metalness: 0.6, roughness: 0.35 },
  glass: { type: "transparent", opacity: 0.25, transmission: 0.9 },
  headlight: { type: "emissive", bloomThreshold: 0.62 },
  chrome: { type: "pbr", metalness: 0.9, roughness: 0.15 },
} as const;
