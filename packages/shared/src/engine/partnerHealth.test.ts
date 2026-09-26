import { describe, expect, it } from 'vitest'
import type { HealthPolicy, PartnerHealth } from '../types/domain'
import { assessPartnerHealth } from './partnerHealth'

const policy: HealthPolicy = {
  maxOverdueOver1YearRupees: 0,
  minCumulativeUtilisationPct: 80,
  rrbMaxNetNpaPct: 15,
  rrbMinYearsUnderNpaLimit: 3,
  rrbWindowYears: 6,
  cautionMarginPct: 5,
  provenance: { kind: 'real', ref: 'test' },
}

const h = (o: Partial<PartnerHealth>): PartnerHealth => ({
  overdueToNsfdcOver1YearRupees: 0,
  cumulativeUtilisationPct: 95,
  asOf: '2026-09-01',
  provenance: { kind: 'seeded', ref: 'test' },
  ...o,
})

describe('assessPartnerHealth (NSFDC prudential rules)', () => {
  it('passes a healthy SCA with no reasons to block', () => {
    const r = assessPartnerHealth('UPSCFDC_OFFICE', h({}), policy)
    expect(r.status).toBe('healthy')
    expect(r.checks.every((c) => c.result === 'pass')).toBe(true)
  })

  it('blocks when any overdue to NSFDC is older than 1 year', () => {
    const r = assessPartnerHealth('UPSCFDC_OFFICE', h({ overdueToNsfdcOver1YearRupees: 250000 }), policy)
    expect(r.status).toBe('blocked')
    expect(r.checks.find((c) => c.key === 'overdue')).toMatchObject({ result: 'fail', actual: 250000, limit: 0 })
  })

  it('blocks below 80% cumulative utilisation', () => {
    expect(assessPartnerHealth('PSB', h({ cumulativeUtilisationPct: 72 }), policy).status).toBe('blocked')
  })

  it('cautions when utilisation is within the margin above 80%', () => {
    const r = assessPartnerHealth('PSB', h({ cumulativeUtilisationPct: 83 }), policy)
    expect(r.status).toBe('caution')
    expect(r.checks.find((c) => c.key === 'utilisation')?.result).toBe('caution')
  })

  it('blocks an RRB whose net NPA was under 15% in fewer than 3 of the last 6 years', () => {
    const r = assessPartnerHealth('RRB', h({ netNpaPctLast6Years: [18, 17, 16, 14, 19, 14] }), policy)
    expect(r.status).toBe('blocked')
    expect(r.checks.find((c) => c.key === 'rrbNpa')).toMatchObject({ result: 'fail', actual: 2, limit: 3 })
  })

  it('passes an RRB meeting the NPA rule in exactly 3 of 6 years', () => {
    const r = assessPartnerHealth('RRB', h({ netNpaPctLast6Years: [18, 17, 16, 14, 12, 10] }), policy)
    expect(r.checks.find((c) => c.key === 'rrbNpa')?.result).toBe('pass')
  })

  it('blocks an RRB with no NPA history rather than assuming health', () => {
    expect(assessPartnerHealth('RRB', h({}), policy).checks.find((c) => c.key === 'rrbNpa')?.result).toBe('fail')
  })

  it('blocks a PSB with overdues at disbursement', () => {
    const r = assessPartnerHealth('PSB', h({ hasOverdueAtDisbursement: true }), policy)
    expect(r.status).toBe('blocked')
    expect(r.checks.map((c) => c.key)).toContain('psbOverdue')
  })

  it('does not apply RRB or PSB checks to other partner types', () => {
    const keys = assessPartnerHealth('UPSCFDC_OFFICE', h({}), policy).checks.map((c) => c.key)
    expect(keys).toEqual(['overdue', 'utilisation'])
  })
})
