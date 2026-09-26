# 2026-09-27 — P6 Financial Calculator

## What was built
New `features/calculator/` feature on `/schemes/:schemeId/cost`, which previously 404'd despite P4/P5's "Continue with this scheme" CTA already pointing there. Pure presentation over engine functions built in P1 and never called from the web app: `financePlan()`, `computeEmi()`, `assessAffordability()` — no engine changes.

`domain/calculatorView.ts` — `toCalculatorView()` composes `financePlan` + `computeEmi` + `assessAffordability` into one view model; `defaultLoanTerms()` seeds rate/tenure/moratorium sliders from `scheme.finance.*.default`. TDD'd against real seed data (boutique GIA split, NSFDC Micro Credit capped loan, rate-change recompute, low-income affordability).

`presentation/useCalculatorViewModel.ts` (MVI): reads the scheme/project from the already-cached catalog, profile for income, and `journey.projectCost`/`journey.loanTerms` from session. States: `loading | error | noCost | notFound | success`. `changeTerms()` recomputes the view synchronously on every slider move (no network round-trip).

New components: `EmiCard`, `GiaSplitCard` (five SOP components, GIA schemes only), `AffordabilityWarning` (always visible, three levels), `TermSlider` (wraps the existing shadcn `Slider`). `CalculatorScreen` composes by status, same pattern as `SchemeDetailScreen`.

`session.chooseScheme()` extended to `chooseScheme(schemeId, projectCost)`; `useSchemeDetailViewModel.continueWithScheme()` now passes `view.financePlan.projectCost` (already resolved there, including the P5 cross-activity alt-lookup) so the calculator never needs to re-run `recommend()`.

Added a `ResizeObserver` stub to `src/test/setup.ts` — jsdom has none, and radix-ui's `Slider` needs one to mount; this was a test-environment gap, not a product bug, and now covers any future radix component that needs it.

Added `calculator.*` locale keys (en + hi).

## Verification
- `npm test` (root): 111 shared, 234 web (13 new: 5 `calculatorView` unit tests, 6 reducer tests, 7 RTL journey tests — GIA split, loan-only card, live slider recompute, affordability warning at both ends, empty state on direct nav, and the stale-journey regression below), 15 script tests — all green.
- `npm run typecheck`, `npm run lint` (oxlint + boundaries + i18n + specs) — all green.
- Manual browser check at 390px in English and Hindi: poultry persona (GIA split, EMI, live slider recompute, affordability), both languages fully translated.

## Browser check found a real bug
Navigating directly to a scheme's `/cost` URL after having already chosen a *different* scheme trusted `journey.projectCost` on its own, without checking it belonged to the scheme in the URL. Confirmed live: after choosing the poultry project (₹1.3L) then navigating straight to the boutique scheme's cost page, the screen silently rendered the boutique's GIA split against poultry's stale ₹1,30,000 project cost instead of boutique's real ₹1,20,000 — wrong numbers, no crash, no warning. Root cause: the `noCost` check only tested `journey.projectCost === undefined`, never whether `journey.schemeId` matched the current route's `schemeId`. Fixed in `useCalculatorViewModel.ts` by deriving `projectCost`/`loanTerms` only when `journey.schemeId === schemeId`; otherwise the screen now correctly falls into the `noCost` empty state. Added a regression RTL test and re-verified live after the fix (HMR): the empty state now shows instead of the wrong numbers.

## Deferred / follow-ups
- None. P6 is fully done. P7 (Partner locator, F3) is next — spec first, same process.
