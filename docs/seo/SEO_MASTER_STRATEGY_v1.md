# ArchiCompass SEO Master Strategy v1

**Status:** working launch specification  
**Market priority:** Poland first, English as a complete companion language  
**Indexation policy:** do not activate search visibility before the first 15 bilingual guides are finished and reviewed

## 1. Product meaning for search

### Positioning

ArchiCompass is a **Residential Project Definition Platform**. It helps a homeowner turn scattered inspiration, practical constraints and project goals into a structured brief, then find suitable interior designers or studios.

It is not positioned as a generic interior-design blog, a gallery of images or a passive directory of contractors. Content must reinforce the product loop:

`inspiration -> structured brief -> matching -> conversation -> project`

### Search promise

For people planning a home, apartment or renovation, ArchiCompass should become the clear source for understanding what to decide, how to prepare, what a designer needs to know, and how to select the right professional in Poland.

### Evidence rule

Do not invent demand, savings, satisfaction scores, customer quotes, professional certifications, pricing averages or research results. Mark product capabilities as product capabilities, quote authoritative sources for external facts, and label opinions as editorial guidance. When aggregated platform data becomes reliable and privacy-safe, it can become a proprietary evidence layer.

## 2. Goals and success signals

The goal is not traffic in isolation. The goal is relevant discovery by people who may plan a residential project or engage a professional.

| Horizon | Primary outcome | Evidence to track |
| --- | --- | --- |
| First 30 days after launch | Clean discovery and crawl coverage | indexed PL/EN URLs, crawl errors, sitemap processing, branded queries |
| 90 days | Early topical relevance | impressions by guide cluster, qualified directory visits, brief starts from organic pages |
| 180 days | Commercial search contribution | visibility for planning and city queries, guide-to-brief conversion, designer-profile visits from organic search |

Never treat a ranking as guaranteed. Search demand, competition and indexing are external variables; the platform controls quality, usefulness, structure and technical accessibility.

## 3. Information architecture

### Public product pages

| Section | Primary purpose | Main CTA |
| --- | --- | --- |
| `/` | Explain the product decision loop | Start AI Project Compass |
| `/project-compass` | Turn reference photos and requirements into a brief | Analyse inspirations |
| `/designers` | Browse and compare designers and studios | View a profile / send brief |
| `/designers/<slug>` | Evaluate one professional | Send a brief / start conversation |
| `/inspiration` | Visual, trend and editorial discovery | Read / save / start a brief |
| `/services-and-pricing` | Explain participation and platform services | Join / create profile |
| `/guides` | Evergreen planning knowledge | Read a guide / start a brief |

Every English equivalent uses the `/en` prefix. The information architecture, components, structured data and CTA placement must stay equivalent between Polish and English.

### Content destinations

- **Guides:** durable educational pages with high search intent.
- **Inspiration Hub:** visual inspiration, editorial stories, trends and discoverable projects.
- **Directory and city pages:** local professional discovery.
- **Profile pages:** unique first-party professional information and portfolios.
- **Commercial product pages:** AI Project Compass, designer catalogue, pricing and participation pages.

Avoid thin combinations of every city, style, room and budget. A page is only published when it has unique value, accurate content and a clear user action.

## 4. Topical silos

The first guide library is organised around the actual order in which a homeowner makes decisions.

1. **Project definition**: goals, brief, scope, timeline and checklist.
2. **Finding a professional**: roles, selection and designer matching.
3. **Budget and renovation**: cost, planning, value and trade-offs.
4. **Style and inspiration**: visual direction, styles, rooms and trends.
5. **Execution**: communication, decisions, supervision and handover.

Each guide belongs to one primary silo, may point to adjacent silos, and always links back to one product action. A guide should answer a question completely; it should not force a reader through a chain of thin pages to obtain a basic answer.

## 5. Content standards for Google and AI search

Every guide must include, where relevant:

- a clear H1 that answers the search need;
- a short executive summary near the top;
- a navigable table of contents for longer pieces;
- plain-language definitions before jargon;
- a step-by-step process, checklists or decision table;
- concrete examples with clearly stated assumptions;
- trade-offs, limits and common mistakes;
- a frequently asked questions section with direct answers;
- a useful next action inside ArchiCompass;
- an author/editor and a reviewed date when editorial processes are in place.

This shape helps people scan a page and gives search systems an unambiguous representation of the content. It is not a promise of citation or ranking by any AI system.

## 6. Polish and English policy

Polish is the primary market language. English is a complete alternative for international readers, not a partial translation layer.

- System labels, navigation, filters, metadata and structured data must be localized for the active site locale.
- User-created profile and portfolio copy may fall back to its available language when the author provides only one version.
- Editorial guides must have intentionally written PL and EN versions. English must preserve the meaning and usefulness, but does not need to mirror Polish sentence-by-sentence.
- Every guide has reciprocal `hreflang` links and a Polish `x-default` URL.
- Do not mix Polish and English paragraphs in one locale's article.

## 7. Internal linking engine

For every published guide, include at least five contextually useful outgoing links and ensure at least three relevant incoming links once the library is large enough. Required link categories:

1. One link to the primary guide or adjacent planning guide.
2. One link to AI Project Compass.
3. One link to the designer directory or a relevant city page.
4. One link to a related style, room or Inspiration Hub page when it helps.
5. One link to a commercial or participation page only when natural.

