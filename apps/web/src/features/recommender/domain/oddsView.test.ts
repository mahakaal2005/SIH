import { describe, expect, it } from 'vitest'
import { recommend, type ApplicantProfile } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { betterOddsViews, funnelDisclosure } from './oddsView'

const catalog = {
  schemes: seed.schemes,
  rules: seed.eligibilityRules,
  activities: seed.activities,
  projects: seed.pmajayProjects,
  approvalStats: seed.approvalStats,
  districts: seed.districts,
}
const ctx = { ...seed.stateContext, asOf: '2026-09-26' }

const poultryWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'poultry',
  estimatedCost: 130000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

describe('betterOddsViews', () => {
  it('names each higher-odds alternative from the project list, best first', () => {
    const poultry = recommend(poultryWoman, catalog, ctx).eligible.find((r) => r.scheme.id === 'pmajay-poultry')!
    const views = betterOddsViews(poultry.betterOdds, catalog.projects)
    expect(views.map((v) => [v.schemeId, v.approvalRatePct])).toEqual([
      ['pmajay-home_industry', 44.3],
      ['pmajay-kirana', 39.4],
      ['pmajay-beauty_parlour', 38.9],
    ])
    expect(views[0]?.name.en).toBe("Women's home industry / self-employment (group)")
  })
})

describe('funnelDisclosure', () => {
  it('reports the no-decision share and the leading districts by name', () => {
    const d = funnelDisclosure(seed.approvalFunnel, seed.districts)
    expect(d.applied).toBe(73888)
    expect(d.noDecisionPct).toBe(62.9)
    expect(d.mostApplications).toEqual({ name: { en: 'Rampur', hi: 'रामपुर' }, count: 2297 })
    expect(d.mostApprovals).toEqual({ name: { en: 'Bahraich', hi: 'बहराइच' }, count: 1246 })
  })
})
