# Yojna Sarthi — SIH 2026, PS 26092

The decision-and-execution layer between SC entrepreneurs in Uttar Pradesh and NSFDC / PM-AJAY money: which scheme fits, what it really costs, which partner can fund it, and where the application is. Citizen + officer web app (PWA), running today on a **stateful mock backend** that behaves like the real Fastify + Supabase one.

Product spec lives in `docs/` (start with `docs/00-INDEX.md`; features in `docs/05-features.md`, stack in `docs/06-tech-stack.md`). Approved design: `docs/superpowers/specs/2026-09-26-yojna-sarthi-frontend-design.md`.

## Before any development

1. **List the available skills and invoke every relevant one before writing code.** Typical: `superpowers:brainstorming` (new behaviour), `superpowers:test-driven-development` (all logic), `superpowers:systematic-debugging` (bugs), `react`, `typescript`, `tailwindcss`, `tanstack-query`, `vite`, `zod-schema-validation`, `frontend-design` / `impeccable` (UI), `a11y-audit` (screens), `superpowers:verification-before-completion` (before claiming done).
2. Read this file, then `docs/BUILD-LOG.md` (latest entries), then the feature's `spec.md`.
3. Check library docs with context7 before using an API. Versions here are newer than most training data (React Router 8, Vitest 5, Zod 4, i18next 26, Tailwind 4, Vite 8, TS 6).

## Stack

npm workspaces · React 19 + Vite 8 + TypeScript 6 · Tailwind 4 + shadcn/ui (radix, nova) · React Router 8 (data mode) · TanStack Query 5 · React Hook Form + Zod 4 · react-i18next · Leaflet (Google Maps behind `VITE_USE_GOOGLE_MAPS`) · Recharts · @react-pdf/renderer · idb-keyval (mock DB persistence) · Vitest 5 + RTL · Playwright · oxlint.

## Folder structure

```
packages/shared/src/        pure TS, zero React — the backend will import this unchanged
  types/ schemas/           domain types; Zod schemas (profile, eligibility rule)
  engine/                   rule evaluator, recommender, finance, partner health, geo/alias, timeline, application helpers
  seed/                     real seed data with provenance (docs 01/02/04)
apps/web/src/
  core/                     app-wide: di/, data/ (repositories, mock backend), session/, router/, services/, config
  shared/                   ui/ (shadcn), lib/, i18n/locales/{en,hi}.json, cross-feature presentational components
  features/<name>/          data/ · domain/ · presentation/ · spec.md
scripts/                    check-boundaries.mjs, check-i18n.mjs (+ node tests)
```

## Architecture (Android Clean Architecture → web)

| Android | Here |
|---|---|
| Repository interface | `core/data/repositories/*.ts` (interfaces only) |
| Repository impl | `core/data/mock/*` now → `core/data/http/*` later |
| Hilt module | `core/di/` — the only place that picks mock vs http (`VITE_DATA_SOURCE`) |
| Single source of truth | TanStack Query cache (server state) + `core/session` (auth, language, profile draft) |
| UseCase | `features/<f>/domain/*.usecase.ts`: pure functions over repositories + `@ys/shared` engine |
| ViewModel (MVI) | `features/<f>/presentation/use<Screen>ViewModel.ts`: `State`, `Event` union, pure `reduce()`, effects call use-cases |
| Screen | `features/<f>/presentation/<Screen>.tsx`: renders State, dispatches Events, no logic |

**Hard rules (enforced by `npm run lint`):**
- A feature never imports another feature. Shared things go to `core/` or `shared/`. Cross-feature navigation uses route constants from `core/router`.
- `packages/shared` never imports React or web code.
- **Rules decide, LLM explains.** Eligibility is only ever decided by `@ys/shared` engine. Any LLM code lives under an `llm/` directory and may not touch PII (name, caste, income, Aadhaar, phone); only `llm/privacy/` (the masking gate) may.
- **No hardcoded user-visible strings (F0.6).** All copy goes through i18n keys in `apps/web/src/shared/i18n/locales/{en,hi}.json` (identical key sets, none empty). A genuinely non-translatable literal needs an `i18n-ignore` comment on the same line.

