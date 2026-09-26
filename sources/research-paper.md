# Digitized but Disconnected: A Review of Existing Government Scheme-Discovery and Credit-Delivery Platforms in India and the Frictions They Leave Unresolved

**Team Zenith**
KIET Group of Institutions

---

## Abstract

Over the last decade, the Government of India has built a layered digital infrastructure for scheme discovery and credit delivery, including myScheme (scheme discovery), Jan Samarth (a unified credit-scheme application gateway), PM-SURAJ (a portal specific to the National Scheduled Castes Finance and Development Corporation, NSFDC), Vidya Lakshmi (education-loan applications), and DigiLocker (Aadhaar-linked digital documents). This paper reviews these existing solutions — their ownership, stated function, and design — and separately documents the frictions that beneficiaries continue to report while using them. Drawing on parliamentary replies, scheme-owner FAQs, Ministry advisories, and reported incidents, we find recurring evidence of four problem classes: (i) documentation and bank-side processing delays that persist even after a scheme is identified and an application is filed; (ii) ambiguity between what a portal shows and what the disbursing institution has actually decided; (iii) eligibility criteria, such as income ceilings, that change over time and can silently invalidate an earlier match; and (iv) fraudulent intermediaries who exploit the gap between "a scheme exists" and "an application is safely, fully processed." We argue that these platforms have substantially solved the problem of scheme *discovery* but have not eliminated friction in the subsequent *execution* of an application, and we identify this execution layer as the primary unresolved gap in the existing ecosystem.

**Keywords:** Government schemes; Digital public infrastructure; Credit delivery; e-Governance; NSFDC

---

## Introduction

India's push toward Digital Public Infrastructure has produced a substantial number of platforms intended to help citizens discover and access government welfare and credit schemes. This paper does not propose a new system. Instead, it asks a narrower and more disciplined question that must be answered before any new system is designed: *what already exists, who owns it, and what problems — documented, not assumed — do citizens actually encounter while using it?* We restrict the scope of this review to platforms relevant to scheme discovery and credit-linked government schemes, with particular attention to Scheduled Caste (SC) welfare finance (NSFDC) and education loans, because these are the two domains for which the clearest official evidence of applicant-side friction is available.

## Existing Digital Solutions: Ownership and Function

The table below summarizes the major platforms reviewed. Each is government-owned and operated by a specific ministry or public-sector entity; none of them is a private-sector product.

| Platform | Owning Ministry/Entity | Primary Function | Documented Limitation |
|---|---|---|---|
| myScheme | MeitY / NeGD | Scheme discovery and eligibility matching | Discovery only; no application processing or status tracking [1] |
| PM-SURAJ / NSFDC | Ministry of Social Justice and Empowerment | Application routing for SC credit schemes | NSFDC does not accept applications directly; routed via SCAs/CAs [4] |
| Jan Samarth | Department of Financial Services | Unified credit-scheme application gateway | 1,29,385 grievances required resolution as of Nov. 2024, indicating substantial applicant-side friction [6] |
| Vidya Lakshmi | DFS / Dept. of Higher Education / IBA | Multi-bank education loan application and tracking | Disbursement occurs outside the portal, directly by the bank [7] |
| DigiLocker | MeitY | Aadhaar-linked digital document verification | Identity/document layer only; does not resolve bank-side processing delays [16] |

### myScheme

myScheme is a one-stop scheme discovery platform, dedicated to the nation on 4 July 2022 and developed, managed and operated by the National e-Governance Division (NeGD) with support from the Ministry of Electronics and Information Technology (MeitY) [1, 2]. It offers a three-step discovery flow — the citizen enters demographic and income attributes, the platform matches eligible schemes, and the citizen is guided to the relevant application channel — and currently onboards thousands of central and state schemes [3]. myScheme's stated objective is explicitly discovery: it does not itself process applications, verify documents, or track post-application status.

### PM-SURAJ and NSFDC

The National Scheduled Castes Finance and Development Corporation (NSFDC) is a Section-8, not-for-profit Central Public Sector Undertaking under the Ministry of Social Justice and Empowerment, financing income-generating activities for Scheduled Caste beneficiaries [5, 4]. Critically, NSFDC's own FAQ states that direct contact or correspondence by applicants is *not entertained*; every loan application must instead be routed either online through the PM-SURAJ portal or offline through an authorized State Channelizing Agency (SCA) or Channelizing Agency (CA) [4]. This means that even a citizen who successfully identifies the correct NSFDC scheme cannot apply to NSFDC directly — the execution of the application is handed off to a separate institutional layer that NSFDC itself does not fully control.

