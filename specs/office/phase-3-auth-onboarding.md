# Phase 3: Auth + onboarding

Status: ✅ done (commit f222ad8). Agreed 2026-09-26.

## Goal
A citizen signs in with a mobile number and tells us about themselves once, in Hindi or English, with or without a helper. That gives the recommender a validated `ApplicantProfile`.

## In scope
- `features/onboarding/` with `data/ · domain/ · presentation/`
- **LoginScreen** `/login`, MVI with two steps (phone → OTP)
  - State: `step: 'phone' | 'otp'`, `phone`, `status: 'idle' | 'loading' | 'error'`, `errorKey?`, `sentTo?`, `devHint?`
  - Events: `PhoneSubmitted`, `OtpSent`, `OtpSubmitted`, `Failed`, `ChangeNumber`
  - Success sets the session user and navigates to `from` or `/`. The demo OTP hint shows only when dev tools are on.
- **ProfileScreen** `/profile`: a 3-step form (React Hook Form + Zod, reusing the shared `applicantProfileSchema`)
  1. About you: name, age, gender, caste category, district (search that also matches legacy names, e.g. "Allahabad" → Prayagraj), rural/urban, education, can read & write
  2. Your plan: business or education, activity (icon grid: 16 PM-AJAY projects + 4 generic), estimated cost (SOP cost pre-filled when the project has one), group/cluster willingness, existing business
  3. Money & history: annual family income, unpaid corporation loan, one-time settlement, funded elsewhere, disability
  - States: loading saved profile, load error with retry, saving, save error (stays on the step), success → `/schemes`
  - Existing profile pre-fills the form (edit flow)
- **Assisted mode (F5.5):** a switch, "I'm filling this for someone else". Labels switch to third person through the i18next `_assisted` context.
- All copy in `en` + `hi`; icon + label on every choice; ≥ 48 px targets; works at 360 px.

## Out of scope
Voice intake (P10, layered over this form later), recommendations (P4), real Supabase OTP.

## Tasks
- [x] Use-cases: `requestOtp`, `verifyOtp`, `loadProfile`, `saveProfile` (tests)
- [x] Login reducer + ViewModel (reducer tests)
- [x] LoginScreen
- [x] Profile form model: step field groups, defaults, SOP cost suggestion (tests)
- [x] District search component (alias-aware, uses `searchDistricts`)
- [x] Activity picker (icon grid)
- [x] ProfileScreen with 3 steps + assisted mode
- [x] RTL tests: login happy path + wrong OTP; profile validation blocks next step; saved profile pre-fills
- [x] Locale keys `onboarding.*` in en + hi
- [x] Routes wired; manual browser check at 360 px in both languages

## Acceptance criteria
- New number → OTP `123456` → profile form. Wrong OTP shows the translated error and stays on the OTP step.
- Invalid input blocks moving to the next step, with a message next to the field.
- Typing "Allahabad" finds Prayagraj; the chosen district is stored as `prayagraj`.
- Saving the demo persona (Sitapur, F, 32, boutique ₹1.2L, income ₹1.8L) lands on `/schemes`.
- Assisted mode changes the question wording.
- `npm run typecheck`, `npm run lint`, `npm test` green.

## Files and modules touched
`apps/web/src/features/onboarding/**`, locale files, app route table.

## Open questions
- None beyond the P2 decisions (app layer location, fonts).
