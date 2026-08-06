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
  /* 英字ラベルだけだと何の章か伝わらない。日本語の小見出しを添える */
  lead: "私たちの思い",
  /* タイプライターで1行ずつ打つ。2行に割って、行の切り替わりで一拍おく */
  headline: ["SEE BEYOND", "THE CONDITION..."],
  sub: ["あなたの愛車には", "必ず価値があります。"],
  body: "長く乗られた車でも、長年放置された車でも、事故で潰れた車でも。あなたの愛車に価値を見出すのが我々の仕事です。",
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
 * SERVICES — 売る / 買う / 探す の3つを1つの章にまとめる。
 *
 * ═══════════════════════════════════════════════════════════════
 *  以前は Sell / Buy / Find の3セクションに分かれていた。
 *  縦に3つ並ぶと1章あたりの情報が薄まり、スクロールしても
 *  「同じような章がまた来た」としか感じられなかった。
 *
 *  1つの章にタブで束ねると、3つが**並列の選択肢**として一度に見え、
 *  自分がどれに当てはまるかを選んでから読める。
 *
 *  SELL = お客様が「売る」= FORESIGHTが買い取る。
 *  BUY  = お客様が「買う」= FORESIGHTが販売する。
 *  顧客目線の命名で、NAVの表記と一致させている。
 * ═══════════════════════════════════════════════════════════════
 *
 * `audience` は「自分の話かどうか」を最初に判断させるための一行。
 * 見出しより先に読ませたいので、タブの直下に小さく置く。
 *
 * TODO(CEO): 対応エリア・実績台数・創業年が入ると説得力が変わる。
 * 数字と固有名詞は事実なのでこちらでは作らない。
 */
export const SERVICES = {
  label: "OUR SERVICES",
  headline: "一人ひとりに最適な選択を。",
  lead: "売る・買う・探す。それぞれに事情がある。",
  items: [
    {
      id: "sell",
      index: "01",
      label: "SELL",
      audience: "売却を希望される方へ",
      headline: ["どんな状態でも", "買い取り可能"],
      body: "過走行車・車検切れ・不動車・事故車。「もう値段がつかない」と思っている車こそ、まず相談してください。動かせないなら、こちらから取りに行きます。引き取り手配もすべて込みで対応します。",
      points: [
        "不動車・事故車・過走行車・車検切れでも買取可能",
        "レッカー・引き取り手配も対応",
        "査定だけでもOK",
      ],
      cta: { label: "買取を相談する", href: "#contact" },
    },
    {
      id: "buy",
      index: "02",
      label: "BUY",
      audience: "買いたい・乗り換えたい方へ",
      headline: ["乗り換えも、", "一社で完結。"],
      body: "今の車の売却から次の車の購入まで、Foresight ひとつでスムーズに進められます。提携工場があるので、購入後のメンテナンスや車検も安心してお任せください。",
      points: [
        "売却から購入をワンストップで対応",
        "提携工場でアフターサービスあり",
        "全車整備・確認済みのみ販売",
      ],
      cta: { label: "乗り換えを相談する", href: "#contact" },
    },
    {
      id: "find",
      index: "03",
      label: "FIND",
      audience: "希望条件から探したい方へ",
      headline: ["全国から、あなたの", "一台を探し出す。"],
      body: "年式・色・走行距離・予算の条件をもとに、全国各地のオークション・業者ネットワークから探します。車に詳しくなくても安心して相談してください。",
      points: [
        "全国オークション・業者網から探索",
        "的確なヒヤリングで安心した車探し",
        "専門家の目でご希望通りの車を選定",
      ],
      cta: { label: "希望の車を伝える", href: "#contact" },
    },
  ],
} as const;

export type ServiceItem = (typeof SERVICES.items)[number];

export const CONTACT = {
  label: "CONTACT",
  /* 大見出しは意図した位置で改行する(自動折返しだと「車の話 / を。」のように割れる) */
  headline: ["まず、", "相談だけでも。"],
  fragments: ["動かない。", "古い。", "傷がある。", "値段がつくのか分からない。"],
  closing: "どれでも構いません。",
  body: "「いくらになるか知りたいだけ」でも大丈夫です。売る・買う・探す、どのことでもお気軽にどうぞ。車種と、だいたいの年式だけでも分かれば話せます。",
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
