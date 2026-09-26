import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '../schemas/profile'
import * as seed from '../seed'
import { activeRule, recommend, type Catalog } from './recommend'

const catalog: Catalog = {
  schemes: seed.schemes,
  rules: seed.eligibilityRules,
  activities: seed.activities,
  projects: seed.pmajayProjects,
  approvalStats: seed.approvalStats,
  districts: seed.districts,
}
const ctx = { ...seed.stateContext, asOf: '2026-09-26' }

/** The demo persona: rural SC woman in Sitapur, ₹1.2L boutique (docs/05 demo script). */
const sitapurWoman: ApplicantProfile = {
  fullName: 'Sunita Devi',
  age: 32,
  gender: 'female',
  casteCategory: 'SC',
  annualFamilyIncome: 180000,
  education: 'middle',
  districtId: 'sitapur',
  area: 'rural',
  purpose: 'business',
  activityId: 'boutique',
  estimatedCost: 120000,
  isLiterate: true,
  willingGroupOrCluster: true,
  isDefaulter: false,
  settledViaOTS: false,
  alreadyFinancedElsewhere: false,
  hasDisability: false,
  isExistingBusiness: false,
}
const run = (o: Partial<ApplicantProfile>) => recommend({ ...sitapurWoman, ...o }, catalog, ctx)
const ids = (xs: { scheme: { id: string } }[]) => xs.map((x) => x.scheme.id)
const find = <T extends { scheme: { id: string } }>(xs: T[], id: string) => xs.find((x) => x.scheme.id === id)

describe('recommend', () => {
  it('ranks the PM-AJAY boutique grant first for the demo persona, with real approval odds', () => {
    const r = run({})
    expect(r.eligible[0]?.scheme.id).toBe('pmajay-boutique')
    expect(r.eligible[0]?.approvalRatePct).toBe(38.7)
    expect(r.eligible[0]?.projectCost).toBe(120000)
    expect(ids(r.eligible)).toContain('nsfdc-micro-credit')
    expect(r.fallbackUsed).toBe(false)
  })

  it('records the rule version that decided each recommendation', () => {
    expect(run({}).eligible[0]?.evaluation.ruleVersion).toBe(1)
  })

  it('surfaces PM-AJAY priority groups the applicant belongs to', () => {
    expect(run({}).eligible[0]?.evaluation.priorityKeys).toEqual(['prio.women', 'prio.lowIncome'])
  })

  it('keeps caste-neutral schemes out of the main list when an SC scheme fits', () => {
    const r = run({})
    expect(ids(r.eligible)).not.toContain('pmegp')
    expect(ids(r.alsoAvailable)).toEqual(expect.arrayContaining(['pmegp', 'mudra']))
  })

  it('treats a ₹1.45L project as a Micro Credit near miss and offers the Term Loan', () => {
    const r = run({ activityId: 'other_service', estimatedCost: 145000 })
    const micro = find(r.nearMisses, 'nsfdc-micro-credit')
    expect(micro?.evaluation.failed[0]?.nearMiss).toEqual({ limit: 140000, gap: 5000 })
    expect(ids(r.eligible)).toContain('nsfdc-term-loan')
  })

  it('rejects PM-AJAY at age 51 but keeps NSFDC credit, which has no upper age limit', () => {
    const r = run({ age: 51 })
    expect(find(r.nearMisses, 'pmajay-boutique')?.evaluation.failed.map((f) => f.reasonKey)).toEqual(['rule.age18to50'])
    expect(ids(r.eligible)).toContain('nsfdc-micro-credit')
  })

  it('explains that the boutique cluster is for SC women only', () => {
    const r = run({ gender: 'male' })
    const boutique = [...r.nearMisses, ...r.ineligible].find((x) => x.scheme.id === 'pmajay-boutique')
    expect(boutique?.evaluation.failed.map((f) => f.reasonKey)).toEqual(['rule.womenOnly'])
  })

  it('keeps PM-AJAY (no income ceiling) when income is above the NSFDC ₹5L cap', () => {
    const r = run({ activityId: 'kirana', estimatedCost: 200000, annualFamilyIncome: 600000 })
    expect(ids(r.eligible)).toContain('pmajay-kirana')
    expect(ids(r.eligible).filter((id) => id.startsWith('nsfdc-'))).toEqual([])
  })

  it('falls back to caste-neutral schemes instead of dead-ending', () => {
    const r = run({ casteCategory: 'GEN', activityId: 'other_service', estimatedCost: 300000 })
    expect(r.fallbackUsed).toBe(true)
    expect(ids(r.eligible)).toEqual(['pmegp', 'mudra'])
  })

  it('never offers Aajeevika Microfinance Yojana in UP, and says why', () => {
    const r = run({ activityId: 'other_service', estimatedCost: 100000 })
    const amy = [...r.nearMisses, ...r.ineligible].find((x) => x.scheme.id === 'nsfdc-amy')
    expect(amy?.evaluation.failed.map((f) => f.reasonKey)).toEqual(['rule.amyNoSca'])
  })

  it('only lists PM-AJAY projects for the chosen activity among ineligible results', () => {
    const r = run({})
    const others = [...r.nearMisses, ...r.ineligible].filter((x) => x.scheme.track === 'pmajay_gia')
    expect(others).toEqual([])
  })

  describe('approval odds (F4)', () => {
    it('warns on poor historical odds and suggests better projects the applicant qualifies for', () => {
      const r = run({ activityId: 'poultry', estimatedCost: 130000 })
      const poultry = find(r.eligible, 'pmajay-poultry')
      expect(poultry?.approvalRatePct).toBe(7.7)
      expect(poultry?.lowOdds).toBe(true)
      expect(poultry?.betterOdds.map((b) => [b.projectId, b.approvalRatePct])).toEqual([
        ['home_industry', 44.3],
        ['kirana', 39.4],
        ['beauty_parlour', 38.9],
      ])
    })

    it('excludes women-only alternatives for a male applicant', () => {
      const r = run({ gender: 'male', activityId: 'logistics_driver', estimatedCost: 630000 })
      const alts = find(r.eligible, 'pmajay-logistics_driver')?.betterOdds.map((b) => b.projectId)
      expect(alts).toEqual(['kirana', 'carpentry', 'e_rickshaw'])
    })

    it('does not flag reasonable odds', () => {
      expect(run({}).eligible[0]?.lowOdds).toBe(false)
    })
  })

  it('uses the applicant estimate when the SOP cost sheet is missing', () => {
    const r = run({ activityId: 'home_industry', estimatedCost: 90000 })
    expect(find(r.eligible, 'pmajay-home_industry')).toMatchObject({ projectCost: 90000, projectCostSource: 'applicant' })
  })
})

describe('activeRule', () => {
  const v = (version: number, effectiveFrom: string) => ({ ...seed.eligibilityRules[0]!, version, effectiveFrom })

  it('picks the highest version already in effect', () => {
    const rules = [v(1, '2025-01-01'), v(2, '2026-01-07'), v(3, '2027-01-01')]
    expect(activeRule(rules, rules[0]!.schemeId, '2026-09-26')?.version).toBe(2)
  })

  it('returns undefined when no version is in effect yet', () => {
    expect(activeRule([v(1, '2027-01-01')], seed.eligibilityRules[0]!.schemeId, '2026-09-26')).toBeUndefined()
  })
})
