# ArchiCompass Next Steps

Last checkpoint: 2026-06-23

## Current State

- Supabase restore is working with the new project.
- Public shell has the Lovable-inspired visual direction.
- `/designers` is redesigned as the marketplace catalog.
- `/designers/[id]` is redesigned as the public designer profile.
- `/account`, `/account/profile`, and `/account/projects` are redesigned as owner tools.
- Latest local preview runs on `http://localhost:3001`.

## Verified

- `npm run lint`
- `./node_modules/.bin/tsc --noEmit`
- `NEXT_TELEMETRY_DISABLED=1 npm run build`
- Browser checks for catalog, profile, and account tools.

## Best Next Small Step

Add real portfolio image uploads using Supabase Storage, replacing the current manual
`Image URL` field in `/account/projects`.

## After That

- Improve `/ai-style-finder` from static mockup into a first real brief flow.
- Add richer seed data for designer profiles and portfolio projects.
- Add lead/contact request storage instead of `mailto:` links.
- Polish mobile details on long forms after real content is added.
