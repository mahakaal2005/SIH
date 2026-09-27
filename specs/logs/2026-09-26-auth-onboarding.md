# 2026-09-26: P3 auth + onboarding

## Goal
A citizen signs in with a mobile number and gives a validated `ApplicantProfile` once, in Hindi or English, alone or with a helper.

## What was done
- `features/onboarding`: `normalizePhone` (+91, 091, leading 0, spaces), login MVI (`useLoginViewModel`: State/Event/reduce), `LoginScreen` with the "free, no agent" note, profile form model (3 steps covering all 18 fields, defaults, SOP cost suggestion), `useProfileViewModel` (load, step, assisted, save), `ProfileScreen` with About/Plan/Money steps, alias-aware `DistrictSearch` combobox, `ActivityPicker`.
- Shared: `ChoiceCards` (radio cards), `YesNoField`, `ActivityIcon` map, `useCatalog` query hook in `core/data/queries.ts`.
- Test harness `src/test/renderApp.tsx`: real route table over a fresh mock backend; RTL cleanup in setup.
- Dev panel trigger moved into the header (the floating button overlapped the form's Back button at 360px).

## Decisions made (and why)
- Assisted mode uses the i18next `_assisted` context, so every question has first- and third-person copy with no branching in components.
- The purpose "education" sets activity `higher_education` automatically and hides the business-only questions.
- Selected district is shown as visible text, not only as a placeholder, for screen readers.

## Issues hit / fixes
- Tests saw duplicate elements: Vitest runs without globals, so RTL cleanup had to be registered in `setup.ts`.
- A pre-fill test failed only because `router.navigate` wasn't awaited; a probe with awaited navigation passed, so there's no product bug.

## Verification
- Gate green: 15 node, 111 shared, 186 web; typecheck, lint, i18n, boundaries, specs.
- Chromium 360px, Hindi: language → login → OTP (demo hint) → 3 profile steps for the demo persona → lands on `/schemes`; zero console errors.

## Next steps
1. Write the P4 recommender phase spec and get it agreed.
2. Commit the workflow files (`specs/`, `scripts/`, `CLAUDE.md`, hooks) once their owner confirms.
