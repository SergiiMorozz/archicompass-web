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

## Checks

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npm run build
```
