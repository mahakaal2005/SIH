# Phase 5: Approval Odds

Status: ✅ done — built, gate green, browser-checked at 360px in English and Hindi.

## Goal
The killer feature: UP's own GIA data shows approval rates from 7.7% (poultry) to 44.3% (women's home industry) for PM-AJAY projects — a 5.8x spread nobody tells the applicant about. P5 surfaces this honestly on top of P4's recommender screens, so the citizen sees the odds before choosing, not after waiting months. The rule engine and finance layer already decide *eligibility*; P5 only *explains* odds that the engine (`recommend()`) already computes. No new engine logic — `approvalRatePct`, `lowOdds` and `betterOdds` were built in P1 (`packages/shared/src/engine/recommend.ts`) and are already on every `Recommendation`. P4 already renders a one-line low-odds warning on `SchemeCard`; P5 replaces that with the fuller F4 treatment and adds the pieces P4 explicitly deferred (its "Out of scope" note: "Approval-odds badges, chart and disclosure").

## In scope (docs/05-features.md F4)
- **F4.1** — Odds badge on every PM-AJAY project card (`SchemeCard`, both `/schemes` and `/schemes/:schemeId`): approval rate as a percentage with a plain-language qualifier (e.g. "44.3% approved historically" vs "7.7% approved historically — most applicants for this project are not"). Only for PM-AJAY projects (`approvalRatePct !== undefined`); NSFDC/fallback schemes have no per-project odds and show nothing here.
- **F4.2** — District throughput disclosure: `FullCatalog.funnel` (`mostApplicationsDistrict`, `mostApprovalsDistrict`) shown once, contextually — likely a small note on the detail screen or a dedicated "About these numbers" panel, not repeated per card. Districts differ (most applications ≠ most approvals), which is itself the point to make legible.
- **F4.3** — When `lowOdds` is true: an honest warning (already partially done in P4) **plus** the `betterOdds` alternatives the engine already ranks (`{projectId, schemeId, approvalRatePct}`, max 3, already filtered to ones the applicant is actually eligible for). These are not currently rendered anywhere — P5 adds a "projects you also qualify for, approved more often" list with a way to see each alternative's own detail (link to `routes.scheme(alt.schemeId)`).
- **F4.4** — The 62.9% no-decision rate as an expectation-setting disclosure: `funnel.noDecision / funnel.applied`. Framed as "many applications are still awaiting a decision" — not as a discouragement, and not attached to any single scheme (it's a state-wide fact about the process, shown once, probably alongside F4.2).
- Provenance: `approvalFunnel.provenance` and `ProjectApprovalStat.provenance` are already `real` (docs/01, UP GIA dashboard); no `seeded` marker needed for these numbers, but the general "demo data" convention stays for anything nearby that is seeded.
- `domain/oddsView.ts` (pure, tested): maps a `Recommendation[]`/`FullCatalog['funnel']` into whatever the components need — no new engine calls, just presentation shaping of data already computed.

## Out of scope
- Any chart/visualization library. F4.2/F4.4 are single numeric disclosures, not a dashboard; Recharts (already a project dependency) is reserved for the officer dashboard (P11) unless this spec is revised.
- Changing `recommend()`, `betterOddsFor()`, or the approval-rate math itself (P1, already correct and tested).
- Per-scheme historical odds for NSFDC/fallback schemes — no such data exists; do not invent it.

## Files and modules touched
`apps/web/src/features/recommender/**` (extends P4's `SchemeCard`, `resultView.ts`/`detailView.ts`, and screens — no new feature folder), locale files (`recommender.odds.*` or similar).

## Decisions (user delegated, 2026-09-27)
1. F4.2/F4.4 disclosure lives on `SchemeDetailScreen` only, as a collapsible "About these numbers" panel directly above the Continue CTA (the commitment moment).
2. Odds badge always shows the real rate; styling uses the engine's existing binary `LOW_ODDS_PCT = 20`. No middle tier: a second threshold would have no doc reference.
3. `betterOdds` alternatives are rendered (F4.3), each linking to its own detail screen.

## Tasks
- [x] `domain/oddsView.ts` with tests: `betterOddsViews(betterOdds, projects)` (names from projects) and `funnelDisclosure(funnel, districts)` (no-decision %, top districts)
- [x] Card + detail views carry `approvalRatePct`, `lowOdds`, `betterOdds`
- [x] `OddsBadge`, `BetterOddsList`, `FunnelDisclosure` components; replace P4's one-line warning
- [x] Detail VM carries the funnel disclosure; reducer tests updated
- [x] Locale keys `recommender.odds.*` (en + hi)
- [x] RTL: boutique shows 38.7%; poultry shows low-odds warning with home industry 44.3% first; NSFDC card has no badge; detail screen disclosure shows 62.9%; alternative link opens its detail
- [x] Gate green
- [x] Browser check at 360 px in both languages — found and fixed a real bug (see below)

## Bug found in browser check, fixed
Clicking a `betterOdds` alternative's link 404'd inside the app shell ("This scheme could not be found") even though the RTL test for it passed — that test only asserted the URL changed, not that the page rendered. Root cause: `recommend()` (P1) excludes any PM-AJAY scheme whose project doesn't match the profile's own `activityId` from every result bucket, by design (`recommend.ts`'s "noise" filter) — but a better-odds alternative *by definition* names a different activity, so it can never appear in the applicant's own `RecommendationResult`. Fixed in `useSchemeDetailViewModel.ts`: when the primary lookup misses and the scheme id is a PM-AJAY project different from the profile's activity, it re-runs `recommend()` (via the existing repository call, no engine changes) with a hypothetical profile whose `activityId` is swapped to that project, and looks up the scheme in that alternate result. Strengthened the RTL test to assert the destination page's content, not just the URL.

## Acceptance criteria
- Demo persona: boutique card shows "38.7% approved"; no warning.
- Poultry (₹1.3L): card shows 7.7% with the low-odds warning and three alternatives: home industry 44.3%, kirana 39.4%, beauty parlour 38.9%.
- NSFDC and fallback cards show no odds badge.
- Detail screen panel: 62.9% of 73,888 applications still await a decision; Rampur has the most applications, Bahraich the most approvals.
- Every string translated; gate green.
