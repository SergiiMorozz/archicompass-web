# ArchiCompass Next Steps

Last checkpoint: 2026-07-01

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
- Professional accounts now receive a session-aware `Designer Studio` link in
  the personal account group; it remains visible across navigation until
  sign-out or session expiry.
- Every signed-in account receives a session-aware `Client Workspace` link in
  the same personal group; professional accounts keep both workspaces, visually
  separated from the public navigation.
- `/client` provides a dashboard with saved brief, favorite, request, and
  unread-message totals plus recent designer conversations.
- `/client/messages` is the client inbox, `/client/briefs` keeps saved Project
  Compass prompts inside the workspace, and `/client/favorites` stores saved
  designers and portfolio projects.
- The generic favorite model already supports future Inspiration HUB articles
  and curated inspiration without another account-data migration.
- Public designer cards, profiles, portfolio cards, and project pages now have
  working Save/Saved controls with login return paths.
- `/studio` provides profile/request/message KPIs, recent incoming briefs,
  profile readiness, and shortcuts to public profile and portfolio tools.
- `/studio/inbox` provides status filters and incoming brief cards, while
  `/studio/inbox/[id]` combines brief context, private photos, lead status, and
  participant-only messaging.
- Clients can continue the same message thread from
  `/account/inquiries/[id]`.
- `/studio/analytics` reports privacy-light profile views, incoming requests,
  accepted-fit rate, measured first-response time, portfolio count, and a
  14-day view chart.
- Public profile views are deduplicated per random browser-tab session per day;
  self-views are skipped and the analytics table stores no visitor email/name.
- `supabase/designer-studio.sql` has been applied to the restored Supabase
  project with least-privilege grants and participant/owner RLS policies.
- `supabase/client-workspace.sql` has been applied with owner-only favorite
  policies and the saved-brief timeline column.
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
- Project Compass now captures a preferred timeline, stores it in the saved
  brief, and includes it in the inquiry snapshot and designer notification.
- Project Compass now captures project area, room count and room types,
  property status, 3D visualization needs, and supervision needs. These values
  are preserved through login, stored in saved briefs, copied into inquiry
  snapshots, included in designer notifications, and shown in both workspaces.
- Individual designers and studios can confirm structured service capabilities
  such as 3D visualization, site consultations, author's supervision, and full
  project coordination. Brief matching rewards confirmed requested services and
  labels unconfirmed services honestly.
- Project Compass has optional AI photo style analysis through `/api/style-analysis`.
  It supports `STYLE_ANALYSIS_PROVIDER=openai` or `gemini`, reads up to 6
  reference photos, and suggests a style, materials, colors, visual cues, and
  designer-search guidance.
- AI style results now include a portrait sharing card built from the first
  four reference photos, with system sharing and a downloadable PNG.
- The personal sharing card now keeps the user's result as the visual focus:
  smaller branding, one logo, complete short copy, confidence, compact palette,
  designer-fit guidance, a stronger CTA, and a ready-to-copy social caption.
- Project Compass passes project type, style, scope, budget, timeline, location,
  visual cues, and saved brief ID into Find Designer. Matching results show the
  brief context and explain style, location, support, budget, and portfolio fit.
- Brief matching ranks the available beta network instead of treating every
  signal as a hard filter. Ordinary catalog filters remain strict, and Polish
  diacritics such as `Kraków`/`Krakow` are normalized consistently.
- Brief sending now preserves designer, studio, and saved-brief context through
  magic-link login. Login copy explains the action the user is returning to.
- The supplied ArchiCompass logo is used in the global header, footer, browser
  icon, and generated sharing card.
- `/admin` is now a protected owner workspace with live platform totals, recent
  accounts, a searchable user directory, and safe account detail pages.
- Admin access is stored separately from editable profiles. The first owner role
  is assigned to the current ArchiCompass owner account and appears as a
  session-aware `Admin` link in the personal header group.
- User review states and internal notes are written through a protected database
  function and recorded in `/admin/activity` with actor, target, and time.
- Admin functions expose operational counts, account fields, public profiles,
  and public projects; private message bodies and brief reference photos are not
  returned to the workspace.
- Administrators can hide and restore public designer profiles and portfolio
  projects. Hidden content is removed from search and direct public pages while
  owners retain account access and existing conversations continue.
