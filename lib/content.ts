/*
 * サイト全文のコピーを1箇所に集約する。
 * 文言修正がコンポーネント横断にならないようにするため、
 * 各セクションはここからのみ文言を読む。
 *
 * 方針: BUY / SELL / FIND は「何をやれるか」をメッセージとして伝える。
 * 対象車種や条件を仕様の箇条書きとして並べない。
 */

export const BRAND = {
  name: "Foresight",
  nameJa: "フォーサイト",
  core: "車の未来を、見通す。",
  en: "Every car has a next.",
  enUpper: "EVERY CAR HAS A NEXT.",
  beyond: "SEE BEYOND THE CONDITION.",
} as const;

/*
 * ナビゲーション。
 * CONTACT は入れない。問い合わせはヘッダー右の「相談する」が担う。
 * 並びをページの順序と一致させ、現在地が分かるようにする。
 */
export const NAV = [
  { label: "TOP", href: "#top", ja: "トップ" },
  { label: "SELL", href: "#sell", ja: "車を売る" },
  { label: "BUY", href: "#buy", ja: "車を買う" },
  { label: "FIND", href: "#find", ja: "車を探す" },
] as const;

export const CTA = {
  /*
   * ヘッダーのボタン。
   * 「車を売る」だと売ると決めた人しか押せない。
   * 実際には「いくらになるか知りたいだけ」の人が大半なので、
   * そこまで含められる言葉にする。
   */
  consult: { label: "相談する", href: "#contact" },
  sell: { label: "買取を相談する", href: "#contact" },
  find: { label: "車を探してもらう", href: "#contact" },
} as const;

export const HERO = {
  headline: ["車の未来を、", "見通す。"],
  /*
   * ファーストビューで「何屋か」を言い切る。
   * ここが抽象語だと、スクロールしない人には何も伝わらない。
   */
  sub: ["動かない車も、事故車も買い取ります。", "お探しの車は、全国から。"],
  en: BRAND.enUpper,
  scrollCue: "SCROLL",
} as const;

/* SCENE 02 — 霧の中から視界が開いていく3段階 */
export const VISION = {
  a11yHeading: "Foresightの視点",
  steps: ["まだ、何も見えない。", "少しずつ、見えてくる。", "そして、全体が見える。"],
} as const;

/*
 * 10枚のビジュアルによるナラティブ。
 * 「車の写真ギャラリー」ではなく、1台の車が視点を変えながら
 * 次の可能性へ進んでいく一つの物語として構成する。
 * 各キャプションは提供された元シートの文言をそのまま使っている。
 */
export const NARRATIVE = {
  label: "THE NARRATIVE",
  movements: [
    {
      id: "see",
      index: "I",
      title: "見る。",
      lead: "まず、その車の姿を見る。",
      shots: [
        {
          src: "/images/foresight/vehicle-parts/01-suv-whole.webp",
          alt: "Foresightのロゴを掲げた探索・回収車両の全体像",
          kicker: "THE WHOLE",
          caption: ["どんな場所へも向かう、", "力強く無骨な探索・回収車両の全体像。"],
        },
        {
          src: "/images/foresight/vehicle-parts/02-suv-side.webp",
          alt: "車両のサイドシルエット",
          kicker: "THE FORM",
          caption: ["機能的で無駄のないフォルム。", "積載性と走破性を兼ね備えた設計。"],
        },
        {
          src: "/images/foresight/vehicle-parts/03-front-face.webp",
          alt: "車両のフロントフェイスとヘッドライト",
          kicker: "THE FACE",
          caption: ["鷹の鋭い眼差しのようなヘッドライト。", "存在感と信頼感を象徴するフロント。"],
        },
      ],
    },
    {
      id: "beneath",
      index: "II",
      title: "その先を見る。",
      lead: "見えているものが、その車のすべてではない。",
      shots: [
        {
          src: "/images/foresight/vehicle-parts/04-tire-suspension.webp",
          alt: "タイヤ・ホイールとサスペンション",
          kicker: "THE GROUND",
          caption: ["過酷な環境を支える足回り。", "路面を掴み、どこへでも進む。"],
        },
        {
          src: "/images/foresight/vehicle-parts/05-engine.webp",
          alt: "エンジンの機械構造",
          kicker: "THE CORE",
          caption: ["見えない内部こそ価値の源泉。", "精密な構造が力を生み出す。"],
        },
        {
          src: "/images/foresight/vehicle-parts/06-damaged.webp",
          alt: "事故や経年により損傷した車両",
          kicker: "THE DAMAGE",
          caption: ["事故や経年による損傷。", "それでも、価値はまだ残っている。"],
        },
      ],
    },
    {
      id: "restore",
      index: "III",
      title: "価値を戻す。",
      lead: "運び、整え、次へつなぐ。",
      shots: [
        {
          src: "/images/foresight/vehicle-parts/07-transport.webp",
          alt: "積載車で車両を運搬する様子",
          kicker: "THE JOURNEY",
          caption: ["大切に回収し、安全確実に", "次の場所へと運ぶ。"],
        },
        {
          src: "/images/foresight/vehicle-parts/08-repair.webp",
          alt: "リフトに上げた車両を整備する作業者",
          kicker: "THE REBUILD",
          caption: ["プロの手によって整え、", "再び走れる状態へ。"],
        },
        {
          src: "/images/foresight/vehicle-parts/09-parts-reuse.webp",
          alt: "分解・分類された再利用可能なパーツ群",
          kicker: "THE PARTS",
          caption: ["一つひとつのパーツに新たな可能性。", "再利用で、価値をつなぐ。"],
        },
      ],
    },
  ],
  finale: {
    id: "next",
    index: "IV",
    kicker: "THE NEXT",
    src: "/images/foresight/vehicle-parts/10-next-journey.webp",
    alt: "夜明けの道を次の場所へ向かう車両",
    headline: ["新しいオーナーのもとへ。", "未来へ続く道を、共に。"],
    closing: "それが、Foresightの見ている先。",
  },
} as const;

