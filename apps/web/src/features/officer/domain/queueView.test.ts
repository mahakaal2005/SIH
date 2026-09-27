import * as seed from '@ys/shared/seed'
import { describe, expect, it } from 'vitest'
import type { Application, ApplicationStage, StageEvent } from '@ys/shared'
import { toCallList, toQueueView } from './queueView'

const NOW = new Date('2026-09-27T00:00:00.000Z')

function makeApp(id: string, stage: ApplicationStage, history: StageEvent[], submittedAt: string): Application {
  return {
    id, receiptNo: `YS-2026-${id}`, userId: 'u1', schemeId: 'pmajay-boutique', ruleVersion: 1,
    districtId: 'sitapur', partnerBranchId: null,
    profile: {
      fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
      education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
      estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
      alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
    },
    loanAmount: 63500, grantAmount: 50000, stage, history, submittedAt, signature: 'sig', seeded: false,
  }
}

describe('toQueueView', () => {
  it('flags an application stuck in pre_scrutiny well past its expected duration as stalled', () => {
    const app = makeApp(
      'app-1', 'pre_scrutiny',
      [{ stage: 'pre_scrutiny', at: '2026-06-01T00:00:00.000Z', actor: 'system' }],
      '2026-06-01T00:00:00.000Z',
    )
    const [row] = toQueueView([app], seed.stageDurations, NOW)
    expect(row!.stalled).toBe(true)
    expect(row!.daysInStage).toBeGreaterThan(seed.stageDurations.pre_scrutiny * 2)
  })

  it('does not flag a freshly submitted application', () => {
    const app = makeApp(
      'app-2', 'submitted',
      [{ stage: 'submitted', at: '2026-09-26T00:00:00.000Z', actor: 'citizen' }],
      '2026-09-26T00:00:00.000Z',
    )
    const [row] = toQueueView([app], seed.stageDurations, NOW)
    expect(row!.stalled).toBe(false)
  })

  it('never flags a terminal (disbursed) application', () => {
    const app = makeApp(
      'app-3', 'disbursed',
      [{ stage: 'disbursed', at: '2026-01-01T00:00:00.000Z', actor: 'bank' }],
      '2025-01-01T00:00:00.000Z',
    )
    const [row] = toQueueView([app], seed.stageDurations, NOW)
    expect(row!.stalled).toBe(false)
  })
})

describe('toCallList', () => {
  it('sorts rows oldest-in-stage first', () => {
    const rows = toQueueView(
      [
        makeApp('young', 'pre_scrutiny', [{ stage: 'pre_scrutiny', at: '2026-09-20T00:00:00.000Z', actor: 'system' }], '2026-09-20T00:00:00.000Z'),
        makeApp('old', 'pre_scrutiny', [{ stage: 'pre_scrutiny', at: '2026-06-01T00:00:00.000Z', actor: 'system' }], '2026-06-01T00:00:00.000Z'),
      ],
      seed.stageDurations,
      NOW,
    )
    const callList = toCallList(rows)
    expect(callList.map((r) => r.application.id)).toEqual(['old', 'young'])
  })
})
