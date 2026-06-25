# ArchiCompass Next Steps

Last checkpoint: 2026-06-25

## Current State

- Supabase restore is working with the new project.
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
  With `OPENAI_API_KEY`, it reads up to 6 reference photos, suggests a style,
  materials, colors, visual cues, and designer-search guidance.
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

## Best Next Small Step

Add `OPENAI_API_KEY` locally, upload one real reference photo in Project Compass,
run `Analyze photos`, then save/send/cancel/delete the test artifacts.

## After That

- Add richer seed data for designer profiles and portfolio projects.
- Add lead/contact request storage instead of `mailto:` links.
- Polish mobile details on long forms after real content is added.