### Jan Samarth Portal

Jan Samarth is described by the Department of Financial Services as a common platform connecting beneficiaries, more than 200 Member Lending Institutions, and Central/State Government agencies for 15 credit-linked government schemes spanning agriculture, renewable energy, business, livelihood, and education, integrated with UIDAI, NeSL, GST and CBDT data sources for authentication [6]. It is, in effect, the closest existing analogue to a unified credit-scheme gateway.

### Vidya Lakshmi Portal

Vidya Lakshmi, developed under the guidance of the Department of Financial Services, the Department of Higher Education, and the Indian Banks' Association, and maintained by Protean eGov Technologies (formerly NSDL e-Governance Infrastructure), lets students fill a Common Education Loan Application Form and apply to up to three banks simultaneously, and provides a dashboard to track status as updated by each bank [7, 8]. Its own FAQ is explicit that final disbursement happens *outside* the portal, directly by the bank [7] — another example of a discovery/application layer that hands off execution to a separate institution.

### DigiLocker

DigiLocker is MeitY's Aadhaar-linked digital document repository, launched in 2015, under which digital documents issued by government agencies are legally equivalent to physical originals under Rule 9A of the IT (Preservation and Retention of Information by Intermediaries) Rules, 2016 [16]. It is the identity- and document-verification layer that other platforms, including myScheme, already link to, and it is designed for data minimization at the point of authentication rather than bulk transfer of a citizen's full document set.

## Documented Problems and Their Impact

### Grievance volume as evidence of friction

The clearest official indicator that existing platforms leave real friction unresolved is grievance volume. In response to a Lok Sabha unstarred question, the Ministry of Finance stated that as on 28 November 2024, the Jan Samarth Portal had resolved 1,29,385 grievances in a time-bound manner [6]. A resolved-grievance count of this size, on a single credit-scheme gateway, is itself evidence that a large number of applicants experienced a problem serious enough to file a formal complaint — even though the same official answer does not break the causes down further.

### Documentation and bank-side processing delays

The single most consistently documented friction point across schemes is delay between an application being filed and a decision being communicated. Under PMEGP, an older Lok Sabha reply reported 93,384 pending applications nationally in 2013–14 alone, and explicitly attributed pendency to (i) non-completion of documents required by banks, (ii) applicants already declared defaulters, (iii) applications filed at the end of the financial year, and (iv) insufficient funds at a particular bank branch [13]. The same reply notes that RBI guidelines require banks to sanction or reject a loan within 30 days of receipt, with the full process from receipt to disbursal expected within 130 days [13] — a timeline that field reports repeatedly describe as unmet. Odisha's MSME department, for instance, publicly flagged 4,511 pending PMEGP proposals and asked bankers to sanction or reject within 30 days [15], and a beneficiary association in Nagaland documented cases of prolonged, unexplained delay and inconsistent collateral demands during PMEGP loan sanctioning [14]. These are reported incidents, not a scientifically sampled study, but they are consistent with the pattern the government's own pendency data describes: a scheme can be correctly matched and an application correctly filed, and the applicant can still be stuck for months at the bank-verification stage.

### Ambiguity between portal status and institutional decision

Both Vidya Lakshmi and Jan Samarth explicitly separate the portal's record of an application from the lending institution's actual decision: Vidya Lakshmi's own FAQ states that a bank marks an application "on hold" when it needs more information, and that disbursement itself happens outside the portal [7]. This design is reasonable, since the portal is not the lender, but it also means a citizen has no way, from the portal alone, to distinguish "the bank is deciding" from "the bank is waiting on something it has not yet told me about." No official dataset we found quantifies how often this specific ambiguity produces citizen complaints, and this should be treated as a design property that is documented in the platforms' own FAQs rather than as a proven failure rate.

### Eligibility criteria that change over time

NSFDC's own current FAQ states that the annual family income ceiling for eligibility is ₹5.00 lakh, applicable to both rural and urban areas, *effective 7 January 2026* [4, 5]. Earlier NSFDC documents on record show this ceiling was ₹3.00 lakh as recently as 2021 [5]. A discovery platform, dataset, or cached scheme description that is not updated at the same moment as this kind of rule change can tell a citizen they are eligible when, by the time they apply, they are not — a structural risk in any system that treats eligibility rules as static reference data rather than as a versioned, dated, and re-verifiable value.

### Fraud and impersonation risk

