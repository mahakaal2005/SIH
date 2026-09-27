# 2026-09-26: Spec-driven workflow + context tooling

## Goal
Make sure no session loses context: one resume point, agreed specs before code, logs at the end, all enforced or injected by hooks.

## What was done
- Created `specs/architecture.md`, `specs/office/progress.md`, phase files P0-P2 (P0/P1 retroactive, P2 written mid-flight), `docs/PRD.md` (thin, links to owning docs), `learning/README.md`, `.claude/rules/senior-mentor.md`.
- Rewrote CLAUDE.md "Where things live" plus rules 0-14; the feature status table now lives only in `progress.md`.
- Hooks: PostToolUse oxlint, Stop verify (typecheck, lint, tests), PreToolUse guard, SessionStart context injection, Stop log nudge. Per-session markers so parallel sessions do not trigger each other.
- Checks: PII-in-LLM rule added to `check-boundaries.mjs`; new `check-i18n.mjs`; 9 node tests.
- Unused skills switched off through `skillOverrides` in `.claude/settings.local.json` (14 kept).

## Decisions made (and why)
- `progress.md` plus per-phase files, not one phases file: a fresh session reads a 40-line tracker and opens only the current phase.
- SessionStart hook injects the resume point automatically: it survives `/clear` and compaction, so the rule does not depend on Claude remembering.
- `docs/BUILD-LOG.md` frozen, `specs/logs/` takes over: one place for session detail.
- 300-line file limit; `repositories.ts` (310) deferred with a split proposal.
- Reference project for the layout: `~/dev/Innogeeks/self/Innogeeks` (Android app using the same workflow).

## Issues hit / fixes
- Overwrote a committed CLAUDE.md by mistake; restored from git and merged instead.
- Bulk move of unused skills was blocked; used `skillOverrides` (reversible).
- Verify marker was shared across sessions; made per-session. Log nudge needed its own marker because Stop hooks run in parallel.

## Team safeguards (added later in the session)
- `scripts/check-specs.mjs` (+5 tests) in `npm run lint`: fails on a malformed tracker or a started phase without a spec file.
- PreToolUse asks before Claude edits `specs/architecture.md`, `.claude/settings.json`, `.claude/hooks/*`. A speed bump for Claude, not access control; real enforcement is CODEOWNERS plus branch protection (must be enabled on GitHub).
- `.github/CODEOWNERS` added; SessionStart warns if `jq` is missing.
- Project skills folder and `skillOverrides` are local-only by design (`.claude/skills` is gitignored, so teammates never load those 198 skills).

## Verification
- `npm test` (97 + 4 vitest, 9 node), `npm run lint` clean at time of the hook work.
- Each hook pipe-tested with sample input; verify hook blocked on an injected type error; log nudge fires and clears correctly.
- Not yet confirmed live: SessionStart injection in a real fresh session (restart or `/clear` to see it).

## Next steps
1. Finish P2: router shell and layout, language picker, dev panel, error boundary, split `repositories.ts`; then commit P2.
2. Write the P3 (auth + onboarding) phase spec and get it agreed before coding.
3. Infra: GitHub Actions CI, Supabase keepalive, gitleaks pre-commit, Supabase and Playwright MCP.
