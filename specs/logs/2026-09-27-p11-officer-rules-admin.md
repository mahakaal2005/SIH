# 2026-09-27 — P11 officer dashboard + rules admin

## What shipped
`/officer` (pending queue with ageing/stall flags and a call-list sort toggle), `/officer/applications/:id` (timeline + officer action buttons, with a reason prompt for reject/return), `/officer/partners` (partner-health view), `/officer/rules` (read-only eligibility-rule browser with version history) — all gated to `district_officer`/`hq_admin`.

## What was already there
As with every phase since P4, the hard layer was already built in P1: `ApplicationRepository.queue()`/`.act()`, `CatalogRepository.publishRule()`/`.ruleHistory()`, `stalledInfo()` (timeline engine), and `assessPartnerHealth()` (the same engine already powering the citizen partner locator in P7) were fully implemented and tested. Routes were pre-reserved and `AppShell.tsx` already had officer nav links wired to them; seed data already had per-demo-district officer accounts and one hq_admin account. P11 was pure presentation-layer work — no new repository methods.

## Design decisions (confirmed with the user before writing the spec)
1. Rules admin is read-only this phase — `EligibilityRule` is a flat, form-editable criteria list, but a safe validated publish form is real extra scope; viewing the live rule + full audit history is what shipped, editing is a natural follow-up.
2. F7.3 (partner health) and F7.4 (call list) were included alongside F7.1/F7.2, since both turned out to be near-free reuse of existing engine/data (no new repository methods needed for either).

## Two things found and fixed along the way
1. **A real boundary violation caught before it shipped:** reusing `HealthBadge` (built for P7's citizen partner locator) from the officer feature would have been a cross-feature import, which `check-boundaries.mjs` forbids. Fixed by moving it to `shared/components/HealthBadge.tsx` (a pure presentational component with zero feature-specific logic — exactly what CLAUDE.md's folder table designates `shared/` for) and updating `PartnerCard.tsx`'s import. For the same reason, P9's `Timeline` component was deliberately *not* reused here — a small officer-local `StageTimeline.tsx` was written instead, to avoid touching already-shipped P9 code mid-P11; the ~10 lines of overlap are a candidate for a future shared-component consolidation if a third consumer ever needs it.
2. **A missing i18n key from a prior phase:** `AppShell.tsx`'s officer nav links already referenced `officer.nav.partners`/`officer.nav.rules` (presumably reserved alongside the routes in an earlier phase), which had never been added to either locale file — invisible until this phase's routes actually existed to render that nav. Added both keys in en + hi.

## Gate
15 script + 111 shared + 305 web tests, typecheck, lint (oxlint + boundaries + i18n + specs) — all green.

## Browser check — not run this session
Retried the Claude-in-Chrome connection again (per the pattern from P9/P10); `tabs_context_mcp` returned "Browser extension is not connected" for the third session in a row. Coverage instead comes from RTL: district-scoped vs. system-wide queue visibility, a backdated application correctly flagged stalled, approving an application moving its timeline forward, reject/return requiring a reason and correctly disabling further officer action once returned, not-found handling, a health badge per seeded partner entity, and rule-history browsing including switching schemes. This is a real, disclosed gap — actual look-and-feel of the (now fairly dense) officer dashboard tables/cards was not visually verified. Recommend a manual pass first thing next session once the extension reconnects.

## Next
P12 PWA + a11y polish is the last phase currently in `specs/office/progress.md`'s table — write `phase-12-pwa-a11y.md` before any code, and check with the user whether further phases are wanted after that.
