# 2026-09-27 — P8 document checklist

## What shipped
`/schemes/:schemeId/documents` (F6): pre-scrutiny checklist, preflight check (CIBIL/penny-drop/no-default), the SOP's 5-line project report for PM-AJAY schemes, a DigiLocker fetch stub, and the citizen's actual application submission — the first screen in the journey to call `ApplicationRepository.submit()`.

## What was already there (found during investigation, not built this session)
P1 had built almost all of F6's hard logic ahead of need, exactly as P7 had found for F3: `DocumentRepository` (`runPreflight`, `fetchFromDigiLocker`, `getChecklistState`/`setChecklistItem`) was fully implemented and tested; `documentsForScheme()` and `financePlan()`'s `GiaSplit`/`SOP_COMPONENTS` already computed the document list and all 5 SOP report components; `preflight.*` i18n keys already existed. This session added the UI feature (`features/documents/`), one new pure domain composition (`documentsView.ts`), two new query hooks, the route, and `documents.*` locale keys — the same shape of work as P7.

## Design decisions (confirmed with the user before writing the spec)
1. Pre-flight gates use the existing deterministic mock — no new profile schema fields.
2. Checklist state is persisted per-user (not ephemeral) via the existing repository.
3. Project report is an in-app card, not a PDF.
4. DigiLocker is a labelled stub (auto-verifies, no real API Setu call).
5. P8's own CTA calls `submit()` and navigates to `routes.application(id)` — P9 becomes purely the status/timeline viewer.

## Browser check
Ran the full flow end-to-end against the real dev server (login → onboarding profile → recommender → calculator → partners → documents) for the poultry/Sitapur demo persona in English, then switched to Hindi mid-flow on the documents screen and confirmed every string translated correctly (preflight reasons, report line items, checklist items, submit button) with no missing keys. Verified: DigiLocker fetch auto-ticks and labels "Verified"; preflight card showed three passing checks with the exact CIBIL score; project report numbers (₹1,30,000 / ₹6,500 / ₹50,000 / ₹7,020 / ₹272) matched the calculator screen exactly; submit was disabled until all 9 documents were ticked, then created a real application and navigated to `/status/app-152` (correctly not-found, P9's route). No bugs found.

**Caveat:** this environment's `resize_window` tool did not actually shrink the tab's viewport below its native 1920px width (confirmed via `window.innerWidth`), so the mobile-width (390px) layout itself was not visually re-verified this session — only the functional flow and Hindi/English string coverage were. The layout code reuses the same `Screen`/card/checkbox primitives already visually verified at 390px in P4–P7, so this is a low-risk gap, but flagging it per the "browser-check at 390px" convention rather than silently claiming it.

## Gate
15 script + 111 shared + 261 web tests, typecheck, lint (oxlint + boundaries + i18n + specs) — all green.

## Next
P9 status tracker (F8): write `phase-9-status-tracker.md` before any code. `ApplicationRepository.listMine`/`get`/`verifyReceipt` already exist and are untouched by any screen; P9 is the viewer for the `Application` records P8 now creates.
