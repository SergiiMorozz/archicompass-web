# One source, two languages

ArchiCompass is being consolidated onto one source branch. The production locale is selected when a Vercel project builds the application.

## Migration status

The shared foundation, home page, global navigation, account entry flow, password recovery, onboarding, Inspiration Hub, and articles already render from the single typed contract in `main`.

The English Vercel project must continue using the legacy `english` branch until the remaining route groups have been migrated: AI Project Compass, designer directory and profiles, legal pages, client workspace, Designer Studio, and Admin. Switching it to `main` before then would expose Polish legacy labels on English routes.

When those route groups are complete, both Vercel projects will build the same `main` commit with only `NEXT_PUBLIC_SITE_LOCALE` changed.

## Required Vercel variables

Set these in both production projects:

```text
NEXT_PUBLIC_SITE_LOCALE=pl | en
NEXT_PUBLIC_POLISH_SITE_URL=https://archicompass.pl
ENGLISH_ZONE_URL=https://archicompass-web-en.vercel.app
```

`archicompass.pl` is the only public host. English pages are publicly addressed as
`https://archicompass.pl/en/...`; the English Vercel deployment is an internal
rewrite target and must not appear in language switches, canonical URLs, or
`hreflang` links. `NEXT_PUBLIC_ENGLISH_SITE_URL` remains supported only as a
temporary compatibility fallback for the rewrite target.

## Shared layer

- `lib/site-locale.ts` owns the locale, the public `/en` path, the internal rewrite host, and HTML/SEO locale metadata.
- `content/site-copy.ts` owns the paired PL and EN contracts for the shared global UI, account entry flow, and Inspiration Hub.
- `Header`, `Footer`, root metadata, home page, login, registration, password recovery, onboarding, Inspiration Hub, and article pages render from this shared content contract.

Both entries in `content/site-copy.ts` must satisfy the same `SiteCopy` TypeScript type. Adding a field to one language without adding it to the other therefore fails type checking.

## Public URLs

- Polish: `https://archicompass.pl/<route>`
- English: `https://archicompass.pl/en/<route>`
- Root English URL: `https://archicompass.pl/en`

Use `localePublicPath()` for internal links and `localePublicUrl()` for canonical,
Open Graph, JSON-LD, and alternate-language URLs. `localeSiteUrl()` is only for
the internal deployment origin used by the `/en` rewrite.

## Author-provided profile copy

Platform fields such as location, experience, pricing, availability, labels,
and actions are part of the shared UI contract and must be supplied in both
language objects. They must never rely on a user-entered translation.

Professional profiles and studio profiles have paired fields for the authored
headline, description, and cooperation terms:

- `*_pl` is shown on Polish pages when present.
- `*_en` is shown on English pages when present.
- If the requested language is empty, the other authored version is shown.
- Legacy fields remain populated with the preferred available value during the
  migration, so existing profiles stay visible.

Use `localizeProfileContent()` or `localizedProfileText()` whenever public
profile or studio data is rendered or used for metadata. Do not copy fallback
logic into individual components.

## Migration rule

New pages must use shared React structure and a typed content object. Do not add a locale-specific page branch or a second copy of a component. Legacy page-local Polish copy in `content/pl/copy.ts` is migrated route by route until the whole platform uses the shared contract.

Run `npm run verify:locales` before deployment. It type-checks both language contracts and rejects a Polish-only import in every route that has already been migrated.
