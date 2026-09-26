# Progress

**Current phase:** P7 Partner locator (⬜ spec not written)
**Pick up here:** write `phase-7-partner-locator.md` (F3) and get it agreed before any P7 code. `/schemes/:schemeId/partners` currently shows not-found.

Status: ⬜ not started · 🟡 in progress · ✅ done. A phase spec must exist and be agreed before its work starts.

| # | Phase | Requirements | Status | Spec |
|---|---|---|---|---|
| P0 | Scaffold + tooling | - | ✅ | `phase-0-scaffold.md` |
| P1 | Shared engine + seed | F1.2-F1.7, F2.1-F2.6, F3.2, F3.6, F4.1, F8.2 | ✅ | `phase-1-shared-engine.md` |
| P2 | Web core | F0.1, F0.2, F0.5, F0.6 | ✅ | `phase-2-web-core.md` |
| P3 | Auth + onboarding | F0, F1.1, F5.5 | ✅ | `phase-3-auth-onboarding.md` |
| P4 | Recommender | F1 | ✅ | `phase-4-recommender.md` |
| P5 | Approval odds | F4 | ✅ | `phase-5-approval-odds.md` |
| P6 | Calculator | F2 | ✅ | `phase-6-calculator.md` |
| P7 | Partner locator | F3 | ⬜ | not written |
| P8 | Document checklist | F6 | ⬜ | not written |
| P9 | Status tracker | F8 | ⬜ | not written |
| P10 | Voice | F5 | ⬜ | not written |
| P11 | Officer dashboard + rules admin | F7 | ⬜ | not written |
| P12 | PWA + a11y polish | - | ⬜ | not written |

## Checklist
- [x] P0 workspaces, Vite app, Tailwind + shadcn, oxlint, Vitest/Playwright config
- [x] P1 engine + seed (97 tests)
- [x] P2 web core (commit d20ae6d)
- [x] P3 auth + onboarding (commit f222ad8)
- [x] P4 recommender (commit 317ab56)
- [x] P5 approval odds (commit d30c852) — browser-checked, one bug found and fixed, see log 2026-09-27-p5-approval-odds.md
- [x] P6 calculator (commit pending this turn) — browser-checked, one bug found and fixed, see log 2026-09-27-p6-calculator.md
- [ ] P7 to P12: spec first, then build (order above)

## Deferred / Known issues
- Product-data caveats (seeded values, approximate coordinates, Hindi names pending SOP verification) live in `CLAUDE.md` "Known issues"; do not duplicate here.
- Infra not yet done: GitHub Actions CI, Supabase keepalive, gitleaks pre-commit, Supabase/Playwright MCP.
- Open doc items in `docs/00-INDEX.md` (Supabase project, Bhashini/Groq keys, GCP budget alerts).

## Mismatch rule
If this file and the code disagree, flag it to the user before proceeding; do not trust either silently.
