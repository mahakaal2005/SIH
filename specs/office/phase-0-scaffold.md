# Phase 0: Scaffold + tooling

Status: ✅ done (2026-09-26, commit b67a040). Retroactive summary.

## Goal
Working monorepo with app, shared package and quality gates.

## In scope / done
- npm workspaces `apps/web` and `packages/shared`
- React 19, Vite 8, TypeScript 6, Tailwind 4, shadcn (radix/nova) primitives in `shared/ui`
- oxlint, Vitest, Playwright config; `scripts/check-boundaries.mjs`

## Out of scope
All features; backend.

## Acceptance criteria (met)
`npm run dev` serves the app; `typecheck`, `lint`, `test` scripts exist and run.

## Files touched
Root `package.json`, `apps/web/**`, `packages/shared/**`, `scripts/`.

## Open questions
None.
