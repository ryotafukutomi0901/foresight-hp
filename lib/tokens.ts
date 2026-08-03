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
  /**
   * 上限1.75。
   *
   * 経緯: 当初 dpr2 で desktop 16fps と大きく予算を割ったため 1.5 まで下げた。
   * その後 D-018(画面外の3D停止)で余裕が生まれ、さらに車両の線画を
   * 主役に据えたことで解像度の影響が大きくなった。1px幅の線は
   * dpr が低いと画素グリッドに乗らずジャギる・ちらつく。
   * 1.75 は「線が読める」下限として実測で決めた値。
   * 上げすぎると再び fps を割るため、Vision の霧が主役だった頃の
   * 2.0 には戻さない。
   */
  dpr: [1, 1.5] as const,
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
  /*
   * 正規化された焦点距離(0〜1が near〜far に対応)。
   * far=220 なので 0.022 は実距離およそ4.8。
   * 車両はカメラから 8.6〜11.2 の位置にあり、旧値では
   * 焦点より奥に外れて常にボケていた（実測で線が沈んだ）。
   * 0.045 ≒ 実距離9.9 で車両に合焦する。霧は更に奥なのでボケたまま残る。
   */
  focusDistance: 0.045,
  focalLength: 0.08,
  /*
   * ボケの強さ。車両が主役になったため弱める。
   * 3.2 は霧だけを見ていた頃の値で、合焦していても
   * 周辺の滲みが線画に被って解像感を削っていた。
   */
  bokehScale: 1.8,
  /**
   * 半解像度で処理する。ぼかしは低解像度でも結果がほぼ変わらないが、
   * DOFはポストプロセス中で最も高コスト。フル解像度だと fps を大きく削る。
   */
  resolutionScale: 0.5,
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
  /** Philosophy: 車両1回転 + リアハッチ開閉を収める。長すぎると冗長になる */
  pinPhilosophyDesktop: "+=300%",
  pinPhilosophyMobile: "+=220%",
} as const;

/* ────────────────────────────────────────────────────────────────
 * VEHICLE — Hero〜Contactを貫くSUVの姿勢・カメラ・ライト
 *
 * Pivot・命名・単位は lib/vehicleRig.ts が正本。ここでは
 * 「各区間で車両とカメラがどこに居るか」だけを定義する。
 *
 * 座標系: +X=右 / +Y=上 / +Z=後方（前方は -Z）。1 unit = 1m。
 * 原点は4輪接地面の中央。
 * ──────────────────────────────────────────────────────────────── */