## Conventions

- **MVI template:** copy the recommender feature's ViewModel once it exists. Every screen state has `status: 'idle' | 'loading' | 'empty' | 'error' | 'success'`.
- **i18n keys:** `feature.screen.element` (e.g. `recommender.results.title`). Rule reasons use the engine's `reasonKey` (`rule.*`, `prio.*`). Scheme/project/district names are data (`Localized {en, hi}`), not i18n keys.
- **Formatting:** Indian conventions: ₹, lakh/crore grouping, DD-MM-YYYY (helpers in `shared/lib/format`).
- **Provenance:** every seed record carries `provenance: {kind: 'real' | 'seeded', ref}`. Never add a number without a doc reference; if there isn't one, mark it `seeded` and list it below.
- **Rules are data:** eligibility changes are new rule *versions* (`version`, `effectiveFrom`), never code edits. Each recommendation stores the `ruleVersion` that decided it.
- **Tests:** TDD for all logic (engine, use-cases, reducers). RTL for key screens, Playwright for journeys.
- **Commits:** one per feature/module, after `npm test`, `npm run typecheck` and `npm run lint` pass and the screen works in a browser.

## Commands

`npm run dev` · `npm test` · `npm run typecheck` · `npm run lint` (oxlint + boundaries + i18n) · `npm run e2e`

## Mock backend contract

Repositories return Promises and run through `mockTransport` (200–500 ms latency, per-repository error injection from the dev panel). `MockDb` holds all tables in IndexedDB (versioned key, "Reset demo data" in the dev panel), seeded from `@ys/shared/seed` plus ~150 generated applications. Officer actions write to the same DB the citizen reads, so the status tracker reflects them. Login is mock phone OTP; roles: `citizen`, `district_officer`, `hq_admin`. Real backend later = new `core/data/http/*` implementations; nothing else changes.

## Feature status

| Module | Req IDs | Status |
|---|---|---|
| Scaffold + tooling | — | Done |
| Shared engine + seed | F1.2–F1.7, F2.1–F2.6, F3.2, F3.6, F4.1, F8.2 | Done (97 tests) |
| Web core (i18n, router, DI, session, mock backend, dev panel) | F0.1, F0.2, F0.5, F0.6 | Not started |
| Auth + onboarding | F0, F1.1, F5.5 | Not started |
| Recommender | F1 | Not started |
| Approval odds | F4 | Not started |
| Calculator | F2 | Not started |
| Partner locator | F3 | Not started |
| Document checklist | F6 | Not started |
| Status tracker | F8 | Not started |
| Voice | F5 | Not started |
| Officer dashboard + rules admin | F7 | Not started |
| PWA + a11y polish | — | Not started |

## Known issues / seeded data

- **Seeded (no public source):** partner health for all entities (shown with a "demo data" marker in the UI); bank branch names/locations (5 demo districts, pending a razorpay/ifsc import); loan tenures; CGTMSE fee (0.37% p.a.); training hours per project (cost = hours × ₹35.10 Category-III rate); PM-AJAY bank-loan rate range; stage-duration split (total ≈ 120 days matches the published ~4 months; the 5-day bank SLA is real); PMEGP own-contribution 5%; Mudra/PMEGP rates.
- **District coordinates** are approximate HQ points; district office addresses are generic ("District Office, <district>").
- **PM-AJAY projects 11–16** have approval rates but no SOP cost sheet, so the calculator uses the applicant's estimate and says so.
- **Hindi project names:** only the boutique name is verbatim from the SOP; the rest are our translations pending SOP verification (F0.4).
- **Micro Credit caps:** ₹1.40L is the project cap and ₹1.25L the loan cap (90%); both are modelled.
- Travel time is straight-line distance until Google Directions is wired.
