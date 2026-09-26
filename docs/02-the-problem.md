# Landscape & Pain Points

> Doc 2 of the planning set. Doc 1 = `org-hierarchy-plan.md` (how the system works + numbers).
> This doc answers three questions:
> 1. Is our data complete and trustworthy?
> 2. Who is already trying to solve this?
> 3. What exactly breaks, and for whom?
>
> Problems only. No solution features here.

---

## Part 1: Team-lead audit. Is our data solid?

### What's strong (primary government sources)
- Budget numbers are from the Union Budget 2026-27 Demand No. 93 document itself.
- NSFDC allocation rules and prudential norms are from NSFDC's own site.
- NSFDC FY26 performance is from the official statement (via IANS/PIB coverage).
- Institutional problems are from the Parliamentary Standing Committee report (Aug 2026, via ThePrint).
- Eligibility rules are from NSFDC, NBCFDC, NSKFDC and DEPwD sites.

### What's weaker (secondary sources, double-check before a slide)
- NBCFDC FY26 figure: from a current-affairs site.
- PMEGP subsidy rates: from bank and blog pages (consistent across 5+ sources, so low risk).
- Mudra FY25: from IBEF, which cites official data.
- **PM-SURAJ FY25 claim** (₹1,389.61 cr to 1.39 lakh entrepreneurs) comes from an IAS-prep site. It doesn't match NSFDC's own FY25 figure (₹611.78 cr to 41,750). PM-SURAJ probably sums NSFDC, NBCFDC, NSKFDC and VISVAS. **Don't quote it without the official source.**

### What we're still MISSING (as project lead, these worry me)

| # | Gap | Why it matters | How to close it |
|---|---|---|---|
| 1 | ~~Hands-on audit of PM-SURAJ~~ | ✅ **CLOSED 26.09.2026.** Public surface audited. It has Applicant/Partner logins, scheme info pages and an aggregate dashboard, but **no recommender, no calculator, no map locator and no partner-health routing.** Official scale: ₹13,666.30 cr, 28.87 lakh beneficiaries, 162 partners, 773 districts. See Part 2.1 | Only remaining sub-item: register an applicant account to see the logged-in form flow. Optional, not blocking |
| 2 | **Zero primary user research** | Every pain point below comes from reports, not people | 5 to 10 short calls or visits: an SC borrower, an SCA or UP SC Finance Corp officer, a bank branch manager, a CSC operator |
| 3 | **Target state not chosen** | NSFDC runs through state SCAs, and every state differs | Pick one state (UP is the natural choice for us) and get its SCA process, forms and partner list |
| 4 | **Partner data availability** | The router needs partner locations plus NPA and utilisation data. None of it is public as an API | Find what NSFDC publishes (channel partner list, state allocation). Plan a mock data feed and say so openly |
| 5 | ~~Application-to-disbursal time~~ | ✅ **Closed:** ~4 months (2020 MoSJE evaluation), independently corroborated by the Standing Committee's ">6 months in 2016-17" finding. See Doc 1 | n/a |
| 6 | **Rejection reasons** | Partly closed: difficulty comes from security/guarantee (93.4%) and repeat visits (77.5%). *Rejection* reasons are still unknown | SCA interview |
| 7 | **Digital access of the target group** | Smartphone, internet and literacy levels among SC households decide if an app even works | NFHS-5 / NSS data on phone ownership by social group |
| 8 | **Document requirements per scheme** | Needed for any checklist feature | Scheme application forms from NSFDC and the UP SCA |
| 9 | **Legal constraints** | Handling caste, income and Aadhaar data falls under the DPDP Act 2023 | One-page note on consent and storage |
| 10 | ~~NSFDC's own overdues, recovery rate, and state allocation~~ | ✅ **Closed:** Standing Committee 25th Report gives official scheme-wise recovery rates, SCA state performance (14 states weak, 2 with no SCA), governance vacancies, and a Credit Guarantee Scheme gap for bank/NBFC partners. See Doc 1 | n/a |
| 11 | **NSFDC's own new systems** | NSFDC built a **Loan Accounting and Management System (LAMS)** integrated with PM-SURAJ in FY26. We need to know what it already does on the back end | Find any public description |

