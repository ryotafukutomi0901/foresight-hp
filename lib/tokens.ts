/*
 * Design Tokens
 *
 * ═══════════════════════════════════════════════════════════════
 *  Token Freeze — 数値の正本(Source of Truth)は docs/*-bible.md のみ。
 *
 *    Bible → lib/tokens.ts → 実装     ← この一方向のみ許可
 *    実装 → tokens.ts → Bible         ← 禁止
 *
 *  実装中に数値を変えたくなったら、**先に Bible を更新し**、
 *  そこからこのファイルへ転写すること。
 *  数値の真実が複数存在する状態を作らない。
 * ═══════════════════════════════════════════════════════════════
 */

/* ────────────────────────────────────────────────────────────────
 * COLOR — High Gloss Mono の5色のみ
 * 出典: docs/01-design-system.md #3
 *
 * 中間色を作らない。同じ5色を DARK / LIGHT の2モードで反転させ、
 * 1色が両モードで別の役割を担う構造にしている。
 * ──────────────────────────────────────────────────────────────── */

export const palette = {
  white: "#FFFFFF",
  offWhite: "#F2F2F2",
  silver: "#CFCFCF",
  charcoal: "#2F2F2F",
  black: "#090909",
} as const;

/** DARK モード: 暗闇=空間と発見 */
export const dark = {
  bg: palette.black,
  surface: palette.charcoal,
  rule: palette.charcoal,
  text: palette.offWhite,
  textSoft: palette.silver,
  textEmphasis: palette.white,
} as const;

/** LIGHT モード: 光=情報と行動 */
export const light = {
  bg: palette.offWhite,
  surface: palette.white,
  rule: palette.silver,
  text: palette.black,
  textSoft: palette.charcoal,
  textEmphasis: palette.black,
} as const;

/** セクションごとの背景。感情曲線と明度を一致させている */
export const sectionBg = {
  loading: palette.black,
  hero: palette.black,
  vision: palette.black,
  whatWeCanDo: palette.charcoal,
  buy: palette.offWhite,
  sell: palette.white, // 物語の頂点。最も明るい
  find: palette.silver,
  cta: palette.black, // Loading と呼応し円環が閉じる
} as const;

/* ────────────────────────────────────────────────────────────────
 * MOTION — 出典: docs/motion-bible.md
 * ──────────────────────────────────────────────────────────────── */

/** CustomEase に登録するベジェ定義。登録は lib/motion.ts が行う */
export const easeCurves = {
  brandOut: "0.16, 1, 0.3, 1",
  brandInOut: "0.76, 0, 0.24, 1",
  brandHeavy: "0.34, 0, 0.2, 1",
  brandSnap: "0.2, 0.9, 0.1, 1",
  brandDolly: "0.45, 0.05, 0.25, 1",
  /** 最後まで加速し続ける。減速させると「止まって見え」入る感覚が消える */
  brandDive: "0.6, 0, 0.9, 0.35",
} as const;

export const ease = {
  out: "brandOut",
  inOut: "brandInOut",
  heavy: "brandHeavy",
  snap: "brandSnap",
  dolly: "brandDolly",
  dive: "brandDive",
  /** scrub連動では必須。easeを掛けるとスクロールと画面がズレて酔う */
  linear: "none",
} as const;

export const duration = {
  micro: 0.3,
  ui: 0.6,
  enter: 1.0,
  cine: 1.6,
  /** 意図的な静止。「静止時間を恐れない」を数値として持つ */
  hold: 0.4,
} as const;

export const stagger = {
  char: 0.022,
  line: 0.08,
  item: 0.12,
  block: 0.18,
} as const;

export const delay = {
  /** 1拍。次の要素を追わせる最小の間 */
  beat: 0.15,
} as const;

export const transform = {
  opacityFrom: 0,
  /** 背景に沈む装飾の上限 */
  opacityGhost: 0.06,
  /** これ以上小さいと「奥にある」ではなく「縮んでいる」に見える */
  scaleLayerFrom: 0.94,
  /** 回廊の拡大上限。素材267pxが破綻する境界（CEO指摘・厳守） */
  scaleCorridorMax: 1.6,
  blurLayerFrom: 8,
  blurDeepFrom: 20,
  yLayerFrom: 40,
  yPercentMask: 110,
  rotateXCharFrom: -78,
  letterSpacingTrackFrom: "0.5em",
} as const;

export const parallax = {
  subtle: 4,
  layer: 8,
  lerp: 0.08,
} as const;

/* ────────────────────────────────────────────────────────────────
 * CAMERA — 出典: docs/camera-bible.md
 * ──────────────────────────────────────────────────────────────── */

export const camera = {
  /** 全セクションで固定。変えると空間の同一性が壊れる */
  fov: 58,
  near: 0.1,
  far: 220,
  position: [0, 0, 6] as const,
  dpr: [1, 2] as const,
} as const;

