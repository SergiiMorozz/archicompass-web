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
NEXT_PUBLIC_ENGLISH_SITE_URL=https://archicompass-web-en.vercel.app
```

`NEXT_PUBLIC_SITE_URL` can remain set to the canonical URL of the individual deployment. The shared locale helper uses it for canonical URLs, while the two explicit host variables build the language switch and `hreflang` links.

## Shared layer

- `lib/site-locale.ts` owns the locale, locale-specific hosts, and HTML/SEO locale metadata.
- `content/site-copy.ts` owns the paired PL and EN contracts for the shared global UI, account entry flow, and Inspiration Hub.
- `Header`, `Footer`, root metadata, home page, login, registration, password recovery, onboarding, Inspiration Hub, and article pages render from this shared content contract.

Both entries in `content/site-copy.ts` must satisfy the same `SiteCopy` TypeScript type. Adding a field to one language without adding it to the other therefore fails type checking.

## Migration rule

New pages must use shared React structure and a typed content object. Do not add a locale-specific page branch or a second copy of a component. Legacy page-local Polish copy in `content/pl/copy.ts` is migrated route by route until the whole platform uses the shared contract.

Run `npm run verify:locales` before deployment. It type-checks both language contracts and rejects a Polish-only import in every route that has already been migrated.
