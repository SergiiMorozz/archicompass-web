# ArchiCompass Web

## Getting Started

Run the local app:

```bash
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001).

## Environment

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Email notifications for saved-brief requests and conversation replies:

```bash
RESEND_API_KEY=
INQUIRY_EMAIL_FROM="ArchiCompass <briefs@your-domain.com>"
INQUIRY_EMAIL_REPLY_TO=
NEXT_PUBLIC_SITE_URL=
GOOGLE_SITE_VERIFICATION=
GOOGLE_PLACES_API_KEY=
```

`NEXT_PUBLIC_SITE_URL` must contain the canonical production origin without a
trailing slash. When a custom domain is connected, change this value before the
first indexed release so canonical links, structured data, robots.txt, and the
sitemap all move together.

`GOOGLE_SITE_VERIFICATION` is the Search Console HTML verification token only
(not the whole meta tag). It can be added after the production domain is ready.

## Search indexing

- `/sitemap.xml` is generated from public designers, studios, projects, articles,
  and location pages that have at least one local professional.
- `/robots.txt` allows public discovery and blocks authenticated workspaces,
  account setup, admin pages, APIs, and conversations.
- Public designer profiles use the professional's exact name in the page title,
  canonical URL metadata, social preview, breadcrumbs, and structured data.
- Imported Google ratings are visible on profile pages but are intentionally not
  marked up as ArchiCompass review snippets. Google does not allow ratings copied
  from another website to be presented as first-party review structured data.
- After connecting the final domain, verify it in Google Search Console and submit
  `https://YOUR-DOMAIN/sitemap.xml`. Monitor Pages, Core Web Vitals, Enhancements,
  and Manual Actions before expanding city or language directories.

When `RESEND_API_KEY` and `INQUIRY_EMAIL_FROM` are missing, requests and messages are
still saved in the workspaces; immediate email delivery is marked as `not_configured`.
Once configured, every new conversation message triggers an immediate email.

Unread-message reminders are called every hour by Supabase Cron and email the
recipient after 24 hours. They require server-only credentials in Vercel:

```bash
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

Never expose these two values through `NEXT_PUBLIC_*` variables. The reminder job
is limited to three delivery attempts and records its result on the request or message.
Run `supabase/schedule-unread-message-reminders.sql` after both values are configured;
use the same random `CRON_SECRET` in Vercel and Supabase Vault.

`GOOGLE_PLACES_API_KEY` is server-only. Designers and studios provide a Google Place
ID; ArchiCompass then imports the current rating, review count, and Maps URL from the
Places API. Rating values are never accepted from profile forms.
Run `supabase/schedule-google-rating-sync.sql` to refresh every linked profile once
per day. Google review text remains on Google; ArchiCompass shows the verified rating,
review count, and source link.

Optional AI photo style analysis in Project Compass:

```bash
STYLE_ANALYSIS_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_STYLE_MODEL=gpt-4.1-mini

# or
STYLE_ANALYSIS_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_STYLE_MODEL=gemini-3.1-flash-lite

# Optional daily limits (defaults shown)
STYLE_ANALYSIS_DAILY_ANON_LIMIT=5
STYLE_ANALYSIS_DAILY_ACCOUNT_LIMIT=15
```

When the selected provider key is missing, Project Compass still works as a manual
brief builder, but photo style analysis shows a configuration message instead of an
AI result.

Run `supabase/style-analysis-rate-limit.sql` before deploying the public AI endpoint.
The quota counts valid analysis attempts after image validation and does not require
guests to create an account.

## Supabase Schema

Run the SQL files in order for a fresh project. Designer Studio conversations,
profile analytics, and Client Workspace favorites are defined in:

```text
supabase/designer-studio.sql
supabase/client-workspace.sql
supabase/profile-auth-emails.sql
supabase/google-business-ratings.sql
supabase/unread-message-reminders.sql
supabase/schedule-unread-message-reminders.sql
supabase/message-attachments.sql
supabase/profile-media-and-verified-ratings.sql
supabase/schedule-google-rating-sync.sql
```

The Studio schema requires `designer_inquiries`, enables RLS, keeps inquiry messages
visible only to request participants, and exposes profile-view analytics only to the
profile owner.

The Client Workspace schema adds owner-only favorites for designers, projects,
and future Inspiration HUB content, plus a preferred timeline on saved briefs.

Google Business ratings store only a Google-verified public profile link, rating
summary, and review count. Review text remains on Google.

## Checks

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npm run build
```
