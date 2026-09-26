import type { PartnerBranch, PartnerEntity } from '../types/domain'
import { districts } from './districts'
import { schemes } from './schemes'

const SEEDED_HEALTH = {
  kind: 'seeded',
  ref: 'No public source for partner NPA/overdues/utilisation (docs/05 data honesty). Values follow the published NSFDC schema.',
} as const
const AS_OF = '2026-09-01'

export const partnerEntities: PartnerEntity[] = [
  {
    id: 'upscfdc', type: 'UPSCFDC_OFFICE',
    name: { en: 'UPSCFDC District Office', hi: 'उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम, जिला कार्यालय' },
    health: { overdueToNsfdcOver1YearRupees: 0, cumulativeUtilisationPct: 97.7, asOf: AS_OF, provenance: SEEDED_HEALTH },
  },
  {
    id: 'sbi', type: 'PSB', name: { en: 'State Bank of India', hi: 'भारतीय स्टेट बैंक' },
    health: { overdueToNsfdcOver1YearRupees: 0, cumulativeUtilisationPct: 94, hasOverdueAtDisbursement: false, asOf: AS_OF, provenance: SEEDED_HEALTH },
  },
  {
    id: 'bob', type: 'PSB', name: { en: 'Bank of Baroda', hi: 'बैंक ऑफ़ बड़ौदा' },
    health: { overdueToNsfdcOver1YearRupees: 0, cumulativeUtilisationPct: 91, hasOverdueAtDisbursement: false, asOf: AS_OF, provenance: SEEDED_HEALTH },
  },
  {
    id: 'pnb', type: 'PSB', name: { en: 'Punjab National Bank', hi: 'पंजाब नेशनल बैंक' },
    health: { overdueToNsfdcOver1YearRupees: 0, cumulativeUtilisationPct: 83, hasOverdueAtDisbursement: false, asOf: AS_OF, provenance: SEEDED_HEALTH },
  },
  {
    id: 'union', type: 'PSB', name: { en: 'Union Bank of India', hi: 'यूनियन बैंक ऑफ़ इंडिया' },
    health: { overdueToNsfdcOver1YearRupees: 0, cumulativeUtilisationPct: 72, hasOverdueAtDisbursement: false, asOf: AS_OF, provenance: SEEDED_HEALTH },
  },
  {
    id: 'upgb', type: 'RRB', name: { en: 'Uttar Pradesh Gramin Bank', hi: 'उत्तर प्रदेश ग्रामीण बैंक' },
    health: {
      overdueToNsfdcOver1YearRupees: 180000, cumulativeUtilisationPct: 86, netNpaPctLast6Years: [17.2, 16.4, 16.1, 15.3, 14.2, 13.1],
      asOf: AS_OF, provenance: SEEDED_HEALTH,
    },
  },
]

const ids = (pred: (id: string) => boolean) => schemes.map((s) => s.id).filter(pred)
const SCA_SCHEMES = ids((id) => id.startsWith('pmajay-') || ['nsfdc-micro-credit', 'nsfdc-term-loan', 'nsfdc-education-loan'].includes(id))
const BANK_SCHEMES = ids((id) => id.startsWith('pmajay-') || ['nsfdc-term-loan', 'nsfdc-education-loan', 'nsfdc-uny', 'pmegp', 'mudra'].includes(id))

// Deterministic offsets so branches sit around the district HQ, not on top of it.
const OFFSETS: Record<string, [number, number]> = {
  sbi: [0.012, -0.018], bob: [-0.021, 0.009], pnb: [0.027, 0.024], union: [-0.009, -0.031], upgb: [0.041, -0.006],
}

const phoneFor = (i: number) => `0522-40${String(1000 + i).slice(-4)}`

export const partnerBranches: PartnerBranch[] = districts.flatMap((d, i) => {
  const office: PartnerBranch = {
    id: `upscfdc-${d.id}`,
    entityId: 'upscfdc',
    name: { en: `UPSCFDC District Office, ${d.name.en}`, hi: `उ.प्र.अ.जा.वि.वि.नि. जिला कार्यालय, ${d.name.hi}` },
    districtId: d.id,
    address: `District Office, ${d.name.en}, Uttar Pradesh`,
    lat: d.lat,
    lng: d.lng,
    email: d.officeEmail,
    authorisedSchemeIds: SCA_SCHEMES,
    provenance: { kind: 'real', ref: 'docs/04-up-reference.md Part E (email real; address and location approximate)' },
  }
  if (!d.isDemoDistrict) return [office]
  const banks = Object.entries(OFFSETS).map(([entityId, [dLat, dLng]], j): PartnerBranch => {
    const entity = partnerEntities.find((e) => e.id === entityId)!
    return {
      id: `${entityId}-${d.id}`,
      entityId,
      name: { en: `${entity.name.en}, ${d.name.en} Main Branch`, hi: `${entity.name.hi}, ${d.name.hi} मुख्य शाखा` },
      districtId: d.id,
      address: `Main Branch, ${d.name.en}, Uttar Pradesh`,
      lat: +(d.lat + dLat).toFixed(4),
      lng: +(d.lng + dLng).toFixed(4),
      phone: phoneFor(i * 10 + j),
      authorisedSchemeIds: BANK_SCHEMES,
      provenance: { kind: 'seeded', ref: 'Branch list/location placeholder until razorpay/ifsc import (docs/05 F3)' },
    }
  })
  return [office, ...banks]
})