---

## Part 2: Who is already trying to solve this?

### 2.1 PM-SURAJ Portal ⚠️ the direct incumbent — ✅ AUDITED 26 Sept 2026
- **Owner:** MoSJE (DoSJE), launched March 2024. URL: pmsuraj.dosje.gov.in
- **What it does:** A single-window portal where SC, OBC and sanitation workers apply for and track loans from NSFDC, NBCFDC and NSKFDC. Self-described as *"an Online Transparent System for loan application & processing with Real time Information availability to all concerned at District, State and Central level with timely updates to the beneficiary."*

**Official scale (public dashboard, retrieved 26.09.2026) — this closes Doc 1 gap #10:**

| Metric | Value |
|---|---|
| States/UTs covered | **36** |
| Districts covered | **773** |
| Channel partners | **162** |
| Beneficiaries covered | **28,86,604** (individual 25,13,381 + SHG 3,73,223) |
| Gender split | Male 10,61,814 / **Female 18,24,790 (63.2%)** |
| **Total disbursement** | **₹13,666.30 cr** |
| — Lending disbursed | ₹13,558.43 cr |
| — VISVAS subvention paid | ₹19.34 cr (against ₹2,652.90 cr of loans subvented) |
| — Venture Capital Fund | ₹88.53 cr |

*This supersedes the earlier unofficial ₹1,389.61 cr / 1.39 lakh claim, which was an order of magnitude off. **Use these figures.*** Note 162 channel partners spans NSFDC + NBCFDC + NSKFDC combined (NSFDC alone is 38 SCAs + 53 CAs = 91).

**What the portal actually has (observed):**
- Navigation: Home · About us · **Corporation's Lending** · VISVAS · Venture Capital Fund · Skilling · Mentoring · Gallery · Marketing Support
- Under Corporation's Lending: **Applicant Login · Partner Login · Scheme Details** — so it does have both citizen-side and partner-side accounts
- Public dashboard filterable by **Select Year** and **Select Agency Type**
- Accessibility: screen-reader access link, font-size controls, language selector
- Partner logos: Digital India, DoSJE, NSFDC, NSKFDC, NBCFDC

**What it demonstrably does NOT have (based on the full public surface):**
- ❌ No scheme recommender. "Scheme Details" is a static information page, not a matcher. Nothing takes user inputs and returns a fitted scheme
- ❌ No EMI or financial calculator anywhere in the navigation
- ❌ No map-based partner locator. Partner counts are aggregate tiles, not a findable directory with locations
- ❌ **No partner-health routing.** The "Agency Type" filter categorises partners (SCA/PSB/RRB/NBFC-MFI); it does not expose or route on NPA, overdues or utilisation
- ❌ No voice or low-literacy mode
- ❌ No caste-neutral fallback. If you're ineligible, the journey ends
- ⚠️ Language: an English selector is present; depth of Indian-language coverage not verified

**Verdict: PM-SURAJ is a transaction and reporting system, not a guidance system.** It assumes you already know which scheme you want and which partner to approach. **All three things the PS asks us to build are absent from it.** That is our differentiation, and it is now evidenced rather than assumed.

### 2.1b UP PM-AJAY Grant-in-Aid portal — ✅ AUDITED, and it hands us our best statistic
- **URL:** grant-in-aid.upscfdc.in · **Owner:** UPSCFDC · Last updated 13-11-2025
- Navigation: Home · Downloads · Login. Footer links to UPSCFDC, PM-AGY and the PM-AJAY Portal
- It publishes a genuinely detailed **public** dashboard: "Scheme Performance in Uttar Pradesh" and "State Projects Performance at a Glance"

**The headline funnel:**

| Stage | Count | Share |
|---|---|---|
| Applied | **73,888** | 100% |
| Approved by pre-scrutiny | **25,000** | 33.8% |
| Rejected by pre-scrutiny | **2,443** | 3.3% |
| **No decision at all** | **46,445** | **62.9%** |

