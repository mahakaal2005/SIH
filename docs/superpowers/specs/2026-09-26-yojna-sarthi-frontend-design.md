# Yojna Sarthi — Frontend MVP on a stateful mock backend

## Context

SIH 2026, PS 26092. We're building the citizen + officer web app for Yojna Sarthi. The repo currently holds only the docs (`docs/00`–`06`) and no code. There's no backend yet, so we build the full production flow (the one agreed in chat) against a **stateful mock backend** that behaves like the real one: data persists, officer actions change citizen status, login is a mock OTP, and each call has a latency and a failure mode. When Fastify + Supabase arrive, only the repository implementations change. Screens, use-cases and the rule engine stay as they are.

Locked sources: stack from `docs/06-tech-stack.md`, features F0–F8 from `docs/05-features.md`, real seed data from `docs/04-up-reference.md` (projects, 75 districts, alias map, documents, process), `docs/02-the-problem.md` §2.1b (approval rates, 62.9% funnel) and `docs/01-the-system.md` (NSFDC caps/rates, ₹5L income ceiling, health gates, PMEGP/Mudra).

User-agreed decisions: Android-style Clean Architecture by feature + MVI; features never import each other; everything shared goes in `core/`/`shared`; build module by module; the rule engine is data-driven (rules are versioned JSON, not code); full depth and tests (no one-day cuts).

## Architecture

**npm workspaces monorepo**
```
apps/web/                  React 19 + Vite + TS + Tailwind + shadcn/ui + PWA
packages/shared/           pure TS, zero React — imported later by Fastify unchanged
  src/types/               Scheme, EligibilityRule, ApplicantProfile, Partner, PartnerHealth,
                           Application, ApplicationStage, District, DocumentRequirement, ...
  src/schemas/             Zod schemas (forms + validating incoming rule/seed data)
  src/engine/              eligibility evaluator, ranking, EMI+moratorium, PM-AJAY grant split,
                           partner health gate, district alias resolver, stage-timeline estimator
  src/seed/                real seed JSON (+ provenance), consumed by mock backend
```

**Android → web mapping** (every feature follows this exactly):

| Android | Here |
|---|---|
| Repository interface | `apps/web/src/core/data/repositories/*.ts` (interfaces only) |
| Repository impl | `core/data/mock/Mock*Repository.ts` now → `core/data/http/Http*Repository.ts` later |
| Hilt module | `core/di/RepositoryProvider.tsx` — the **only** file choosing mock vs http (`VITE_DATA_SOURCE`) |
| Single source of truth | TanStack Query cache (server state) + `core/session` (auth, language, `ApplicantProfile` draft) |
| UseCase | `features/<f>/domain/*.usecase.ts` — pure fns taking repos + shared engine; unit-tested |
| ViewModel (MVI) | `features/<f>/presentation/use<Screen>ViewModel.ts` — `State`, `Event` union, pure `reduce()`, effects call use-cases via TanStack Query |
| Screen | `features/<f>/presentation/<Screen>.tsx` — renders State, dispatches Events, no logic |

Feature folder: `data/` (query keys + hooks wrapping repos), `domain/`, `presentation/`, `spec.md`. The ESLint `no-restricted-imports` rule blocks `features/a` → `features/b`. Cross-feature navigation goes through `core/router` route constants only.

**Mock backend** (`core/data/mock/`): a `MockDb` holds tables (schemes, rules, projects, approvalStats, districts, partners, partnerHealth, applications, users) seeded from `packages/shared/src/seed`, persisted to IndexedDB (`idb-keyval`), versioned key, and a "Reset demo data" action. A `mockTransport` adds a 200–500ms delay plus an optional error injection (dev panel toggle per repo), so loading/error states are real. It seeds ~150 applications across districts with realistic ageing, so the officer queue and the 62.9% stall look real.

