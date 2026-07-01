# ArchiCompass Product Research Notes

Last review: 2026-06-30

## Materials Reviewed

- ArchiCompass pitch decks from 2023 and 2025.
- ArchiCompass designer and client interview summaries.
- ArchiCompass investor Q&A notes from January 2025.
- Proplo's April 2025 designer acquisition page.
- Innovatika's April 2025 Proplo venture-building case study.
- Early ArchiCompass homepage and designer-discovery HTML concepts.
- Four early AI-generated interface mood images.

The interview percentages are directional rather than statistically
representative. Their increments indicate small samples, so they should guide
product discovery and test design, not be presented as broad market proof.

## Strongest Repeated Signals

### Clients

- Finding a designer is perceived as difficult or time-consuming, and most
  respondents reported spending weeks on the search.
- The biggest friction is unclear pricing and cooperation terms, followed by
  weak filtering and comparison.
- Portfolios are the primary decision surface. Filters, comparable offers, and
  trustworthy reviews support that decision rather than replace it.
- Clients should be able to browse and prepare a brief without paying.

### Designers

- The repeated pain is reaching suitable clients amid high competition and
  expensive promotion.
- A strong portfolio plus direct, qualified contact is the clearest immediate
  value proposition.
- More experienced designers also want project-management and CRM support, but
  these needs come after useful lead flow.
- Designers showed willingness to pay, but the research suggests price
  sensitivity and mixed preferences across subscriptions, lead fees, and
  commissions.

### Competitive Evidence

- Proplo validates that a focused Polish designer marketplace can recruit
  supply with profiles, search visibility, inspiration, and client inquiries.
- Its published case study reports an MVP built in six months, 62 published
  profiles in the first two months, and a 50% registration-to-publication
  conversion. Its later acquisition page advertises more than 800 registered
  designers.
- This also invalidates the old ArchiCompass claim that no focused competitor
  exists. Future positioning must explain why ArchiCompass is different, not
  merely claim to be the only directory.

## Product Direction

ArchiCompass should not compete as another static directory. The strongest
current differentiation is the complete path from visual references to a
structured project brief, explainable designer matching, and a private shared
conversation. Studio collaboration strengthens that path on the supply side.

The early concepts still contribute three useful visual principles:

- Let real interior work dominate profiles and discovery.
- Keep filters and comparison criteria scannable.
- Make the client-to-designer handoff the central action.

The generated device scenes and old HTML prototypes are mood references only.
They contain invented people, ratings, counts, and malformed interface copy and
must not be reused as product evidence or production content.

## Immediate Brief Expansion

Status: implemented on 2026-07-01.

The next implementation block should add:

- `area_m2`: a numeric area with an optional "not sure" state.
- `rooms`: room count plus selectable room types.
- `property_status`: for example new build, existing property, renovation in
  progress, or not yet purchased.
- `visualization_need`: none, selected rooms, full project, or undecided.
- `supervision_need`: none, consultations, author's supervision, full project
  management, or undecided.

These values must be persisted in saved briefs, included in inquiry snapshots,
shown to designers, preserved through login, and added to matching only when
the professional profile exposes corresponding service capabilities.

## Priority After The Brief

1. Add clearer price ranges and cooperation terms to professional profiles.
   Implemented on 2026-07-01.
2. Add a client comparison view for a small shortlist of designers or studios.
3. Introduce reviews only when they can be tied to a real completed inquiry.
4. Build Inspiration HUB on the existing generic favorites model.
5. Add lightweight CRM and project progress tools after qualified inquiry flow
   has been tested with real users.
6. Treat 3D, 360-degree work, and supervision first as searchable professional
   services. Do not build an in-house AR/VR editor before demand is proven.

## Claims To Revalidate Before A New Pitch

- Current Polish market size, company, and professional counts.
- Current competitor set and their active user numbers.
- Any profitability threshold or forecast from the old Q&A.
- Any claim of verification, ratings, traction, or uniqueness.
