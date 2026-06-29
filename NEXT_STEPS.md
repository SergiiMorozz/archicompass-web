# ArchiCompass Next Steps

Last checkpoint: 2026-06-29

## Current State

- Supabase restore is working with the new project.
- Production is deployed through Vercel at
  `https://archicompass-web-cqyf.vercel.app` from GitHub `main`.
- Vercel production has the Supabase and Gemini environment variables.
- Supabase Auth uses the Vercel URL as its Site URL and allows callbacks from
  the production site plus local ports 3001 and 3002.
- Homepage positioning now leads with the Project Compass flow: references,
  AI-assisted brief, designer fit, and sending the brief.
- Fake marketplace metrics and the stock "real projects" claim were removed.
- Empty Inspiration and Services routes remain available for development but
  are hidden from the main navigation.
- Current test professional records are presented publicly as two clearly
  labelled example profiles with curated demo copy; raw test names and fake
  ratings, verification, response times, and filter counts are hidden.
- Designer cards show contextual fit signals from Project Compass style and
  location filters.
- Privacy and Terms now contain closed-beta working notices covering reference
  photos, private brief storage, AI processing, sharing, deletion, and user rights.
- `/health` returns only `{ "ok": true }` or an HTTP 503 without sample data.
- Public shell has the Lovable-inspired visual direction.
- `/designers` is redesigned as the marketplace catalog.
- `/designers/[id]` is redesigned as the public designer profile.
- `/account`, `/account/profile`, and `/account/projects` are redesigned as owner tools.
- `/account/projects` has the app-side image upload path for Supabase Storage.
- Storage bucket/policy SQL is in `supabase/storage.sql` and has been applied to Supabase.
- Project galleries support up to 12 uploaded images per project.
- Portfolio images open in an embedded lightbox on account and public profile pages.
- Existing projects can be edited from `/account/projects`.
- Existing projects and individual project images can be deleted from
  `/account/projects`.
- Projects now have an optional external project page link, separate from uploaded images.
- Public project detail pages live at `/projects/[id]` and can be opened from
  portfolio cards.
- `/project-compass` is now a first Project Compass brief-builder flow; the old
  `/ai-style-finder` route still renders it for compatibility.
- Project Compass accepts up to 10 local reference photos and visual cues, which
  are included in the copied brief and designer search signal.
- Project Compass has optional AI photo style analysis through `/api/style-analysis`.
  It supports `STYLE_ANALYSIS_PROVIDER=openai` or `gemini`, reads up to 6
  reference photos, and suggests a style, materials, colors, visual cues, and
  designer-search guidance.
- Project Compass briefs can be saved to Supabase with private reference photo
  storage and reviewed at `/account/briefs`.
- Unsent saved briefs can be deleted from `/account/briefs`; their private
  reference photos are removed from storage.
- Saved briefs can be sent to designers as stored requests and tracked at
  `/account/inquiries`.
- Sent brief requests can be cancelled from `/account/inquiries`; the saved
  brief remains available.
- Designers can update incoming request status to reviewing, accepted, or
  declined from `/account/inquiries`.
- Saved-brief requests have email notification plumbing via Resend. Set
  `RESEND_API_KEY` and `INQUIRY_EMAIL_FROM` to send real emails; without them,
  requests are saved and marked `not_configured`.
- Saved briefs and saved-brief requests can render private reference photos via
  signed Supabase Storage URLs.
- Latest local preview for the fresh build is running on `http://localhost:3002`
  because an older local server is still occupying `http://localhost:3001`.

## Verified

- `npm run lint`
- `./node_modules/.bin/tsc --noEmit`
- `NEXT_TELEMETRY_DISABLED=1 npm run build`
- Browser checks for catalog, profile, and account tools.
- Browser check on `http://localhost:3002/account/projects` confirmed the fresh
  delete controls render for the user's 2 projects and 13 current images.
- Browser check on `http://localhost:3002/account/briefs` and
  `/account/inquiries` confirmed brief deletion and request cancellation controls render.
- Browser check on `http://localhost:3002/project-compass` confirmed the AI
  photo analysis section and button render.
- `/api/style-analysis` returns `AI_NOT_CONFIGURED` when `OPENAI_API_KEY` is
  missing, instead of pretending to analyze photos.
- Gemini provider was tested locally with `GEMINI_STYLE_MODEL=gemini-3.1-flash-lite`
  and returned a structured style analysis for a temporary test image.
- Production homepage, `/designers`, `/project-compass`, and `/login` return
  HTTP 200; the public designers page also loads live Supabase profile data.
- Production `/api/style-analysis` is live and correctly rejects an empty
  request with HTTP 400.
- Launch-alignment update passes lint, TypeScript, `git diff --check`, and a
  complete production build; local browser checks covered the homepage,
  filtered designer results, demo profile, Project Compass disclosure, Privacy,
  and the minimal health response.

## Best Next Small Step

Open the production site, sign in with a magic link, then upload real reference
photos in Project Compass and run `Analyze photos`. Save/send/cancel/delete the
test artifacts after checking the Gemini answer.

## After That

- Add richer seed data for designer profiles and portfolio projects.
- Add lead/contact request storage instead of `mailto:` links.
- Polish mobile details on long forms after real content is added.
