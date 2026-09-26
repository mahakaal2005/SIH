# Phase 4: Recommender

Status: ✅ done — built, gate green, manual 360px/en+hi browser check confirmed working by the user.

## Goal
After the profile, the citizen sees which schemes fit, ranked, with a plain reason for each. They also see which schemes they narrowly miss (and by how much) and why others don't apply. Then they pick one to go on with. The rule engine decides; the screen only explains (F1, "rules decide, LLM explains").

## In scope
- `features/recommender/` with `data/ · domain/ · presentation/`
- **Use-case** `getRecommendations(repo, profile)` → `RecommendationResult` (engine runs behind the repository, as the backend will).
- **View mapping** `toResultView(result, lang)` (pure, tested): per card the title, agency, kind (grant + loan / loan / subsidy + loan), headline figure (grant amount, or rate range), up to 3 "why it fits" reasons from `passedKeys`, priority chips from `priorityKeys`, and a finance preview from `financePlan`. Near-miss cards carry `{gap, limit}` for the "you miss this by ₹5,000" line.
- **SchemesScreen** `/schemes` (MVI, `useSchemesViewModel`)
  - Top match is shown large, with the `MoneyBar` preview of what she pays / gets free / borrows
  - Other eligible schemes as compact cards
  - "Almost eligible" section (near misses) with the exact gap and what would change it
  - "Also available" (PMEGP/Mudra) collapsed when an SC scheme fits; shown as the main list with an explanatory banner when the fallback is used (F1.7)
  - "Why not these" collapsed list with the failing reasons
  - States: loading (skeleton), error + retry, empty (nothing at all, not even near misses: show the district UPSCFDC office contact), success
  - Link to edit the profile
- **SchemeDetailScreen** `/schemes/:schemeId`: summary, every rule line pass/fail, "Rules as of DD-MM-YYYY, version N" (auditability), finance preview, SOP project details (skill courses, conditions) for PM-AJAY. The "Continue with this scheme" CTA stores `journey.schemeId` and goes to `/schemes/:id/cost` (P6; until then that route shows not-found).
- **Explanation:** deterministic i18n templates from `reasonKey`s. An `ExplanationService` interface is not added yet (YAGNI until an LLM adapter exists); the P4 log notes where it will go (`llm/`, behind the privacy gate).
- Recommendations are invalidated when the profile is saved (already wired in P3).

## Out of scope
Approval-odds badges, chart and disclosure (P5, which slots into these cards); calculator (P6); LLM prose.

## Tasks
- [x] Use-case + query hook (`data/`) — `domain/recommendations.usecase.ts`
- [x] `toResultView` with tests (persona, near miss ₹1.45L, fallback GEN, priority chips, AMY reason)
- [x] `useSchemesViewModel` (status mapping, retry) with reducer tests
- [x] SchemesScreen: top match + MoneyBar, list, near misses, also available, why-not, all states
- [x] SchemeDetailScreen: rule table with version/date, finance preview, SOP details, CTA → journey
- [x] Locale keys `recommender.*` (en + hi)
- [x] RTL: persona sees PM-AJAY boutique first; ₹1.45L shows "miss by ₹5,000"; GEN profile sees fallback banner; injected failure → error → retry succeeds; choosing a scheme stores it in the journey
- [x] Routes wired
- [x] Browser check at 360 px in Hindi and English — confirmed working by the user

## Acceptance criteria
- Demo persona: PM-AJAY Boutique first, with a MoneyBar of ₹6,000 own / ₹50,000 grant / ₹64,000 loan; Micro Credit and UNY listed below.
- ₹1.45L generic service project: Micro Credit shows under "Almost" with "you miss this by ₹5,000"; Term Loan is eligible.
- Age 51: boutique shows under "Almost" with the age reason.
- GEN caste: banner explains the fallback; PMEGP and Mudra listed.
- Every reason and label translated; nothing rendered from an untranslated key.
- Gate green.

## Files and modules touched
`apps/web/src/features/recommender/**`, locale files, `app/router.tsx`.

## Open questions
- None.