The Ministry of MSME has formally and publicly warned that private persons and agencies have approached potential PMEGP beneficiaries, issued fake loan sanction letters, and charged money, stating unambiguously that the entire PMEGP application and fund-release process is online and free of cost, and that no private party, agency, middleman or franchise is authorized to sanction PMEGP projects [9]. This is not a hypothetical risk: reported cases include a Hyderabad woman defrauded of ₹1.32 lakh by a caller falsely claiming bank affiliation with PMEGP [11], an Udupi couple and relative who lost more than ₹1.45 crore to fraudsters posing as agents who could arrange government loans [10], and a multi-crore fraud uncovered at an Axis Bank branch in Manipur involving subsidy amounts credited without any underlying loan ever being sanctioned [12]. These cases show that the gap between "a legitimate scheme exists" and "the applicant safely completes the process" is actively and repeatedly exploited, independent of whether the scheme itself is well designed.

### Grievance redress: existing but bounded

A formal grievance-redress channel does already exist for banking-side deficiencies: the Reserve Bank — Integrated Ombudsman Scheme, 2021, consolidates the earlier Banking Ombudsman Scheme, the NBFC Ombudsman Scheme, and the Digital Transactions Ombudsman Scheme into a single, jurisdiction-neutral mechanism, and a complainant must first approach the bank and wait 30 days (or receive an unsatisfactory reply) before escalating [17]. Separately, under the Fair Practices Code adopted from the Banking Codes and Standards Board of India, banks are committed to communicating, in writing, the reason for rejecting a loan application, with non-adherence itself constituting valid grounds for an Ombudsman complaint [18]. These mechanisms mean the ecosystem is not without recourse; the open question this review surfaces, rather than answers, is how many affected citizens are aware such recourse exists and use it before frustration or fraud intervenes.

## Gap Analysis: What Is and Is Not Already Solved

Read together, the evidence above supports a specific, narrower conclusion than "government portals do not work." Scheme *discovery* is a problem that myScheme and, to a lesser extent, Jan Samarth already address at national scale. What remains documented and unresolved is friction in *execution*:

- **(a)** Bank- and channel-partner-side documentation delays that persist after a correct scheme match, evidenced by both historical PMEGP pendency data and Jan Samarth's six-figure grievance volume [13, 6].
- **(b)** No reviewed platform's own documentation claims to give the citizen a single, authoritative, real-time answer to "what is my application's status right now, and why," since final decisions and disbursement are explicitly stated to occur outside the portal [7, 4].
- **(c)** Eligibility parameters that are revised over time by the scheme owner without a documented mechanism, visible to us in the sources reviewed, for propagating that change instantly to every discovery surface [4].
- **(d)** A persistent, officially acknowledged fraud risk that specifically targets the ambiguity between scheme legitimacy and application legitimacy [9].

## Discussion

Three qualifications are important to state plainly.

First, official parliamentary answers (grievance counts, pendency figures, income-ceiling notifications) should be weighted more heavily than individual news reports or association statements, which illustrate a pattern but do not establish its frequency or representativeness; we have flagged each source accordingly throughout.

Second, none of the reviewed evidence supports a claim that any platform is deliberately designed to fail, or that fraud is sanctioned or tolerated by any scheme owner — on the contrary, the strongest fraud-related evidence found is the Ministry's own public warning against it [9].

Third, several of the pendency and complaint figures cited (PMEGP, 2013–14; Jan Samarth grievances, to November 2024) are the most recent officially sourced figures we were able to independently verify at the time of writing, and are dated accordingly; more recent official data, if tabled in Parliament, should supersede them.

## Conclusion

India's existing government scheme-discovery and credit-delivery infrastructure — myScheme, PM-SURAJ/NSFDC, Jan Samarth, Vidya Lakshmi, and DigiLocker — has meaningfully solved the problem of helping a citizen find out *which* scheme exists and whether they appear eligible for it. The evidence reviewed here, drawn from the scheme owners' own FAQs, parliamentary replies, and reported enforcement/fraud cases, shows that the unresolved problem lies downstream of discovery: in documentation and bank-side delay, in status ambiguity between a portal and the disbursing institution, in eligibility rules that shift over time, and in fraud that specifically exploits the gap between a legitimate scheme and a safely completed application. Any subsequent design work — which this paper deliberately does not undertake — should be evaluated against this specific, evidenced gap rather than against the already largely solved problem of discovery.

## Methods

