import Link from "next/link";
import type { ArticleBlock } from "@/lib/article-content";
import { localizedBlockText, localizedRichArticleHtml, localizedText } from "@/lib/article-content";
import type { SiteLocale } from "@/lib/site-locale";

function InlineText({ value }: { value: string }) {
  const parts = value.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_")) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
}

function ArticleTable({ block, locale }: { block: ArticleBlock; locale: SiteLocale }) {
  const table = block.table;
  if (!table) return null;
  const headers = locale === "pl" ? table.headers_pl : table.headers_en;
  const alternativeHeaders = locale === "pl" ? table.headers_en : table.headers_pl;
  const rows = locale === "pl" ? table.rows_pl : table.rows_en;
  const alternativeRows = locale === "pl" ? table.rows_en : table.rows_pl;
  const displayHeaders = headers.map((header, index) => header || alternativeHeaders[index] || "");
  const displayRows = rows.length ? rows : alternativeRows;
  const caption = localizedText(locale, table.caption_pl, table.caption_en);
  if (!displayHeaders.some(Boolean) && !displayRows.some((row) => row.some(Boolean))) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-card">
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="border-b border-line px-5 py-3 text-left font-semibold">{caption}</caption> : null}
        <thead className="bg-primary-soft text-foreground">
          <tr>{displayHeaders.map((header, index) => <th key={index} scope="col" className="px-5 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {displayRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-line">
              {displayHeaders.map((_, columnIndex) => <td key={columnIndex} className="px-5 py-3 align-top text-muted">{row[columnIndex] || ""}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArticleRichContent({ blocks, locale }: { blocks: ArticleBlock[]; locale: SiteLocale }) {
  return (
    <div className="grid gap-7 text-lg leading-9 text-foreground">
      {blocks.map((block) => {
        if (block.type === "rich_text") {
          const html = localizedRichArticleHtml(block, locale);
          return html ? <div key={block.id} className="article-rich-content" dangerouslySetInnerHTML={{ __html: html }} /> : null;
        }
        if (block.type === "divider") return <hr key={block.id} className="border-line" />;
        if (block.type === "heading") {
          const value = localizedBlockText(block, locale);
          if (!value) return null;
          const className = "scroll-mt-28 font-bold tracking-tight";
          if (block.level === 3) return <h3 key={block.id} className={`text-2xl ${className}`}><InlineText value={value} /></h3>;
          if (block.level === 4) return <h4 key={block.id} className={`text-xl ${className}`}><InlineText value={value} /></h4>;
          return <h2 key={block.id} className={`text-3xl ${className}`}><InlineText value={value} /></h2>;
        }
        if (block.type === "image" && block.image_url) {
          const alt = localizedText(locale, block.alt_pl, block.alt_en, "ArchiCompass Inspiration Hub");
          const caption = localizedText(locale, block.caption_pl, block.caption_en);
          return (
            <figure key={block.id} className="overflow-hidden rounded-lg border border-line bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.image_url} alt={alt} width="1400" height="900" loading="lazy" className="h-auto w-full object-cover" />
              {caption ? <figcaption className="px-5 py-3 text-sm leading-6 text-muted">{caption}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "table") return <ArticleTable key={block.id} block={block} locale={locale} />;
        if (block.type === "quote") {
          const value = localizedBlockText(block, locale);
          return value ? <blockquote key={block.id} className="border-l-4 border-primary bg-primary-soft px-6 py-5 text-xl font-medium leading-9"><InlineText value={value} /></blockquote> : null;
        }
        if (block.type === "callout") {
          const value = localizedBlockText(block, locale);
          const label = localizedText(locale, block.link_label_pl, block.link_label_en);
          return value || (block.link_url && label) ? (
            <aside key={block.id} className="rounded-lg border border-primary/30 bg-primary-soft p-6">
              {value ? <p className="font-medium leading-8"><InlineText value={value} /></p> : null}
              {block.link_url && label ? <Link href={block.link_url} className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">{label}</Link> : null}
            </aside>
          ) : null;
        }
        if (block.type === "faq") {
          const question = localizedBlockText(block, locale, "question");
          const answer = localizedBlockText(block, locale, "answer");
          return question && answer ? (
            <details key={block.id} className="rounded-lg border border-line bg-card px-5 py-4">
              <summary className="cursor-pointer text-lg font-semibold">{question}</summary>
              <p className="mt-4 leading-8 text-muted"><InlineText value={answer} /></p>
            </details>
          ) : null;
        }
        const value = localizedBlockText(block, locale);
        if (!value) return null;
        const className = block.tone === "lead" ? "text-xl leading-9 text-foreground" : block.tone === "small" ? "text-base leading-7 text-muted" : "text-lg leading-9";
        return <p key={block.id} className={className}><InlineText value={value} /></p>;
      })}
    </div>
  );
}