- Approval rate **among applications that got a decision: 91.1%.** So the system is not rejecting people. **It is simply not deciding.** Nearly 2 in 3 applicants are in indefinite limbo with no outcome and no reason.
- 53.9% of applicants are women (39,847). **81.1% are rural** (59,954).
- Every single applicant (73,888) is also recorded as having applied for skill-development training.
- District with most applications: **Rampur (2,297)**. District with most approvals: **Bahraich (1,246)**. Different districts, which suggests approval throughput is not tracking demand.

**Approval rate by project — the single best evidence for the PS's core problem:**

| Project | Approved | Applied | Rate |
|---|---|---|---|
| Women's home industry | 2,538 | 5,726 | **44.3%** |
| Kiosk / kirana / general store | 4,470 | 11,356 | 39.4% |
| Beauty parlour cluster | 4,030 | 10,351 | 38.9% |
| Boutique cluster | 3,097 | 8,004 | 38.7% |
| Modular furniture / carpentry | 1,356 | 3,578 | 37.9% |
| Auto / e-rickshaw driver | 1,837 | 4,891 | 37.6% |
| Photography & videography | 790 | 2,425 | 32.6% |
| Jan Suvidha Kendra | 1,909 | 6,312 | 30.2% |
| 2/3-wheeler mechanic | 1,354 | 4,542 | 29.8% |
| Dairy + vermicompost | 949 | 3,457 | 27.5% |
| Solar panel installer | 406 | 1,613 | 25.2% |
| Multi-skilled construction | 331 | 1,412 | 23.4% |
| IT support / hardware | 1,327 | 5,991 | 22.1% |
| Goat rearing (group) | 316 | 2,145 | 14.7% |
| Logistics vehicle driver | 273 | 1,864 | 14.6% |
| Poultry (group) | 17 | 221 | **7.7%** |

*(Project totals sum to exactly 73,888 and approvals to exactly 25,000, so the data is internally consistent and one application maps to one project choice.)*

**🔴 THE KILLER FINDING: a 5.8x spread in approval odds depending purely on which project you pick.** Choose women's home industry and you have a 44.3% chance. Choose poultry and you have 7.7%. **Nobody tells the applicant this.** There is no guidance, no signal, no comparison anywhere in the citizen journey. This is the scheme-matching problem quantified, in our target state, with the government's own published data. It is the strongest single slide we have.

### 2.1c How slow is slow, officially — the PMEGP benchmark (🆕 best timing data we have)

**Lok Sabha, 31 July 2026.** MSME Minister Jitan Ram Manjhi gave stage-by-stage PMEGP processing times:

| Stage | Days |
|---|---|
| Implementing agency processing | **58** |
| Bank loan sanction | **70** |
| KVIC margin-money subsidy release | **84** |
| **End to end** | **≈212 days, about 7 months (derived)** |

Set against the RBI expectation the government itself cites for PMEGP — **sanction or reject within 30 days, full receipt-to-disbursal within 130 days** — actual delivery runs **~63% over the expected timeline (derived)**.

**Why this matters to us:** it is a 2026 figure, from a minister, in Parliament, with a published benchmark to measure against. It is far stronger than the older 2013-14 PMEGP pendency figure (93,384 applications, attributed to incomplete bank documentation, existing defaulters, end-of-financial-year filing, and branch-level fund shortages). Use 2026 as the headline and 2013-14 only as "this is not new."

It also corroborates our NSFDC timeline from a completely independent scheme: ~4 months (2020 MoSJE evaluation), ">6 months in 2016-17" (Standing Committee), and now ~7 months for PMEGP in 2026. **Three separate sources, three separate schemes, same order of magnitude.**

