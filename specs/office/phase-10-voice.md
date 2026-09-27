# Phase 10: Voice (F5)

Status: ✅ done — built, gate green (15 script + 111 shared + 290 web tests, typecheck, lint). Browser check not run: the Claude-in-Chrome extension was still disconnected this session (retried, same as noted in the P9 log) — verified via RTL instead (mic buttons filling fields from simulated transcripts, hidden when unsupported; read-aloud composing and speaking the expected summary, hidden when unsupported; a light unit-test suite for the Web Speech wiring itself using stubbed globals).

## Goal
PS 26092 / F5 asks for voice-first, low-literacy intake and read-aloud results (81.1% of UP GIA applicants are rural; 15.3% illiterate; 73.7% only primary/middle-schooled). Two of F5's five requirements are already shipped: F5.5 (assisted mode, "filling this for someone else") in P3, and F5.4 (icon-led UI) substantially covered by P3's `ChoiceCards`/`ActivityPicker`. No Bhashini/Groq keys, SDKs, or backend exist (confirmed: no `.env`, no dependency, no `core/services/` directory, zero voice code anywhere in `apps/web/src`) — `docs/BUILD-PROMPT.md` explicitly allows stub-quality voice for the hackathon demo. This phase covers the remaining F5.1/F5.2 (voice intake) and F5.3 (read-aloud), using the browser's own Web Speech API as a real, working, key-free implementation behind a `LanguageService` interface — matching `docs/06-tech-stack.md`'s architecture rule ("one `LanguageService` interface, no component ever calls Bhashini directly") so a real Bhashini backend can later replace only the implementation.

## In scope (docs/05-features.md F5)
- **F5.1/F5.2** Voice intake on the existing `ProfileScreen` (P3): a mic button on `age`, `estimatedCost`, `annualFamilyIncome` (the shared `NumberField`), `fullName`, and `DistrictSearch`'s query — the only free-dictation/spoken-number fields the shipped form actually has (the "land in acres / animals / milk / distance to vet" fields from docs/04's प्रपत्र-02 reference were never built into `ApplicantProfile` and are out of scope).
- **F5.3** Read-aloud on the recommender results: `SchemeCard` (list results, `SchemesScreen`) and `SchemeDetailScreen` (which also hosts `OddsBadge`/`BetterOddsList` — there is no separate approval-odds screen), each composing one spoken string (scheme name, top "why it fits" reason, approval-odds percentage) from already-localized on-screen text.
- New `core/services/languageService.ts` (interface) + `webSpeechLanguageService.ts` (browser implementation), wired into the existing DI `Container`/`RepositoryProvider` pattern.
- New reusable `shared/components/MicButton.tsx` and `ReadAloudButton.tsx`.
- Locale keys `voice.*` (en + hi).

## Decisions
1. **Web Speech API, not a fake stub.** `SpeechRecognition` (mic input) and `window.speechSynthesis`/`SpeechSynthesisUtterance` (read-aloud) are real, free, and need no keys — a genuinely working demo, unlike the DigiLocker-style label-only stub in P8. `SpeechSynthesis` is fully typed in `lib.dom.d.ts`; `SpeechRecognition` is not, so a small ambient declaration file is added.
2. **Scope stays to the profile form + recommender results.** No voice on documents/partners/status/verify screens this phase; no redesign of F5.4 (already covered); F5.5 already shipped.
3. **Graceful degradation is mandatory.** `LanguageService.isSttSupported()`/`isTtsSupported()` gate the mic/read-aloud buttons — they hide (not error) when the browser lacks support (no Firefox, older Safari). This is a real, disclosed limitation, not silently glossed over.
4. **STT/TTS language follows the app's current i18n language** (`hi-IN` in Hindi, `en-IN` in English). Disclosed limitation: Web Speech API's Hindi recognition quality/availability varies by browser/OS (best on Chrome desktop) — this is not equivalent to a real Bhashini backend, and the spec/log say so.
5. **DI shape:** `language: LanguageService` is added directly to the existing `Container` type (`core/di/container.ts`) and exposed via a `useLanguageService()` hook next to `useRepositories`/`useDevTools` in `RepositoryProvider.tsx` — matching the existing pattern exactly rather than introducing a parallel context, even though `LanguageService` is synchronous/browser-global-backed unlike the async data repositories. Tests inject a `MockLanguageService` test double the same way `renderApp` already injects mock repositories.

## Out of scope
- Real Bhashini/Groq integration — no backend, no keys, no account exists.
- Guaranteeing non-Chrome browser support for STT (Web Speech API's `SpeechRecognition` is Chrome/Chromium/Edge-only in practice).
- Voice on any screen besides `ProfileScreen`, `SchemesScreen`, `SchemeDetailScreen`.
- F5.4 (icon-led UI redesign) and F5.5 (assisted mode) — both already shipped.
- The प्रपत्र-02 dairy-form fields (land/animals/milk/vet-distance) — not part of the implemented `ApplicantProfile` schema.

## Files and modules touched
`apps/web/src/types/speech-recognition.d.ts` (new), `apps/web/src/core/services/**` (new), `apps/web/src/core/di/container.ts` + `RepositoryProvider.tsx` (modified), `apps/web/src/shared/components/{MicButton,ReadAloudButton}.tsx` (new), `apps/web/src/features/onboarding/presentation/{fields.tsx,AboutStep.tsx,DistrictSearch.tsx}` (modified), `apps/web/src/features/recommender/presentation/{SchemeCard.tsx,SchemeDetailScreen.tsx}` (modified), `apps/web/src/test/renderApp.tsx` (modified, to inject a mock `LanguageService`), locale files.

## Tasks
- [x] `speech-recognition.d.ts` ambient declarations
- [x] `languageService.ts` interface + `webSpeechLanguageService.ts` implementation
- [x] Wire `language` into `Container`/`RepositoryProvider`; add `MockLanguageService` test double and inject it in `renderApp`
- [x] `MicButton.tsx`, `ReadAloudButton.tsx` + `voice.*` locale keys (en + hi)
- [x] Mic wired into `NumberField` (age/cost/income), `fullName`, `DistrictSearch`
- [x] Read-aloud wired into `SchemeCard` and `SchemeDetailScreen`
- [x] RTL: mic button hidden when STT unsupported; clicking it and firing a mock transcript fills each of the four wired inputs; read-aloud button hidden when TTS unsupported; clicking it calls `speak()` with the expected composed text
- [x] Gate green (typecheck, lint, i18n, boundaries, specs, full test suite: 15 script + 111 shared + 290 web tests)
- [ ] Browser check — retried Claude-in-Chrome connection, still disconnected this session; documented rather than silently skipped (see Status line)

## Acceptance criteria
- On `ProfileScreen`, each of `fullName`, `age`, `estimatedCost`, `annualFamilyIncome`, and district search shows a mic button when the browser supports `SpeechRecognition`, hidden otherwise; a simulated transcript fills the right field.
- On `SchemesScreen`'s scheme cards and on `SchemeDetailScreen`, a read-aloud button is present when `speechSynthesis` is supported and speaks a composed summary (scheme name, top reason, approval odds) in the current UI language.
- Toggling the UI language changes the STT/TTS language tag used (`hi-IN`/`en-IN`).
- Gate green: typecheck, lint, i18n, boundaries, specs, full test suite.

## Open questions
- None — engine choice (Web Speech API), scope (profile form + recommender results only), degradation behavior, and DI shape were confirmed with the user before this spec was written.
