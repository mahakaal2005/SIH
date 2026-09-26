import type { Provenance } from '../types/common'
import type { Scheme, SchemeFinance } from '../types/domain'
import { pmajayProjects } from './projects'

const real = (ref: string): Provenance => ({ kind: 'real', ref })
const seeded = (ref: string): Provenance => ({ kind: 'seeded', ref })

const PS_MORATORIUM = { min: 3, max: 12, default: 6 }
const psMoratoriumRef = real('PS 26092 via docs/05-features.md F2.1 (moratorium 3–12 months)')
const tenureRef = seeded('Loan tenure not in docs; placeholder until NSFDC/SCA product notes are sourced')
const nsfdcRateRef = real('docs/01-the-system.md "NSFDC (6.5 to 8%)"')

const UPSCFDC = { en: 'UPSCFDC (Uttar Pradesh SC Finance & Development Corporation)', hi: 'उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम' }
const NSFDC = { en: 'NSFDC via UPSCFDC', hi: 'NSFDC (उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम के माध्यम से)' }

const pmajayFinance: SchemeFinance = {
  grant: { maxAmount: 50000, maxShareOfCost: 0.5 },
  beneficiaryContributionShare: 0.05,
  ratePct: { min: 9, max: 12, default: 10.5 },
  tenureMonths: { min: 36, max: 84, default: 60 },
  moratoriumMonths: PS_MORATORIUM,
  cgtmseFeePct: 0.37,
}

const pmajaySchemes: Scheme[] = pmajayProjects.map((p) => ({
  id: `pmajay-${p.id}`,
  track: 'pmajay_gia',
  agency: UPSCFDC,
  name: { en: `PM-AJAY Grant-in-Aid: ${p.name.en}`, hi: `पीएम-अजय अनुदान: ${p.name.hi}` },
  summary: {
    en: '₹50,000 grant (or 50% of cost, whichever is lower), 5% own contribution, rest as a bank loan from any bank. Free skill training.',
    hi: '₹50,000 अनुदान (या लागत का 50%, जो कम हो), 5% स्वयं का अंशदान, शेष किसी भी बैंक से ऋण। निःशुल्क कौशल प्रशिक्षण।',
  },
  kind: 'grant_plus_loan',
  finance: pmajayFinance,
  pmajayProjectId: p.id,
  extraDocumentIds: ['selection_letter', 'affidavit_3yr', ...(['poultry', 'dairy', 'goat'].includes(p.id) ? ['livestock_bundle'] : [])],
  provenance: real('docs/04-up-reference.md Part B1–B2, C'),
  financeProvenance: {
    grant: real('docs/04-up-reference.md Part B1'),
    beneficiaryContributionShare: real('docs/04-up-reference.md Part B1'),
    ratePct: seeded('Bank loan rate is set by the chosen bank; placeholder range'),
    tenureMonths: tenureRef,
    moratoriumMonths: psMoratoriumRef,
    cgtmseFeePct: seeded('CGTMSE fee % not in docs; placeholder 0.37% p.a.'),
  },
}))

