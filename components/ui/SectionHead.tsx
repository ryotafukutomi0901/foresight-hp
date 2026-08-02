"use client";

/*
 * セクション冒頭の共通ヘッダー(通し番号 + ラベル + 罫線)。
 * BUY / SELL / AUCTION を「サービスカード3枚」にせず、
 * それぞれ独立した章として見せるための一貫した記名装置。
 *
 * orientation="vertical" では、ラベルを縦組みにして画面左端に
 * sticky で貼り付ける。本文がその横を流れていく間、章の名前だけが
 * 残り続けるため、「今どの章を読んでいるか」が常に分かる。
 * (リファレンス izanami の h2 が同じ構造。実測で幅18px・sticky)
 */
export default function SectionHead({
  index,
  label,
  id,
  orientation = "horizontal",
}: {
  index?: string;
  label: string;
  id?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <div
        className="pointer-events-none absolute left-0 top-0 hidden h-full lg:block"
        data-section-head
      >
        <div className="sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-5">
          {index ? (
            <span
              aria-hidden
              className="label text-ink-faint [writing-mode:vertical-rl]"
              data-section-head-item
            >
              {index}
            </span>
          ) : null}
          <span
            id={id}
            className="label text-ink [writing-mode:vertical-rl]"
            data-section-head-item
          >
            {label}
          </span>
          <span
            aria-hidden
            className="w-px flex-1 origin-top bg-rule-strong"
            data-section-rule
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5" data-section-head>
      {index ? (
        <span
          aria-hidden
          className="label text-ink-faint"
          data-section-head-item
        >
          {index}
        </span>
      ) : null}
      <span id={id} className="label text-ink" data-section-head-item>
        {label}
      </span>
      <span
        aria-hidden
        className="h-px flex-1 origin-left bg-rule-strong"
        data-section-rule
      />
    </div>
  );
}
