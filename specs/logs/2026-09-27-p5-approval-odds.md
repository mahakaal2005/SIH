# 2026-09-27 — P5 Approval Odds

## What was built
`features/recommender/domain/oddsView.ts` — pure `betterOddsViews()` (names each engine-computed `BetterOdds` alternative from the project list) and `funnelDisclosure()` (no-decision % and leading districts by name from `FullCatalog.funnel`). TDD'd against the real seed data (poultry → home_industry 44.3%, kirana 39.4%, beauty_parlour 38.9%; funnel → 62.9%, Rampur 2,297, Bahraich 1,246).

Extended `resultView.ts` and `detailView.ts` so every `SchemeCardView`/`SchemeDetailView` carries `approvalRatePct`, `lowOdds`, `betterOdds`. Extended `useSchemeDetailViewModel` so its success state also carries a `FunnelDisclosure` computed from the catalog.

New presentation components: `OddsBadge` (real rate + low-odds warning, renders nothing for NSFDC/fallback schemes with no per-project odds), `BetterOddsList` (linked alternatives, only shown when odds are low), `FunnelDisclosure` (collapsible "About these numbers" panel, detail screen only, right above the Continue CTA — per the agreed spec's decision). Wired into `SchemeCard` (replacing P4's one-line warning) and `SchemeDetailScreen`.

Added `formatNumber` to `shared/lib/format.ts` (Indian digit grouping, no currency sign) for the funnel counts. Added `recommender.odds.*` locale keys to both `en.json`/`hi.json`; removed the now-unused `recommender.schemes.lowOddsWarning`/`betterOdds` keys P4 had added but P5 superseded.

## Verification
- `npm test` (root): 111 shared, 216 web (30 new/changed for odds: 2 `oddsView` unit tests, 1 `resultView` case, 1 `detailView` case, 5 RTL journey tests covering real rate display, low-odds warning + alternatives ordering, no badge on NSFDC, funnel disclosure text, and alternative-link navigation), 15 script tests — all green.
- `npm run typecheck`, `npm run lint` (oxlint + boundaries + i18n + specs) — all green.
- Manual 360px/en+hi browser check — not done this session (same Chrome-extension limitation as P4); flagging as open, same as P4's was before the user confirmed it separately.

## Process note
P4 had been left uncommitted at the end of the previous turn with a "commit pending" note instead of an actual commit. The user corrected this: commit completed phases immediately, not just flag it as an offer. Saved as a durable memory (`commit-after-each-phase.md`). P4 was committed (`317ab56`) before starting P5's work in this turn.

## Deferred / follow-ups
- Manual browser check at 360px (en + hi) for the odds badge, alternatives list, and funnel disclosure — do before treating P5 as fully done.
