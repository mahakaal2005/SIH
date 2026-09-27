# Phase 9: Status Transparency for the Citizen

Status: ✅ done — built, gate green. Browser check could not be run this session: the Claude-in-Chrome extension was not connected (verified via `tabs_context_mcp` returning "Browser extension is not connected"), so the flow was verified via the full RTL suite (list, detail, timeline correctness, resubmit/reject/return handling, notifications, receipt round-trip through `encodeReceipt`/`verifyReceipt`, and the verify screen with no session at all) rather than a live browser pass. Flagged here rather than silently claimed.

## Goal
PS 26092 / F8 asks for an honest, always-visible view of where an application stands, why it was returned/rejected if it was, and a way for a third party (bank, block office, family) to verify a citizen's letter is genuine. P8's submit CTA already creates real `Application` records and navigates to `routes.application(id)`, and `/status` currently 404s. Almost all of F8's hard logic was already built in P1 ahead of need: `ApplicationRepository` (`listMine`, `get`, `verifyReceipt`, `encodeReceipt`, `resubmit`), `NotificationRepository` (`list`, `markRead`), `estimateTimeline`/`PIPELINE_STAGES`/`StageDurations`, and `nextStage`/`allowedActions` (the workflow engine only permits `resubmit` from `returned`, never from `rejected`) are fully implemented and tested. P9 is a UI feature over that already-working data/engine layer, plus one new pure domain composition for the timeline view.

## In scope (docs/05-features.md F8)
- New routes `/status` (`routes.status`) and `/status/:applicationId` (`routes.application`), both currently reserved and not-found.
- New public route `/verify` (`routes.verify`), not currently wired.
- New feature folder `features/status/` (`domain/`, `presentation/`), following the documents/partners structure.
- **F8.1/F8.2** Timeline view: 5 pipeline stages with expected vs. actual dates, from `estimateTimeline()` (P1) plus `app.history`/`app.stage`.
- **F8.3** SMS/WhatsApp nudges surfaced as an in-app notification feed on the detail screen, reading `NotificationRepository.list(userId)` — honestly framed as "what would be sent by SMS/WhatsApp," since this app cannot send real messages. No new backend.
- **F8.4** Fix-and-reapply: `returned` shows the reason + a "Resubmit" button (`application.resubmit`, only valid transition per the workflow engine); `rejected` shows the reason + a link back to `routes.schemes` to start a fresh application — no resubmit button, because `nextStage`/`allowedActions` has no transition out of `rejected`.
- **F8.5** Verify screen: public, no login required, textarea + Check button against `application.verifyReceipt`; anti-fraud framing (this app is free, no middleman is authorised, RBI Ombudsman escalation after 30 days). Paste-text only, no QR scanning.
- List screen (`/status`): all the citizen's applications (receipt no, localized scheme name, stage badge, submitted date), linking to the detail screen; empty state links to `routes.schemes`.
- Locale keys `status.list.*`, `status.detail.*`, `verify.*` (en + hi).

## Decisions
1. **Notifications are an in-app feed**, not real SMS/WhatsApp — read directly from the existing `NotificationRepository`, framed honestly as a preview of what would be sent.
2. **`/verify` is genuinely public.** No `RequireLanguage`/`RequireRole` wrapper — added directly under `ShellWithBoundary` in the router, since a third party checking a suspicious letter has no account and no language preference set.
3. **Resubmit follows the engine exactly**, not a UI preference: `returned` → reason + Resubmit; `rejected` → reason + link to start a new application. This mirrors the hard constraint in `packages/shared/src/engine/workflow.ts`.
4. **Both a list and a detail screen** — matches the two routes already reserved (`routes.status`, `routes.application`).
5. **`StatusDetailView` domain contract** (`features/status/domain/statusView.ts`, pure, tested):
   ```ts
   export type StepStatus = 'done' | 'current' | 'upcoming'
   export interface TimelineStep { stage: PipelineStage; status: StepStatus; expectedStart: string; expectedEnd: string; actualAt?: string }
   export type Terminal = 'none' | 'disbursed' | 'srf_lock' | 'completed' | 'rejected' | 'returned'
   export interface StatusDetailView {
     steps: TimelineStep[]
     terminal: Terminal
     rejectionReasonKey?: string
     canResubmit: boolean
   }
   export function toTimelineView(app: Application, durations: StageDurations): StatusDetailView
   ```
   `rejectionReasonKey` comes from `app.history.at(-1)?.reasonKey` when `terminal` is `rejected`/`returned`. `canResubmit` is true only when `terminal === 'returned'`.