export type NarrativeShot = {
  src: string;
  alt: string;
  kicker: string;
  caption: readonly [string, string];
};

/*
 * 3D回廊が読む、10枚のフラットな並び。
 * 順番そのものに意味がある(全体→形→顔→足回り→内部→損傷→運搬→整備→再利用→未来)ため、
 * 定義順を入れ替えないこと。
 *
 * 型を明示しているのは、`as const` のままだと各要素のsrcがリテラル型に
 * 狭まって配列全体が合成できなくなるため。
 */
const movementShots: NarrativeShot[] = NARRATIVE.movements.flatMap((m) =>
  // プロパティを明示的に写す。スプレッドだと`as const`由来のリテラル型が
  // タプルごとに食い違い、配列として合成できなくなる。
  m.shots.map((s) => ({
    src: s.src as string,
    alt: s.alt as string,
    kicker: s.kicker as string,
    caption: s.caption as readonly [string, string],
  })),
);

export const NARRATIVE_SHOTS: readonly NarrativeShot[] = [
  ...movementShots,
  {
    src: NARRATIVE.finale.src,
    alt: NARRATIVE.finale.alt,
    kicker: NARRATIVE.finale.kicker,
    caption: NARRATIVE.finale.headline,
  },
];

/*
 * 唯一「AではなくB」の型を残す章。
 * ここがブランドの一番強い一行なので、型の強さを使う価値がある。
 * 他の章では全て直接の言い切りに直した。
 */
export const BRAND_MESSAGE = {
  label: "PHILOSOPHY",
  headline: BRAND.beyond,
  sub: ["いま動かない車にも、", "値段はつきます。"],
  body: "十年放置された車でも、事故で潰れた車でも。まだ走れるのか、部品として使えるのか、海外でなら買い手がつくのか。そこまで見てから値段を出します。引き取って、運んで、整えて、次に乗る人へ渡すところまでがうちの仕事です。",
} as const;

/*
 * SCENE 04 — THE UNSEEN
 * 状態を列挙した「情報」ではなく、一語ずつ視界に結んでは消える体験にする。
 * カード化・リスト化しない。1画面に1語だけを置き、余白に語らせる。
 */
export const UNSEEN = {
  a11yHeading: "私たちが価値を見出す車の状態",
  words: ["不動車。", "事故車。", "長年乗り続けた車。", "価値がわからない車。"],
  closing: "それでも、次がある。",
} as const;

/*
 * SELL = お客様が「売る」= FORESIGHTが買い取る。
 * BUY  = お客様が「買う」= FORESIGHTが販売する。
 * 顧客目線の命名(NAVの表記と一致させる)。旧実装ではBUY/SELLの中身が
 * 逆に割り当てられていたため、CEO確認のうえ入れ替えた。
 */
/*
 * TODO(CEO): ここに実物の情報が入ると、伝わり方が一段変わる。
 *   - 対応エリア(「関東一円」など)
 *   - 買取の実績台数、または創業年
 *   - 実際の買取事例(車種・年式・状態)
 * 数字と固有名詞は事実なので、こちらでは作らずCEOに埋めてもらう。
 * 現状のコピーは事実を足さずにトーンだけ整えた状態。
 */

