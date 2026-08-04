# ArchiCompass Launch SEO System v1

This directory is the operating specification for organic search and AI-search
content. It is deliberately more than an article backlog: it connects product
positioning, bilingual publishing, technical quality, internal links and the
controlled indexation launch.

## Governing rule

ArchiCompass is **not indexed before the first complete release of 15 guides in
Polish and English**. The product can be used normally during preparation.

The code enforces that rule through `NEXT_PUBLIC_SEO_INDEXING_ENABLED`:

- missing or any value other than `true`: every public page emits `noindex`,
  `robots.txt` does not advertise a sitemap, and `sitemap.xml` is empty;
- `true`: normal indexability and the full bilingual sitemap are enabled.

This is a build-time setting. Enable it only after the launch checklist passes
for all 15 PL and 15 EN guide URLs, then redeploy both production projects.

## Documents

- [SEO Master Strategy v1](./SEO_MASTER_STRATEGY_v1.md): positioning,
  information architecture, topical authority, technical standards and launch
  process.
- [Content Blueprint v1](./CONTENT_BLUEPRINT_v1.md): the first 15 bilingual
  guides, their purpose and linking requirements.
- [Publishing Checklist](./PUBLISHING_CHECKLIST.md): a repeatable editorial and
  technical acceptance checklist for each release.

## Publishing sequence

1. Create a draft in the existing Admin Content editor.
2. Write the Polish and English versions as native articles, not machine
   translations.
3. Add a cover image, inline images, bilingual ALT text, metadata, FAQ and
   internal links.
4. Have another person check each language and all claims before publication.
5. Keep the article published only after its PL and EN fields are complete.
6. After all 15 topics are complete, run the launch checklist and enable the
   single indexation switch in both Vercel projects.

The first guide does not use a `/pl` prefix. The public convention is:

- Polish: `https://archicompass.pl/guides/<polish-slug>`
- English: `https://archicompass.pl/en/guides/<english-slug>`

Until the dedicated Guides routes are activated, drafts can live in the
existing editor without public navigation or search visibility.