export const vehicle = {
  /* ── Hero: 右の暗闇から中央へ走り込み、3/4フロントビューで停止 ── */
  hero: {
    /*
     * 登場位置。画面右外。
     * 左へ走ってくるので、奥行きはほぼ変えない(Zを動かすと
     * 「左へ走る」ではなく「手前に寄ってくる」動きに見える)。
     */
    fromX: 9.5,
    fromZ: -0.4,
    /** 停止位置。やや右寄りに置き、左半分をコピー領域として空ける */
    toX: 1.1,
    toZ: 0,
    /*
     * 停止時の角度 —「左斜め前」を向く。
     *
     * モデルは -Z が前方(グリル・ヘッドライトが -Z 側)。
     * rotationY = -π/2 で前方が -X(画面左)を向く = 完全な真横。
     * そこから 0.62rad 戻してカメラ側へ振ると、フロントが
     * 左斜め前を向いた3/4ビューになる。
     * ヘッドライトの光がそのまま左のコピー領域へ向かう。
     */
    toRotationY: -Math.PI / 2 + 0.62,
    /*
     * 登場時の角度 — ほぼ真横(左向き)。
     * 画面右外から左へ走ってくる姿勢そのもの。
     * ここから toRotationY へ振れることで「走ってきて、
     * 少しこちらへ向き直って停まる」動きになる。
     */
    fromRotationY: -Math.PI / 2,
    /** 走行〜停止の尺(秒)。Heroのみ時間ベース(サイト唯一の自動再生) */
    driveDuration: 2.6,
    /** 停止時のサスペンション沈み込み。0→1→0で1回だけ */
    dipDuration: 0.5,
    /** 沈み込みの実距離(m)。これ以上沈むと「壊れた」ように見える */
    dipDepth: 0.06,
    /** ヘッドライト点灯にかける時間 */
    headlightDuration: 1.1,
  },

  /* ── Philosophy: 時計回りに回してリアを見せ、ハッチを開く ── */
  philosophy: {
    /** 回転の終端。3/4フロント(-0.62) からリアビューまで回す */
    toRotationY: -Math.PI / 2 + 0.62 + Math.PI,
    /** ハッチが開き始める進行度。回ってリアが見えてから開く */
    gateOpenStart: 0.55,
    /** ハッチが全開になる進行度 */
    gateOpenEnd: 0.85,
  },

  /* ── Sell: ハッチを閉じ、側面へ回してスキャン ── */
  sell: {
    /** ハッチを閉じ終える進行度。早めに閉じてからスキャンへ移る */
    gateCloseEnd: 0.25,
    /** 側面が見える角度(真横) */
    toRotationY: -Math.PI / 2 + 0.62 + Math.PI * 0.5,
    /** 僅かに前進する距離(m)。「動き出す」気配だけを出す */
    advanceZ: -0.6,
    /** スキャンが始まる/終わる進行度 */
    scanStart: 0.35,
    scanEnd: 0.95,
  },

  /* ── Buy: カメラが車両を周回する ── */
  buy: {
    /*
     * 周回の振れ幅(ラジアン)。1周させない。
     *
     * 大きく取ると車の真後ろまで回り込み、被写体が背面だけになる上、
     * 次のFind区間(車の後方から並走)への繋ぎでカメラが大きく飛ぶ。
     * 0.55π ≒ 100度で、正面寄りから側面までを見せて止める。
     */
    orbitSweep: Math.PI * 0.55,
    /** 周回中のカメラ半径(m)と高さ。低い位置から見上げてボディラインを強調 */
    orbitRadius: 10.4,
    orbitHeightFrom: 1.1,
    orbitHeightTo: 3.4,
  },

  /* ── Find: 再び走行姿勢へ。タイヤが回り、光のラインが分岐する ── */
  find: {
    /** 走行姿勢の角度。ほぼ真正面から少しだけ振る */
    toRotationY: -Math.PI / 2 + 0.62 + Math.PI * 1.5,
    /*
     * この区間で進む距離(m)。
     * カメラは lookAt でこの動きを追うので、車が小さくなるのではなく
     * 「並走しながら奥へ進んでいる」絵になる。短すぎると走行感が出ない。
     */
    travelZ: -6.0,
    /**
     * 区間全体でホイールが回る総角度(ラジアン)。
     * 実距離ではなく見た目の心地よさで決める。
     * タイヤ半径0.35mなら travelZ 2.2m ≒ 6.3rad が物理的に正しいが、
     * それでは回転が地味すぎるため誇張する。
     */
    wheelSpin: Math.PI * 6,
  },

  /* ── Contact: 減速して停止。ライトが落ちる ── */
  contact: {
    /** 画面中央へ戻す */
    toX: 0,
    toRotationY: -Math.PI / 2 + 0.62 + Math.PI * 1.5,
    /** タイヤが止まりきる進行度。車体停止より少し手前で止める */
    wheelStopAt: 0.6,
    /** ヘッドライトが消えきる進行度 */
    lightOutAt: 0.85,
  },

  /* ── カメラの区間別ポジション ──
     lerpで補間しながらここへ向かう。突然のジャンプを作らない。 */
  camera: {
    /* 車は右寄りに停まるので、カメラも少し右から見て構図の重心を取る */
    hero: { x: 1.4, y: 1.8, z: 11.5, lookY: 0.95 },
    philosophy: { x: -0.8, y: 2.1, z: 11.0, lookY: 1.05 },
    /*
     * Sellの終端は、次のBuy区間の周回の始点(角度0 = 真正面)と
     * 一致させる。ここがズレると区間の継ぎ目でカメラが飛ぶ。
     * z は orbitRadius(10.4)、x は 0、y は orbitHeightFrom(1.1) に合わせる。
     */
    sell: { x: 0, y: 1.1, z: 10.4, lookY: 0.85 },
    buy: { x: 0, y: 2.0, z: 10.4, lookY: 0.9 },
    find: { x: 0, y: 1.8, z: 12.0, lookY: 0.95 },
    contact: { x: 0, y: 1.9, z: 12.6, lookY: 0.9 },
  },

  /** ライト */
  light: {
    /** ヘッドライトのEmissive強度の最大値 */
    headlightMax: 4.2,
    /** 荷室光の最大値。ヘッドライトより弱く、内側から滲む程度 */
    cargoMax: 2.4,
  },
} as const;

/* ────────────────────────────────────────────────────────────────
 * HERO / SILENT GAZE — 出典: docs/hero-bible.md
 *
 * Heroの右半分に引かれる「一本の光の線」。決定事項1(Silent Gaze)の
 * Hero側での実体で、鷹を実体として見せずに「見通す視線」だけを置く。
 *
 * 幾何は hero-bible.md の Hero Layout のASCII図が正本。
 * 右半分・左下から右上へ上昇する対角線。
 * ──────────────────────────────────────────────────────────────── */

export const heroGaze = {
  /*
   * 線の両端（Heroセクションを 0-100 とした%座標）。
   * hero-bible の ASCII図では、右半分を左下→右上に横切る対角線。
   */
  x1: 52,
  y1: 74,
  x2: 96,
  y2: 26,

  /** H-01: 中央から左右へ伸びる時間。hero-bible「Flip完了直後 / +1.2s」 */
  drawDuration: 1.2,

  /*
   * ⚠️ 以下3つは hero-bible に数値の記載が無く、実装時に決めた暫定値。
   * decision-log D-020 に候補として記録済み。CEO承認で確定させる。
   */
  /** 線の基準不透明度。明滅の中心値 */
  opacityBase: 0.5,
  /** 線幅(px)。1pxだと高DPRで消えかけ、2pxだと装飾に見えた */
  strokeWidth: 1.5,
  /** にじみ(feGaussianBlur)の半径。線幅に対する倍率 */
  glowBlur: 3,

  /** H-05: 明滅。hero-bible「周期6秒・振幅0.06」 */
  pulsePeriod: 6,
  pulseAmplitude: 0.06,

  /** H-05: ポインタ追従パララックスの振れ幅(px)。hero-bible Hero Camera */
  parallaxGaze: 12,
  parallaxHeadline: 4,
} as const;