**Swappable services** (interfaces in `core/services`, impl chosen in `core/di`):
- `LanguageService`: Web Speech API impl (hi-IN/en-IN ASR + TTS) now; Bhashini adapter stub.
- `MapProvider`: Leaflet + OSM now; Google Maps adapter behind `VITE_USE_GOOGLE_MAPS`.
- `ExplanationService`: deterministic i18n templates from rule reasonKeys now; LLM adapter later.
- `IdentityService`: mock OTP (fixed code shown in dev hint); roles `citizen | district_officer | hq_admin`.
- `ReceiptSigner`: real WebCrypto ECDSA P-256; the mock "server" keypair lives in MockDb, and verification works on any pasted receipt.
- `DigiLockerService`: mock consent screen → returns caste/income certificate as verified.

**Other stack (from doc 06):** react-i18next, TanStack Query, React Hook Form + Zod, React Router v7, Recharts, react-pdf, vite-plugin-pwa, Vitest + RTL, Playwright.

## Data & rules (real vs seeded)

Every seed record has `provenance: { kind: 'real' | 'seeded', ref: 'docs/04 Part C' }`. Anything the docs don't supply is `seeded` and listed in CLAUDE.md "Known issues". No silent invention.

- **Real:** 10 PM-AJAY projects with costs, gender restriction, NSQF codes (doc 04 C); approval rates for all 16 projects + funnel + Rampur/Bahraich (doc 02); 75 districts + emails + 8 aliases (doc 04 E); PM-AJAY eligibility B2 and grant rule (min ₹50k, 50% cost), 5% contribution; NSFDC Micro Credit (project ≤₹1.40L / loan ≤₹1.25L, 90%), Term Loan (₹1.40L–50L / loan ≤₹45L), Education (≤₹40L or 90% fee), UNY (≤₹4.5L on ≤₹5L), AMY (≤₹1.25L, only where no working SCA → not applicable in UP, shown with reason); income ceiling ₹5L; rates 6.5–8%, micro up to 15% (5% + 10% SCA margin); health gates (overdue >1y, ≥80% utilisation, RRB NPA <15%, PSB no overdues); document lists D3 + livestock extras; process stages + 5-day bank SLA + SRF 18 months; PMEGP (25/35% SC subsidy, ₹50L/₹20L, no income cap, VIII pass rule) and Mudra (≤₹20L) as fallbacks.
- **Seeded (flagged):** loan tenures, CGTMSE fee %, per-project training cost (derived from course hours × ₹35.10–49/hr category rates, category assumed), costs for projects 11–16 (shown as "cost: see SOP", excluded from calculator), partner health values, bank branch list/coords for the 5 demo districts, district HQ coordinates (approximate), stage durations beyond the published SLAs.
- **Rule format:** `EligibilityRule { schemeId, version, effectiveFrom, criteria: { field, op: eq|in|lte|gte|between|notTrue, value, reasonKey }[] }`. The evaluator returns per-criterion pass/fail + reasonKeys, so the UI shows *why*. Each recommendation stores `ruleVersion`.

## Features (build order = module order; each ends with tests green + commit)