### 2.2 JanSamarth (Ministry of Finance)
- **What it does:** A national portal for credit-linked government schemes. It hosts 16 schemes under 8 loan categories, 8+ ministries, 10+ nodal agencies and 250+ lenders.
- **Has:** eligibility check, apply, digital approval, real-time tracking, multiple languages.
- **Scale:** 41 lakh applications worth ₹1,06,306 cr processed by March 2026 **[secondary source]**.
- **🆕 Grievance volume, official:** **1,29,385 grievances resolved** as on 28 November 2024 — Lok Sabha Unstarred Question No. 2096, answered 9 December 2024. A six-figure formal-complaint count on a single credit gateway is hard evidence that a unified application portal, on its own, does not remove applicant-side friction. **This is our best "the incumbents still generate pain" number, and it is properly citable.**
- **Relevant to us:** it covers the caste-neutral side (PMEGP, education loans, SVANidhi etc.).
- **Gap:** **NSFDC schemes don't appear to be on it [verify].** It also needs PAN, ITR, bank statements, Udyam, GST and CIBIL, which suits formal-sector borrowers more than first-time rural ones.

### 2.3 PM-Vidyalaxmi portal (Ministry of Education)
- One common application sent to up to 3 banks, with tracking, interest subvention and grievances.
- FY26: 6.45 lakh applications.
- **Gap:** covers education loans only, and not NSFDC's education loan.

### 2.4 Jan Dhan Darshak (Ministry of Finance / NIC)
- **What it does:** Locates bank branches, ATMs, Bank Mitras, post offices and CSCs across India.
- **Has:** directions, basemaps, a "near by" search around any village.
- **Relevant to us:** it's exactly the *map* half of our locator.
- **Gap:** no idea which branch handles *which scheme*, or whether that partner is eligible (NPA or funds).
- **Notable:** it was itself an **SIH 2020 problem statement**, and the winning team's repo is public. Judges have seen "a map of banks" before. A plain locator won't impress them.

### 2.5 myScheme (Government of India, NeGD)
- National scheme discovery and eligibility portal **[details not verified this pass]**.
- **Gap:** discovery only. No application, partner routing or EMI tool.

### 2.6 Haqdarshak (private social enterprise)
- 6,000+ central and state schemes, simple summaries, 10+ Indian languages. Uses field agents for assisted access.
- **Gap:** information only. Not affiliated with government and doesn't process applications.

### 2.7 Other channels
- **NSFDC toll-free helpline** 1800-180-9006 **[secondary source, verify]**.
- **State SCA websites and offline offices.** Quality varies by state.
- **Bank branches, CSCs, Bank Mitras.** 17.36 lakh Business Correspondents, and 99.92% of villages have banking within 5 km.

### 2.8 Comparison: what exists vs what the PS asks for

*Updated 26 Sept 2026 after auditing PM-SURAJ and the UP GIA portal. The PM-SURAJ column is now observed, not assumed.*

| Capability (from PS) | PM-SURAJ | UP GIA portal | JanSamarth | Jan Dhan Darshak | myScheme | Haqdarshak |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Covers NSFDC schemes | ✅ | PM-AJAY only | ❌ | ❌ | info only | info only |
| **Scheme recommender from user inputs** | **❌** | **❌** | ✅ (own schemes) | ❌ | ✅ | ✅ |
| **EMI calculator with moratorium** | **❌** | **❌** | ❓ | ❌ | ❌ | ❌ |
| **Map locator of partners** | **❌** | **❌** | ❌ | ✅ (all banks) | ❌ | ❌ |
| Filters partners by scheme authorisation | ❌ | ❌ | lender list only | ❌ | ❌ | ❌ |
| **Filters partners by NPA / utilisation health** | **❌** | **❌** | ❌ | ❌ | ❌ | ❌ |
| Online application + tracking | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Public performance dashboard | ✅ aggregate | ✅ **detailed** | ❌ | ❌ | ❌ | ❌ |
| Multilingual | ⚠️ EN selector | Hindi/English | ✅ | Hindi/English | ✅ | ✅ 10+ |
| Voice / low-literacy mode | ❌ | ❌ | ❌ | ❌ | ❌ | via field agents |
| Covers caste-neutral fallback schemes | ❌ | ❌ | ✅ | n/a | ✅ | ✅ |
| Partner-side accounts | ✅ Partner Login | ✅ Login | lender side ✅ | ❌ | ❌ | ❌ |

