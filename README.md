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
```

When `RESEND_API_KEY` and `INQUIRY_EMAIL_FROM` are missing, requests are still saved
in `/account/inquiries`; the email notification is marked as `not_configured`.

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

Optional AI photo style analysis in Project Compass:

```bash
STYLE_ANALYSIS_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_STYLE_MODEL=gpt-4.1-mini

# or
STYLE_ANALYSIS_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_STYLE_MODEL=gemini-3.1-flash-lite
```

When the selected provider key is missing, Project Compass still works as a manual
brief builder, but photo style analysis shows a configuration message instead of an
AI result.

## Supabase Schema

Run the SQL files in order for a fresh project. Designer Studio conversations,
profile analytics, and Client Workspace favorites are defined in:

```text
supabase/designer-studio.sql
supabase/client-workspace.sql
supabase/profile-auth-emails.sql
supabase/unread-message-reminders.sql
supabase/schedule-unread-message-reminders.sql
```

The Studio schema requires `designer_inquiries`, enables RLS, keeps inquiry messages
visible only to request participants, and exposes profile-view analytics only to the
profile owner.

The Client Workspace schema adds owner-only favorites for designers, projects,
and future Inspiration HUB content, plus a preferred timeline on saved briefs.

## Checks

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npm run build
```