Links are editorial recommendations, not a mechanical keyword template. Use descriptive anchor text, avoid repeated exact-match anchors, and never add a link merely to meet a quota.

## 8. Commercial and local discovery

The commercial path is:

`planning query -> guide -> AI Project Compass or directory -> profile -> brief/conversation`

City pages and professional profiles are the eventual local SEO layer. They must show actual location, service format, specialties, portfolio evidence and current profile information. A page must not claim a professional works in a city merely because the city is near a selected location.

As genuine profile density grows, expand high-value city pages such as Warsaw, Krakow, Wroclaw, Gdansk, Poznan and Lodz. Build unique local guidance and curated catalogue context before expanding to long-tail locations.

## 9. Structured data and metadata

Use only schema that is visible and supported by the page:

- `Organization` and `WebSite` globally;
- `BreadcrumbList` on hierarchical pages;
- `Article` on editorial pages;
- `FAQPage` only when the questions and answers are visible;
- `Person` or `Organization` for real designer/studio profiles where data is accurate;
- `ImageObject` only when the page can provide reliable image details.

Each public page needs a unique title, meta description, canonical URL, Open Graph image and localized ALT text. Metadata must describe what a visitor will actually find, not repeat unverified superlatives.

## 10. Technical SEO rules

- One canonical URL per locale and reciprocal `hreflang` values.
- Public pages render meaningful PL or EN content before client hydration.
- Authenticated, account, admin and API routes remain excluded from crawling.
- Use `noindex` for drafts, private routes, test pages and non-launch content.
- Keep the sitemap limited to canonical, published and indexable URLs.
- Use responsive, optimized images with accurate ALT text; avoid using a large source image where a smaller one is suitable.
- Protect Core Web Vitals by avoiding layout shifts, unnecessary client work and unbounded third-party scripts.
- Validate final HTML, canonical links, robots, sitemap and JSON-LD for both locales after deployment.

## 11. Controlled indexation launch

### Pre-launch (current state)

The platform stays accessible to users. Search engines receive `noindex` for public pages, `robots.txt` does not publish a sitemap, and `sitemap.xml` is empty. This prevents an incomplete content set from becoming the first indexed representation of the brand.

### Launch criteria

Do not enable indexing until all are true:

- 15 guide topics have completed Polish and English versions;
- all 30 guide URLs pass copy, link, image, ALT and metadata review;
- all facts, pricing statements and product claims are checked;
- no drafts, placeholders or test profiles can be crawled;
- PL and EN build successfully and render the correct language in HTML;
- schema and canonical checks pass;
- the latest production deployment is healthy;
- the team approves exact title and spelling before submission.

### Launch action

1. Set `NEXT_PUBLIC_SEO_INDEXING_ENABLED=true` in both production Vercel projects.
2. Redeploy both the Polish and English production builds.
3. Check PL and EN HTML for `index,follow`, canonical and hreflang output.
4. Check that `robots.txt` announces the sitemap and that the sitemap contains only approved canonical pages.
5. Then add the domain to Google Search Console and Bing Webmaster Tools, submit the sitemap and monitor coverage. Do not submit the sitemap before this point.

If a critical public issue appears, set the variable back to any value other than `true` and redeploy; then investigate before reopening indexing.

## 12. Editorial publishing specification

Before publishing, an editor must complete the checklist in `PUBLISHING_CHECKLIST.md`. The Admin Content editor already supports bilingual title/excerpt/author/cover ALT/meta fields, a rich document editor, inline images, ALT text, tables and FAQ blocks. Use this system rather than encoding article content directly in application code.

An article needs a real cover, meaningful inline visuals and image descriptions that explain the image's subject and role in the article. Do not write ALT text as a list of SEO keywords.

## 13. Measurement and learning loop

After indexation begins, review monthly:

- crawl/index coverage and excluded reasons;
- impressions, queries, clicks and CTR by page and language;
- guide-to-AI-Project-Compass starts;
- guide-to-directory/profile visits;
- brief starts and conversations attributable to organic entry pages;
- content gaps found in search queries and user questions;
- page performance, image weight and errors.

Use this information to improve existing high-potential guides before producing large quantities of new content. Avoid updating dates without meaningful content changes.

## 14. Anti-patterns

Do not:

- publish translated fragments as if they were an English edition;
- make location pages with duplicated text and swapped city names;
- use generated images or claims without checking that they match the article;
- expose drafts or test accounts in a sitemap;
- add FAQ markup for questions that do not appear on the page;
- write for a search engine at the expense of a homeowner making a decision;
- treat AI-generated text as publish-ready without an editorial review.

## 15. Decision log

| Decision | Status | Rationale |
| --- | --- | --- |
| Polish is the default public language | active | Poland-first product and market focus |
| English is a full `/en` companion edition | active | international accessibility without replacing Polish |
| First launch set is 15 bilingual guides | active | enough breadth to establish a coherent initial planning library |
| Indexing stays off until launch criteria are met | active | protects first crawl/index representation |
| Existing CMS is the publication surface | active | supports bilingual rich content and avoids code-only publishing |
| Search Console/Bing submission happens after the release | pending | user will complete after final spelling review |
