# Build prompt — paste this into Claude Code to start the frontend

> Paste everything in the fenced block below as your first message to Claude Code, run from inside the cloned `SIH` repo root. It bootstraps the project the same way the InnoGeeks app is structured: feature-driven, one spec per feature, a `CLAUDE.md` that stays current, and a progress log so no session starts from zero context.

---

```
We are building the frontend for Yojna Sarthi, our SIH 2026 submission (PS 26092, AI-driven scheme matching for SC entrepreneurs under NSFDC). A demo video is due tomorrow, so the target for this session is: a complete, click-through citizen journey, running entirely on mock data, no backend, that we can screen-record end to end.

Before writing any code, read these five files in `docs/` in order — they are the actual product spec, not background reading:
- docs/00-INDEX.md (what every doc is for)
- docs/05-features.md (the feature list, tiers, build order, and demo script — this is your build plan)
- docs/06-tech-stack.md (the locked stack and architecture — follow it, don't re-decide it)
- docs/01-the-system.md and docs/02-the-problem.md (only if you need to understand why a feature exists — skim, don't block on these)

Then check whatever skills are available to you in this session (list them) and use whichever ones genuinely help — frontend/design review skills if present, documentation skills for the specs below, anything else that fits. Don't force a skill that doesn't apply.

## What we are NOT doing right now
- No backend, no Fastify, no Supabase, no real Gemini/Bhashini calls. Everything is mocked.
- No auth. No real Google Maps key wiring (mock the map — see below).
- Don't build every Tier 1 feature deeply. Depth is for after the video. Today's job is one continuous, working, demoable flow.

## Stack (from docs/06-tech-stack.md, do not deviate)
React 19 + Vite + TypeScript + Tailwind + shadcn/ui. PWA-capable but the manifest/service-worker can come later — don't spend time on it today.

## Architecture: feature-driven, exactly like the Android app (Clean-Architecture-by-feature, MVI-style state)
Mirror how InnogeeksApp is organized (github.com/mahakaal2005/InnogeeksApp) — feature-first folders, typed contracts, no god-files. For this web project:

```
src/
  core/                    # cross-cutting: theme, i18n, router, mock-api client, design tokens
    i18n/                  # translation dictionaries (English + Hindi minimum — F0 is Tier 0, not optional)
    mock-client/           # the swappable data layer — see contract below
    router/
  features/
    onboarding/            # language select + profile capture (F0 + intake for F1)
      components/
      hooks/
      mock/                # this feature's mock fixtures
      types.ts
      spec.md              # what this feature does, its states, its mock data shape, what's stubbed
    recommender/            # F1
    calculator/              # F2
    partner-locator/         # F3
    approval-odds/           # F4
    voice/                   # F5 (stub-quality is fine today)
    document-checklist/      # F6
    officer-dashboard/       # F7 (lowest priority for the video — do last, or skip)
    status-tracker/          # F8
  shared/                  # shared UI primitives (buttons, cards) if shadcn's own isn't enough
```

Every feature folder is self-contained and independently demoable. Do not let features import each other's internals — only through `core/mock-client` types and `shared/`.

## The mock data contract — this is the part that matters most
Every feature talks to `core/mock-client`, never to fetch/axios/hardcoded arrays scattered in components. Define TypeScript interfaces for each entity now (Scheme, ChannelPartner, ApplicantProfile, CalculatorResult, ApprovalOddsResult, ApplicationStatus — shapes are in docs/05-features.md and docs/06-tech-stack.md) and write mock functions that return them, e.g. `getRecommendedSchemes(profile: ApplicantProfile): Promise<Scheme[]>`, with a small artificial delay (200-500ms) so loading states are real and demoable. When the backend exists later, only `core/mock-client`'s internals change — every feature component stays untouched. Seed the mock data from docs/04-up-reference.md where it exists (real district names, real project names and costs, real partner-office emails as placeholder branch names) so the demo looks grounded, not like Lorem Ipsum.

Map: no live Google Maps key today. Build `partner-locator` against the same mock-client interface it would use for real, but render it with a static/placeholder map component (a simple SVG/image with pinned markers is fine) behind a `USE_MOCK_MAP` flag, so swapping to the real Google Maps component later is a one-file change.

## Build order for tomorrow's video (adjust if you see a better sequence, but say why)
1. `core/` scaffolding + mock-client types and fixtures for everything, before any feature UI
2. Onboarding (language select, profile intake) — F0 + F1 input
3. Recommender results (F1) — the "here's what you're eligible for" screen
4. Calculator (F2) on a selected scheme
5. Partner locator (F3), mocked map
6. Approval odds (F4) shown alongside a scheme — this is our strongest evidence point, don't cut it
7. Document checklist (F6)
8. Status tracker (F8) — can be a single static-looking screen with one state transition
9. Voice (F5) and officer dashboard (F7) only if time remains after 1-8 are demoable end to end

Stop and confirm the flow works end-to-end after step 6 before polishing anything — a complete rough flow beats a polished partial one for tomorrow's video.

## Context management — do this like the Android project, not like a one-shot script
Create and maintain these as you go, not as an afterthought:

1. **`CLAUDE.md`** at repo root. Sections: Project summary (2-3 lines), Tech stack, Folder structure, Feature status table (Not started / In progress / Demo-ready, one row per feature), Mock data contract summary, Conventions (naming, state management pattern, how i18n strings are added), Known issues / cut corners. Update this file every time a feature's status changes — it is what the next session (or the next teammate) reads first.
2. **`docs/BUILD-LOG.md`** — append-only, dated entries, a few lines each: what you built, what decisions you made and why, what you deliberately skipped. Never rewrite old entries, only append.
3. **`src/features/<name>/spec.md`** per feature — written before or right after building it: what it does, its states (loading/empty/error/success), its mock data shape, what's stubbed for today vs real later.

Commit after each feature is visually working (`git commit`, feature-scoped messages). Don't let uncommitted work pile up across features — if the machine or session dies, we want to lose at most one feature's progress, not the whole day.

## Definition of done for tomorrow
- `npm run dev` runs clean, no console errors
- Click-through works: language select → profile → recommendations → calculator → locator → approval odds → document checklist → status, without dead ends
- Every screen has real-looking data (UP districts, real scheme names/costs from docs/04), not placeholder Lorem Ipsum
- Mobile-width responsive enough to record on a phone-sized viewport if we want that framing
- `CLAUDE.md` and `docs/BUILD-LOG.md` both reflect the final state, not the plan

Start by reading the docs, then propose the mock-data TypeScript interfaces before writing any UI, so we agree on the shapes once rather than refactoring them mid-build.
```
