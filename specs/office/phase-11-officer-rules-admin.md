# Phase 11: Officer Dashboard + Rules Admin

Status: ✅ done — built, gate green (15 script + 111 shared + 305 web tests, typecheck, lint). Browser check not run: the Claude-in-Chrome extension was disconnected for the third session in a row — verified via RTL instead (district-scoped vs. system-wide queue, stalled flagging, officer actions transitioning applications with reason prompts for reject/return, partner-health badges per entity, rules browsing with scheme switching).

## Goal
PS 26092 / F7 responds to an MP SC Finance Corporation president's own words — "I am not aware of the progress of the schemes, I will be able to tell something only after I have statistics" — and the fact that 62.9% of UP applications sit undecided with no one watching. Routes (`/officer`, `/officer/applications/:id`, `/officer/partners`, `/officer/rules`) are already reserved, nav links to them already exist in `AppShell.tsx`, and seed data already has per-demo-district `district_officer` accounts plus one `hq_admin` account — but zero route entries exist in `router.tsx` and no officer feature folder exists at all. As with every phase since P4, the hard data/engine layer was already built in P1 ahead of need: `ApplicationRepository.queue()`/`.act()`, `CatalogRepository.publishRule()`/`.ruleHistory()`, `stalledInfo()` (timeline engine), and `assessPartnerHealth()` (partner-health engine, already used by the citizen partner locator in P7) are all fully implemented and tested. P11 is a UI feature over that already-working layer, plus small pure view compositions — no new repository methods.

## In scope (docs/05-features.md F7)
- New routes `/officer` (queue), `/officer/applications/:id` (detail + actions), `/officer/partners` (health view), `/officer/rules` (read-only rules browser) — all gated `RequireRole(['district_officer', 'hq_admin'])`.
- **F7.1** Pending queue with ageing, oldest-waiting-first: `OfficerQueueScreen` lists `application.queue({ districtId: user.districtId })` (district officers see only their district; `hq_admin` — no `districtId` on their user — sees every district) with an ageing bucket per row computed via `stalledInfo()`.
- **F7.2** Stalled-application alert: the same `stalledInfo().stalled` flag drives a visible "stalled" badge/filter on the queue — no separate screen, no AI summary (docs/06-tech-stack.md marks the Gemini summary explicitly optional; this phase ships the rule-based flag only).
- Application detail + actions: `OfficerApplicationScreen` shows the full timeline (reusing P9's `Timeline` component) and the citizen's submitted profile, with buttons for every `allowedActions(stage)` action (`approve_pre_scrutiny`, `forward_to_bank`, `sanction`, `disburse`, `reject`, `return_for_fix` — the last two prompt for a `reasonKey`), calling `application.act()`.
- **F7.3** Partner-health view: `OfficerPartnersScreen` lists every `catalog.partnerEntities`, each run through `assessPartnerHealth()` and rendered with the existing `HealthBadge` component (verbatim reuse from P7).
- **F7.4** Call-list generator: a section of `OfficerQueueScreen` (not a separate route — no route was reserved for it) — the same queue, sorted by `daysInStage` descending, framed as "call these first" for the HQ Tele Caller role.
- **Rules admin (read-only)**: `OfficerRulesScreen` lists every scheme's live rule (from `catalog.rules`) and, per scheme, its full version history via `ruleHistory(schemeId)` — criteria, `when` guards, priority list, all rendered from data. No edit/publish form this phase; `publishRule()` stays wired in the repository but unused by any screen.
- Locale keys `officer.*` (en + hi).

## Decisions
1. **Rules admin is read-only this phase.** `EligibilityRule` is a flat, non-nested criteria list and is genuinely form-editable, but a safe validated publish form (per-operator value-type switching, optional `when`-guard editing, a reasonKey picker) is real extra scope. This phase ships a clear read view of the live rule + full audit history; editing is a natural follow-up.
2. **F7.3 and F7.4 are in scope.** Both turn out to be nearly free: F7.3 reuses the exact `assessPartnerHealth()`/`HealthBadge` pair already shipped for the citizen partner locator (P7); F7.4 is the existing `queue()` result re-sorted by the same `stalledInfo()` helper already used for F7.2 — no new repository methods for either.
3. **District scoping matches the real session shape.** A `district_officer` user's `districtId` is populated on login (confirmed via the seeded officer accounts) and passed straight to `queue({ districtId })`; `hq_admin` has no `districtId`, so `queue({})` returns every application system-wide — this is the correct, existing behavior of the mock repository, not new logic.
4. **No new repository methods, no AI.** `queue`, `act`, `publishRule`, `ruleHistory` are final (P1) and untouched. F7.2's optional Gemini stall-summary (docs/06-tech-stack.md) is out of scope.

## Out of scope
- Rules admin edit/publish form (deferred; `publishRule()` remains available for a future phase).
- Any AI-generated stall summary.
- Real-time/push updates to the queue (React Query refetch/staleness is the existing pattern app-wide; no websockets).
- Changing `ApplicationRepository`, `CatalogRepository`, `stalledInfo`, `assessPartnerHealth`, or `allowedActions` themselves (P1, already correct and tested).
- Officer login/onboarding flows beyond the existing seeded accounts (already built in P3/P1).

## Files and modules touched
`apps/web/src/features/officer/**` (new: `domain/`, `presentation/`), `apps/web/src/app/router.tsx` (new routes), locale files.

## Tasks
- [x] `domain/queueView.ts` (pure, tested): merges `Application[]` + `StageDurations` + `now` into rows with `stalledInfo()`-derived ageing/stalled flag; a `toCallList()` sort variant
- [x] `domain/partnerHealthView.ts` (pure, tested): maps `PartnerEntity[]` + `HealthPolicy` through `assessPartnerHealth()`
- [x] `core/data/queries.ts`: `useOfficerQueue(filter)`, `useRuleHistory(schemeId)` (`useApplication` reused from P9)
- [x] `useOfficerQueueViewModel`, `useOfficerApplicationViewModel` (exposes `act()`), `useOfficerPartnersViewModel`, `useOfficerRulesViewModel` (MVI, following `usePartnersViewModel.ts`/`useStatusListViewModel.ts`)
- [x] `OfficerQueueScreen.tsx` (queue + ageing + stalled filter + call-list toggle), `OfficerApplicationScreen.tsx` (own `StageTimeline` + action buttons + reason prompt for reject/return), `OfficerPartnersScreen.tsx` (shared `HealthBadge` reuse), `OfficerRulesScreen.tsx` (read-only criteria/history browser)
- [x] Router: 4 new routes gated `RequireRole(['district_officer', 'hq_admin'])`
- [x] Locale keys `officer.*` (en + hi) — including `officer.nav.partners`/`officer.nav.rules`, found missing from `AppShell.tsx`'s pre-existing nav links during this phase
- [x] RTL: queue shows only the officer's own district's applications (district_officer) vs all districts (hq_admin); stalled flag appears on a backdated application; approving transitions the application; reject/return require a reason and leave no further officer actions once returned; not-found for an unknown id; partner-health view renders one row per seeded entity; rules view shows criteria/version history and switches correctly between schemes
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite: 15 script + 111 shared + 305 web tests)
- [ ] Browser check — retried Claude-in-Chrome connection, still disconnected (third session running); documented rather than silently skipped (see Status line)

