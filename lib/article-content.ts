import type { SiteLocale } from "@/lib/site-locale";

export type ContentTone = "body" | "lead" | "small";
export type ArticleBlockType = "paragraph" | "heading" | "image" | "table" | "quote" | "callout" | "faq" | "divider" | "rich_text";

export type ArticleTable = {
  caption_pl: string;
  caption_en: string;
  headers_pl: string[];
  headers_en: string[];
  rows_pl: string[][];
  rows_en: string[][];
};

export type ArticleBlock = {
  id: string;
  type: ArticleBlockType;
  content_pl?: string;
  content_en?: string;
  tone?: ContentTone;
  level?: 2 | 3 | 4;
  image_url?: string;
  storage_path?: string;
  alt_pl?: string;
  alt_en?: string;
  caption_pl?: string;
  caption_en?: string;
  table?: ArticleTable;
  question_pl?: string;
  question_en?: string;
  answer_pl?: string;
  answer_en?: string;
  link_url?: string;
  link_label_pl?: string;
  link_label_en?: string;
  html_pl?: string;
  html_en?: string;
  storage_paths?: string[];
};

export type ArticleLocalizationFields = {
  title: string;
  excerpt: string;
  body: string;
  author_name: string | null;
  image_url: string | null;
  title_pl?: string | null;
  title_en?: string | null;
  excerpt_pl?: string | null;
  excerpt_en?: string | null;
  author_name_pl?: string | null;
  author_name_en?: string | null;
  cover_alt_pl?: string | null;
  cover_alt_en?: string | null;
  meta_title_pl?: string | null;
  meta_title_en?: string | null;
  meta_description_pl?: string | null;
  meta_description_en?: string | null;
  focus_keyword_pl?: string | null;
  focus_keyword_en?: string | null;
  content_blocks?: unknown;
};

function cleanText(value: unknown, maxLength = 50000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanStringArray(value: unknown, limit = 8) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, limit).map((item) => cleanText(item, 240));
}

function cleanMatrix(value: unknown, rows = 20, columns = 8) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, rows).map((row) => cleanStringArray(row, columns));
}

function safeUrl(value: unknown) {
  const url = cleanText(value, 1200);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&quot;/gi, "\"")
    .replace(/&#0*39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

const allowedRichTags = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "ul", "ol", "li", "blockquote", "hr",
  "figure", "img", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "a", "font", "span", "div",
]);

function safeRichAttributes(tag: string, source: string) {
  const attributes: Record<string, string> = {};
  const attributePattern = /([a-zA-Z:-]+)\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s\"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(source))) {
    const name = match[1].toLowerCase();
    const value = decodeBasicEntities(match[2] ?? match[3] ?? match[4] ?? "");
    if ((name === "href" || name === "src") && safeUrl(value)) attributes[name] = safeUrl(value);
    if ((tag === "img" && name === "alt") || (tag === "a" && name === "title")) attributes[name] = value.slice(0, 500);
    if (tag === "font" && name === "size" && /^[1-7]$/.test(value)) attributes[name] = value;
  }
  return Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join("");
}

// The document editor stores only a deliberately small HTML subset. It is safe
// to render on the server while retaining the familiar Word-like experience.
export function sanitizeRichArticleHtml(value: unknown, maxLength = 120000) {
  const source = typeof value === "string" ? value.slice(0, maxLength) : "";
  if (!source) return "";
  return source.replace(/<[^>]*>|[^<]+/g, (token) => {
    if (!token.startsWith("<")) return escapeHtml(decodeBasicEntities(token));
    const closing = /^<\s*\/\s*([a-zA-Z0-9]+)/.exec(token);
    if (closing) return allowedRichTags.has(closing[1].toLowerCase()) ? `</${closing[1].toLowerCase()}>` : "";
    const opening = /^<\s*([a-zA-Z0-9]+)/.exec(token);
    if (!opening) return "";
    const tag = opening[1].toLowerCase();
    if (!allowedRichTags.has(tag)) return "";
    if (tag === "img") {
      const attributes = safeRichAttributes(tag, token);
      return /\ssrc=/.test(attributes) ? `<img${attributes}>` : "";
    }
    if (tag === "br" || tag === "hr") return `<${tag}>`;
    return `<${tag}${safeRichAttributes(tag, token)}>`;
  }).trim();
}

export function richArticlePlainText(value: string) {
  return decodeBasicEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function safeBlockId(value: unknown, index: number) {
  const id = cleanText(value, 80);
  return /^[a-zA-Z0-9_-]{4,80}$/.test(id) ? id : `block-${index + 1}`;
}

function normalizedTable(value: unknown): ArticleTable {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const headersPl = cleanStringArray(source.headers_pl);
  const headersEn = cleanStringArray(source.headers_en);
  const columnCount = Math.max(headersPl.length, headersEn.length, 1);
  const normalizeRows = (rows: string[][]) => rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] || ""));
  return {
    caption_pl: cleanText(source.caption_pl, 240),
    caption_en: cleanText(source.caption_en, 240),
    headers_pl: Array.from({ length: columnCount }, (_, index) => headersPl[index] || ""),
    headers_en: Array.from({ length: columnCount }, (_, index) => headersEn[index] || ""),
    rows_pl: normalizeRows(cleanMatrix(source.rows_pl)),
    rows_en: normalizeRows(cleanMatrix(source.rows_en)),
  };
}

