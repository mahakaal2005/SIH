# Doc 3: Real Voices + Data Source Register

> Replaces field interviews with sourced evidence found online, and settles what data we can actually get vs what we hardcode.
> Doc 1 = `org-hierarchy-plan.md` (how the system works + numbers). Doc 2 = `pain-points-and-landscape.md` (problems + competitors).
> Compiled 25 Sept 2026.

---

# PART A: Real voices and ground evidence

Reddit and Quora turned out to be dead ends for this specific topic. NSFDC borrowers are overwhelmingly rural, 89.5% per the MoSJE evaluation, with 15.3% illiterate and only 10.4% educated past matric. **They are not on Reddit.** That absence is itself a finding: the population we're designing for does not post online, which is exactly why every existing digital solution misses them.

Where their experience *does* get recorded: Dalit-focused news media, parliamentary evidence, government evaluation surveys, and grievance data. That's what's below.

## A1. The single best ground report: MP SC Finance Corporation

**Source:** The Mooknayak, investigation into the Madhya Pradesh State Cooperative SC Finance and Development Corporation, FY 2023-24.

| Scheme | Target | Applications received | Approved | Actually funded | % of applicants funded **(derived)** |
|---|---|---|---|---|---|
| Sant Ravidas Self-Employment | 2,000 | **6,027** | 1,354 | **1,119** | **18.6%** |
| Ambedkar Economic Welfare | 5,000 | 3,697 | 1,342 | **1,155** | **31.2%** |
| CM SC Special Project | 10 | 29 | 21 | **0** | **0%** |

**This reframes the problem, and it matters for our pitch.**

We had been building the story around awareness, "0.15% reach, people don't know NSFDC exists." That's true nationally. But at the state level, **demand already exceeds supply by 3x**. 6,027 people applied for 2,000 slots. They found out, they applied, and 4,908 of them got nothing. One scheme approved 21 projects and funded zero.

So the real failure is not only "people don't know." It is **"people apply, wait, and the money never arrives, and nobody tells them why."** Our solution has to answer both.

**Stated reasons from the report:** delay in budget allocation, and lack of publicity. Officials said pamphlets couldn't even be printed and the PR department ran no hoardings or ad campaigns.

**The quote to put on a slide.** Corporation president Sawan Sonkar, asked about his own schemes' progress:

> "I am not aware of the progress of the schemes, I will be able to tell something only after I have statistics."

The head of a state SC finance corporation could not say how his own loan schemes were performing without first requesting statistics. **That is the single strongest justification for the agency-side dashboard we want to build.** It is not a hypothetical gap. The person responsible said it out loud to a journalist.

## A2. Discrimination at the bank counter

**Source:** SARIM Watch. Dalit youth in Bihar alleged Bank of Baroda discriminated in loan processing and filed a written complaint to the RBI.

Relevant because NSFDC's alternate channel now runs through 53 bank/RRB/NBFC partners. Routing someone to "the nearest partner branch" is not neutral if the counter experience differs by caste. Supports pain point B12 and P1, and argues for our partner-quality signal being more than just NPA numbers.

*(Flagged as a lead, not fully verified. The site blocked automated fetch. Worth one manual read before quoting.)*

## A3. The 3,300-person survey we already have is primary research

Worth restating plainly: the **MoSJE-commissioned 2020 NSFDC evaluation surveyed 3,300 actual loan beneficiaries across 5 states.** That is real user research, professionally conducted, at a sample size we could never reach ourselves. We are not missing user research. We are using someone else's, which is legitimate and citable.

Direct beneficiary-reported findings already in Doc 1, restated here as user voice:

- **67.7% asked for interest-free loans.** 16.5% asked for loans without a guarantee. 15.5% asked for faster processing. 13.8% asked for less paperwork. *This is a user requirements list, stated by users.*
- **31.4% faced difficulty getting the loan.** Of those, 93.4% could not provide security or a guarantee, and 77.5% had to make repeated office visits.
- **61.1% heard about the scheme from relatives or friends.** Only 2.6% from official awareness camps.
- **57.2% submitted their application at the gram panchayat**, not online, not at a bank.
- **94.8% repay in cash.** No digital trail exists for most borrowers.
- **46.3% needed more credit later. 34% of those went to moneylenders.**

## A4. What Parliament recorded beneficiaries saying (Standing Committee, Aug 2026)

Common findings across NSFDC's own evaluation cycles, as tabled:

- Beneficiaries reported the **"slow process of application, approval and disbursement"**; average time from submission to receipt in 2016-17 was **more than six months**.
- Beneficiaries expressed **unhappiness about insufficient credit amount** to run their proposed activity properly, and asked for higher limits.
- Beneficiaries reported **difficulty due to repeated visits** to the channel partner's office.
- The Committee separately noted there is **no mechanism at all** for beneficiaries or SC representatives to advise NSFDC or the SCAs on scheme design.

## A5. Grievance data as a proxy for complaints

**CPGRAMS** (pgportal.gov.in) is the national grievance system. **data.gov.in publishes state/UT-wise received and pending complaint counts.** This gives us a defensible volume-of-dissatisfaction number without interviewing anyone.

