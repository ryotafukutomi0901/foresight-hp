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

export const BRAND_MESSAGE = {
  label: "PHILOSOPHY",
  headline: BRAND.beyond,
  sub: ["どんな状態の車にも、", "次の可能性がある。"],
  /* 情報の列挙ではなく、断章として1行ずつ置く */
  fragments: [
    "不動車。",
    "事故車。",
    "故障した車。",
    "過走行車。",
    "車検が切れた車。",
    "長年眠っていた車。",
    "価値がわからない車。",
  ],
  closing: "それでも、次がある。",
  body: "車の現在の状態は、その車の価値ではない。私たちは状態の先にある可能性を見て、買取り、運び、整え、次の人へつなぐ。",
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