export function parseArticleBlocks(value: unknown): ArticleBlock[] {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(source)) return [];

  return source.slice(0, 80).flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const block = raw as Record<string, unknown>;
    const type = cleanText(block.type, 24) as ArticleBlockType;
    if (!(["paragraph", "heading", "image", "table", "quote", "callout", "faq", "divider", "rich_text"] as ArticleBlockType[]).includes(type)) return [];
    const base: ArticleBlock = { id: safeBlockId(block.id, index), type };

    if (type === "divider") return [base];
    if (type === "rich_text") return [{
      ...base,
      html_pl: sanitizeRichArticleHtml(block.html_pl),
      html_en: sanitizeRichArticleHtml(block.html_en),
      storage_paths: cleanStringArray(block.storage_paths, 80).filter((path) => path.includes("/inspiration/")),
    }];
    if (type === "table") return [{ ...base, table: normalizedTable(block.table) }];
    if (type === "image") {
      const imageUrl = safeUrl(block.image_url);
      return imageUrl ? [{
        ...base,
        image_url: imageUrl,
        storage_path: cleanText(block.storage_path, 1000),
        alt_pl: cleanText(block.alt_pl, 240),
        alt_en: cleanText(block.alt_en, 240),
        caption_pl: cleanText(block.caption_pl, 500),
        caption_en: cleanText(block.caption_en, 500),
      }] : [];
    }
    if (type === "faq") return [{
      ...base,
      question_pl: cleanText(block.question_pl, 500),
      question_en: cleanText(block.question_en, 500),
      answer_pl: cleanText(block.answer_pl, 5000),
      answer_en: cleanText(block.answer_en, 5000),
    }];
    if (type === "callout") return [{
      ...base,
      content_pl: cleanText(block.content_pl, 5000),
      content_en: cleanText(block.content_en, 5000),
      link_url: safeUrl(block.link_url),
      link_label_pl: cleanText(block.link_label_pl, 180),
      link_label_en: cleanText(block.link_label_en, 180),
    }];
    return [{
      ...base,
      content_pl: cleanText(block.content_pl, 10000),
      content_en: cleanText(block.content_en, 10000),
      tone: block.tone === "lead" || block.tone === "small" ? block.tone : "body",
      level: block.level === 3 || block.level === 4 ? block.level : 2,
    }];
  });
}

export function localizedText(locale: SiteLocale, polish: string | null | undefined, english: string | null | undefined, fallback = "") {
  const primary = locale === "pl" ? cleanText(polish) : cleanText(english);
  const secondary = locale === "pl" ? cleanText(english) : cleanText(polish);
  return primary || secondary || fallback;
}

export function localizedBlockText(block: ArticleBlock, locale: SiteLocale, field = "content") {
  return localizedText(
    locale,
    block[`${field}_pl` as keyof ArticleBlock] as string | undefined,
    block[`${field}_en` as keyof ArticleBlock] as string | undefined,
  );
}

export function localizedRichArticleHtml(block: ArticleBlock, locale: SiteLocale) {
  return localizedText(locale, block.html_pl, block.html_en);
}

function legacyInlineHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export function articleBlocksToRichHtml(blocks: ArticleBlock[], locale: SiteLocale) {
  return blocks.map((block) => {
    if (block.type === "rich_text") return localizedRichArticleHtml(block, locale);
    if (block.type === "divider") return "<hr>";
    if (block.type === "paragraph") {
      const value = localizedBlockText(block, locale);
      return value ? `<p>${legacyInlineHtml(value)}</p>` : "";
    }
    if (block.type === "heading") {
      const value = localizedBlockText(block, locale);
      const level = block.level || 2;
      return value ? `<h${level}>${legacyInlineHtml(value)}</h${level}>` : "";
    }
    if (block.type === "image" && block.image_url) {
      const alt = localizedText(locale, block.alt_pl, block.alt_en, "ArchiCompass Inspiration Hub");
      const caption = localizedText(locale, block.caption_pl, block.caption_en);
      return `<figure><img src="${escapeHtml(block.image_url)}" alt="${escapeHtml(alt)}">${caption ? `<figcaption>${legacyInlineHtml(caption)}</figcaption>` : ""}</figure>`;
    }
    if (block.type === "table" && block.table) {
      const headers = locale === "pl" ? block.table.headers_pl : block.table.headers_en;
      const fallbackHeaders = locale === "pl" ? block.table.headers_en : block.table.headers_pl;
      const rows = locale === "pl" ? block.table.rows_pl : block.table.rows_en;
      const fallbackRows = locale === "pl" ? block.table.rows_en : block.table.rows_pl;
      const displayHeaders = headers.map((header, index) => header || fallbackHeaders[index] || "");
      const displayRows = rows.length ? rows : fallbackRows;
      const caption = localizedText(locale, block.table.caption_pl, block.table.caption_en);
      return `<table>${caption ? `<caption>${legacyInlineHtml(caption)}</caption>` : ""}<thead><tr>${displayHeaders.map((header) => `<th>${legacyInlineHtml(header)}</th>`).join("")}</tr></thead><tbody>${displayRows.map((row) => `<tr>${displayHeaders.map((_, index) => `<td>${legacyInlineHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }
    if (block.type === "quote") {
      const value = localizedBlockText(block, locale);
      return value ? `<blockquote>${legacyInlineHtml(value)}</blockquote>` : "";
    }
    if (block.type === "faq") {
      const question = localizedBlockText(block, locale, "question");
      const answer = localizedBlockText(block, locale, "answer");
      return question && answer ? `<h3>${legacyInlineHtml(question)}</h3><p>${legacyInlineHtml(answer)}</p>` : "";
    }
    if (block.type === "callout") {
      const value = localizedBlockText(block, locale);
      const label = localizedText(locale, block.link_label_pl, block.link_label_en);
      const link = safeUrl(block.link_url);
      return `${value ? `<blockquote>${legacyInlineHtml(value)}</blockquote>` : ""}${link && label ? `<p><a href="${escapeHtml(link)}">${legacyInlineHtml(label)}</a></p>` : ""}`;
    }
    return "";
  }).filter(Boolean).join("\n");
}

export function localizeArticle<T extends ArticleLocalizationFields>(article: T, locale: SiteLocale) {
  const blocks = parseArticleBlocks(article.content_blocks);
  const title = localizedText(locale, article.title_pl, article.title_en, article.title);
  const excerpt = localizedText(locale, article.excerpt_pl, article.excerpt_en, article.excerpt);
  return {
    ...article,
    title,
    excerpt,
    author_name: localizedText(locale, article.author_name_pl, article.author_name_en, article.author_name || "") || null,
    cover_alt: localizedText(locale, article.cover_alt_pl, article.cover_alt_en, title),
    meta_title: localizedText(locale, article.meta_title_pl, article.meta_title_en, title),
    meta_description: localizedText(locale, article.meta_description_pl, article.meta_description_en, excerpt),
    focus_keyword: localizedText(locale, article.focus_keyword_pl, article.focus_keyword_en),
    content_blocks: blocks,
  };
}

export function articleBlocksPlainText(blocks: ArticleBlock[], locale: SiteLocale) {
  return blocks
    .flatMap((block) => {
      if (block.type === "rich_text") return [richArticlePlainText(localizedRichArticleHtml(block, locale))];
      if (block.type === "table" && block.table) {
        const headers = locale === "pl" ? block.table.headers_pl : block.table.headers_en;
        const rows = locale === "pl" ? block.table.rows_pl : block.table.rows_en;
        return [headers.join(" | "), ...rows.map((row) => row.join(" | "))];
      }
      if (block.type === "faq") return [localizedBlockText(block, locale, "question"), localizedBlockText(block, locale, "answer")];
      return [localizedBlockText(block, locale)];
    })
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 50000);
}

export function articleReadingMinutes(blocks: ArticleBlock[], legacyBody: string) {
  const words = articleBlocksPlainText(blocks, "pl") || legacyBody;
  return Math.max(1, Math.ceil(words.trim().split(/\s+/).filter(Boolean).length / 220));
}

export function articleFaqItems(blocks: ArticleBlock[], locale: SiteLocale) {
  return blocks
    .filter((block) => block.type === "faq")
    .map((block) => ({ question: localizedBlockText(block, locale, "question"), answer: localizedBlockText(block, locale, "answer") }))
    .filter((item) => item.question && item.answer);
}

export function hasRenderableArticleBlocks(blocks: ArticleBlock[], locale: SiteLocale) {
  return blocks.some((block) => {
    if (block.type === "rich_text") return Boolean(richArticlePlainText(localizedRichArticleHtml(block, locale)) || /<img\b/i.test(localizedRichArticleHtml(block, locale)));
    if (block.type === "image") return Boolean(block.image_url);
    if (block.type === "table") return Boolean(block.table?.headers_pl.some(Boolean) || block.table?.headers_en.some(Boolean) || block.table?.rows_pl.some((row) => row.some(Boolean)) || block.table?.rows_en.some((row) => row.some(Boolean)));
    if (block.type === "divider") return true;
    if (block.type === "faq") return Boolean(localizedBlockText(block, locale, "question") && localizedBlockText(block, locale, "answer"));
    return Boolean(localizedBlockText(block, locale));
  });
}

export function articleImagePaths(blocks: ArticleBlock[], userId: string) {
  return Array.from(new Set(blocks.flatMap((block) => [block.storage_path || "", ...(block.storage_paths || [])])
    .filter((path) => path.startsWith(`${userId}/inspiration/`))));
}