- Visibility changes use protected database functions, appear in dashboard
  totals and user filters, and are recorded in the admin audit log.
- Accounts now have an explicit `client` or `designer` operating role. Clients
  create and send briefs; designers receive them and can work independently or
  as part of a studio. The same account cannot perform both roles concurrently.
- Designers can permanently delete their personal public profile and portfolio
  without deleting their login, saved conversation history, or studio access.
- `/studio/team` creates and edits separate design-studio profiles, manages
  consent-based team invitations and roles, and links each active designer's
  existing public profile and portfolio to the studio automatically.
- `/studios/[id]` presents the studio identity, connected designers, combined
  portfolio, shared contact action, and studio favorite state.
- Studio inquiries keep one client conversation while granting every active
  team member access to the brief, private references, status, and messages.
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
- Designer Studio passes lint, TypeScript, `git diff --check`, and a production
  build. Browser checks confirmed the persistent header tab, authenticated
  Studio dashboard, Inbox, Analytics, and the existing client's conversation.
- Analytics insertion was verified end to end and its test record deleted.
- Chat RLS was verified in a rolled-back transaction: the request participant
  saw the test message and an unrelated authenticated user saw zero rows.
- Client Workspace passed lint, TypeScript, production build, and desktop/mobile
  browser checks. Save/remove was exercised for both a designer and a project,
  then the temporary favorites were removed.
- Browser checks confirmed the persistent header tab, dashboard, messages,
  saved briefs, future Inspiration HUB placeholder, Project Compass timeline,
  and no browser console errors.
- The supplied brand logo and shareable style result passed desktop/mobile
  browser checks with no horizontal overflow or console errors. PNG generation
  reached its successful completion state in the browser.
- Admin Workspace passed lint, TypeScript, a production build, live Supabase
  migration, and desktop/mobile browser checks. Overview, Users, user detail,
  internal review persistence, audit activity, and the owner-only header link
  were verified against the restored project.
- Public moderation was verified end to end: a hidden designer profile and a
  hidden portfolio project returned their not-found states to a logged-out
  visitor, then both were restored to visible status.
- Account-role and studio migrations were applied successfully to live Supabase.
  The owner account is now a designer account, is redirected away from Client
  Workspace, and no longer sees or can execute new brief-sending actions.
- Local production browser checks covered account role copy, retained brief
  history, profile deletion controls, Studio & Team creation UI, public catalog,
  personal profile actions, mobile overflow, and browser errors.
- Rolled-back live database checks verified automatic studio-owner membership,
  pending invitations for an existing designer account, and database-level
  rejection when a designer account attempts to save a client brief.
- Browser checks verified brief-aware matching, honest remote/location labels,
  preserved matching query parameters, context-aware login, Polish city-name
  normalization, mobile width, and no browser console errors.
- Structured project-detail migration was applied to live Supabase and returned
  all eight expected columns. The expanded Project Compass passed lint,
  TypeScript, a production build, desktop interaction checks, mobile overflow
  checks, service-capability profile checks, and saved-brief compatibility.

## Best Next Small Step

Add clearer price ranges and cooperation terms to individual designer and studio
profiles so clients can compare realistic engagement models before sending a
brief.

## Admin Workspace Roadmap

- Add deeper funnel reporting for Project Compass, designer contact, and saved
  content conversion.
- Add a content workspace for articles and Inspiration HUB entries, including
  drafts, publishing, authors, categories, and featured content.
- Add subscription, invoice, and payment oversight when monetization is enabled.
- Support scoped staff permissions such as owner, support, content editor, and
  finance, plus an audit log for sensitive actions.
- Keep private photos and conversations hidden from general staff by default.
  Any support access should be explicit, limited, and recorded in the audit log.

## After That

- Use two test designer accounts to create the first real studio, accept an
  invitation, and exercise one shared client conversation from both team logins.
- Add a compact comparison view for shortlisted designers and studios.
- Introduce reviews only when they can be tied to a completed real inquiry.
- Add richer seed data for designer profiles and portfolio projects.
- Build the first Inspiration HUB route on top of the existing generic favorites.
- Add realtime message subscriptions and email notifications for new chat
  messages after the two-account conversation flow is approved.
- Polish mobile details on long forms after real content is added.
