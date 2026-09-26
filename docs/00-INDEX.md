# Doc 0: INDEX — Yojna Sarthi / SIH PS 26092

> **Read this first.** It says what every other document is for, what belongs in it, what must never be duplicated into it, and what is still open.
> Last synchronised: **26 September 2026.**
> Team Zenith · KIET Group of Institutions · PS 26092, Ministry of Social Justice and Empowerment · Target state: **Uttar Pradesh**

---

## The rule that keeps these docs clean

**Every fact lives in exactly one document.** Other documents reference it, they do not restate it.

If you find yourself copying a number from one doc into another, stop and link instead. The reason is simple: we have already had one figure (PM-SURAJ's scale) sit wrong in two places for a week because it was copied rather than referenced.

---

## The document set

| # | File | Single purpose | Owner | Status |
|---|---|---|---|---|
| **0** | `00-INDEX.md` | Navigation, doc purposes, open items | Atul | ✅ current |
| **1** | `01-the-system.md` | **How the system works, and every number about it** | Atul | ✅ current |
| **2** | `02-the-problem.md` | **What is broken, and who else has tried to fix it** | Atul | ✅ current |
| **3** | `03-evidence-and-data.md` | **Evidence from real people, and what data we can actually get** | Atul | ✅ current |
| **4** | `04-up-reference.md` | **Uttar Pradesh operational detail — the build reference** | Charan | ✅ current |
| **5** | `05-features.md` | **What we are building, in what order** | Atul | ✅ current |
| **6** | `06-tech-stack.md` | **Stack, architecture, cost guardrails** | Chirag | ✅ **v2, 26 Sept** |
| **H** | `explainer.html` | **Judge-facing visual explainer of the current system** | Ayush | ✅ rebuilt 26 Sept |

---

## What belongs in each, precisely

### Doc 1 — `01-the-system.md` · *The System*
**Answers:** how does government money reach an SC entrepreneur, and what are the numbers?

**Contains:**
- Ministry → Department → finance corporation → channel partner → beneficiary hierarchy
- All six finance corporations (NSFDC, NBCFDC, NSKFDC, NDFDC, NSTFDC, NMDFC) and caste-neutral fallbacks
- Every budget, disbursement, recovery-rate and beneficiary figure
- NSFDC prudential rules (the NPA and utilisation gates we route on)
- The multi-cycle impact evaluations
- Target-state decision and district priorities
- Research gap status table

**Never put here:** pain points (Doc 2), UP process detail (Doc 4), features (Doc 5).

### Doc 2 — `02-the-problem.md` · *The Problem*
**Answers:** what is actually broken, for whom, and who has already tried to fix it?

**Contains:**
- Data-confidence audit and remaining gaps
- Competitor landscape: PM-SURAJ, UP GIA portal, JanSamarth, Jan Dhan Darshak, myScheme, Haqdarshak, with the capability comparison table
- Pain point inventory: beneficiary (B), partner (P), NSFDC (N), Ministry (M), each with evidence and severity
- The disconnection loop
- Prioritised top pain points

**Never put here:** how the system works (Doc 1), our features (Doc 5).

### Doc 3 — `03-evidence-and-data.md` · *Evidence & Inputs*
**Answers:** what do real people say, and what data can we actually build on?

**Contains:**
- Real beneficiary voices from field reports and government surveys
- The data source register: real / scrapable / hardcoded
- Platform verdicts: Bhashini, data.gov.in, DigiLocker, API Setu, AIKosh
- The data-honesty position we take with judges

**Never put here:** pain point severity ratings (Doc 2), stack choices (Doc 6).

### Doc 4 — `04-up-reference.md` · *UP Operational Detail*
**Answers:** in Uttar Pradesh specifically, how does this actually run?

**Contains:**
- UPSCFDC's two tracks (NSFDC credit and PM-AJAY Grant-in-Aid)
- Full PM-AJAY process, committees, timelines, SRF lock
- All 16 state projects with costs and NSQF skill codes
- Application form fields and document checklists
- All 75 district offices and the 8 legacy-name aliases
- District staffing

**Never put here:** national figures (Doc 1), features (Doc 5).

### Doc 5 — `05-features.md` · *The Build Plan*
**Answers:** what are we building, why, in what order, and who does it?

**Contains:**
- Tier 0 PS-mandated features (F0 multilingual, F1 recommender, F2 calculator, F3 locator)
- Tier 1 differentiators (F4 approval odds, F5 voice, F6 documents, F7 officer dashboard, F8 status)
- Explicit out-of-scope list
- Pitch guardrails
- Data-honesty statement
- Team split and build order
- Demo script

**Never put here:** evidence (Docs 1–3), stack detail (Doc 6).

### Doc 6 — `06-tech-stack.md` · *Architecture* ✅ **v2**
**Answers:** what are we building it with, and why not the alternatives?

**Contains:**
- Every layer with the options considered and why the rejected ones lost
- **Two documented reversals from v1:** Python → Node/TypeScript, and Cloud SQL + Firebase → Supabase
- The three-tier LLM fallback (Gemini → Groq → Ollama)
- The privacy gate: PII masking, prompt-injection screening, signed application receipts
- Open-source alternatives for every AI component
- Cost model against ₹32k, and the guardrails
- Pre-commit checklist

**Never put here:** features (Doc 5), evidence (Docs 1–3).

### HTML — `explainer.html` · *Judge Explainer*
**Purpose:** explain the current system to someone with zero background, visually, in one scroll. Used in the pitch and for onboarding new teammates.

**Contains:** the story of how money flows, what breaks, and the headline evidence. It is a **presentation of** Docs 1 and 2, not a replacement for them.

---

## Current state, one screen

**Locked decisions**
- PS 26092, SC scope via NSFDC, with PM-AJAY as a second track
- Target state **Uttar Pradesh**; demo districts Sitapur, Hardoi, Rae Bareli, Lucknow, Ghaziabad
- Web-first PWA, not Android-first
- Partner health data is **seeded**, with a published API contract
- **Rules decide eligibility, LLM only explains**
- Multilingual is Tier 0, not a differentiator
- **Node + TypeScript end to end** (Fastify backend, React frontend, shared types)
- **Supabase** for database, auth and storage — one service, not split across Firebase
- **Three-tier LLM fallback**: Gemini → Groq → Ollama, so a dead key costs quality, not uptime
- **PII never reaches an LLM.** Caste and income go to the rule engine only

**The five numbers that carry the pitch** *(all sourced in Docs 1 and 2)*
1. **62.9%** of UP Grant-in-Aid applications never get any decision
2. **5.8x** swing in approval odds depending only on which project you pick
3. **58.8%** of beneficiaries cross the poverty line, down from ~99%
4. **~212 days** end-to-end for PMEGP, against a 130-day expectation
5. **0.15%** of SC households reached per year

**Still open**
| Item | Priority | Owner |
|---|---|---|
| **Scaffold repo + seed data** | 🔴 **blocking everyone** | TBD |
| Supabase project, PostGIS + pgvector enabled | 🔴 before code | TBD |
| GCP budget alerts + referrer-restricted Maps key | 🔴 before any deploy | Atul |
| Bhashini/ULCA account, Groq key, Ollama local | 🟠 before F0/F5 | TBD |
| **Team allocation** — deliberately deferred until the repo exists | 🟠 | Atul |
| Lok Sabha Q-number for the ₹7,856.65 cr figure | 🟠 before deck | anyone |
| Fix 5 source problems in the research paper | 🟠 before submission | paper author |
| Register PM-SURAJ applicant account | 🟡 optional | anyone |
| SOP projects 11–16, forms प्रपत्र-03 to 06 | 🟡 optional | — |
| VCFSC / ASIIM track (Doc 1 gap #12) | 🟡 optional | — |

---

## Source hierarchy, when two sources disagree

1. **Primary parliamentary** — Standing Committee report, Lok Sabha answers
2. **Official portal dashboards** — PM-SURAJ, UP GIA, NDFDC
3. **Government scheme documents** — UPSCFDC SOP, NSFDC lending policy, Union Budget
4. **Government-commissioned studies** — the 2020 MoSJE evaluation
5. **Reputable reporting** — The Mooknayak, PIB releases
6. **Everything else** — mark `[low confidence]` and keep it off slides

**Known conflict on record:** the UPSCFDC SOP states UP's SC population is 16.6%; Census 2011 says 20.69%. **Use Census, know the SOP disagrees.**
