# Yojna Sarthi — SIH 2026, PS 26092

The decision-and-execution layer between SC entrepreneurs in Uttar Pradesh and NSFDC / PM-AJAY money: which scheme fits, what it really costs, which partner can fund it, and where the application is. Citizen + officer web app (PWA), running today on a **stateful mock backend** that behaves like the real Fastify + Supabase one.

Product spec lives in `docs/` (start with `docs/00-INDEX.md`; features in `docs/05-features.md`, stack in `docs/06-tech-stack.md`). Approved design: `docs/superpowers/specs/2026-09-26-yojna-sarthi-frontend-design.md`.

## Where things live

| What | Where |
|---|---|
| Resume point, phase table, deferred issues (read first, every session) | `specs/office/progress.md` |
| Architecture (source of truth; never deviate without approval) | `specs/architecture.md` |
| Phase specs (written and agreed before work starts) | `specs/office/phase-N-<name>.md` |
| Session dev journal | `specs/logs/YYYY-MM-DD-<topic>.md` |
| Product requirements | `docs/PRD.md` |
| Product evidence and features (one fact, one doc) | `docs/00-INDEX.md` to `docs/06-tech-stack.md` |
| Per-module summaries (frozen after 2026-09-26; new work goes in `specs/logs/`) | `docs/BUILD-LOG.md` |
| Mentor Q&A notes | `learning/` (style: `.claude/rules/senior-mentor.md`) |

Team safeguards (committed, so every clone gets them): `npm run lint` fails if `progress.md` is malformed or a started phase has no spec (`scripts/check-specs.mjs`); Claude asks before editing `specs/architecture.md`, `.claude/settings.json` or `.claude/hooks/`; `.github/CODEOWNERS` routes those paths to the owner for review (turn on "Require review from Code Owners" in GitHub branch protection). Hooks need `jq` installed; a SessionStart warning appears if it is missing. Personal overrides go in `.claude/settings.local.json` (gitignored).

A SessionStart hook injects the "Pick up here" line and the latest log's next steps into every session, including after `/clear` and compaction.

## Rules

0. Start every session by reading `specs/office/progress.md`.
1. Read `specs/architecture.md` before writing code. Never deviate without listing the changes and getting explicit approval.
2. Don't start a feature until its phase spec exists and the user has agreed to it.
3. At the end of a session or task: write a log in `specs/logs/`, tick items in `progress.md`, mark finished phases in their phase file.
4. If `progress.md` and the code disagree, flag the mismatch; don't silently trust either.
5. Stay within the current phase. Note unrelated bugs under "Deferred" in `progress.md`; don't fix them inline.
6. Read only files relevant to the task; don't re-read unchanged files; ask for a path instead of grepping blindly.
7. Match existing naming and patterns exactly.
8. Flag new dependencies and get approval before adding them.
9. Never invent APIs; check docs with context7 (versions here are newer than most training data: React Router 8, Vitest 5, Zod 4, i18next 26, Tailwind 4, Vite 8, TS 6).
10. After any code change run typecheck, lint and the relevant tests before calling it done.
11. Keep files under 300 lines (generated `shared/ui/*` exempt); propose a split instead of growing one.
12. Comments: short, inline, one sentence max. No decorative separators or paragraph headers.
13. Mentor Q&A: write the `learning/` note in the same turn.
14. Invoke relevant skills before coding: `superpowers:brainstorming` (new behaviour), `superpowers:test-driven-development` (logic), `superpowers:systematic-debugging` (bugs), `react`, `typescript`, `tailwindcss`, `tanstack-query`, `vite`, `zod-schema-validation`, `frontend-design` / `impeccable` (UI), `a11y-audit` (screens), `superpowers:verification-before-completion`.

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

Claude Code hooks (`.claude/hooks/`, wired in `.claude/settings.json`): oxlint `--deny-warnings` on every edited TS file; on Stop, if TS/JSON changed, typecheck + lint + script tests + `vitest related` must pass; edits to `.env*`/credential files, reading `.env`, and force-push are blocked; remote `supabase db push` and `git reset --hard` ask first.

## Mock backend contract

Repositories return Promises and run through `mockTransport` (200–500 ms latency, per-repository error injection from the dev panel). `MockDb` holds all tables in IndexedDB (versioned key, "Reset demo data" in the dev panel), seeded from `@ys/shared/seed` plus ~150 generated applications. Officer actions write to the same DB the citizen reads, so the status tracker reflects them. Login is mock phone OTP; roles: `citizen`, `district_officer`, `hq_admin`. Real backend later = new `core/data/http/*` implementations; nothing else changes.

## Feature status

See `specs/office/progress.md` (single source).

## Known issues / seeded data

- **Seeded (no public source):** partner health for all entities (shown with a "demo data" marker in the UI); bank branch names/locations (5 demo districts, pending a razorpay/ifsc import); loan tenures; CGTMSE fee (0.37% p.a.); training hours per project (cost = hours × ₹35.10 Category-III rate); PM-AJAY bank-loan rate range; stage-duration split (total ≈ 120 days matches the published ~4 months; the 5-day bank SLA is real); PMEGP own-contribution 5%; Mudra/PMEGP rates.
- **District coordinates** are approximate HQ points; district office addresses are generic ("District Office, <district>").
- **PM-AJAY projects 11–16** have approval rates but no SOP cost sheet, so the calculator uses the applicant's estimate and says so.
- **Hindi project names:** only the boutique name is verbatim from the SOP; the rest are our translations pending SOP verification (F0.4).
- **Micro Credit caps:** ₹1.40L is the project cap and ₹1.25L the loan cap (90%); both are modelled.
- Travel time is straight-line distance until Google Directions is wired.
