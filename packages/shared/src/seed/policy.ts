import type { StageDurations } from '../engine/timeline'
import type { HealthPolicy } from '../types/domain'

export const healthPolicy: HealthPolicy = {
  maxOverdueOver1YearRupees: 0,
  minCumulativeUtilisationPct: 80,
  rrbMaxNetNpaPct: 15,
  rrbMinYearsUnderNpaLimit: 3,
  rrbWindowYears: 6,
  cautionMarginPct: 5,
  provenance: { kind: 'real', ref: 'docs/01-the-system.md NSFDC prudential rules (caution margin is ours)' },
}

/**
 * Total ≈ 120 days matches the published ~4 months application-to-disbursal (docs/05 F8).
 * Bank 5 days is the SOP SLA (docs/04 B5); the split of the rest is seeded.
 */
export const stageDurations: StageDurations = {
  submitted: 2,
  pre_scrutiny: 30,
  dlpac: 45,
  bank: 5,
  sanctioned: 38,
}

export const SRF_LOCK_MONTHS = 18

/** UP has a working SCA (UPSCFDC), which rules out Aajeevika Microfinance Yojana. */
export const stateContext = { stateHasWorkingSca: true, state: 'UP' } as const