**Reading of this table, now that the unknowns are resolved:**
- The ecosystem is **fragmented, not empty** — but the specific gap the PS names is **genuinely empty**.
- **All three PS deliverables (recommender, calculator, partner locator/router) score ❌ across every incumbent.** Not one of them does any of the three.
- PM-SURAJ and the UP GIA portal are **transaction and reporting systems**. They process you once you already know what you want. Neither helps you decide.
- Partner-health routing exists **nowhere**, in any system, at any level of government. That remains our sharpest differentiator.
- **The UP GIA portal actually proves the need**, via its own published data: 62.9% of applications never get a decision, and approval odds vary 5.8x by project choice with zero guidance offered.

---

## Part 3: Pain points

Each pain point includes evidence and a severity rating (🔴 high · 🟠 medium · 🟡 low).

### 3A. The beneficiary (SC citizen)

**Stage 1: Awareness**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B1 | Most eligible people never hear of NSFDC | ~59K loans/yr vs ~4 crore SC households (~0.15% reach, derived). **61.1% of actual beneficiaries heard by word of mouth; only 2.6% from awareness camps** (2020 evaluation) | 🔴 |
| B2 | They don't know NSFDC differs from a normal bank or Mudra loan (6.5% vs ~7 to 18%) | ~50% of Mudra borrowers are SC/ST/OBC, often at higher market rates | 🔴 |
| B3 | Scheme info is spread over NSFDC, PM-SURAJ, the SCA site, JanSamarth and bank sites | Part 2 above | 🟠 |

**Stage 2: Choosing a scheme**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B4 | Can't tell Micro Credit, Term Loan, Education Loan and women's schemes apart. NSFDC runs **13 distinct schemes** | PS challenge statement; NSFDC scheme list | 🔴 |
| B5 | Borderline cases are confusing, e.g. a ₹1.45L project falls just over the micro limit | Hard ₹1.40L cut-off | 🟡 |
| B6 | If not eligible (income > ₹5L, not SC), they aren't told about alternatives | No cross-scheme routing exists (Part 2 table) | 🟠 |
| B7 | Rules change quietly: the ₹3L ceiling became ₹5L on 7 Jan 2026, yet many sites and articles still say ₹3L | Seen repeatedly during our research | 🟠 |

**Stage 3: Understanding cost**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B8 | No clear EMI, total cost or moratorium effect before applying | No EMI tool on any NSFDC channel found | 🟠 |
| B9 | The same "NSFDC loan" costs 6.5%, 8% or **15%** depending on the channel, and they don't know which one they'll get | NSFDC rate structure; the committee called 15% "very high" and a deterrent | 🔴 |
| B10 | Can't judge whether they can afford the repayment | Only 58.8% of beneficiaries crossed the poverty line (2022-23 evaluation) | 🟠 |

**Stage 4: Finding where to apply**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B11 | Don't know which nearby office handles *their* loan type | PS challenge statement | 🔴 |
| B12 | **They may go to a partner that is blocked from NSFDC funds** (overdues, <80% utilisation, high NPA), and nobody tells them | NSFDC prudential norms | 🔴 |
| B13 | In 14 states the SCA is weak. **Telangana and Ladakh have no SCA** | Standing Committee 2026 | 🔴 |
| B14 | State funds can be moved away mid-year (review on 31 Aug, reallocation by 15 Sep). Applying late may mean "no funds" | NSFDC allocation rules | 🟠 |

