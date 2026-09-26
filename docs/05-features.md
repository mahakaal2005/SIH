# Doc 5: Feature List and Build Scope

> Locked 26 Sept 2026. PS 26092, target state Uttar Pradesh.
> Tier 0 is the PS floor, non-negotiable. Tier 1 is what makes us win. Tier 2 is explicitly out.
> Docs 1–4 are the evidence base for every claim here.

---

## The one-sentence pitch

> Every existing government portal processes an application you already know how to make. **None of them help you decide.** We built the deciding layer: it tells you which scheme fits, what it will actually cost, and which partner near you can genuinely fund it today.

**Why that holds up:** PM-SURAJ, the UP GIA portal, JanSamarth, Jan Dhan Darshak, myScheme and Haqdarshak were all audited. **All three PS deliverables score ❌ on every single one.** Partner-health routing exists nowhere in Indian e-governance. That's not a guess any more, it's checked.

### ⚠️ Pitch guardrail 2: do NOT position this as a "scheme discovery" product

The Team Zenith literature review argues that **discovery is already largely solved** at national scale by myScheme and JanSamarth, and that the unresolved gap is **execution**. If we stand up and say "we help people discover schemes," a judge answers "myScheme exists" and we're done.

**Both things are true, and the distinction is ours to make:**
- Discovery is solved **generically** — myScheme lists 2,066 schemes for anyone who reaches it
- Discovery is **not** solved **for this population** — 61.1% of actual NSFDC beneficiaries heard by word of mouth, 2.6% from official camps, 81.1% are rural, 15.3% illiterate. They never reach myScheme. And **no platform anywhere runs a recommender over NSFDC's own schemes**
- Execution is unsolved **for everyone** — 62.9% of UP applications never decided, ~212 days for PMEGP end to end, 1.29 lakh JanSamarth grievances

**Say this:** *"We are not a discovery portal. We are the decision-and-execution layer: which scheme actually fits you, what it truly costs, which partner can genuinely fund it, and what is happening to your application right now."*

**Corollary for F4 and F8:** these are the features that make the claim true. Lead with them, not with F1.

### ⚠️ Pitch guardrail 1: do NOT say "the funds go unused"

A February 2026 Lok Sabha answer puts channel-partner fund utilisation at **97.67%** (₹7,856.65 cr released, ₹7,673.59 cr utilised as on 23.01.2026). Any claim that money sits idle gets destroyed in one question.

**Say this instead:** the plumbing works, the **decision layer** is what fails. And the Government's own four stated reasons for what shortfall exists are:
1. Delays in beneficiary selection by SCAs → **F4**
2. Time taken by beneficiaries to complete documentation → **F6**
3. Non-receipt of utilisation information from district branches → **F7**
4. Pending utilisation certificates → **F7**

**All four are features in this document.** When a judge asks "why these features?", the answer is: *because the Ministry told Parliament these are the problems.* Full analysis in Doc 1.

---

## TIER 0: The PS floor (must ship, judges check these line by line)

> **Correction, 26 Sept:** an earlier version of this doc had multilingual sitting in Tier 1. That was wrong. The PS requirement sentence reads: *"develop an intelligent, **multi-lingual** digital platform or mobile application."* **Multilingual is PS-mandated, not a differentiator.** It has been moved to F0 below.

### F0. Multilingual Interface ⚠️ PS-MANDATED, BUILD FROM DAY ONE
*PS: "develop an intelligent, multi-lingual digital platform or mobile application"*

| # | Requirement | Source |
|---|---|---|
| F0.1 | Hindi and English at minimum, every screen, every string | PS |
| F0.2 | Language chosen **before** the first question, remembered thereafter | 81.1% of UP GIA applicants are rural |
| F0.3 | Bhashini translation for scheme names, eligibility text and results | Doc 3 |
| F0.4 | Scheme and project names rendered in Hindi as the SOP writes them (बुटीक व्यवसाय आधारित क्लस्टर, not "Boutique cluster") | UPSCFDC SOP |
| F0.5 | Numbers, currency and dates in Indian conventions (lakh, crore, ₹, DD-MM-YYYY) | — |
| F0.6 | Architecture: **i18n from the first component.** No hardcoded strings, ever | Engineering call |

**🔴 Why this cannot be deferred, and why the earlier plan was wrong:**
Retrofitting i18n into an English-first React app means touching every component twice. Worse, **voice (F5) is the same Bhashini integration** — language detection, ASR, TTS and translation all run through one service layer. Building English-first and adding language later means building that layer twice.

