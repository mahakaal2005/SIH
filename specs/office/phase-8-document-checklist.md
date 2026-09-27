# Phase 8: Document Readiness Checklist

Status: ✅ done — built, gate green, browser-checked in English and Hindi (viewport could not be resized below the environment's fixed 1920px window this session — see the log for the exact caveat).

## Goal
PS 26092 / F6 asks for a document readiness checker: an exact per-scheme checklist, a pre-flight check against the real pre-scrutiny gates (CIBIL, penny-drop, no-default certificate), an auto-generated project report draft with the SOP's five required cost components, and a DigiLocker link-out for caste/income certificates. After the partner locator (P7), the citizen's "Continue" CTA already navigates to `routes.documents(schemeId)`, which currently 404s — no route entry exists. Almost all of F6's hard logic was already built in P1 ahead of need: `DocumentRepository` (preflight, DigiLocker fetch, checklist persistence) is fully implemented and tested, `documentsForScheme()` and `financePlan()`/`GiaSplit` already compute the document list and the SOP's five report components, and `preflight.*` i18n keys already exist in both locales. P8 is a UI feature over that already-working data layer, plus one new pure domain composition, plus wiring the citizen's actual application submission (`ApplicationRepository.submit()`, built in P1, called by no screen yet).

## In scope (docs/05-features.md F6)
- New route `/schemes/:schemeId/documents` (`routes.documents`, already reserved, currently not-found).
- New feature folder `features/documents/` (`domain/`, `presentation/`), following the recommender/calculator/partners structure.
- **F6.1** Exact document checklist per scheme (common set + scheme-specific), from `documentsForScheme()` (P1) merged with the citizen's persisted per-document checked state (`DocumentRepository.getChecklistState`/`setChecklistItem`, P1).
- **F6.2** Pre-flight check against CIBIL score, penny-drop validation and the no-default certificate — already implemented (`DocumentRepository.runPreflight`, P1, deterministic from the profile); this phase only surfaces its output. Informational only: a failing check does not block submission, matching the real pre-scrutiny process (the committee decides after submission) and `ApplicationRepository.submit()`'s own behaviour (always creates the application into `pre_scrutiny`).
- **F6.3** Auto-generated project report with the SOP's five cost components (total cost, 5% own contribution, grant, training amount, CGTMSE fee) — already computed by `financePlan()`'s `GiaSplit` output (`plan.gia`, P1) for PM-AJAY (`grant_plus_loan`) schemes; this phase only presents it. Non-PM-AJAY schemes (`loan`, `subsidy_plus_loan`) have no `gia` and show no report card — the SOP's 5-component report is a PM-AJAY-specific requirement (docs/04-up-reference.md D4), not a generic one.
- **F6.4** DigiLocker link-out for DigiLocker-eligible documents (caste certificate, income certificate, Aadhaar, residence certificate) via the existing stub (`DocumentRepository.fetchFromDigiLocker`, P1) — returns an always-verified mock document, not a real API Setu redirect. UI copy says "via DigiLocker"; behaviour is the documented mock.
- **Submission**: the screen's final CTA calls `ApplicationRepository.submit()` with the journey's `schemeId`, `partnerBranchId`, and the recomputed `loanAmount`/`grantAmount`, then navigates to `routes.application(applicationId)` (P9; not-found until then, same convention as P4→P5→P6→P7).
- Locale keys `documents.*` (en + hi).

## Decisions
1. **No new profile fields.** CIBIL score and penny-drop are simulated entirely inside the existing `runPreflight` (deterministic hash of `userId` plus `isDefaulter`/`settledViaOTS`) — confirmed with the user rather than adding real-looking fields to onboarding.
2. **Checklist state is persisted**, not ephemeral — reuses the existing `checklists` table in `MockDb`, keyed `${userId}:${schemeId}`, already read/written by `DocumentRepository`.
3. **Project report is an in-app card, not a PDF.** No `@react-pdf/renderer` usage this phase; reuses `shared/lib/format` for ₹ formatting, same as the calculator screen.
4. **DigiLocker is a labelled stub.** Clicking the button for an eligible document calls `fetchFromDigiLocker`, which resolves as already verified and ticks that checklist item automatically (no separate manual checkbox once fetched).
5. **P8 owns submission**, not just the checklist. By the time the citizen reaches this screen, `journey` already has everything `SubmitApplicationInput` needs (`schemeId`, `projectCost`, `loanTerms`, `partnerBranchId`) and no earlier screen calls `submit()`. P9 (status tracker) becomes purely the viewer for already-submitted applications.
6. **`DocumentsView` domain contract** (`features/documents/domain/documentsView.ts`, pure, tested):
   ```ts
   export interface ChecklistItem { id: string; name: Localized; hint: Localized; digiLocker: boolean; checked: boolean }
   export interface ProjectReportLine { key: string; label: Localized; amount: number }
   export interface DocumentsView {
     items: ChecklistItem[]
     preflight: PreflightResult[]
     report: ProjectReportLine[] | null
     allChecked: boolean
   }
   export function toDocumentsView(
     scheme: Scheme, allDocuments: DocumentRequirement[], checklistState: Record<string, boolean>,
     preflight: PreflightResult[], plan: FinancePlan,
   ): DocumentsView
   ```
   `report` is built from `SOP_COMPONENTS` mapped over `plan.gia` when present (PM-AJAY), else `null`.

## Out of scope
- Building `routes.application` / the status timeline itself (P9) — this phase only navigates there after submit.
- Officer-side document review (F7, P11).
- Real API Setu / DigiLocker network integration.
- Changing `DocumentRepository`, `documentsForScheme`, `financePlan`/`GiaSplit`, or `ApplicationRepository.submit()` itself (P1, already correct and tested).
- PDF export of the project report.

## Files and modules touched
`apps/web/src/features/documents/**` (new), `apps/web/src/core/data/queries.ts` (new hooks), `apps/web/src/app/router.tsx` (new route), locale files.

## Tasks
- [x] `domain/documentsView.ts` with tests: merged document list against real seed schemes (PM-AJAY with extra docs + full report, NSFDC loan scheme with `report: null`), checked/unchecked state, DigiLocker-eligible vs not
- [x] `core/data/queries.ts`: `queryKeys.documents`/`queryKeys.preflight`, `useChecklist`/`usePreflight` hooks
- [x] `useDocumentsViewModel` (MVI): loads profile + catalog, recomputes `financePlan` from journey (staleness-guarded like the calculator), calls preflight/checklist, exposes `toggleItem`, `fetchDigiLocker`, `submit`
- [x] `ChecklistItem`, `PreflightCard`, `ProjectReportCard`, `SubmitBar`, `DocumentsScreen`
- [x] Locale keys `documents.*` (en + hi)
- [x] RTL: checklist toggle persists across remount; DigiLocker button ticks the item; preflight banner shows for a defaulter profile; submit disabled until all items checked; submit navigates to `routes.application(id)`; unknown `schemeId` shows not-found
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite: 15 script + 111 shared + 261 web tests)
- [x] Browser check in English and Hindi — functional flow verified end-to-end (login → profile → recommender → calculator → partners → documents → submit → `/status/:id`); true 390px viewport could not be forced this session (see log)

