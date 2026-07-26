/*
 * サイト全文のコピーを1箇所に集約する。
 * 文言修正がコンポーネント横断にならないようにするため、
 * 各セクションはここからのみ文言を読む。
 *
 * 方針: BUY / SELL / AUCTION は「何をやれるか」をメッセージとして伝える。
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

export const NAV = [
  { label: "BUY", href: "#buy", ja: "車を売る" },
  { label: "SELL", href: "#sell", ja: "車を探す" },
  { label: "AUCTION", href: "#auction", ja: "オークション代行" },
  { label: "CONTACT", href: "#contact", ja: "お問い合わせ" },
] as const;

export const CTA = {
  sell: { label: "車を売る", href: "#contact" },
  find: { label: "車を探す", href: "#contact" },
} as const;

export const HERO = {
  headline: ["車の未来を、", "見通す。"],
  sub: ["どんな状態の車にも、", "次の可能性がある。"],
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

export const BRAND_MESSAGE = {
  label: "PHILOSOPHY",
  headline: BRAND.beyond,
  sub: ["どんな状態の車にも、", "次の可能性がある。"],
  body: "車の現在の状態は、その車の価値ではない。私たちは状態の先にある可能性を見て、買取り、運び、整え、次の人へつなぐ。",
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

export const BUY = {
  label: "BUY",
  index: "01",
  headline: ["走れなくても、", "終わりじゃない。"],
  /* 状態の断章。畳みかけるリズムで読ませる */
  fragments: [
    "不動車。",
    "事故車。",
    "故障車。",
    "過走行車。",
    "車検切れ。",
    "長年眠っていた車。",
  ],
  bridge: "それでも、値段はつく。",
  /* セクション内で最も強い一行。独立して置く */
  core: ["動かないなら、", "取りに行く。"],
  body: "エンジンがかからない。事故で歪んだ。十年動かしていない。車検はとうに切れた。そんな車ほど、私たちは状態の先を見る。動かせない車は、こちらから引き取りに伺う。",
  cta: CTA.sell,
} as const;

export const SELL = {
  label: "SELL",
  index: "02",
  headline: ["必要な車を、", "必要な人へ。"],
  lead: ["ここにあるのは、在庫ではない。", "次のオーナーを待っている車だ。"],
  body: "一台ずつ状態を見て、素性を確かめて、渡せる状態にしてから並べる。台数を競わない。その一台が誰のところへ行くのかを考える。",
  /* 「渡す」プロセス。手順の説明ではなく、受け渡しの姿勢として置く */
  steps: [
    { n: "01", t: "見極める", d: "状態と素性を、こちらの目で確かめる。" },
    { n: "02", t: "整える", d: "次の人が安心して乗れる状態にする。" },
    { n: "03", t: "つなぐ", d: "その一台を、必要としている人へ渡す。" },
  ],
  cta: CTA.find,
} as const;

export const AUCTION = {
  label: "AUCTION",
  index: "03",
  headline: ["見つける。", "選ぶ。", "つなぐ。"],
  lead: ["欲しい車が、目の前にあるとは限らない。", "だから、探しに行く。"],
  body: "全国のオークションには、毎日膨大な数の車が流れている。その中から条件に合う一台を探し出し、状態を見極めて、あなたの代わりに競り落とす。まだ市場に出ていない一台まで、追いかける。",
  core: ["必要な車を、", "必要な人へ。"],
  cta: CTA.find,
} as const;

export const CONTACT = {
  label: "CONTACT",
  /* 大見出しは意図した位置で改行する(自動折返しだと「車の話 / を。」のように割れる) */
  headline: ["まずは、", "車の話を。"],
  fragments: ["動かない。", "古い。", "傷がある。", "価値がわからない。"],
  closing: "それでも大丈夫です。",
  body: "査定も相談も、まだ売ると決めていない段階でかまいません。車の状態を教えてください。",
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
