# Phase 7: Partner Locator

Status: ✅ done — built, gate green, browser-checked at 390px in English and Hindi.

## Goal
PS 26092 asks to "identify the nearest eligible Channel Partner based on the user's location and the partner's current fund utilization eligibility (ensuring applications aren't sent to partners with high NPAs or overdues)." After the calculator (P6), the citizen's "Continue" CTA already navigates to `routes.partners(schemeId)`, which currently 404s — no route entry exists. Most of F3's hard logic was already built in P1 (health-gate rules, district alias map, seed data, and a working mock `PartnerRepository`); P7 is a UI feature over that already-working data layer, plus one new piece of pure domain logic (next-best-alternative for blocked partners) that the repository doesn't do.

## In scope (docs/05-features.md F3)
- New route `/schemes/:schemeId/partners` (`routes.partners`, already reserved, currently not-found).
- New feature folder `features/partners/` (`domain/`, `presentation/`), following the recommender/calculator structure.
- **F3.1** List (and map) of partners near the citizen, filtered to those authorised for the chosen scheme (`branch.authorisedSchemeIds`, already filtered by the mock repository).
- **F3.2** Health gate using NSFDC's real published prudential rules — already implemented (`assessPartnerHealth`, P1); this phase only surfaces its output.
- **F3.3** Each partner shows a health badge with the reason (from `HealthCheck[]`), never a bare score.
- **F3.4** Blocked partners are shown but marked, with the next-best alternative — new `toPartnersView()` domain function computes this; the repository only sorts blocked-to-bottom today.
- **F3.5** Covers UPSCFDC's 75 district offices plus bank branches (bank branches seeded for 5 demo districts only — pre-existing, documented gap, not fixed in this phase).
- **F3.6** District alias map — already implemented (`resolveDistrict`/`searchDistricts`, P1); not directly exercised by this UI (the citizen's own district comes from their profile, not free-text search), so this phase does not add new UI for it.
- **Domain** `domain/partnersView.ts` (pure, tested): `toPartnersView(matches: PartnerMatch[]): PartnersView`, annotating blocked matches with their nearest healthy/caution alternative.
- **Continue** stores the chosen branch via `session.choosePartner(branchId)` (already implemented, unused until now) and navigates to `routes.documents(schemeId)` (P8; not-found until then, same convention as P4→P5→P6).
- Locale keys `partners.*` (en + hi).

## Decisions
1. **Where "near the user" comes from:** `ApplicantProfile` has no lat/lng, only `districtId`. `usePartnersViewModel` resolves `profile.districtId` → the matching `District` (from `catalog.districts`, already in `FullCatalog`) → `{lat: district.lat, lng: district.lng}` as `PartnerQuery.near`. District coordinates are already documented as approximate HQ points, consistent with existing precision elsewhere in the app. No browser geolocation.
2. **Next-best-alternative (F3.4):** computed client-side in `features/partners/domain/partnersView.ts`, not in the mock repository or the shared engine — pure composition over the `PartnerMatch[]` the repository already returns, same pattern as `calculatorView.ts` composing `financePlan`/`computeEmi`. For each blocked match, the nearest non-blocked match becomes its `alternative`.
3. **Map:** a Leaflet map (`leaflet`/`react-leaflet`, already installed dependencies) shows one marker per partner, colored by health status (healthy/caution/blocked), alongside the same sorted list. Clicking a marker or a list row highlights the other via shared `selectedBranchId` state in the view model.
4. **Health badge:** three-level badge reusing `AffordabilityWarning`'s color-token convention (`text-pass`/`text-caution`/`text-blocked`), with a one-line reason drawn from the first failing/caution `HealthCheck`, mapped through a locale key (`partners.health.reason.<key>`) rather than free text, so it's translatable.
5. **Officer-side partner views** (`routes.officerPartners`, F7) are out of scope — belongs to P11.

## Out of scope
- Changing `assessPartnerHealth`, `haversineKm`, `resolveDistrict`/`searchDistricts`, or the mock `PartnerRepository.find()` itself (P1, already correct and tested).
- Fixing the F3.5 data gap (bank branches only seeded for 5 of 75 districts) — pre-existing, documented in `CLAUDE.md`, not a P7 bug.
- Officer dashboard / partner routing (F7, P11).
- Document checklist / application submission (P8/P9) — Continue only stores the selection and navigates.
- Live browser geolocation.

## Files and modules touched
`apps/web/src/features/partners/**` (new), `apps/web/src/core/data/queries.ts` (`queryKeys.partners`, `usePartners`), `apps/web/src/app/router.tsx` (new route), locale files.

## Tasks
- [x] `core/data/queries.ts`: `queryKeys.partners`, `usePartners` hook
- [x] `domain/partnersView.ts` with tests: next-best-alternative computation against real seed data, no-blocked-partners case, empty-matches case
- [x] `usePartnersViewModel` (MVI): loads profile + catalog, derives `near`, calls `usePartners`, states loading/error/notFound/success
- [x] `HealthBadge`, `PartnerCard`, `PartnersMap`, `PartnersScreen`
- [x] Locale keys `partners.*` (en + hi)
- [x] RTL: demo-district scheme shows office + bank branches sorted correctly; non-demo district shows office only, no crash; a blocked partner shows its badge, reason, and alternative; selecting a partner calls `choosePartner` and navigates; unknown `schemeId` shows not-found
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite)
- [x] Browser check at 390 px in English and Hindi

## Acceptance criteria (verified)
- Demo persona (poultry scheme, Sitapur district): map shows color-coded pins (green healthy, amber caution, red blocked) plus a sorted list; UPSCFDC District Office (0 km, healthy) and State Bank of India (2.2 km, healthy) shown first.
- Punjab National Bank shows "Caution — Below the minimum fund utilisation required"; Union Bank of India and Uttar Pradesh Gramin Bank show "Blocked" with their specific reason and "Suggested alternative: UPSCFDC District Office, Sitapur" (the nearest non-blocked partner, always the district office itself since it sits at distance 0).
- A non-demo district (Agra) shows only the UPSCFDC office branch, no crash.
- Selecting a partner sets `journey.partnerBranchId` and navigates to `routes.documents(schemeId)` (P8; not-found until then, matching the P4→P5→P6→P7 convention).
- Every string translated; gate green (15 script + 111 shared + 248 web tests, typecheck, lint).

## Note on the "next-best alternative"
Because the UPSCFDC district office sits at distance 0 from the citizen's own district centroid, it is always the nearest non-blocked partner and therefore always the suggested alternative for every blocked bank branch in that district. This matches the literal requirement (nearest non-blocked partner) and was verified correct in the browser; it does not restrict the alternative to the same partner type. Not treated as a bug — flagged here for awareness if a future phase wants type-aware alternatives.

## Open questions
- None — map vs. list, next-best-alternative placement, and location derivation were confirmed with the user before this spec was written.
