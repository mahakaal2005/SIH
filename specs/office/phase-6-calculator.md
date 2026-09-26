# Phase 6: Financial Calculator

Status: ✅ done — built, gate green, browser-checked at 390px in English and Hindi.

## Goal
PS 26092 asks to "calculate projected EMIs, accounting for maximum loan limits, interest rates (6.5% to 15%), and moratorium periods (3 to 12 months)." After picking a scheme (P4/P5), the citizen needs to see what it actually costs month to month before committing — EMI, total interest, the Grant-in-Aid split where it applies, and an honest affordability check against her stated income. The engine already does all the math (P1, `packages/shared/src/engine/finance.ts`): `computeEmi`, `computeLoanFinancing`, `computeGiaSplit`, `assessAffordability` are built and unit-tested but **never called from the web app**. P6 is a presentation feature only — no new engine logic, no new rules.

## In scope (docs/05-features.md F2)
- New route `/schemes/:schemeId/cost` (`routes.cost`, already reserved, currently not-found — P4/P5's "Continue with this scheme" CTA already navigates here).
- New feature folder `features/calculator/` (`data/ · domain/ · presentation/`), following the recommender's structure.
- **F2.1** EMI with principal, rate, tenure, and moratorium (3–12 months) — `computeEmi`, already built.
- **F2.2** Scheme-correct rate range shown as a slider/stepper bounded by `scheme.finance.ratePct.{min,max}`, defaulting to `.default`. Same pattern for `tenureMonths` and `moratoriumMonths` ranges. Recompute live on any change.
- **F2.3** Loan capped at `scheme.finance.maxLoan`/`financingShare` (90% rule for NSFDC) — already enforced by `computeLoanFinancing`; the calculator surfaces `cappedByMaxLoan` as a note when it applies.
- **F2.4** Grant-in-Aid mode: for `kind: 'grant_plus_loan'` schemes, show the already-computed `GiaSplit` (total cost → 5% beneficiary contribution → grant → training cost → CGTMSE fee → net loan), all five SOP components, each with its provenance (real vs seeded, per `financeProvenance`).
- **F2.5** Total interest paid alongside the monthly EMI (`computeEmi().totalInterest`/`.totalPayable`).
- **F2.6** Affordability check: `assessAffordability(emi, profile.annualFamilyIncome)` → `ok`/`stretch`/`unaffordable`, shown as a plain-language warning, not just a number.
- **Domain** `domain/calculatorView.ts` (pure, tested): given a `Scheme`, `PmAjayProject | undefined`, `projectCost`, `LoanTerms` (rate/tenure/moratorium) and `annualFamilyIncome`, returns one view model combining `FinancePlan` + `EmiResult` + affordability — no new math, just composition and Localized labels.
- **Continue** stores the chosen `LoanTerms` via the existing `session.setLoanTerms()` (already implemented, currently unused) and navigates to `routes.partners(schemeId)` (P7; until then not-found, same convention P4→P5→P6 used).
- Locale keys `calculator.*` (en + hi).

## Decisions
1. **Where `projectCost` comes from:** `session.chooseScheme()` currently stores only `schemeId`. Extend it to `chooseScheme(schemeId, projectCost)` and have `useSchemeDetailViewModel`'s `continueWithScheme()` pass `view.financePlan.projectCost` (already resolved there, including the cross-activity alt-lookup from the P5 bug fix). The calculator reads `journey.projectCost` from session instead of re-running `recommend()` — avoids duplicating the alt-activity lookup in a second place. If a citizen lands on `/schemes/:id/cost` directly without going through the detail screen first (no `journey.projectCost`), the screen shows a "start from your schemes list" empty state rather than guessing a cost.
2. **Rate/tenure/moratorium controls:** plain HTML range sliders styled with existing `shared/ui` tokens (no new dependency), each showing the numeric value and its bounds, snapping to whole numbers/months. Changing any of them recomputes the whole view instantly (pure client-side, no network round-trip).
3. **Where the affordability warning shows:** directly under the EMI figure, always visible (not collapsed) — this is the "honest warning" F2.6 asks for, and hiding it behind an accordion would undercut that.
4. **NSFDC vs GIA layout:** one `CalculatorScreen` with a conditional block — GIA schemes show the five-component split (F2.4) above the EMI card; loan-only schemes (NSFDC Micro Credit/Term Loan/Education Loan, PMEGP/Mudra fallback) show just the EMI card. Same component, different sections rendered, to avoid two near-duplicate screens.

## Out of scope
- Changing `computeEmi`, `computeGiaSplit`, `computeLoanFinancing`, or `assessAffordability` themselves (P1, already correct and tested).
- Partner locator / partner-specific rates (P7).
- Persisting the chosen loan terms to the mock DB beyond session state (no "application" object exists yet; that's P7/P9 territory).
- A chart/visualization of the amortisation schedule — a single EMI figure plus total interest is what F2.5 asks for, not a schedule table.

## Files and modules touched
`apps/web/src/features/calculator/**` (new), `apps/web/src/core/session/sessionStore.ts` (`chooseScheme` signature), `apps/web/src/features/recommender/presentation/useSchemeDetailViewModel.ts` (`continueWithScheme` passes cost), `apps/web/src/app/router.tsx` (new route), locale files.

## Tasks
- [x] `domain/calculatorView.ts` with tests: default terms from scheme ranges, live recompute on changed terms, GIA vs loan-only branching, capped-loan note, affordability levels
- [x] `sessionStore.chooseScheme(schemeId, projectCost)` + test update
- [x] `useSchemeDetailViewModel.continueWithScheme()` passes `view.financePlan.projectCost`
- [x] `useCalculatorViewModel` (MVI): loads scheme/project from catalog, profile for income, `journey.projectCost`; states loading/error/notFound (no journey cost)/success
- [x] `CalculatorScreen`: EMI card (principal, rate, tenure, moratorium controls; EMI, total interest, total payable), GIA split card when applicable, affordability warning, capped-loan note, Continue CTA
- [x] Locale keys `calculator.*` (en + hi)
- [x] RTL: boutique (GIA) shows all five SOP components and a plausible EMI; NSFDC Micro Credit shows loan-only card; changing the rate slider updates the EMI; low income shows the affordability warning; direct navigation with no journey cost shows the empty state
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite)
- [x] Browser check at 390 px in English and Hindi — found and fixed a real bug (see below)

## Bug found in browser check, fixed
Direct navigation to a scheme's cost page trusted `journey.projectCost` on its own. If the citizen had previously chosen a different scheme (so `journey.projectCost` was still set, just for the wrong scheme — e.g. from `pmajay-poultry`) and then navigated straight to another scheme's `/cost` URL (e.g. `pmajay-boutique`), the screen silently computed the GIA split and EMI against the stale cost instead of showing the empty state. Root cause: the `noCost` check only tested whether `journey.projectCost` was `undefined`, never whether it belonged to the scheme in the URL. Fixed in `useCalculatorViewModel.ts` by deriving `projectCost`/`loanTerms` only when `journey.schemeId === schemeId`, otherwise treating them as absent. Added a regression RTL test and verified live in the browser (HMR picked up the fix): navigating to a different scheme's cost page after choosing one now correctly shows the empty state instead of the wrong numbers.

## Acceptance criteria (verified)
- Demo persona (boutique, ₹1.2L project): GIA split shows ₹6,000 own contribution, ₹50,000 grant, ₹13,338 training cost, ₹272 CGTMSE fee, ₹73,500 net loan; EMI recomputed live when the rate slider moved.
- NSFDC/loan-only schemes show the EMI card with no GIA split.
- A low-income profile against a large EMI shows the "unaffordable" warning; a comfortable one shows "ok" with no warning.
- Visiting `/schemes/:id/cost` without a matching `journey.projectCost` (never chosen, or chosen for a different scheme) shows the empty state, not a crash or wrong number.
- Every string translated; gate green.

## Open questions
- None.