This review is based on a structured search of primary and official sources: scheme-owner websites and FAQs (myScheme, NSFDC/PM-SURAJ, Vidya Lakshmi, DigiLocker), Government of India press releases (Press Information Bureau), and replies tabled in the Lok Sabha (retrieved from the Parliament of India's e-Library, eparlib). These were supplemented with secondary reports (news coverage of specific fraud incidents and association statements) used only to illustrate patterns already indicated by official data, and explicitly labeled as such in the text. No user survey, interview, or primary data collection was conducted for this paper; all figures cited are attributed to their original source and dated.

## Data Availability

All sources cited in this review are publicly available government websites, press releases, and parliamentary records, with URLs provided in the references below.

## Acknowledgments

The authors thank their Smart India Hackathon mentors for guidance on scoping this literature review.

---

## References

1. Ministry of Electronics and Information Technology. *myScheme Platform: One-stop search and discovery of Government Schemes* (Factsheet), 2022. https://static.pib.gov.in/WriteReadData/specificdocs/documents/2022/sep/doc2022921106701.pdf
2. Digital India Corporation. *myScheme — One-stop search and discovery platform for Government schemes*, 2026. https://negd.gov.in/myscheme/
3. National e-Governance Division. *About myScheme*, 2026. https://myscheme.gov.in/about
4. National Scheduled Castes Finance and Development Corporation. *Frequently Asked Questions — Eligibility, Income Ceiling and Application Process*, 2026. https://devmosje.negd.in/?p=15629 (Income ceiling of ₹5.00 lakh effective 7 January 2026; applications must be routed through State Channelizing Agencies or the PM-SURAJ portal.)
5. National Scheduled Castes Finance and Development Corporation. *About Us*, 2026. https://devmosje.negd.in/?p=3207
6. Ministry of Finance, Department of Financial Services. *Lok Sabha Unstarred Question No. 2096: Complaints Received on Jan Samarth Portal*, answered 9 December 2024. https://eparlib.sansad.in/bitstream/123456789/3000201/1/AU2096_y1jbjI.pdf (States 1,29,385 grievances resolved as on 28.11.2024.)
7. Protean eGov Technologies Limited. *Vidya Lakshmi Portal — Frequently Asked Questions*, 2026. https://cms.proteantech.in/services/vidyalakshmi
8. Factly. *Vidya Lakshmi Portal for Education Loans*, 2026. https://factly.in/vidya-lakshmi-portal-education-loans
9. Ministry of Micro, Small and Medium Enterprises. *Ministry of MSME warns unscrupulous elements against cheating people in the name of PMEGP Scheme*, 2020. https://www.pib.gov.in/PressReleasePage.aspx?PRID=1670661
10. News Karnataka. *Udupi couple, relative lose over ₹1.45 crore in fake PMEGP subsidy loan scam*, 2025. https://newskarnataka.com/udupi/udupi-couple-relative-lose-over-%E2%82%B91-45-crore-in-fake-pmegp-subsidy-loan-scam/27102025
11. LatestLY. *Hyderabad: Fraudster Dupes Woman of INR 1.32 Lakh with Fake PMEGP Loan Offer*, 2023. https://www.latestly.com/india/news/hyderabad-fraudster-dupes-woman-of-inr-1-32-lakh-with-fake-pmegp-loan-offer-investigation-underway-6446437.html
12. The Frontier Manipur. *Multi-crore PMEGP subsidy scam hits Manipur; Financial Fraud uncovered, Two Held*, 2022. https://thefrontiermanipur.com/exclusive-multi-crore-pmegp-subsidy-scam-hits-manipur-financial-fraud-uncovered-two-held/
13. Ministry of Micro, Small and Medium Enterprises. *Lok Sabha reply on Pending Applications under PMEGP (State-wise), Reasons for Pendency and Processing Timelines*, 2015. https://eparlib.nic.in/bitstream/123456789/708604/1/701.pdf (Reports 93,384 pending PMEGP applications in 2013–14 and states RBI-mandated 30-day sanction / 130-day disbursal timelines.)
14. Morung Express. *PMEGP a mental harassment for most applicants, says BAN*, 2019. https://mail.morungexpress.com/pmegp-mental-harassment-most-applicants-says-ban
15. OdishaPlus Bureau. *Banks going slow: 4511 PMEGP proposals pending in Odisha*, 2019. https://odisha.plus/?p=2845
16. Melento. *DigiLocker: A Gateway to Authentic Digital Documents*, 2026. https://melento.ai/en-in/blog/?p=8635
17. Reserve Bank of India. *The Reserve Bank — Integrated Ombudsman Scheme, 2021*. https://upgb.bank.in/ombudsman.php
18. Reserve Bank of India. *Communication of Reasons for Rejection of Loan Applications — Code of Bank's Commitment to Customers / Fair Practices Code*, 2013. https://www.taxmanagementindia.com/web/tmi_blog_details.asp?id=463792