**Stage 5: Applying**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B15 | Paperwork and guarantees: ID, residence, qualification, caste, income, project proposal, quotations, plus security | 2020 evaluation: 31.4% faced difficulty; of those **93.4% couldn't provide security, 77.5% made repeated visits** | 🔴 |
| B16 | Can't write a project report (needed for term loans) | Term-loan requirement | 🟠 |
| B17 | Digital portals need smartphone skills and documents like PAN, ITR and bank statements | JanSamarth requirements | 🟠 |
| B18 | Language and literacy barriers. Portals are mostly Hindi and English | **15.3% of beneficiaries are illiterate, 73.7% studied only to primary or middle school**; 57.2% applied via the gram panchayat, not online (2020 evaluation) | 🔴 |
| B19 | **🔴 FRAUD: fake agents, fake sanction letters, fake subsidy.** Upgraded from 🟡 after the Team Zenith literature review | **The MSME Ministry has issued a formal public warning (PIB, 2020)** that private persons and agencies approach beneficiaries, issue **fake loan sanction letters** and charge money, stating the entire process is online and free and **no middleman is authorised**. Documented cases: Hyderabad woman defrauded of **₹1.32 lakh** by a caller claiming bank affiliation (2023); Udupi couple and relative lost **₹1.45 crore** to fake government-loan agents (2025); **multi-crore subsidy scam at an Axis Bank branch in Manipur** where subsidy was credited with no underlying loan ever sanctioned (2022) | 🔴 |
| B19a | The fraud exploits a specific, structural gap: **"a legitimate scheme exists" ≠ "my application is safely being processed."** A citizen with no authoritative status view cannot tell a real agent from a fake one | Ministry warning + the three cases above; compounded by B20 (no visible timeline) and the UP GIA finding that 62.9% of applications never get a decision | 🔴 |
| B19b | **Citizens have a legal right to a written rejection reason and almost nobody knows it.** RBI's Fair Practices Code for Lenders requires lenders to *"convey in writing, the main reason/reasons... which have led to rejection of the loan applications"* — explicitly for **loans up to ₹2 lakh**, which covers NSFDC Micro Credit (≤₹1.25L) and most PM-AJAY projects | RBI Guidelines on Fair Practices Code for Lenders. Non-adherence is itself valid grounds for an Ombudsman complaint | 🔴 |
| B19c | **A formal escalation path exists and is unused.** RBI Integrated Ombudsman Scheme 2021 consolidates the Banking, NBFC and Digital Transactions ombudsman schemes. Complainant must first approach the bank and wait 30 days, then may escalate | RBI-IOS 2021. Open question the literature review raises but cannot answer: how many affected citizens know this exists before frustration or a fraudster intervenes | 🟠 |

**Stage 6: Waiting**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B20 | **Slow and invisible timeline.** Nothing is published to the applicant; in practice it averages ~3 months to sanction + ~1 month to first instalment | 2020 evaluation, which itself recommended a 3-month cap | 🔴 |
| B21 | Offline applications give no status visibility | Paper process at SCAs | 🟠 |
| B22 | Rejection reasons are unclear, so they can't fix and reapply | Gap #6 | 🟠 |

**Stage 7: After disbursal**
| # | Pain point | Evidence | Sev |
|---|---|---|---|
| B23 | No repayment reminders or support, leading to defaults | Mudra NPA 9.8%; NSFDC overdue history | 🟠 |
| B24 | Business fails for lack of skills or market access | PM-DAKSH cut from ₹130 cr to ₹20 cr, then merged. Marketing fairs made only ₹10.5 cr in 10 years | 🟠 |
| B25 | Good repayment isn't rewarded with a route to a bigger loan | Mudra has Tarun Plus for repeat borrowers; no NSFDC equivalent found. **46.3% of beneficiaries needed more credit later, and 34% of those went to moneylenders** | 🟠 |
| B26 | Repayment is cash and in person | **94.8% repay in cash**, 81.5% at a bank branch, so no digital trail and no automated reminders | 🟠 |

### 3B. The channel partner (SCA / bank / RRB / MFI)

| # | Pain point | Evidence | Sev |
|---|---|---|---|
| P1 | Receive incomplete or wrong-scheme applications, then reject or bounce them | PS: "misrouted applications" | 🔴 |
| P2 | Weak institutions: 14 states' SCAs under- or non-performing | Standing Committee 2026 | 🔴 |
| P3 | Must verify caste and income manually. It's their legal responsibility | NSFDC rules | 🟠 |
| P4 | Recovery is hard (borrowers relocate, staff shortage). Overdues then block future funds | Overdue rule; earlier evaluations | 🔴 |
| P5 | Low margin: micro credit leaves a 4% spread to cover staff, paperwork and risk on tiny loans | Rate structure | 🟠 |
| P6 | Utilisation certificates and reporting to NSFDC are manual | Prudential norms require them | 🟡 |
| P7 | **Government-built software goes unused.** None of the sampled partners adopted SBMS (NeGD/MeitY); banks asked for login access and changes | 2020 evaluation | 🔴 |
| P8 | Slow fund use: partners take 1 month to 1 year to deploy NSFDC money | 2020 evaluation | 🟠 |
| P9 | **Bank/NBFC channel partners can't extend large loans because their exposure isn't secured.** Unlike SCA loans, the 53 alternate Channelizing Agencies (banks, RRBs, NBFC-MFIs) are not covered under any Credit Guarantee Scheme | Standing Committee 2026 — Committee called this a gap to fix "without any further delay" | 🔴 |
| P10 | **Many state governments won't guarantee loans for their own SCA**, directly restricting what that SCA can lend regardless of local demand | Standing Committee 2026, NSFDC's own deliberation testimony | 🟠 |