**So: F0 and F5 ship together as one workstream, starting day one.** Faiqua owns the Bhashini service layer; every other feature consumes it. Treat "which language" as a first-class input to the app, exactly like "which district", not as a skin applied at the end.

### F1. Smart Scheme Recommender
*PS: "An AI/rule-based engine that takes basic user inputs (project type, estimated cost, income level, education status) and automatically recommends the most suitable credit or educational loan scheme."*

| # | Requirement | Source |
|---|---|---|
| F1.1 | Intake: project type, estimated cost, annual family income, education status, age, gender, district, SC status | PS + UPSCFDC प्रपत्र-01/02 |
| F1.2 | Rule engine returns a **ranked** list of fitting schemes with a plain-language reason for each | PS |
| F1.3 | Covers NSFDC credit: Micro Credit (≤₹1.40L), Term Loan (₹1.40L–₹50L), Education Loan (≤₹40L), AMY, UNY | Standing Committee 25th Report |
| F1.4 | **Also covers PM-AJAY Grant-in-Aid** (₹50k grant, no income cap, age 18–50) and its 16 UP projects with real costs | UPSCFDC SOP |
| F1.5 | Handles boundary cases explicitly, e.g. a ₹1.45L project just over the micro limit | Doc 2 pain point B5 |
| F1.6 | Eligibility rules stored as **data, not code**, so new schemes are added without a rebuild | Our design call |
| F1.7 | If ineligible for everything SC-specific, falls back to caste-neutral (PMEGP, Mudra) rather than dead-ending | Doc 2 B6 |

**Data:** `gov-myscheme-dataset` (2,066 schemes, Apache-2.0) + our hand-built NSFDC and PM-AJAY rule tables from Docs 1 and 4.

### F2. Financial Calculator
*PS: "calculate projected EMIs, accounting for maximum loan limits, interest rates (6.5% to 15%), and moratorium periods (3 to 12 months)."*

| # | Requirement | Source |
|---|---|---|
| F2.1 | EMI with principal, rate, tenure **and moratorium (3–12 months)** | PS |
| F2.2 | Scheme-correct rates: NSFDC 6.5–8%, micro credit up to **15%** via SCA margin | Standing Committee |
| F2.3 | Enforces per-scheme caps and the 90% financing rule | PS + NSFDC |
| F2.4 | **Grant-in-Aid mode:** total cost → 5% beneficiary contribution → ₹50k grant → training cost → CGTMSE fee → net loan | UPSCFDC SOP, verbatim |
| F2.5 | Shows total interest paid, not just the monthly figure | Doc 2 B8 |
| F2.6 | Affordability check against stated income, with an honest warning | Doc 2 B10 |

### F3. Geo-Spatial Partner Locator and Router
*PS: "identify the nearest eligible Channel Partner based on the user's location and the partner's current fund utilization eligibility (ensuring applications aren't sent to partners with high NPAs or overdues)."*

| # | Requirement | Source |
|---|---|---|
| F3.1 | Map of partners near the user, filtered to those authorised for **their** scheme | PS |
| F3.2 | **Health gate**, using NSFDC's real published prudential rules: no overdues >1 year, ≥80% cumulative utilisation, RRB net NPA <15%, PSB no overdues at disbursement | NSFDC lending policy |
| F3.3 | Each partner shows a health badge with the reason, never a bare score | Our design call |
| F3.4 | Blocked partners are **shown but marked**, with the next-best alternative. Never silently hidden | Doc 2 B12 |
| F3.5 | Covers UPSCFDC's 75 district offices plus bank branches | Doc 4 |
| F3.6 | **District alias map** for the 8 renamed districts (Prayagraj/Allahabad, Ayodhya/Faizabad, Hathras/Mahamaya Nagar, Sambhal/Bhim Nagar, Amethi/CSM Nagar, Amroha/JP Nagar, Hapur/Panchsheel Nagar, Shamli/Prabuddh Nagar, Kasganj/Kanshiram Nagar) | Doc 4, our find |

**Data:** `razorpay/ifsc` for branches, UPSCFDC district list from Doc 4, partner-health values **seeded** with the published schema (see Doc 3 Part B3).

---

## TIER 1: Differentiators (this is where we win)

Ranked by evidence strength and demo impact.