/*
 * 各章の `plain` と `services` について。
 *
 * 業界用語を先に出さない。「不動車」「レッカー」「オークション代行」は、
 * 車を売り買いしたことがない人には通じない。
 * まず普通の言葉で何ができるかを言い、そのあとに用語を並べる。
 *
 * services は現行の本文から根拠が取れるものだけにしてある。
 * 「名義変更の代行」「廃車手続き」などは本文に記述が無いので入れていない。
 * TODO(CEO): 実際に扱っているサービスがあれば追記する。
 */
export const SELL = {
  label: "SELL",
  index: "01",
  plain: [
    "動かない車も、事故で壊れた車も買い取ります。",
    "こちらから引き取りに伺うので、運ぶ手配はいりません。",
  ],
  services: ["中古車の買取", "事故車・不動車の買取", "引き取り・レッカーの手配"],
  headline: ["走れなくても、", "終わりじゃない。"],
  /* 状態の列挙。同じ位置で1語ずつ入れ替えて読ませる */
  fragments: [
    "不動車。",
    "事故車。",
    "故障車。",
    "過走行車。",
    "車検切れ。",
    "長年眠っていた車。",
  ],
  bridge: "それでも、値段はつきます。",
  /* セクション内で最も強い一行 */
  core: ["動かないなら、", "取りに行く。"],
  body: "エンジンがかからない。事故で歪んだ。車検が切れて十年置いたまま。そういう車の相談が一番多いです。動かせない車はこちらから引き取りに伺うので、レッカーを手配していただく必要はありません。",
  cta: CTA.sell,
} as const;

export const BUY = {
  label: "BUY",
  index: "02",
  plain: [
    "整備をすませた中古車を販売しています。",
    "一台ずつ状態を確かめてからお渡しします。",
  ],
  services: ["中古車の販売", "納車前の整備・点検"],
  headline: ["必要な車を、", "必要な人へ。"],
  lead: ["台数は多くありません。", "そのかわり、状態を見ていない車は置いていません。"],
  body: "仕入れた車は一台ずつ下回りまで見て、直すところを直してから並べます。台数を競っても、買う人には関係のない話なので。",
  /* 手順。3つ並べるのは「見て・直して・渡す」の実務がそのまま3工程だから */
  steps: [
    { n: "01", t: "見極める", d: "下回りや修復歴まで、こちらの目で確かめます。" },
    { n: "02", t: "整える", d: "消耗品を替えて、次の人が乗れる状態にします。" },
    { n: "03", t: "つなぐ", d: "その一台を、必要としている人へ渡します。" },
  ],
  cta: CTA.find,
} as const;

export const FIND = {
  label: "FIND",
  index: "03",
  plain: [
    "全国のオークションから、ご希望の車をお探しします。",
    "お店に置いていない車でも、探して仕入れられます。",
  ],
  services: ["オークション代行", "車両のお探し"],
  headline: ["欲しい一台は、", "たいてい他所にある。"],
  lead: ["業者向けのオークションには、", "毎日ものすごい数の車が出ます。"],
  body: "年式や色、走行距離、予算。条件を伺って、その中から合う車を探します。状態はこちらで確認してから入札するので、写真だけで決めることはありません。市場に出る前の車が回ってくることもあります。",
  core: ["探すところから、", "任せてください。"],
  cta: CTA.find,
} as const;

export const CONTACT = {
  label: "CONTACT",
  /* 大見出しは意図した位置で改行する(自動折返しだと「車の話 / を。」のように割れる) */
  headline: ["まずは、", "車の話を。"],
  fragments: ["動かない。", "古い。", "傷がある。", "値段がつくのか分からない。"],
  closing: "どれでも構いません。",
  body: "売ると決めていなくて大丈夫です。いくらになるか知りたいだけ、という相談が一番多いです。車種と、だいたいの年式だけでも分かれば話せます。",
  form: {
    typeLabel: "ご相談の種類",
    types: ["車を売りたい", "車を探している", "その他"],
    name: "お名前",
    contact: "メールアドレス",
    tel: "電話番号",
    message: "車の状態・ご相談内容",
    messagePlaceholder:
      "車種・年式・走行距離・状態など、わかる範囲でかまいません。",
    submit: "送信する",
    required: "必須",
    optional: "任意",
  },
} as const;

/*
 * 会社情報。
 * 未提供の項目は実在情報を創作せず、プレースホルダであることが
 * 明らかにわかる表記のままにしてある(TODO)。
 */
export const COMPANY = {
  label: "COMPANY",
  rows: [
    { k: "商号", v: "Foresight（フォーサイト）" },
    { k: "事業内容", v: "中古車買取／中古車販売／オークション代行" },
    { k: "所在地", v: "TODO：所在地未確定" },
    { k: "電話番号", v: "TODO：電話番号未確定" },
    { k: "営業時間", v: "TODO：営業時間未確定" },
    { k: "古物商許可番号", v: "TODO：許可番号未確定" },
  ],
} as const;
