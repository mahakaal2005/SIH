import { describe, expect, it } from 'vitest'
import { recommend, type ApplicantProfile } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { toResultView } from './resultView'

const catalog = {
  schemes: seed.schemes,
  rules: seed.eligibilityRules,
  activities: seed.activities,
  projects: seed.pmajayProjects,
  approvalStats: seed.approvalStats,
  districts: seed.districts,
}
const ctx = { ...seed.stateContext, asOf: '2026-09-26' }

const sitapurWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}
const run = (o: Partial<ApplicantProfile> = {}) => recommend({ ...sitapurWoman, ...o }, catalog, ctx)

describe('toResultView', () => {
  it('puts the top match up front with its finance plan and priority chips', () => {
    const view = toResultView(run(), sitapurWoman.area, catalog.projects)
    expect(view.topMatch?.schemeId).toBe('pmajay-boutique')
    expect(view.topMatch?.financePlan.grant).toBeGreaterThan(0)
    expect(view.topMatch?.priorityKeys).toEqual(['prio.women', 'prio.lowIncome'])
    expect(view.topMatch?.reasonKeys.length).toBeLessThanOrEqual(3)
    expect(view.eligible.map((c) => c.schemeId)).not.toContain('pmajay-boutique')
    expect(view.eligible.map((c) => c.schemeId)).toContain('nsfdc-micro-credit')
    expect(view.fallbackUsed).toBe(false)
    expect(view.empty).toBe(false)
  })

  it('reports the exact gap and limit for a near miss', () => {
    const view = toResultView(run({ activityId: 'other_service', estimatedCost: 145000 }), 'rural', catalog.projects)
    const micro = view.nearMisses.find((n) => n.schemeId === 'nsfdc-micro-credit')
    expect(micro).toMatchObject({ gap: 5000, limit: 140000, failedReasonKeys: ['rule.microCostCap'] })
  })

  it('flags a fallback with alsoAvailable empty and a banner', () => {
    const view = toResultView(run({ casteCategory: 'GEN', activityId: 'other_service', estimatedCost: 300000 }), 'rural', catalog.projects)
    expect(view.fallbackUsed).toBe(true)
    const ids = [view.topMatch?.schemeId, ...view.eligible.map((c) => c.schemeId)]
    expect(ids).toEqual(expect.arrayContaining(['pmegp', 'mudra']))
    expect(view.alsoAvailable).toEqual([])
  })

  it('lists ineligible schemes with their failing reasons', () => {
    const view = toResultView(run({ gender: 'male' }), 'rural', catalog.projects)
    const boutique = [...view.nearMisses, ...view.ineligible].find((x) => x.schemeId === 'pmajay-boutique')
    expect(boutique?.failedReasonKeys).toEqual(['rule.womenOnly'])
  })
})