0. **Scaffold** — workspaces, Vite app, Tailwind + shadcn init, ESLint boundaries, Vitest/Playwright config, i18n (en/hi, `lakh/crore` + DD-MM-YYYY formatters), router shell, app layout (mobile-first), `core/di`, `core/session`, MockDb + transport, dev panel (role switch, error injection, reset). CLAUDE.md + BUILD-LOG created here.
1. **shared engine (TDD)** — evaluator, ranking, EMI with moratorium (interest accrues during moratorium, then amortised), grant split, health gate, alias resolver, timeline estimator. Edge-case tests: ₹1.45L project (just over micro → Term Loan + explicit boundary note), age 51 (PM-AJAY fails, NSFDC passes), male + boutique (women-only fail), income ₹6L (NSFDC fails → PM-AJAY/PMEGP fallback), Allahabad → Prayagraj.
2. **auth + onboarding (F0)** — language picker is the first screen (persisted), mock OTP login, profile intake (RHF + Zod, F1.1 fields + PM-AJAY B2 fields: literacy, group willingness, defaulter/OTS, disability, transgender), assisted-mode toggle (F5.5, operator fills for someone).
3. **recommender (F1)** — ranked eligible list + "not eligible, because…" list, template explanations, boundary notes, caste-neutral fallback, Hindi scheme names from data (`nameHi`).
4. **approval-odds (F4)** — odds badge on each recommendation, project comparison chart (Recharts, all 16), district throughput, low-odds warning with better alternatives, 62.9% disclosure.
5. **calculator (F2)** — loan mode (principal, rate slider within scheme range, tenure, moratorium 3–12, total interest, 90% cap enforcement, affordability warning vs income) and GIA mode (the 5-component SOP split → net loan → EMI).
6. **partner-locator (F3)** — Leaflet map + list, filtered to partners authorised for the chosen scheme, health badge with reason, blocked partners shown and marked + next-best alternative, UPSCFDC district office always shown, alias-aware district search.
7. **document-checklist (F6)** — per-scheme checklist with tick states, DigiLocker mock link-out, pre-flight gates (CIBIL/penny-drop/no-default, simulated with explained results), project report PDF (react-pdf; validates all 5 SOP components before enabling download), submit → signed receipt.
8. **status-tracker (F8)** — stage timeline (pre-scrutiny → DLPAC → bank 5-day SLA → sanction → SRF 18 months) with expected dates, notification inbox (mock SMS/WhatsApp), rejection reason + fix-and-reapply, anti-fraud panel (process is free, no middleman, RBI Ombudsman path), "verify a sanction letter/receipt" tool.
9. **voice (F5)** — mic-driven intake over the onboarding form (प्रपत्र-02-style spoken-number questions), a read-aloud button on results/status, icon-led controls; graceful fallback message when the browser lacks Speech API.
10. **officer-dashboard (F7)** — district queue (ageing buckets, oldest first), stalled alerts, pre-scrutiny actions (approve/reject with reason/forward) that **update the citizen's status via MockDb**, HQ partner-health view, Tele Caller call-list (CSV export), rules admin (add/edit scheme rule, Zod-validated, new version → recommendations change immediately).
11. **PWA + polish** — manifest/SW, a11y pass (`a11y-audit` skill), responsive pass at 360px, error boundary.

## Process & docs

- **Root `CLAUDE.md`** (created in step 0, updated at every status change): summary, stack, folder structure, Android→web mapping table, feature status table, mock contract summary, conventions (MVI template, i18n keys `feature.screen.element`, no hardcoded strings, provenance rule), **"Before any development: list available skills and invoke the relevant ones (e.g. superpowers:test-driven-development, react, tailwindcss, tanstack-query, vite, frontend-design/impeccable for UI, a11y-audit, verification-before-completion)"**, known issues / seeded data list.
- **`docs/BUILD-LOG.md`**: append-only dated entries per module.
- **`features/<f>/spec.md`**: written before the module; covers purpose, requirement IDs covered, states (idle/loading/empty/error/success), data shapes, what's mocked vs real later.
- One commit per module, after tests pass and the screen works in the browser.

## Critical files (representative)

`package.json` (workspaces), `packages/shared/src/engine/{eligibility,emi,grantSplit,partnerHealth,districtAlias,timeline}.ts`, `packages/shared/src/seed/*.json`, `apps/web/src/core/di/RepositoryProvider.tsx`, `apps/web/src/core/data/mock/MockDb.ts`, `apps/web/src/core/data/repositories/*.ts`, `apps/web/src/core/i18n/{en,hi}.json`, `apps/web/src/features/recommender/presentation/useRecommenderViewModel.ts` (the MVI template the others copy), `CLAUDE.md`, `docs/BUILD-LOG.md`.

## Verification

- `npm test` (Vitest): engine edge cases, every ViewModel reducer, key screen RTL tests — all green.
- `npm run typecheck` and `npm run lint` (incl. the cross-feature import ban) clean.
- `npm run dev`: no console errors; manual click-through at 360px and desktop.
- Playwright E2E:
  1. Citizen journey (Hindi): language → OTP → profile (Sitapur, F, 32, ₹1.2L boutique, income ₹1.8L) → recommendations (PM-AJAY Boutique top, odds 38.7%) → calculator GIA split → locator (blocked partner marked + alternative) → checklist → PDF → submit → signed receipt → status.
  2. Officer journey: switch to district officer (Sitapur) → application in queue → approve pre-scrutiny → back as citizen → status advanced.
  3. Rules admin: edit rule → new version → recommendation changes.
  4. Receipt verification: genuine verifies, tampered fails.
  5. Error injection on recommendations → error state → retry works.