### 3C. NSFDC (the wholesaler)

| # | Pain point | Evidence | Sev |
|---|---|---|---|
| N1 | **Only ₹14.6 cr (2019-20) and ₹15 cr (2023-24) equity in 7 years, zero every other year.** NSFDC's own written submission: it "may not grow" and can't "meet even the inflation" without fresh equity | Standing Committee 2026, NSFDC testimony | 🔴 |
| N2 | Missed its FY26 lending plan by ~20% (₹775 cr vs ₹968 cr) | Budget document vs actuals | 🟠 |
| N3 | Thin and *worsening* staff and board: 9/15 board seats vacant (only 6 official directors left); staff vacancies **rose from 21 to 27** between 31 Mar and 28 July 2026; only 4 liaison centres for 91 partners | Standing Committee 2026 | 🔴 |
| N4 | Limited real-time visibility into which partners are healthy and where demand sits (a new LAMS system is only now being built) | FY26 statement on LAMS | 🟠 |
| N5 | **Outcome decline across 3 evaluation cycles, not just one:** beneficiaries crossing the poverty line fell from 99.88% (2017-18) → 100% (2018-19) → 68.10% (2019-20) → **58.8% (2022-23)** — a near-halving over 5 years while lending continued | 4-cycle NSFDC evaluation table, Standing Committee 2026 | 🔴 |
| N6 | Allocation follows SC population, not actual demand or partner capacity, so money gets reallocated mid-year | Allocation rules | 🟠 |
| N7 | Beneficiary counts reported inconsistently (59,002 credit-scheme vs 61,394 SCA-channel vs 1.18 lakh prior year) — now understood as measuring different channels, not an error, but still a reporting-clarity problem for any dashboard we design | Standing Committee 2026 | 🟡 |
| N8 | Targets far above delivery: the 2020-21 plan aimed for ₹1,500 cr to 3.58 lakh people; the best year since is ₹775 cr to 59,002 | 2020 evaluation vs FY26 actuals | 🟠 |
| N9 | **Governance breaches its own rules, not just outcomes:** Board and Audit Committee meeting gaps exceeded the mandated 3-4 month limit in both FY24 and FY25 (DPE Corporate Governance guidelines) | Standing Committee 2026 | 🟠 |
| N10 | Recovery is uneven by loan type: Education Loan recovers only 83-84%, well below Micro Credit's 97-98%, so the scheme meant to fund the most upwardly-mobile activity (higher education) has the weakest repayment | Official recovery-rate table, Standing Committee 2026 | 🟠 |
| N11 | **No channel for beneficiaries or SC community representatives to advise NSFDC or SCAs on scheme design.** Evaluations are commissioned and read internally with no beneficiary voice in the loop | Standing Committee 2026 | 🟡 |

### 3D. The Ministry (MoSJE / DoSJE)

| # | Pain point | Evidence | Sev |
|---|---|---|---|
| M1 | Budget under-use: DoSJE FY26 revised to 84% of BE | Budget document | 🟠 |
| M2 | Support schemes under-used or cut: VISVAS 47% used; PM-DAKSH −85%; Venture Capital Fund near zero | Budget document | 🟠 |
| M3 | Fragmented digital estate: PM-SURAJ, SCA sites, NSFDC site, JanSamarth and Vidyalaxmi don't talk to each other | Part 2 | 🟠 |
| M4 | EWS/EBC have a policy owner (DoSJE) but no credit instrument | Doc 1, Level 2 | 🟡 |

