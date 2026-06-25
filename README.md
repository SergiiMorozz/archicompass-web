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

Optional email notifications for saved-brief requests:

```bash
RESEND_API_KEY=
INQUIRY_EMAIL_FROM="ArchiCompass <briefs@your-domain.com>"
INQUIRY_EMAIL_REPLY_TO=
NEXT_PUBLIC_SITE_URL=
```

When `RESEND_API_KEY` and `INQUIRY_EMAIL_FROM` are missing, requests are still saved
in `/account/inquiries`; the email notification is marked as `not_configured`.

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

## Checks

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npm run build
```
