# 2026-09-27 — P4 Recommender

## Mismatch found and resolved
Session started with a conflict: `progress.md` said the P4 spec was not written and to write one before coding, but `phase-4-recommender.md` already existed in full (goal, scope, tasks, acceptance criteria), just still headed "awaiting agreement." Flagged it to the user; confirmed the spec is agreed and building could start directly. Updated both files' status markers to match reality.

## What was built
`features/recommender/` end to end, per the phase spec:
- `domain/resultView.ts` — pure `toResultView(result, area, projects)` mapping a `RecommendationResult` to per-card view models (top match, other eligible, also-available, near-miss with gap/limit, ineligible with failing reason keys), each card carrying its `financePlan` from the shared engine. TDD'd against the real seed catalog and the demo persona fixtures from `recommend.test.ts`.
- `domain/detailView.ts` — pure `toDetailView(result, schemeId, rules, area, projects)` building the full pass/fail rule table plus rule version/effective date and SOP project details for the detail screen.
- `domain/recommendations.usecase.ts` — thin wrapper over `RecommendationRepository`.
- `presentation/useSchemesViewModel.ts` and `useSchemeDetailViewModel.ts` — MVI hooks combining TanStack Query (profile, catalog, recommendations) with a small reducer for `status: loading/error/empty|notFound/success`. Both have pure reducer unit tests.
- `presentation/SchemesScreen.tsx` + `SchemeCard.tsx`, `NearMissList.tsx`, `WhyNotList.tsx`, `moneySegments.ts`, and `SchemeDetailScreen.tsx` — all states (loading/error/empty/success), MoneyBar previews, priority chips, low-odds warning, fallback banner, collapsed why-not accordion, and the rule table with version/date on the detail screen.
- Routes `/schemes` and `/schemes/:schemeId` wired into `app/router.tsx` behind `RequireLanguage` + `RequireRole(['citizen'])`, matching the profile route's pattern. "Continue with this scheme" stores `journey.schemeId` (session store already had `chooseScheme`) and navigates to `routes.cost(id)`, which 404s until P6 as expected.
- `recommender.*` locale keys added to both `en.json` and `hi.json` (screen titles, section headers, money segment labels, banners, empty state, CTA); reused the existing `rule.*`/`prio.*` keys for reasons and priority chips.

## Verification
- `npm test` (root): 111 shared engine tests, 207 web tests (21 new for recommender, including 5 RTL journey tests: demo persona top match, exact near-miss gap text, GEN fallback banner, injected-failure retry, choose-scheme-then-navigate), 15 script tests — all green.
- `npm run typecheck` and `npm run lint` (oxlint + boundaries + i18n + specs) — all green.
- **Not done:** the phase spec's manual 360px/English+Hindi browser check. The Claude-in-Chrome extension was not connected in this session, so it could not be performed. Flagging this as an open item rather than claiming it was verified.

## Deferred / follow-ups
- Manual browser check at 360px (en + hi) — do this before treating P4 as fully done.
- `routes.cost` (P6) still 404s by design.
