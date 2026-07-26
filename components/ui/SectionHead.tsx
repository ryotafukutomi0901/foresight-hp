"use client";

/*
 * セクション冒頭の共通ヘッダー(通し番号 + ラベル + 罫線)。
 * BUY / SELL / AUCTION を「サービスカード3枚」にせず、
 * それぞれ独立した章として見せるための一貫した記名装置。
 */
export default function SectionHead({
  index,
  label,
  id,
}: {
  index?: string;
  label: string;
  id?: string;
}) {
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
