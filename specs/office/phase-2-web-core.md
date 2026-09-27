# Phase 2: Web core

Status: ✅ done (commit d20ae6d). Written retroactively on 2026-09-26 while work was already underway; checklist reflects files seen on disk that day.

## Goal
The app-wide foundation every feature builds on: data layer with a stateful mock backend, DI, session, routing, i18n and formatting, so features only add `data/domain/presentation`.

## In scope
- Repository contracts and a stateful `MockDb` (IndexedDB), transport with latency and error injection, receipt signing, generated applications
- Typed data errors
- `core/config.ts`, `core/di` (container + `RepositoryProvider`), `core/session` (store + provider), route constants in `core/router`
- react-i18next with `en` and `hi` locale files, coverage test, Indian formatters (rupee, lakh/crore, DD-MM-YYYY)
- App shell: router, mobile-first layout, language switch, dev panel (reset data, error injection, role switch), error boundary

## Out of scope
Any feature screen (P3+), real backend, voice, PWA manifest and service worker (P12), Google Maps.

## Tasks
- [x] Repository interfaces (`core/data/repositories/types.ts`)
- [x] `MockDb`, `transport`, `signing`, `seedApplications`, `repositories` (with tests)
- [x] Typed errors (`core/data/errors.ts`, tests)
- [x] `core/config.ts`
- [x] `core/di` container and `RepositoryProvider`
- [x] `core/session` store and provider (tests for store)
- [x] `core/router/routes.ts`
- [x] i18n setup, `en.json`, `hi.json`, coverage test
- [x] `shared/lib/format.ts` with tests
- [x] Router shell and app layout wired in `App.tsx` (currently a placeholder)
- [x] Language picker component and persisted language
- [x] Dev panel (reset demo data, per-repository error injection, role switch)
- [x] Error boundary
- [x] Split `repositories.ts` under 300 lines (or defer with approval)
- [x] Commit P2 after typecheck, lint and tests are green and the shell works in a browser

## Acceptance criteria
- `npm run typecheck`, `npm run lint`, `npm test` all green.
- App loads at 360px and desktop with no console errors; switching language changes every visible string.
- Injecting an error in the dev panel makes a repository call fail and recover on retry.
- Reset demo data restores the seeded state.
- Swapping `VITE_DATA_SOURCE` is the only change needed to select an implementation (no feature edits).

## Files and modules touched
`apps/web/src/core/**`, `apps/web/src/shared/i18n/**`, `apps/web/src/shared/lib/format*`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`.

## Open questions
- Resolved: dev panel always in dev, in production only with `VITE_SHOW_DEV_TOOLS=true`.
- Resolved: `repositories.ts` split into one file per repository under `core/data/mock/repositories/`.
- Resolved: app composition lives in a new `app/` layer (architecture.md updated, enforced by check-boundaries).
- Note: the dev panel shows demo accounts instead of a role switch; logging in with an officer number is the role switch.
