# 2026-09-27 — P9 status tracker

## What shipped
`/status` (list) and `/status/:applicationId` (detail, F8): a 5-step timeline (done/current/upcoming) from `estimateTimeline()`, a terminal banner for rejected/returned/disbursed/srf_lock/completed with the workflow-engine-correct resubmit/no-resubmit split, an in-app notification feed reading the mock's existing SMS/WhatsApp preview records, and a receipt-code reveal. `/verify` (F8.5): a public, unauthenticated screen that checks a pasted receipt code against `ApplicationRepository.verifyReceipt`.

## What was already there (found during investigation, not built this session)
As with P7 and P8, P1 had built almost all of F8's hard logic ahead of need: `ApplicationRepository` (`listMine`, `get`, `verifyReceipt`, `encodeReceipt`, `resubmit`, `act`), `NotificationRepository`, `estimateTimeline`/`PIPELINE_STAGES`/`StageDurations`, and `nextStage`/`allowedActions` (the workflow engine only permits `resubmit` from `returned`, never `rejected` — a hard constraint, not a UI choice) were fully implemented and tested. This session added the UI feature (`features/status/`), one new pure domain composition (`statusView.ts`), three new query hooks, three routes, and `status.*`/`verify.*` locale keys.

## Design decisions (confirmed with the user before writing the spec)
1. SMS/WhatsApp nudges (F8.3) are an honest in-app notification feed, not real messages.
2. `/verify` is genuinely public — no `RequireLanguage`/`RequireRole` wrapper.
3. Fix-and-reapply (F8.4) matches the engine exactly: `returned` → reason + Resubmit; `rejected` → reason + link to start a new application, no resubmit button.
4. Both a list and a detail screen, matching the two routes already reserved.
5. Ownership is checked client-side in `useApplicationDetailViewModel` (`app.userId === user.id`), since `ApplicationRepository.get()` doesn't filter by user.

## A real bug found and fixed during testing (not shipped)
Two RTL assertions used `screen.findByText('Sent back for correction')` to check the detail screen's terminal banner. That exact English string is also the `stage.returned` badge label already shown on the *list* screen (the screen we navigate away from). `findByText` matched the stale list-screen badge before the detail screen's async data finished loading, giving a false pass on the title check and only failing on the next, more specific assertion — a real race in how fast the query settles after `router.navigate`, masked by ambiguous text. Fixed by asserting against the `terminal-banner` test id instead of matching by text, which is unambiguous and waits correctly. This wasn't a product bug — the app's actual behavior was to render the correct screen; the test just observed it unreliably.

## Gate
15 script + 111 shared + 276 web tests, typecheck, lint (oxlint + boundaries + i18n + specs) — all green.

## Browser check — not run this session
The Claude-in-Chrome extension was not connected (`tabs_context_mcp` returned "Browser extension is not connected"). Unlike P5–P8, no live browser pass was possible. Coverage instead comes from the RTL suite: list screen (empty state, applications listed, links to detail), detail screen (timeline correctness across in-flight/disbursed/srf_lock/rejected/returned, resubmit transitions the app back into the pipeline, notification mark-read), and the verify screen (genuine receipt round-tripped through `encodeReceipt`/`verifyReceipt` within the same mock DB instance — cross-instance verification isn't meaningful since each `MockDb` generates its own signing keypair —, malformed text rejected, and the screen rendering and working with no session/citizen login at all). Flagging this explicitly rather than claiming a browser check that didn't happen; recommend a manual pass next session once the extension reconnects.

## Next
P10 Voice (F5): write `phase-10-voice.md` before any code.