Individual grievance *text* is not public, so we can cite counts, not quotes.

## A6. Honest limitation to state on a slide

We have survey-level and report-level evidence, not our own interviews. Say so. Judges respect "3,300-person government survey plus a parliamentary report plus a field investigation" far more than five hallway conversations, provided we cite them properly and don't pretend they're ours.

---

# PART B: Data source register

Every data element the product needs, and where it actually comes from.

## B1. ✅ REAL and free, use directly

| Data | Source | Format | Notes |
|---|---|---|---|
| **2,066 government schemes** with eligibility, exclusions, benefits, application process, documents required, FAQs, official links | **`Aryan-Pardeshi/gov-myscheme-dataset`** (GitHub) | CSV, JSON, PostgreSQL | **The single biggest unlock.** 527 central + 1,539 state/UT. 16 columns, claimed 100% completeness. **Apache-2.0 licensed**, so we can ship it. Derived from the official MyScheme portal |
| Same data, upstream | `shrijayan/gov_myscheme` (HuggingFace) | dataset | Cross-check source for the above |
| Extra scheme datasets | Kaggle: "Indian Government Schemes Data September 2026", "Indian Government Schemes" | CSV | Use to fill gaps or validate |
| **Every bank branch in India with IFSC, address, district, state** | **`razorpay/ifsc`** (GitHub) | JSON | Actively maintained, well-known. This is our partner-location layer |
| Bank branch data, official | data.gov.in keywords `RBI`, `branch`; RBI DBIE portal | CSV/API | Official backup for the above |
| **Translation + speech in 22 Indian languages** | **Bhashini** (bhashini.ai, docs at bhashini.gitbook.io) | REST API, free | Government-run. Powers our voice-first and multilingual requirement. Already used by CSC, DigiLocker, UMANG |
| Caste certificate, income certificate, other documents | **DigiLocker via API Setu** (apisetu.gov.in) | API | Issuer network. Needs registration, but it's the legitimate path for document verification |
| Village/district/block administrative hierarchy (LGD) | `mchittineni/india-village-finder` (GitHub) | data + maps | For location matching down to village level |
| NSFDC scheme rules, interest rates, loan limits, lending policy, allocation rules | nsfdc.nic.in (incl. the Lending Policy PDF) | web/PDF | Scrape once, store |
| NDFDC year-wise + state-wise disbursement | ndfdc.nic.in → Achievements | already downloaded | In Doc 1 |
| NSFDC institutional data, recovery rates, SCA state performance | Standing Committee 25th Report | already downloaded | In Doc 1 |
| Grievance volumes by state | data.gov.in CPGRAMS dataset | CSV | Evidence, not a product feature |
| SC population by state/district | Census 2011 via data.gov.in | CSV | Needed because NSFDC allocates funds by SC population share |

## B2. 🟡 REAL but needs scraping or manual collection

| Data | Source | Effort |
|---|---|---|
| State Channelizing Agency list, 38 of them, with addresses and contacts | nsfdc.nic.in; the direct URLs 404 so navigate the live site | One session, manual |
| **UP SCA process, forms, district offices** (our target state) | **upscfdc.in** | Blocked to automated tools, **needs a human with a browser**. One hour |
| District-level SC corporation office addresses | Individual state/district `.gov.in` sites (e.g. AP districts publish "SC Corporation" pages) | Tedious. Do only for the target state |
| PM-SURAJ application flow and any published stats | pmsuraj.dosje.gov.in (also pmsuraj.ncog.gov.in) | **Still the #1 open item. Needs registration** |

## B2b. Platform verdicts (assessed 26 Sept 2026)

| Platform | Verdict | Solves | Lacks |
|---|---|---|---|
| **Bhashini** | ✅ **CORE** | F0 multilingual + F5 voice. Free, 22 languages, government-built | Two-step call (pipeline config → compute), needs ULCA registration. Financial vocabulary will need a custom glossary |
| **data.gov.in** | ✅ **Useful, secondary** | Census SC population by district, CPGRAMS grievance volumes, RBI branch backup. Self-serve API key, no gate | No NSFDC operational data. Mostly CSV dumps, not live APIs |
| **DigiLocker** | 🟡 **Link-out only** | F6 document readiness. Caste and income certificates issued by many states; legally equivalent to originals (Rule 9A, IT Rules 2016) | **Real API needs partner approval via API Setu** — not achievable in our timeframe. Ship a deep-link button instead, demos identically |
| **API Setu** | 🟡 **Architecture slide** | The production path for document verification. 16 categories, Document/Service/Listing API types | **Consumers must register AND get per-API publisher approval.** Not self-serve. Name it as the go-live path, don't block on it |
| **AIKosh** | 🔴 **Skip for build** | Nothing we need. National AI repository (IndiaAI/MeitY): datasets, models, sandbox. Hosts IndicVoices and EKA Indic Corpus | **No scheme data, no NSFDC data, no runtime API.** It is for training models, which we should not do. Worth one pitch line: our approach scales via AIKosh, and IndicVoices is the fallback if Bhashini rate-limits |
| **Google Maps Platform** | ✅ **Use it** (₹32k credits available) | F3. Places Autocomplete for village names, Directions for real travel time rather than straight-line distance | ⚠️ **Key must be restricted by HTTP referrer** or the credits get drained from the frontend bundle. Keep Leaflet behind a fallback flag |
| **Gemini** | ✅ **Use, narrowly** | Plain-language explanation of *why* a scheme fits, project-report drafting (F6.3), parsing free-text voice input | **Never let it decide eligibility.** Rules decide, LLM explains. That distinction is the answer when a judge asks if matching is reliable |