---

## Part 4: The disconnections

Where the chain physically breaks, based on Part 3:

```
 Citizen ──✗── knows scheme exists?          (B1, B2, B3)
    │
    ├──✗── picks the right scheme?            (B4, B6, B7)
    │
    ├──✗── knows the true cost?               (B8, B9, B10)
    │
    ├──✗── finds an ELIGIBLE, FUNDED partner? (B11, B12, B13, B14, P2)   ← PS's core
    │
    ├──✗── submits a complete application?    (B15, B16, B17, B18, P1)
    │
    ├──✗── knows status / reason?             (B20, B21, B22)
    │
    └──✗── repays and grows?                  (B23, B24, B25, P4)
                    │
                    └── defaults → partner overdues → partner blocked
                        → next citizen can't get funds  (loop back to B12)
```

**The most important insight:** the last break feeds the first. Defaults make partners ineligible. Ineligible partners turn away the next applicant. And less money flows back to NSFDC, which already gets no fresh equity. **The system's problems compound in a loop, not a straight line.**

---

## Part 5: Top pain points to prioritise

Ranked by severity × how directly the PS asks for it × evidence strength:

1. **B12 / B13: Routing to partners that can't fund you.** In the PS, with a written rule, and 16 states impaired.
2. **B4 / B6: Wrong or no scheme choice, and no fallback.** In the PS, and 13 schemes create real confusion.
3. **B9 / B8: Hidden and variable cost** (6.5% vs 15%). In the PS, and flagged by Parliament.
4. **B15 / B16 / P1: Incomplete applications and the paperwork wall.** Causes misrouting and rejection at both ends.
5. **B1 / B2: Awareness.** The largest gap by numbers (~0.15% reach).
6. **B23 / P4 / N1: The default loop.** Explains *why* the system shrinks.

---

## Sources
- PM-SURAJ overview: https://crackittoday.com/current-affairs/pm-suraj-portal/
- PM-SURAJ FY25 claim: https://www.sanskritiias.com/current-affairs/pm-suraj-portal-digital-credit-push-for-inclusive-entrepreneurship
- NSFDC links to PM-SURAJ: https://nsfdc.nic.in/scheme
- NSFDC LAMS + PM-SURAJ: https://www.newkerala.com/news/a/nsfdc-disburses-rs-77526-crore-fy26-logs-27-325.htm
- JanSamarth (Play Store): https://play.google.com/store/apps/details?id=com.projects.jansamarth&hl=en_IN
- JanSamarth (Bank of Baroda): https://bankofbaroda.bank.in/loans/jansamarth-portal
- JanSamarth scale + rural banking coverage: https://www.egovtschemes.com/jansamarth-portal/ · https://sarkariyojana.com/jan-samarth-portal/
- Jan Dhan Darshak: https://play.google.com/store/apps/details?id=com.arcgis.esri.bankgis1&hl=en_IN
- Jan Dhan Darshak SIH 2020 winner: https://github.com/maxakash/Jan-Dhan-Darshak
- Haqdarshak: https://play.google.com/store/apps/details?id=com.haqdarshak.jana&hl=en_IN
- Standing Committee findings: https://theprint.in/economy/dalit-finance-body-beneficiaries-nearly-halve-as-house-panel-flags-funding-drought-board-vacancies/3013066/
- NSFDC allocation rules: https://nsfdc.nic.in/en/allocation-of-funds
- **Standing Committee on Social Justice and Empowerment (2025-26), 25th Report — "Review of the Functioning of NSFDC," presented to Lok Sabha 12.8.2026** (primary source for N1, N3, N5, N7, N9, N10, N11, P9, P10, B13; PDF held by the team, official copy via sansad.in → Committee → Committee Reports)
- NDFDC Year-wise and State-Wise Total Disbursement, as on 31.07.2026: ndfdc.nic.in → Achievements
- All budget and performance figures: see `org-hierarchy-plan.md`