### F4. ⭐ Approval Odds Predictor — *the killer feature*
**The evidence:** UP's own GIA portal publishes that approval rates range from **7.7% (poultry) to 44.3% (women's home industry)** across the 16 projects. A **5.8x spread** based purely on which project you pick. Nothing anywhere tells the applicant this.

| # | Requirement |
|---|---|
| F4.1 | Show historical approval rate for each recommended scheme/project, from real published data |
| F4.2 | Show district-level throughput (Rampur leads applications, Bahraich leads approvals — they differ) |
| F4.3 | Warn honestly when a chosen project has poor historical odds, and show better-matched alternatives |
| F4.4 | Surface the **62.9% no-decision rate** as an expectation-setting disclosure, not a hidden risk |

**Why no other team will have this:** it requires having found and parsed the UP GIA dashboard. We have it.

### F5. ⭐ Voice-First Low-Literacy Intake (Bhashini) — *ships with F0, same workstream*
> Multilingual (F0) is PS-mandated. **Voice is our addition on top** — the PS never asks for it. But both run on one Bhashini service layer, so they are built together, not sequentially.

**The evidence:** 81.1% of UP GIA applicants are rural. In the 3,300-person MoSJE survey, 15.3% were illiterate and 73.7% had only primary or middle schooling. 57.2% applied at a gram panchayat, not online.

| # | Requirement |
|---|---|
| F5.1 | Full intake answerable by speaking, via Bhashini ASR, Hindi first |
| F5.2 | Questions modelled on UPSCFDC प्रपत्र-02, which is mostly spoken numbers (land in acres, animals owned, milk produced, distance to vet hospital) |
| F5.3 | Every result readable aloud via Bhashini TTS |
| F5.4 | Icon-led UI that works without reading. Ayush's core deliverable |
| F5.5 | Assisted mode for a CSC or panchayat operator filling on someone's behalf |

### F6. ⭐ Document Readiness Checker
**The evidence:** 31.4% of borrowers hit difficulty; of those **93.4% couldn't produce security or guarantee** and **77.5% made repeated office visits.**

| # | Requirement |
|---|---|
| F6.1 | Exact document checklist per scheme, from the real UPSCFDC list (Aadhaar, caste cert, income cert, residence, bank passbook, selection letter, notarised 3-year affidavit, plus project-specific items) |
| F6.2 | Pre-flight check against the real pre-scrutiny gates: CIBIL, penny-drop, no-default certificate |
| F6.3 | Auto-generated project report draft with the SOP's five required cost components |
| F6.4 | DigiLocker link-out for caste and income certificates via API Setu |

### F7. Officer-Side Dashboard
**The evidence:** an MP SC Finance Corporation president told a journalist *"I am not aware of the progress of the schemes, I will be able to tell something only after I have statistics."* And 62.9% of UP applications sit undecided.

| # | Requirement |
|---|---|
| F7.1 | District officer view: pending queue, ageing buckets, oldest-waiting first |
| F7.2 | **Stalled-application alert** — the 62.9% problem made visible and actionable |
| F7.3 | Partner-health view for the NSFDC/SCA level |
| F7.4 | **Call list generator** for the HQ Tele Caller role that actually exists at UPSCFDC |
| F7.5 | Simple enough for a Computer Operator or Tally Operator, who are the real district staff |

### F8. Status Transparency for the Citizen
**The evidence:** ~4 months application-to-disbursal, nothing published to the applicant. 62.9% never hear anything.

| # | Requirement |
|---|---|
| F8.1 | Stage tracker against the real process: pre-scrutiny → DLPAC → bank (5-day SLA) → sanction → SRF 18-month lock |
| F8.2 | Realistic expected timeline from published averages, not invented ones |
| F8.3 | SMS/WhatsApp nudges, since 94.8% of borrowers are offline-first |
| F8.4 | On rejection, show the reason and a concrete fix-and-reapply path. **Frame this as enforcing an existing legal right**, not as a nice-to-have: RBI's Fair Practices Code requires lenders to convey rejection reasons **in writing** for loans up to ₹2 lakh, which covers NSFDC Micro Credit (≤₹1.25L) and most PM-AJAY projects |
| F8.5 | **Anti-fraud layer.** The MSME Ministry has formally warned that fake agents issue fake sanction letters and charge fees; documented losses run to ₹1.45 crore in a single case. Show the citizen an authoritative status view, state plainly that the process is free and no middleman is authorised, and surface the RBI Integrated Ombudsman escalation path (approach the bank, wait 30 days, then escalate). **A citizen who can see their real status cannot be sold a fake one** |