6. **No new domain function for the list screen** — a thin map from `Application[]` + `catalog.schemes` to display rows, done directly in `useStatusListViewModel`, same weight as how the partners/calculator screens compose simple joins without an extra domain file.
7. **Ownership is checked client-side.** `ApplicationRepository.get(id)` does not filter by `userId`, so `useApplicationDetailViewModel` must check `app.userId === user.id` and treat a mismatch the same as `null` (not-found) — otherwise one citizen could view another's application by guessing an id.

## Out of scope
- Officer-side stall alerts (F7.2, P11).
- Real SMS/WhatsApp sending — the notification feed is in-app only.
- QR-code scanning for the verify screen — paste-text only.
- Changing `ApplicationRepository`, `NotificationRepository`, `estimateTimeline`, or `nextStage`/`allowedActions` themselves (P1, already correct and tested).

## Files and modules touched
`apps/web/src/features/status/**` (new), `apps/web/src/core/data/queries.ts` (new hooks), `apps/web/src/app/router.tsx` (new routes), locale files.

## Tasks
- [x] `domain/statusView.ts` with tests: in-flight application at each pipeline stage (done/current/upcoming split), `disbursed`/`srf_lock` (all steps done), `rejected` (reason, `canResubmit: false`), `returned` (reason, `canResubmit: true`)
- [x] `core/data/queries.ts`: `useApplications(userId)`, `useApplication(id)`, `useNotifications(userId)` (+ `queryKeys.application`, `queryKeys.notifications`; `queryKeys.applications` already existed)
- [x] `useStatusListViewModel`, `useApplicationDetailViewModel` (ownership check, `resubmit()`, `markNotificationRead(id)`), `useVerifyViewModel` (no auth dependency)
- [x] `StatusListScreen.tsx`, `ApplicationDetailScreen.tsx` (Timeline, terminal banner, NotificationFeed, receipt reveal), `VerifyScreen.tsx`
- [x] Locale keys `status.list.*`, `status.detail.*`, `verify.*` (en + hi)
- [x] RTL: list screen (empty state, applications listed and linking to detail); detail screen (timeline correctness, returned→resubmit, rejected→link to schemes, notification mark-read); verify screen (valid round-trip via `encodeReceipt`, malformed text, works fully logged-out)
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite: 15 script + 111 shared + 276 web tests)
- [ ] Browser check — not run this session (Claude-in-Chrome extension not connected); covered by the RTL suite instead, see Status line above

## Acceptance criteria (verified via RTL, browser check not run this session)
- A freshly submitted application appears on `/status` and its detail page shows the correct current stage highlighted (`timeline-step-*` `data-status` attributes: done/current/upcoming), with expected/actual dates from `estimateTimeline()`.
- A `returned` application shows its reason (`reject.documents`) and a working Resubmit button that transitions it back into `pre_scrutiny`.
- A `rejected` application shows its reason (`reject.cibil`) and a link to start a new application, with no resubmit button.
- The notification feed shows the stage-transition messages already generated by the mock backend; clicking an unread one marks it read and disables it.
- `/verify` works with no session at all, correctly validates a real receipt round-tripped through `encodeReceipt`/`verifyReceipt`, and correctly rejects malformed text with a clear reason.
- i18n key parity holds for `status.*` and `verify.*` in both locales (`check-i18n.mjs` green); Hindi wording not re-verified visually this session (no live browser check — see Status line).

## Open questions
- None — notification framing, verify-screen public access, and the resubmit/rejected split were confirmed with the user before this spec was written.
