import * as seed from '@ys/shared/seed'
import { describe, expect, it } from 'vitest'
import type { Application, ApplicationStage, StageEvent } from '@ys/shared'
import { toTimelineView } from './statusView'

const SUBMITTED_AT = '2026-06-01T00:00:00.000Z'

function makeApp(stage: ApplicationStage, history: StageEvent[]): Application {
  return {
    id: 'app-1', receiptNo: 'YS-2026-000001', userId: 'u1', schemeId: 'pmajay-boutique', ruleVersion: 1,
    districtId: 'sitapur', partnerBranchId: 'upscfdc-sitapur',
    profile: {
      fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
      education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
      estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
      alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
    },
    loanAmount: 63500, grantAmount: 50000, stage, history, submittedAt: SUBMITTED_AT, signature: 'sig', seeded: false,
  }
}

describe('toTimelineView', () => {
  it('marks a submitted-only application as current at submitted, the rest upcoming', () => {
    const app = makeApp('submitted', [{ stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' }])
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.steps.map((s) => s.status)).toEqual(['current', 'upcoming', 'upcoming', 'upcoming', 'upcoming'])
    expect(view.terminal).toBe('none')
    expect(view.canResubmit).toBe(false)
  })

  it('marks earlier stages done and the present one current mid-pipeline', () => {
    const history: StageEvent[] = [
      { stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' },
      { stage: 'pre_scrutiny', at: SUBMITTED_AT, actor: 'system' },
      { stage: 'dlpac', at: '2026-06-05T00:00:00.000Z', actor: 'district_officer' },
      { stage: 'bank', at: '2026-06-20T00:00:00.000Z', actor: 'district_officer' },
    ]
    const app = makeApp('bank', history)
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.steps.map((s) => s.status)).toEqual(['done', 'done', 'done', 'current', 'upcoming'])
    expect(view.steps.find((s) => s.stage === 'dlpac')?.actualAt).toBe('2026-06-05T00:00:00.000Z')
    expect(view.terminal).toBe('none')
  })

  it('marks every pipeline step done and the terminal disbursed', () => {
    const history: StageEvent[] = [
      { stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' },
      { stage: 'pre_scrutiny', at: SUBMITTED_AT, actor: 'system' },
      { stage: 'dlpac', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'bank', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'sanctioned', at: SUBMITTED_AT, actor: 'bank' },
      { stage: 'disbursed', at: SUBMITTED_AT, actor: 'bank' },
    ]
    const app = makeApp('disbursed', history)
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.steps.every((s) => s.status === 'done')).toBe(true)
    expect(view.terminal).toBe('disbursed')
    expect(view.canResubmit).toBe(false)
  })

  it('marks every pipeline step done for a grant scheme locked into srf_lock', () => {
    const history: StageEvent[] = [
      { stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' },
      { stage: 'pre_scrutiny', at: SUBMITTED_AT, actor: 'system' },
      { stage: 'dlpac', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'bank', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'sanctioned', at: SUBMITTED_AT, actor: 'bank' },
      { stage: 'srf_lock', at: SUBMITTED_AT, actor: 'bank' },
    ]
    const app = makeApp('srf_lock', history)
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.steps.every((s) => s.status === 'done')).toBe(true)
    expect(view.terminal).toBe('srf_lock')
  })

  it('surfaces the rejection reason and disallows resubmit when rejected', () => {
    const history: StageEvent[] = [
      { stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' },
      { stage: 'pre_scrutiny', at: SUBMITTED_AT, actor: 'system' },
      { stage: 'dlpac', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'bank', at: SUBMITTED_AT, actor: 'district_officer' },
      { stage: 'rejected', at: '2026-06-25T00:00:00.000Z', actor: 'bank', reasonKey: 'reject.cibilLow' },
    ]
    const app = makeApp('rejected', history)
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.terminal).toBe('rejected')
    expect(view.rejectionReasonKey).toBe('reject.cibilLow')
    expect(view.canResubmit).toBe(false)
  })

  it('surfaces the return reason and allows resubmit when returned', () => {
    const history: StageEvent[] = [
      { stage: 'submitted', at: SUBMITTED_AT, actor: 'citizen' },
      { stage: 'pre_scrutiny', at: SUBMITTED_AT, actor: 'system' },
      { stage: 'returned', at: '2026-06-10T00:00:00.000Z', actor: 'district_officer', reasonKey: 'reject.missingDocs' },
    ]
    const app = makeApp('returned', history)
    const view = toTimelineView(app, seed.stageDurations)
    expect(view.terminal).toBe('returned')
    expect(view.rejectionReasonKey).toBe('reject.missingDocs')
    expect(view.canResubmit).toBe(true)
  })
})
