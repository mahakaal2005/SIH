import { describe, expect, it } from 'vitest'
import type { StageEvent } from '../types/domain'
import { estimateTimeline, stalledInfo, type StageDurations } from './timeline'

const durations: StageDurations = { submitted: 2, pre_scrutiny: 30, dlpac: 45, bank: 5, sanctioned: 38 }

describe('estimateTimeline', () => {
  it('lays expected stage dates end to end from submission', () => {
    const t = estimateTimeline('2026-01-01', durations)
    expect(t.map((s) => [s.stage, s.expectedStart, s.expectedEnd])).toEqual([
      ['submitted', '2026-01-01', '2026-01-03'],
      ['pre_scrutiny', '2026-01-03', '2026-02-02'],
      ['dlpac', '2026-02-02', '2026-03-19'],
      ['bank', '2026-03-19', '2026-03-24'],
      ['sanctioned', '2026-03-24', '2026-05-01'],
    ])
  })

  it('totals about four months to disbursal', () => {
    const t = estimateTimeline('2026-01-01', durations)
    expect(t.at(-1)?.expectedEnd).toBe('2026-05-01')
  })
})

describe('stalledInfo', () => {
  const history: StageEvent[] = [
    { stage: 'submitted', at: '2026-01-01T10:00:00Z', actor: 'citizen' },
    { stage: 'pre_scrutiny', at: '2026-01-03T10:00:00Z', actor: 'system' },
  ]

  it('is not stalled within twice the expected stage duration', () => {
    const r = stalledInfo('pre_scrutiny', history, durations, new Date('2026-02-20T10:00:00Z'))
    expect(r).toEqual({ daysInStage: 48, expectedDays: 30, stalled: false })
  })

  it('is stalled beyond twice the expected stage duration', () => {
    const r = stalledInfo('pre_scrutiny', history, durations, new Date('2026-03-10T10:00:00Z'))
    expect(r.stalled).toBe(true)
    expect(r.daysInStage).toBe(66)
  })

  it('never marks a terminal stage as stalled', () => {
    expect(stalledInfo('rejected', history, durations, new Date('2027-01-01')).stalled).toBe(false)
  })
})
