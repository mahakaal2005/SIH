# Phase 1: Shared engine + seed

Status: ✅ done (2026-09-26, commit d25d75f). Retroactive summary; details in `docs/BUILD-LOG.md`.

## Goal
Deterministic, tested rule engine and real UP seed data in `packages/shared`, reusable unchanged by a future Fastify backend.

## In scope / done
Eligibility evaluator over versioned Zod-validated rules; recommender (tiering, odds ranking, low-odds alternatives, caste-neutral fallback); finance (EMI with moratorium, NSFDC 90% and caps, PM-AJAY split, affordability); partner health gate; district alias resolver; stage timeline; receipt canonicalisation. Seed: 75 districts + aliases, 16 PM-AJAY projects, approval stats, schemes and rules, documents, partners. 97 tests.

## Out of scope
UI, persistence, network.

## Acceptance criteria (met)
`npm test -w @ys/shared` green; seed-integrity test guards references and totals.

## Files touched
`packages/shared/src/{engine,schemas,seed,types}/**`.

## Open questions
Seeded values pending real sources are listed in `CLAUDE.md` "Known issues".
