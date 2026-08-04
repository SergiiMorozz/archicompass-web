# ArchiCompass Guide Publishing Checklist

Use this checklist for every Polish and English guide before changing its status to published. It is intentionally strict: a published URL represents the brand in search, AI answers and direct sharing.

## Content and language

- [ ] The topic has a clear user question and a useful answer.
- [ ] The PL article is written and reviewed as Polish.
- [ ] The EN article is written and reviewed as English.
- [ ] The two articles carry the same meaning and level of detail, but do not read as literal translations.
- [ ] The H1 is unique, accurate and matches the search intent.
- [ ] There is a concise executive summary.
- [ ] Long pieces have a navigable contents section.
- [ ] The article includes practical steps, a checklist, example or table.
- [ ] Claims, costs, dates and recommendations have been checked.
- [ ] The article includes 8-10 real FAQs when FAQ is appropriate.
- [ ] The reader has a logical next step in ArchiCompass.

## Images and rich content

- [ ] A cover image is relevant, high quality and safe to use.
- [ ] Cover ALT exists in PL and EN.
- [ ] Every inline image has a relevant PL and EN ALT text.
- [ ] No image contains personal data, an address or confidential project material without permission.
- [ ] Tables are understandable on a mobile screen and in both languages.
- [ ] Rich text formatting improves readability rather than substituting for document structure.

## Metadata and structured data

- [ ] Title and meta description exist in PL and EN.
- [ ] The focus keyword is an editorial reference, not a reason to over-repeat words in the article.
- [ ] Canonical, PL/EN hreflang and Open Graph data resolve to the correct locale URLs.
- [ ] Article schema matches visible title, author, date and image.
- [ ] FAQ schema exists only for visible FAQ items.
- [ ] Breadcrumbs show the actual public path.

## Internal links

- [ ] The guide links to 3-5 genuinely relevant pages.
- [ ] It includes a contextual link to AI Project Compass when a brief helps.
- [ ] It includes a directory or city-page link when selecting a professional is relevant.
- [ ] Incoming links have been added from related guides where possible.
- [ ] Links use human-readable anchors and work in PL and EN.

## Release validation

- [ ] The guide renders correctly in PL and EN desktop and mobile layouts.
- [ ] No placeholder, test copy, untranslated system label or broken image is visible.
- [ ] The public HTML contains the correct locale, title and description.
- [ ] The correct content and profile language falls back only when an author has not supplied the selected locale.
- [ ] The page has been checked after production deployment.

## Indexation launch checklist

Complete this only after all 15 guide topics are published in PL and EN.

- [ ] Every item above passes for all 30 URLs.
- [ ] The public sitemap contains only approved, canonical pages.
- [ ] No draft, test page, account page, admin page or placeholder profile is indexable.
- [ ] PL/EN builds and locale verification pass.
- [ ] `NEXT_PUBLIC_SEO_INDEXING_ENABLED=true` has been added to both production deployments and both projects were redeployed.
- [ ] `robots.txt` advertises the sitemap and the sitemap has been checked.
- [ ] Google Search Console and Bing Webmaster Tools are connected only after the final language and spelling check.