---

## TIER 2: Explicitly OUT of scope

State this on a slide. Discipline reads as maturity.

| Not building | Why |
|---|---|
| Actual loan disbursement or money movement | PM-SURAJ and banks do this. We are the guidance layer |
| Replacing PM-SURAJ | We complement it. Ideally we hand off *into* it |
| Live integration with NSFDC/LAMS/PM-SURAJ back ends | No public API exists. We publish the contract we'd need |
| Real CIBIL pulls | Licensed data. We simulate the gate |
| Aadhaar eKYC | Needs authorised-agency status |
| All 28 states | UP only. Architecture is state-agnostic, seed data is not |
| All 2,066 myScheme schemes at full depth | NSFDC + PM-AJAY deep, others as fallback breadth |
| Native iOS | Android + responsive web |

---

## Data honesty statement (say this out loud to judges)

| Layer | Status |
|---|---|
| Scheme rules, rates, limits, documents | **Real**, from NSFDC, the Standing Committee report and the UPSCFDC SOP |
| 16 UP projects with costs and skill codes | **Real**, from the UPSCFDC SOP |
| Approval-rate data | **Real**, from the UP GIA public dashboard |
| Bank branch locations | **Real**, `razorpay/ifsc` |
| District offices | **Real**, all 75 from UPSCFDC |
| Language and voice | **Real**, Bhashini |
| **Partner NPA / overdues / utilisation** | **Seeded.** No public source exists anywhere. We publish the exact API contract NSFDC would need to expose |

> NSFDC monitors 91 channel partners through 4 liaison centres. A state corporation president could not report his own scheme's progress without first requesting statistics. **The data we need doesn't exist because nobody has built the system that would produce it.** Here is that system, and here is the feed it needs.

---

## Build split, 6 people

| Who | Owns | Tier 0 | Tier 1 |
|---|---|---|---|
| **Rudra** (AI/ML) | Recommender engine | F1 | F4 approval-odds model |
| **Chirag** (AI/ML + backend) | Backend, DB, partner-health service | F3.2–F3.4 | F7 dashboard APIs |
| **Charan** (full stack) | Web app, officer dashboard, calculator | F2, F3.1 | F7 |
| **Faiqua** (Android + AI/ML) | Android app, Bhashini integration | F1 UI, F2 UI | F5 voice |
| **Atul** (Android + web, lead)| Architecture, integration, citizen app, pitch | F1–F3 glue | F6, F8 |
| **Ayush** (UI/UX) | Design system, icon-led low-literacy UI, deck | all screens | F5.4 |

**Suggested order (revised 26 Sept):**
0. **F0 language layer + seeded DB — day one, in parallel.** Everything else depends on both. Faiqua on the Bhashini service, Chirag on the data
1. **F1 + F2** — they demo standalone and prove the concept
2. **F3** partner map and health routing
3. **F4** approval odds — cheap, data already in hand, biggest impact
4. **F5** voice layered onto the F0 service, **F6** documents
5. **F7** officer dashboard, **F8** status and anti-fraud

⚠️ **Never build an English-only version "to be translated later."** Every string goes through the i18n layer from the first commit.

---

## Demo script (7 slides)

1. **The person.** Rural SC woman in Sitapur, wants a ₹1.2L boutique. Today she has no idea PM-AJAY exists
2. **The gap.** 0.15% annual reach. 61.1% hear by word of mouth, 2.6% from official camps
3. **The trap.** Approval odds swing **5.8x** by project choice, and **62.9% of applications never get a decision.** UP's own published data
4. **Live demo.** She speaks in Hindi → matched to boutique cluster → sees real EMI and grant split → sees a partner who can actually fund her → gets a document checklist
5. **The officer side.** The stalled-application queue that nobody can currently see
6. **What's real vs seeded.** The honesty table above
7. **The ask.** One API from NSFDC, and this runs on live data tomorrow

---

## Open, non-blocking
- Register a PM-SURAJ applicant account to see the logged-in form flow
- AJAY-Udyami app needs credentials we don't have
- SOP projects 11–16 cost sheets and forms प्रपत्र-03 to 06
- VCFSC/ASIIM track discovered but not mapped (Doc 1 gap #12)