## Acceptance criteria (verified)
- Demo persona (poultry scheme, Sitapur district, SC woman, ₹1,30,000 project): checklist shows the common set plus scheme-specific documents (selection letter, affidavit, livestock bundle); ticking one persists in the mock backend; the DigiLocker button on Aadhaar/caste/income/residence auto-verifies and ticks, showing "Verified".
- Preflight card showed "Credit score 754: looks fine", "Bank account verified", "No unpaid corporation loan" for this persona (all pass, non-defaulter); RTL test separately confirms a defaulter profile shows a CIBIL fail with the non-blocking note, without disabling submit.
- Project report card showed all 5 SOP components (₹1,30,000 / ₹6,500 / ₹50,000 / ₹7,020 / ₹272), matching the calculator screen's numbers for the same scheme exactly; an NSFDC (loan) scheme shows no report card.
- Submit was disabled until every checklist item was checked, then created the application and navigated to `/status/app-152` (P9's route; correctly not-found until P9 exists, same convention as P4→P7).
- Every string translated; verified visually in Hindi (all labels, preflight reasons, and report line items render correctly, no missing keys). Gate green: 15 script + 111 shared + 261 web tests, typecheck, lint.

## Open questions
- None — pre-flight simulation, checklist persistence, project-report presentation, DigiLocker stub behaviour, and the submit boundary were confirmed with the user before this spec was written.
