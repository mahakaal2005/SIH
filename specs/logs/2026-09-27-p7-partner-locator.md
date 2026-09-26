# 2026-09-27 — P7 Partner Locator

## What was built
New `features/partners/` feature on `/schemes/:schemeId/partners`, which previously 404'd despite P6's "Continue to find a partner" CTA already pointing there. Unlike P6, most of F3's hard logic was already built in P1 — the health-gate rules (`assessPartnerHealth`, `packages/shared/src/engine/partnerHealth.ts`), the district alias map (`resolveDistrict`/`searchDistricts`, `geo.ts`), the full seed data, and a working mock `PartnerRepository.find()` (already wired into DI). P7 is almost entirely a UI feature over that already-working data layer, plus one new piece of domain logic the repository doesn't do.

`core/data/queries.ts` — added `queryKeys.partners` and a `usePartners()` hook, mirroring `useCatalog()`.

`features/partners/domain/partnersView.ts` — `toPartnersView(matches)` computes, for each blocked partner, the nearest non-blocked match as its `alternative` (F3.4's "next-best alternative"), which the mock repository itself only sorts blocked-to-bottom without computing. Pure client-side composition, no repository or engine changes. TDD'd against real seed data (`union` blocked on utilisation, `upgb` blocked on overdue + NPA).

`features/partners/presentation/usePartnersViewModel.ts` (MVI): derives the citizen's location as their district's centroid (`profile.districtId` → `catalog.districts` → `{lat, lng}`, confirmed with the user — `ApplicantProfile` has no lat/lng, only a district), calls `usePartners`, and composes the result through `toPartnersView`. States: `loading | error | notFound | success`.

New components: `HealthBadge` (three-level badge + reason drawn from `HealthCheck[]`, reusing `AffordabilityWarning`'s color-token convention), `PartnerCard` (name, distance, health badge, address/phone, alternative note when blocked, select button), `PartnersMap` (Leaflet `CircleMarker`s color-coded by health status — already-installed `leaflet`/`react-leaflet` dependencies, no new install needed), `PartnersScreen` (composes by status, map + list).

Router: added `routes.partners()` entry. Locale keys `partners.*` (en + hi), including per-check reason strings so the health badge's reason is translatable, not free text.

## Verification
- `npm test` (root): 111 shared, 248 web (14 new: 4 `partnersView` unit tests, 5 reducer tests, 5 RTL journey tests — demo-district sort order, non-demo-district single-office case, blocked-partner badge/reason/alternative, partner selection + navigation, unknown-scheme not-found), 15 script tests — all green.
- `npm run typecheck`, `npm run lint` (oxlint + boundaries + i18n + specs) — all green.
- Manual browser check at 390px in English and Hindi: poultry persona in Sitapur (a demo district) — map renders with green/amber/red pins matching each partner's health badge, list sorted non-blocked-first-then-distance, Punjab National Bank shows "Caution", Union Bank and UP Gramin Bank show "Blocked" with specific reasons and a suggested alternative, selecting the UPSCFDC office correctly set `journey.partnerBranchId` and navigated to the (expected, not-yet-built) documents route. No console errors in either language.

## Observation, not a bug
The UPSCFDC district office sits at distance 0 from the citizen's own district centroid, so it is always the nearest non-blocked partner and therefore always the suggested "alternative" for every blocked bank branch in that district — verified correct in the browser, matches the literal F3.4 requirement (nearest non-blocked partner, not type-restricted). Noted in `phase-7-partner-locator.md` for awareness if a future phase wants type-aware alternatives.

## Deferred / follow-ups
- None new. P8 (Document checklist, F6) is next — spec first, same process.