**Boundary fix along the way:** `HealthBadge` (built for P7's citizen partner locator) needed reuse here, which would have been a cross-feature import (`officer` importing from `partners`, forbidden by `check-boundaries.mjs`). Moved it verbatim to `shared/components/HealthBadge.tsx` and updated `PartnerCard.tsx`'s import — a pure presentational component with zero feature-specific logic, exactly the kind of thing CLAUDE.md's folder table designates `shared/` for. For the same reason, P9's `Timeline` component was **not** reused for the officer application screen — instead a small officer-local `StageTimeline.tsx` was written (near-identical rendering, ~10 lines of overlap) rather than moving citizen-status code mid-P11; that duplication is a candidate for a future shared-component pass if a third consumer ever needs it.

## Acceptance criteria (verified via RTL, browser check not run this session)
- A district officer's queue includes an application in their own district and excludes one from a different district; `hq_admin` sees both.
- An application backdated well past `expectedDays * STALL_FACTOR` shows the "Stalled" badge.
- Approving pre-scrutiny on a `pre_scrutiny` application moves its current timeline step to `dlpac`; sending it back for correction requires picking a reason first (confirm stays disabled until one is chosen) and, once confirmed, leaves no further officer action available (matching `allowedActions('returned')` being empty).
- An unknown application id shows the same not-found message as the citizen status screen's error copy.
- The partner-health screen renders one row per seeded `partnerEntities` entry.
- The rules screen shows real criteria/reasonKeys for the default scheme and correctly switches to another scheme's rule when picked.
- Gate green: typecheck, lint, i18n, boundaries, specs, full test suite.

## Open questions
- None — rules-admin scope (read-only), F7.3/F7.4 inclusion, and district-scoping behavior were confirmed with the user before this spec was written.
