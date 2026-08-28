# Public Beta legal/product implementation note — 28 August 2026

## Scope checked before implementation

- The application is a bilingual Next.js App Router deployment. Polish is the primary locale; the English checkout is maintained separately and must receive the same user-facing changes.
- The public legal routes are `/terms`, `/privacy`, `/cookies` and `/ai-transparency`. The long-form PL/EN source documents are rendered by `LegalDocumentPage`.
- Registration currently records versions of the Terms, Privacy Policy, Cookie Policy and AI transparency document in Supabase. The UI currently asks for four mandatory checkboxes, even though only the Terms acceptance and acknowledgement of the Privacy Policy are needed for account creation.
- AI Project Compass sends up to six reference images and selected brief context to a server-side AI route. Its provider is selected by the server configuration: it can be OpenAI or Google Gemini. Neither key is exposed from the client code.
- Portfolio Autopilot uses the server-side Gemini provider. A professional may provide a website URL or upload images. The product stores imported material in the private `portfolio-import-staging` bucket, groups/analyzes it, lets the owner edit/review it and copies only selected images into the public `project-images` bucket after an explicit publish action.
- The public pricing page advertises a three-month free period for professional accounts. Billing accounts and Stripe Checkout support paid monthly/yearly plans, but checkout is unavailable until Stripe price configuration is present. No card is collected during ordinary account registration.
- The active application uses Vercel Analytics and Speed Insights. No Google Analytics, advertising pixel, Meta Pixel, LinkedIn Insight Tag, Hotjar, Clarity, PostHog, Mixpanel or similar tracker was found in the application code.
- Transactional email paths exist for account confirmation, inquiries/messages and Portfolio Autopilot completion. No newsletter or marketing-send implementation was found.
- Portfolio Autopilot tables are protected by owner/admin RLS and its staging bucket is private. Public profile and project media deliberately use public buckets after publication.

## Product/legal gaps found before implementation

1. The current full Terms and Privacy Policy describe AI Project Compass but do not give Portfolio Autopilot a complete dedicated treatment.
2. The short legal-page metadata refers broadly to Google Gemini or OpenAI, whereas the long-form privacy policy says Project Compass uses Gemini only; the actual code supports a server-selected OpenAI or Gemini provider for Project Compass and Gemini for Autopilot.
3. The pricing page describes the free period, but it does not yet state that ordinary registration does not collect a payment card or that paid access requires a user-initiated checkout. The checkout and Terms must remain conditional on Stripe being configured.
4. The current registration screen creates unnecessary separate acknowledgements for cookies and AI transparency.
5. Public profiles do not have an in-product reporting route. Existing legal text points to email only.
6. The public footer does not link to concise publication rules.

## Boundaries for this implementation

- This implementation updates product wording, contextual notices, a report form, a moderation-permission admin queue, report-handling source code and database migration source. The report table is inaccessible to browser roles; only a server route and a moderation-authorised admin page use it after access checks. It does not apply database migrations, modify vendor accounts, change AI models, enable marketing, or deploy.
- Provider retention terms, the Stripe tax/invoice configuration, international-transfer documentation, DSA classification and the appropriate legal basis for each processing operation require external legal and vendor-contract review.