const nsfdcSchemes: Scheme[] = [
  {
    id: 'nsfdc-micro-credit',
    track: 'nsfdc',
    agency: NSFDC,
    name: { en: 'NSFDC Micro Credit Finance', hi: 'NSFDC माइक्रो क्रेडिट फाइनेंस' },
    summary: {
      en: 'Small business loan for projects up to ₹1.40 lakh; 90% financed, loan up to ₹1.25 lakh.',
      hi: '₹1.40 लाख तक की परियोजनाओं के लिए छोटा व्यवसाय ऋण; 90% वित्तपोषण, ऋण ₹1.25 लाख तक।',
    },
    kind: 'loan',
    finance: {
      maxProjectCost: 140000, maxLoan: 125000, financingShare: 0.9,
      ratePct: { min: 9, max: 15, default: 15 },
      tenureMonths: { min: 12, max: 36, default: 36 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['project_quotation'],
    provenance: real('docs/01-the-system.md (Standing Committee 25th Report, loan product sizes)'),
    financeProvenance: {
      maxProjectCost: real('docs/01-the-system.md loan product sizes'),
      maxLoan: real('docs/01-the-system.md loan product sizes'),
      ratePct: real('docs/01-the-system.md: NSFDC lends to SCA at 5% + 10% margin (sometimes 4%)'),
      tenureMonths: tenureRef,
      moratoriumMonths: psMoratoriumRef,
    },
  },
  {
    id: 'nsfdc-term-loan',
    track: 'nsfdc',
    agency: NSFDC,
    name: { en: 'NSFDC Term Loan', hi: 'NSFDC सावधि ऋण (टर्म लोन)' },
    summary: {
      en: 'Business loan for projects from ₹1.40 lakh to ₹50 lakh at 6.5–8%; 90% financed, loan up to ₹45 lakh.',
      hi: '₹1.40 लाख से ₹50 लाख तक की परियोजनाओं के लिए 6.5–8% पर व्यवसाय ऋण; 90% वित्तपोषण, ऋण ₹45 लाख तक।',
    },
    kind: 'loan',
    finance: {
      minProjectCost: 140001, maxProjectCost: 5000000, maxLoan: 4500000, financingShare: 0.9,
      ratePct: { min: 6.5, max: 8, default: 8 },
      tenureMonths: { min: 36, max: 120, default: 84 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['project_quotation', 'project_report'],
    provenance: real('docs/01-the-system.md loan product sizes'),
    financeProvenance: {
      maxProjectCost: real('docs/01-the-system.md loan product sizes'),
      maxLoan: real('docs/01-the-system.md loan product sizes'),
      ratePct: nsfdcRateRef,
      tenureMonths: tenureRef,
      moratoriumMonths: psMoratoriumRef,
    },
  },
  {
    id: 'nsfdc-education-loan',
    track: 'nsfdc',
    agency: NSFDC,
    name: { en: 'NSFDC Education Loan', hi: 'NSFDC शिक्षा ऋण योजना' },
    summary: {
      en: 'Up to ₹40 lakh or 90% of the course fee, whichever is lower.',
      hi: '₹40 लाख या पाठ्यक्रम शुल्क का 90%, जो कम हो।',
    },
    kind: 'loan',
    finance: {
      maxLoan: 4000000, financingShare: 0.9,
      ratePct: { min: 6.5, max: 8, default: 8 },
      tenureMonths: { min: 60, max: 120, default: 84 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['admission_proof', 'fee_structure'],
    provenance: real('docs/01-the-system.md loan product sizes'),
    financeProvenance: {
      maxLoan: real('docs/01-the-system.md loan product sizes'),
      ratePct: seeded('Education loan rate not itemised in docs; NSFDC 6.5–8% range used'),
      tenureMonths: tenureRef,
      moratoriumMonths: psMoratoriumRef,
    },
  },
  {
    id: 'nsfdc-uny',
    track: 'nsfdc',
    agency: { en: 'NSFDC via cooperative societies / banks', hi: 'NSFDC (सहकारी समितियों / बैंकों के माध्यम से)' },
    name: { en: 'NSFDC Udyam Nidhi Yojana', hi: 'NSFDC उद्यम निधि योजना' },
    summary: {
      en: 'Loan up to ₹4.5 lakh on projects up to ₹5 lakh, through cooperative societies and banks.',
      hi: 'सहकारी समितियों और बैंकों के माध्यम से ₹5 लाख तक की परियोजनाओं पर ₹4.5 लाख तक ऋण।',
    },
    kind: 'loan',
    finance: {
      maxProjectCost: 500000, maxLoan: 450000, financingShare: 0.9,
      ratePct: { min: 6.5, max: 8, default: 8 },
      tenureMonths: { min: 36, max: 84, default: 60 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['project_quotation'],
    provenance: real('docs/01-the-system.md loan product sizes'),
    financeProvenance: {
      maxProjectCost: real('docs/01-the-system.md loan product sizes'),
      maxLoan: real('docs/01-the-system.md loan product sizes'),
      ratePct: seeded('UNY rate not in docs; NSFDC 6.5–8% range used'),
      tenureMonths: tenureRef,
      moratoriumMonths: psMoratoriumRef,
    },
  },
  {
    id: 'nsfdc-amy',
    track: 'nsfdc',
    agency: NSFDC,
    name: { en: 'NSFDC Aajeevika Microfinance Yojana', hi: 'NSFDC आजीविका माइक्रोफाइनेंस योजना' },
    summary: {
      en: 'Microfinance up to ₹1.25 lakh, only in states without a working SCA.',
      hi: '₹1.25 लाख तक माइक्रोफाइनेंस, केवल उन राज्यों में जहां कार्यरत SCA नहीं है।',
    },
    kind: 'loan',
    finance: {
      maxLoan: 125000, financingShare: 0.9,
      ratePct: { min: 9, max: 15, default: 15 },
      tenureMonths: { min: 12, max: 36, default: 36 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: [],
    provenance: real('docs/01-the-system.md loan product sizes'),
    financeProvenance: { maxLoan: real('docs/01-the-system.md loan product sizes'), tenureMonths: tenureRef },
  },
]

const fallbackSchemes: Scheme[] = [
  {
    id: 'pmegp',
    track: 'fallback',
    agency: { en: 'KVIC / KVIB / DIC (Ministry of MSME)', hi: 'KVIC / KVIB / DIC (MSME मंत्रालय)' },
    name: { en: 'PMEGP (Prime Minister’s Employment Generation Programme)', hi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' },
    summary: {
      en: 'Bank loan plus a one-time subsidy for a new unit: 35% rural / 25% urban for SC applicants. No income ceiling.',
      hi: 'नई इकाई के लिए बैंक ऋण और एकमुश्त सब्सिडी: SC आवेदकों के लिए ग्रामीण 35% / शहरी 25%। कोई आय सीमा नहीं।',
    },
    kind: 'subsidy_plus_loan',
    finance: {
      maxProjectCost: 5000000,
      subsidyShare: { rural: 0.35, urban: 0.25 },
      beneficiaryContributionShare: 0.05,
      ratePct: { min: 9, max: 12, default: 10.5 },
      tenureMonths: { min: 36, max: 84, default: 60 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['project_report', 'edp_certificate'],
    provenance: real('docs/01-the-system.md PMEGP'),
    financeProvenance: {
      subsidyShare: real('docs/01-the-system.md PMEGP'),
      maxProjectCost: real('docs/01-the-system.md PMEGP (₹50L manufacturing / ₹20L service)'),
      beneficiaryContributionShare: seeded('PMEGP own contribution not in docs; 5% special-category placeholder'),
      ratePct: seeded('Set by the lending bank'),
      tenureMonths: tenureRef,
    },
  },
  {
    id: 'mudra',
    track: 'fallback',
    agency: { en: 'Banks / NBFCs / MFIs (Ministry of Finance)', hi: 'बैंक / NBFC / MFI (वित्त मंत्रालय)' },
    name: { en: 'PM MUDRA Yojana', hi: 'प्रधानमंत्री मुद्रा योजना' },
    summary: {
      en: 'Collateral-free micro-business loan up to ₹20 lakh. No caste or income test; rate set by the bank.',
      hi: '₹20 लाख तक बिना गारंटी का सूक्ष्म व्यवसाय ऋण। कोई जाति या आय शर्त नहीं; ब्याज दर बैंक तय करता है।',
    },
    kind: 'loan',
    finance: {
      maxLoan: 2000000,
      ratePct: { min: 9, max: 14, default: 11 },
      tenureMonths: { min: 12, max: 84, default: 60 },
      moratoriumMonths: PS_MORATORIUM,
    },
    extraDocumentIds: ['project_quotation'],
    provenance: real('docs/01-the-system.md PM MUDRA Yojana'),
    financeProvenance: {
      maxLoan: real('docs/01-the-system.md PM MUDRA Yojana'),
      ratePct: seeded('Set by each bank, not concessional'),
      tenureMonths: tenureRef,
    },
  },
]

export const schemes: Scheme[] = [...pmajaySchemes, ...nsfdcSchemes, ...fallbackSchemes]
