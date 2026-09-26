import { describe, expect, it } from 'vitest'
import { allowedActions, nextStage, WorkflowError } from './workflow'

describe('nextStage', () => {
  it.each([
    ['pre_scrutiny', 'approve_pre_scrutiny', 'grant_plus_loan', 'dlpac'],
    ['submitted', 'approve_pre_scrutiny', 'loan', 'dlpac'],
    ['dlpac', 'forward_to_bank', 'loan', 'bank'],
    ['bank', 'sanction', 'loan', 'sanctioned'],
    ['sanctioned', 'disburse', 'loan', 'disbursed'],
    ['pre_scrutiny', 'reject', 'loan', 'rejected'],
    ['bank', 'reject', 'loan', 'rejected'],
    ['dlpac', 'return_for_fix', 'loan', 'returned'],
    ['returned', 'resubmit', 'loan', 'pre_scrutiny'],
  ] as const)('%s + %s (%s) → %s', (from, action, kind, to) => {
    expect(nextStage(from, action, kind)).toBe(to)
  })

  it('parks a PM-AJAY grant in the 18-month Subsidy Reserve Fund on disbursal', () => {
    expect(nextStage('sanctioned', 'disburse', 'grant_plus_loan')).toBe('srf_lock')
  })

  it('refuses an illegal transition', () => {
    expect(() => nextStage('pre_scrutiny', 'sanction', 'loan')).toThrow(WorkflowError)
    expect(() => nextStage('rejected', 'approve_pre_scrutiny', 'loan')).toThrow(WorkflowError)
  })
})

describe('allowedActions', () => {
  it('offers approve, reject and return during pre-scrutiny', () => {
    expect(allowedActions('pre_scrutiny')).toEqual(['approve_pre_scrutiny', 'reject', 'return_for_fix'])
  })
  it('offers nothing on a terminal stage', () => {
    expect(allowedActions('srf_lock')).toEqual([])
  })
  it('never offers the citizen-only resubmit to officers', () => {
    expect(allowedActions('returned')).toEqual([])
  })
})