export const corridor = {
  /** 1枚あたりの奥行き間隔 */
  gap: 16,
  /** 進行度0での1枚目の距離。farOut より奥に置き、Hero/Vision では何も見せない */
  leadIn: 128,
  /** 進行度0→1で回廊が手前へ流れる距離 */
  travel: 210,
  /**
   * ハードゲート。これ未満の進行度では回廊を一切描画しない。
   * 距離設計だけだと板のサイズを変えた瞬間に破れる（実測で確認）。
   * 「Hero/Visionで車両を見せない」は不変条件なので、
   * 調整可能なパラメータの組み合わせではなく独立したゲートで守る。
   */
  gateProgress: 0.04,
  /**
   * これより手前には来させない（厳守）。
   * 透視投影では見かけの大きさ ∝ 1/距離。カメラ z=6 なので
   *   (6 - farIn) / (6 - nearOut) = 101 / 63 = 1.60
   * となり、拡大率の上限 scaleCorridorMax(1.6) にちょうど収まる。
   * 感覚で決めず式から逆算した値。docs/camera-bible.md に検算あり。
   */
  nearOut: -57,
  /** 完全に消えきる位置 */
  nearIn: -38,
  /** ここまで来たら完全に見える */
  farIn: -95,
  /** これより奥は見えない */
  farOut: -125,

  /* 不透明度の3段カーブ: 遠景は薄く / 中景でピーク / 近景は素早く落とす */
  /** 遠景の上限。大気遠近で奥ほど薄く霞ませる */
  opacityFar: 0.5,
  /** 中景のピーク */
  opacityPeak: 1.0,
  /** 近景の落ち方。1より大きいほど急速に消える */
  nearFalloffPower: 1.6,

  /**
   * 板の基準サイズ。画面上で被写体が読める大きさを確保する。
   * これは「拡大率の上限1.6倍」とは別軸の指標で、
   * 上限は "最遠と最近の見かけの比" を縛るもの、こちらは絶対サイズ。
   * 小さすぎると線画のディテールが潰れ、何が写っているか分からなくなる。
   */
  planeScaleBase: 22,
  planeScaleVariance: 4,
} as const;

export const fogPlacement = {
  zNear: -22,
  zFar: -132,
} as const;

export const speed = {
  page: 40,
  dust: 60,
} as const;

export const lerp = {
  camera: 0.05,
  mesh: 0.1,
  pointer: 0.08,
} as const;

export const dof = {
  focusDistance: 0.022,
  focalLength: 0.08,
  bokehScale: 3.2,
} as const;

/* ────────────────────────────────────────────────────────────────
 * LIGHTING — 出典: docs/lighting-bible.md
 * ──────────────────────────────────────────────────────────────── */

export const lighting = {
  /** シーンのフォグ色。Color System の地と一致させる */
  fogColor: palette.black,
  fogDensity: 0.014,
  toneMappingExposure: 1.0,
} as const;

export const bloom = {
  intensity: 0.35,
  /** 高く取り線画の白だけを拾う。下げると霧まで光って白飛びする */
  luminanceThreshold: 0.62,
  luminanceSmoothing: 0.3,
} as const;

export const noise = {
  /** SOFT_LIGHT。NORMALだと暗部が持ち上がって黒が濁る */
  opacity: 0.2,
} as const;

export const vignette = {
  offset: 0.22,
  darkness: 0.92,
} as const;

export const chromaticAberration = {
  offsetBase: [0.0004, 0.00024] as const,
  offsetMax: [0.0026, 0.0016] as const,
  modulationOffset: 0.3,
} as const;

export const volumetric = {
  fogCount: 26,
  fogOpacityNear: 0.13,
  fogOpacityFalloff: 0.06,
  dustCount: 700,
  dustOpacity: 0.3,
  dustSize: 0.1,
  shaftOpacityBase: 0.06,
  shaftOpacityAmp: 0.025,
} as const;

/* ────────────────────────────────────────────────────────────────
 * MATERIAL — 出典: docs/art-bible.md #dithering
 *
 * pixelSize をカメラ距離に連動させ、寄るほど粒が粗くなる。
 * 素材の解像度不足を「意図した粒状感」に変換する。
 * ──────────────────────────────────────────────────────────────── */

export const dither = {
  /** Bayer 行列の一辺 */
  matrixSize: 4,
  /**
   * 粒の大きさ。遠いほど細かい。
   * 当初 near=3.5 にしたところ車両が判別不能な粒の塊になったため下げた。
   * ディザは被写体を様式化するものであって消すものではない。
   * 上限は常に「被写体が何であるか分かること」。
   */
  pixelSizeFar: 0.8,
  pixelSizeNear: 1.6,
  /** 粒サイズを補間する距離レンジ */
  distanceNear: 40,
  distanceFar: 120,
  /**
   * 暗部カットオフ。これ未満は完全な黒として扱う。
   * 素材の黒背景は圧縮とミップマップで厳密な0ではなく、
   * カットオフ無しだと背景に白点が散ってプレーンの矩形が浮かび上がる。
   * 加算合成では黒=透明なので、黒を確実に0へ落とすことが透過の前提になる。
   */
  darkCutoff: 0.24,
  /** 明部カットオフ。これ以上は完全な白 */
  lightCutoff: 0.94,
  /**
   * ディザの混合比。0=原画のまま / 1=完全2値化。
   * 267pxのアンチエイリアス付き線画を2値化すると線の縁が点に分解され
   * 線そのものが壊れるため、混ぜて使う。
   * 0.18 は現行素材(267px)で線の連続性が保てる上限。実測で0.35は破綻した。
   * 高解像度素材に差し替わった後は上げる余地がある。
   */
  strength: 0.18,
  /**
   * 板の端のフェード開始位置（中心からの正規化距離）。
   * 素材はWebP圧縮のブロックノイズを持ち、暗部カットオフだけでは
   * 背景の一部が残って板の矩形が薄い箱に見える。
   * 矩形の境界自体を消せば、ノイズが残っても箱にはならない。
   */
  edgeFeather: 0.34,
} as const;

/* ────────────────────────────────────────────────────────────────
 * SCROLL — 出典: docs/01-design-system.md #9
 * ──────────────────────────────────────────────────────────────── */

export const scroll = {
  revealStart: "top 78%",
  pinVision: "+=260%",
  pinUnseenDesktop: "+=380%",
  pinUnseenMobile: "+=280%",
} as const;
