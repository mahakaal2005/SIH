# Architecture (source of truth)

Change this file only with explicit approval. Rationale for the stack lives in `docs/06-tech-stack.md`; the original design is `docs/superpowers/specs/2026-09-26-yojna-sarthi-frontend-design.md` (history, not authority).

## Principles
1. **Rules decide, LLM explains.** Eligibility, EMI, partner health are deterministic code in `packages/shared/src/engine`.
2. **PII never reaches an LLM.** Any `llm/` directory may not reference name, caste, income, phone, Aadhaar or `ApplicantProfile`; only `llm/privacy/` may. Enforced by `scripts/check-boundaries.mjs`.
3. **No hardcoded user-visible strings (F0.6).** i18n keys only; `en` and `hi` key sets identical. Enforced by `scripts/check-i18n.mjs`.
4. **Degrade, never die.** Every external dependency sits behind an interface with a fallback.
5. **Rules are data.** Eligibility changes are new rule versions (`version`, `effectiveFrom`), never code edits.

## Layers and modules
```
packages/shared/src/   pure TS, zero React; the future Fastify backend imports it unchanged
  types/ schemas/      domain types; Zod schemas (profile, rule)
  engine/              eligibility, recommend, finance, partnerHealth, geo/alias, timeline, application
  seed/                real seed data, each record carries provenance {kind: real|seeded, ref}
apps/web/src/
  app/                 composition root: router, shell, providers, boot, dev panel; the only layer that imports features
  core/                app-wide: di/, data/ (repositories, mock), session/, router/, services/, config.ts
  shared/              ui/ (shadcn, do not hand-edit), lib/, i18n/locales/{en,hi}.json, presentational components
  features/<name>/     data/ · domain/ · presentation/   (one folder per feature)
scripts/               check-boundaries.mjs, check-i18n.mjs (+ node tests)
```
Import rules: only `app/` (and `main.tsx`) may import `app/` or feature screens; a feature never imports another feature; shared code goes to `core/` or `shared/`; `packages/shared` never imports React or `@/`; cross-feature navigation uses route constants from `core/router/routes.ts`.

## Android to web mapping
| Android | Here |
|---|---|
| Repository interface | `core/data/repositories/*.ts` (interfaces only) |
| Repository impl | `core/data/mock/*` now, `core/data/http/*` later |
| Hilt module | `core/di/` is the only place choosing mock vs http (`VITE_DATA_SOURCE`) |
| Single source of truth | TanStack Query cache (server state) + `core/session` (auth, language, profile draft) |
| UseCase | `features/<f>/domain/*.usecase.ts`: pure functions over repositories + engine |
| ViewModel (MVI) | `features/<f>/presentation/use<Screen>ViewModel.ts`: `State`, `Event` union, pure `reduce()`, effects call use-cases |
| Screen | `features/<f>/presentation/<Screen>.tsx`: renders State, dispatches Events, no logic |

## Naming
- Files: `PascalCase.tsx` for components and classes, `camelCase.ts` for modules, `*.usecase.ts`, `*.test.ts(x)` beside the source.
- i18n keys: `feature.screen.element` (e.g. `recommender.results.title`); rule reasons use the engine `reasonKey` (`rule.*`, `prio.*`).
- Scheme, project and district names are data (`Localized {en, hi}`), not i18n keys.
- Formatting: Indian conventions (rupee sign, lakh/crore, DD-MM-YYYY) via `shared/lib/format`.

## State and data flow
Screen dispatches Event, `reduce()` yields State, effects call use-cases through TanStack Query, use-cases call repositories, repositories go through `mockTransport` (200-500 ms latency, per-repository error injection). Every screen State has `status: 'idle' | 'loading' | 'empty' | 'error' | 'success'`.

## Mock backend contract
`MockDb` holds all tables in IndexedDB (versioned key, reset from the dev panel), seeded from `@ys/shared/seed` plus generated applications. Officer actions write to the same DB the citizen reads. Mock OTP login; roles `citizen`, `district_officer`, `hq_admin`. Receipts are really signed (WebCrypto ECDSA P-256).

## Error handling
Repositories throw typed errors from `core/data/errors.ts`; the ViewModel maps them to `status: 'error'` with an i18n message key and a retry event. No silent catches.

## Dependency injection
`core/di/container.ts` builds the repository and service set; `RepositoryProvider` exposes it via context. Tests inject mocks or in-memory fakes; no module-level singletons in features.

## Testing
TDD for all logic (engine, use-cases, reducers). RTL for key screens, Playwright for journeys. Mocks must behave like the real backend contract. Gate before done: `npm run typecheck`, `npm run lint`, `npm test`.

## Provenance
Every seed record has `provenance {kind, ref}`. Anything the docs do not supply is `seeded` and listed in CLAUDE.md "Known issues". No silent invention.

## Limits
Max **300 lines per file** (generated `shared/ui/*` exempt). Propose a split before a file crosses it.
