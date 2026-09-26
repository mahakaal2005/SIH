# 2026-09-27 — P5 Approval Odds

## What was built
`features/recommender/domain/oddsView.ts` — pure `betterOddsViews()` (names each engine-computed `BetterOdds` alternative from the project list) and `funnelDisclosure()` (no-decision % and leading districts by name from `FullCatalog.funnel`). TDD'd against the real seed data (poultry → home_industry 44.3%, kirana 39.4%, beauty_parlour 38.9%; funnel → 62.9%, Rampur 2,297, Bahraich 1,246).

Extended `resultView.ts` and `detailView.ts` so every `SchemeCardView`/`SchemeDetailView` carries `approvalRatePct`, `lowOdds`, `betterOdds`. Extended `useSchemeDetailViewModel` so its success state also carries a `FunnelDisclosure` computed from the catalog.

New presentation components: `OddsBadge` (real rate + low-odds warning, renders nothing for NSFDC/fallback schemes with no per-project odds), `BetterOddsList` (linked alternatives, only shown when odds are low), `FunnelDisclosure` (collapsible "About these numbers" panel, detail screen only, right above the Continue CTA — per the agreed spec's decision). Wired into `SchemeCard` (replacing P4's one-line warning) and `SchemeDetailScreen`.

Added `formatNumber` to `shared/lib/format.ts` (Indian digit grouping, no currency sign) for the funnel counts. Added `recommender.odds.*` locale keys to both `en.json`/`hi.json`; removed the now-unused `recommender.schemes.lowOddsWarning`/`betterOdds` keys P4 had added but P5 superseded.

## Verification
- `npm test` (root): 111 shared, 216 web (30 new/changed for odds: 2 `oddsView` unit tests, 1 `resultView` case, 1 `detailView` case, 5 RTL journey tests covering real rate display, low-odds warning + alternatives ordering, no badge on NSFDC, funnel disclosure text, and alternative-link navigation), 15 script tests — all green.
- `npm run typecheck`, `npm run lint` (oxlint + boundaries + i18n + specs) — all green.
- Manual 360px/en+hi browser check — done once the Chrome extension connected mid-session (see below): boutique persona, poultry low-odds persona, NSFDC scheme, and both languages all verified visually.

## Process note
P4 had been left uncommitted at the end of the previous turn with a "commit pending" note instead of an actual commit. The user corrected this: commit completed phases immediately, not just flag it as an offer. Saved as a durable memory (`commit-after-each-phase.md`). P4 was committed (`317ab56`) before starting P5's work in this turn.

## Browser check found a real bug
Walked the full flow live (login → profile → schemes → detail) at 390px in English and Hindi. Everything matched the acceptance criteria except one thing the RTL suite had missed: clicking a `betterOdds` alternative's link landed on a 404 inside the app shell. The existing RTL test only asserted the URL changed after the click, not that the destination page actually rendered content — a real test-coverage gap, not just an implementation bug. See `phase-5-approval-odds.md`'s "Bug found in browser check, fixed" section for the root cause and fix (`useSchemeDetailViewModel.ts` now re-runs `recommend()` for a hypothetical profile when the direct lookup misses a cross-activity alternative). RTL test strengthened to check page content, not just navigation. Re-verified live in the browser after the fix — the alternative's detail page now renders correctly.

## Deferred / follow-ups
- None. P5 is fully done.