## B3. 🔴 DOES NOT EXIST PUBLICLY, hardcode it

This is the decision, made and closed:

| Data | Why it's missing | What we do |
|---|---|---|
| **Partner-level NPA %** | Never published per-partner | **Seed realistic values** from the real ranges we now have: RRB eligibility threshold is Net NPA <15%, Mudra portfolio NPA is 9.8%, NSFDC recovery is 93–97% |
| **Partner overdues to NSFDC** | Not published | Seed. Rule is real: overdues >1 year block a partner |
| **Partner fund utilisation %** | Aggregate only, in the committee report | Seed. Rule is real: ≥80% cumulative utilisation required |
| **Live fund availability per partner** | Not published anywhere | Seed |
| **Real-time application status** | Locked inside PM-SURAJ / LAMS | Simulate |

**How we present this, and this is important:** we do not hide it. We publish the exact JSON schema and API contract we would need NSFDC to expose, and we demo the routing engine running on seeded data. The pitch line writes itself now:

> NSFDC monitors 91 channel partners through 4 liaison centres. A state corporation president told a reporter he couldn't state his own schemes' progress without first requesting statistics. The data we need doesn't exist because **nobody has built the system that would produce it.** Here is that system, and here is the feed it needs.

Every prudential rule we filter on (overdues >1 year, ≥80% utilisation, RRB Net NPA <15%, PSB no-overdues) is **real, published, and cited** in Doc 1. Only the per-partner values are seeded. That distinction is what makes this credible rather than hand-wavy.

---

# PART C: What this changes

1. **Scheme matching is now cheap.** The myScheme dataset gives us 2,066 schemes with structured eligibility on an Apache-2.0 licence. We do not need to hand-build a scheme database. This frees days of work.
2. **Partner location is solved.** razorpay/ifsc covers every bank branch in India.
3. **Voice and multilingual is solved and free.** Bhashini, government-run, 22 languages, already used by CSC and UMANG.
4. **Document verification has a legitimate path.** DigiLocker via API Setu.
5. **Only partner *health* is fabricated**, and we say so openly with a published schema.
6. **The problem framing shifts.** Not just "people don't know about schemes" but "people apply in numbers exceeding supply, and then nothing happens and nobody can tell them why." The MP data proves it, the corporation president's quote proves nobody upstream can see it either.

---

## Sources

- The Mooknayak, MP SC Finance Corporation investigation: https://en.themooknayak.com/dalit-news/mp-sc-finance-corporation-not-giving-loans-sending-community-youth-into-tizzy
- SARIM Watch, Bihar Dalit youth / Bank of Baroda complaint to RBI: https://sarimwatch.org/22194/
- The Mooknayak, SC/ST sub-plan underfunding in UP: https://en.themooknayak.com/dalit-news/underfunding-of-scst-sub-plan-in-up-budget-sparks-outcry
- gov-myscheme-dataset (2,066 schemes, Apache-2.0): https://github.com/Aryan-Pardeshi/gov-myscheme-dataset
- gov_myscheme on HuggingFace: https://huggingface.co/datasets/shrijayan/gov_myscheme
- razorpay/ifsc bank branch repository: https://github.com/razorpay/ifsc
- india-village-finder (LGD hierarchy): https://github.com/mchittineni/india-village-finder
- Kaggle Indian Government Schemes Data (Sept 2026): https://www.kaggle.com/datasets/suyashbaoney/indian-government-schemes-data-september-2026
- Bhashini: https://www.bhashini.ai/ · API docs: https://bhashini.gitbook.io/bhashini-apis
- API Setu / DigiLocker: https://apisetu.gov.in/digilocker · https://www.digilocker.gov.in/web/data-exchange
- data.gov.in RBI datasets: https://www.data.gov.in/keywords/RBI
- data.gov.in CPGRAMS state-wise complaints: https://www.data.gov.in/resource/stateut-wise-details-pending-and-received-complaints-cpgrams-centralized-public-grievance
- CPGRAMS portal: https://pgportal.gov.in/
- NSFDC Lending Policy: https://nsfdc.nic.in/UploadedFiles/other/2020-02-28/6-1-5.pdf
- UP SC Finance and Development Corporation: https://www.upscfdc.in/
- PM-SURAJ: https://pmsuraj.dosje.gov.in/ · alternate: https://pmsuraj.ncog.gov.in/login
- MoSJE NSFDC Evaluation Study 2020 (3,300 beneficiaries): https://socialjustice.gov.in/public/ckeditor/upload/Summary%20Report-Evaluation%20of%20NSFDC_1648795113.pdf
