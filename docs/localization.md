# One source, two languages

ArchiCompass is being consolidated onto one source branch. The production locale is selected when a Vercel project builds the application.

## Migration status

The shared foundation, home page, global navigation, account entry flow, password recovery, onboarding, Inspiration Hub, public designer directory and profiles, client workspace, account profile and portfolio management, the main Designer Studio views, and the main Admin views render from typed locale contracts in one source tree.

The Polish and English deployment branches must always point to the same application commit. The two Vercel projects differ only by `NEXT_PUBLIC_SITE_LOCALE`; no feature or visual fix may be introduced in one language branch without being released from the same source commit to the other.

The remaining route groups are being migrated into the shared contract route by route: AI Project Compass detail UI, account briefs and enquiry history, remaining public city and studio details, and the remaining Admin content views.

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

The legacy English zone is built with Next.js `basePath: "/en"`. The Polish
project therefore rewrites `/en` to `${ENGLISH_ZONE_URL}/en` and
`/en/<route>` to `${ENGLISH_ZONE_URL}/en/<route>`. This keeps every Next `Link`,
static asset, and English API request on the public `/en` namespace while the
remaining route groups are still being migrated to the shared source.

## Shared layer

- `lib/site-locale.ts` owns the locale, the public `/en` path, the internal rewrite host, and HTML/SEO locale metadata.
- `content/site-copy.ts` owns the paired PL and EN contracts for the shared global UI, account entry flow, and Inspiration Hub.
- `content/workspace-copy.ts` owns paired PL and EN contracts for the account dashboard, profile editor, portfolio management, client workspace, main Designer Studio views, and Admin dashboard, users, team, and activity views.
- `content/public-profile-copy.ts` owns paired system labels visible on public profiles, including location, experience, price, availability, contact, and portfolio.
- `lib/profile-system-labels.ts`, `lib/profile-pricing.ts`, `lib/professional-options.ts`, and `lib/service-capabilities.ts` translate stored platform values from their canonical database keys. They must not store language-specific values in a profile row.
- `Header`, `Footer`, root metadata, home page, login, registration, password recovery, onboarding, Inspiration Hub, article pages, designer directory, client workspace, account dashboard, profile editor, portfolio management, main Designer Studio views, and main Admin views render from shared content contracts.

Both entries in `content/site-copy.ts` must satisfy the same `SiteCopy` TypeScript type. Adding a field to one language without adding it to the other therefore fails type checking.

## Public URLs

- Polish: `https://archicompass.pl/<route>`
- English: `https://archicompass.pl/en/<route>`
- Root English URL: `https://archicompass.pl/en`

Use `localeAppPath()` for Next.js internal links in the current deployment and
`localePublicPath()` only for a public cross-locale URL. Use `localePublicUrl()`
for canonical, Open Graph, JSON-LD, and alternate-language URLs.
`localeSiteUrl()` is only for the internal deployment origin used by the `/en`
rewrite. This distinction prevents accidental `/en/en/...` links.

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
