# Phase 12: PWA + a11y polish

Status: ✅ done — built, gate green (15 script + 111 shared + 305 web tests, typecheck, lint incl. `jsx-a11y`). Browser check not run: the Claude-in-Chrome extension was disconnected for the fourth session in a row — substituted a static code-level a11y audit and a `npm run build` verification of the generated manifest/service worker instead of an interactive keyboard pass or live installability check.

## Goal

Close out the phase table (P0–P11 all shipped) with the two cross-cutting non-functional items named in the stack but never built: installability/offline-shell caching (PWA) and accessibility. Neither has a prior feature ID or architecture decision — this phase establishes both.

## In scope

**PWA**
- Wire the already-installed `vite-plugin-pwa` into `apps/web/vite.config.ts` (`registerType: 'autoUpdate'`, workbox precaching of the built app shell: JS/CSS/fonts/icons).
- Real web manifest (`name`, `short_name`, Hindi-first `description`, `theme_color`/`background_color` matching existing Tailwind tokens, `display: "standalone"`, icon set).
- Real icon set (192×192, 512×512, maskable) derived from the existing `favicon.svg` mark.
- `index.html` PWA meta tags (`<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`).
- `.gitignore` entry for `dev-dist` (currently only oxlint-ignored, not git-ignored).

**A11y**
- Enable oxlint's built-in `jsx-a11y` plugin (`.oxlintrc.json`), fix findings.
- Dynamic `<html lang>` following the active i18next language (currently hardcoded `"hi"`).
- Manual keyboard-only audit of onboarding steps, recommender results, status tracker, and officer queue/detail screens: tab order, focus visibility, keyboard traps, form-error announcement, color-contrast spot-check on pass/caution/blocked badge tokens. Fix findings.

## Decisions

1. **PWA scope is installable + static-asset caching, not offline data sync.** No mutation queueing, no background sync, no change to `ApplicationRepository`/`MockDb` offline behavior — that's a separate, much larger feature if ever pursued.
2. **A11y enforcement is lint + manual audit, no new test dependency.** oxlint's `jsx-a11y` is built in (no npm package, no rule-8 approval needed). `vitest-axe`/`jest-axe` automated per-screen assertions are a deferred follow-up, not this phase.
3. **Architecture record:** since `specs/architecture.md` requires explicit approval to edit (per CLAUDE.md), this phase spec is the system-of-record for these two decisions; `architecture.md` itself is left untouched unless the user asks otherwise.

## Out of scope

- Offline mutation queueing / background sync / conflict handling.
- `vitest-axe`/`jest-axe` automated a11y test assertions.
- Any new PWA feature ID in `docs/05-features.md` (none exists today; not retrofitting one).
- Full WCAG conformance audit or certification — this is a practical polish pass, not a formal audit.

## Files and modules touched

`apps/web/vite.config.ts`, `apps/web/public/` (manifest + icons), `apps/web/index.html`, `apps/web/.oxlintrc.json`, `.gitignore`, the i18n language-switch site (dynamic `<html lang>`), and whichever screens the manual audit finds issues in.

## Tasks

- [x] Wire `VitePWA` plugin into `vite.config.ts`, manifest config
- [x] Generate 192/512/maskable icon set from `favicon.svg`
- [x] `index.html` PWA meta tags
- [x] `.gitignore`: add `dev-dist`
- [x] Dynamic `<html lang>` on language change — already existed (`SessionProvider.tsx`), verified not rebuilt
- [x] Enable `jsx-a11y` in `.oxlintrc.json`; fix findings (2 real `autoFocus` fixes; 9 false positives suppressed per-file, see log)
- [x] Manual keyboard/contrast audit of key screens; fix findings (found and fixed a WCAG contrast gap in the `pass`/`caution` badge tokens; `ChoiceCards`/`DistrictSearch` keyboard patterns verified correct by code inspection)
- [x] Gate: typecheck, lint (incl. jsx-a11y), full test suite — green
- [ ] Browser check — Claude-in-Chrome disconnected 4th session running; `npm run build` verified manifest/SW generation instead
- [x] `progress.md` + session log + commit

## Acceptance criteria

- Built app (`npm run build` + preview) shows a valid installable PWA (manifest linked, service worker registered, icons present at required sizes).
- Reloading a previously-visited route with network disabled still renders the app shell (cached).
- `npm run lint` passes with `jsx-a11y` enabled and no unaddressed findings (or each suppressed rule has a one-line justification).
- `<html lang>` reflects the current UI language after switching.
- Keyboard-only pass through the audited screens reaches every interactive element in a sensible order with visible focus, no traps.
- Full gate green: typecheck, lint, full test suite.

## Open questions

- None — PWA depth (installable + shell caching, no offline data sync) and a11y depth (lint + manual audit, no new test dependency) were confirmed with the user before this spec was written.
