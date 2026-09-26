import { describe, expect, it } from 'vitest'
import { recommend, type ApplicantProfile } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { toDetailView } from './detailView'

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

describe('toDetailView', () => {
  it('builds a full pass/fail rule table with the rule version and date', () => {
    const result = recommend(sitapurWoman, catalog, ctx)
    const view = toDetailView(result, 'pmajay-boutique', catalog.rules, sitapurWoman.area, catalog.projects)
    expect(view?.ruleVersion).toBe(1)
    expect(view?.ruleEffectiveFrom).toBeTruthy()
    expect(view?.lines.some((l) => l.passed)).toBe(true)
    expect(view?.financePlan.grant).toBeGreaterThan(0)
    expect(view?.project?.id).toBe('boutique')
  })

  it('finds a near-miss scheme too, with its failing lines', () => {
    const result = recommend({ ...sitapurWoman, age: 51 }, catalog, ctx)
    const view = toDetailView(result, 'pmajay-boutique', catalog.rules, sitapurWoman.area, catalog.projects)
    expect(view?.lines.find((l) => l.reasonKey === 'rule.age18to50')?.passed).toBe(false)
  })

  it('returns undefined for a scheme id that is not in the result', () => {
    const result = recommend(sitapurWoman, catalog, ctx)
    expect(toDetailView(result, 'nope', catalog.rules, sitapurWoman.area, catalog.projects)).toBeUndefined()
  })
})
