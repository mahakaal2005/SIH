import { describe, expect, it } from 'vitest'
import type { EligibilityRule } from '../schemas/rule'
import { evaluateRule } from './eligibility'

const rule = (criteria: EligibilityRule['criteria'], priority: EligibilityRule['priority'] = []): EligibilityRule => ({
  schemeId: 's1',
  version: 3,
  effectiveFrom: '2026-01-07',
  criteria,
  priority,
})

describe('evaluateRule', () => {
  it('is eligible when every criterion passes and records the rule version', () => {
    const r = evaluateRule(
      rule([
        { criterion: { op: 'eq', field: 'casteCategory', value: 'SC', reasonKey: 'sc' } },
        { criterion: { op: 'lte', field: 'annualFamilyIncome', value: 500000, reasonKey: 'income' } },
      ]),
      { casteCategory: 'SC', annualFamilyIncome: 180000 },
    )
    expect(r.eligible).toBe(true)
    expect(r.ruleVersion).toBe(3)
    expect(r.passedKeys).toEqual(['sc', 'income'])
    expect(r.failed).toEqual([])
  })

  it('lists every failing criterion with the actual value, not just the first', () => {
    const r = evaluateRule(
      rule([
        { criterion: { op: 'eq', field: 'gender', value: 'female', reasonKey: 'women' } },
        { criterion: { op: 'between', field: 'age', value: [18, 50], reasonKey: 'age' } },
      ]),
      { gender: 'male', age: 51 },
    )
    expect(r.eligible).toBe(false)
    expect(r.failed.map((f) => [f.reasonKey, f.actual])).toEqual([
      ['women', 'male'],
      ['age', 51],
    ])
  })

  it.each([
    ['neq', 'x', 'y', true],
    ['neq', 'x', 'x', false],
    ['in', ['a', 'b'], 'b', true],
    ['in', ['a', 'b'], 'c', false],
    ['notIn', ['a'], 'b', true],
    ['lt', 10, 9, true],
    ['lt', 10, 10, false],
    ['gt', 10, 11, true],
    ['gte', 10, 10, true],
    ['between', [18, 50], 18, true],
    ['between', [18, 50], 50, true],
    ['between', [18, 50], 17, false],
  ] as const)('op %s with %j against %j → %s', (op, value, actual, expected) => {
    const r = evaluateRule(rule([{ criterion: { op, field: 'f', value, reasonKey: 'k' } as never }]), { f: actual })
    expect(r.eligible).toBe(expected)
  })

  it('handles isTrue / isFalse', () => {
    const crit = rule([
      { criterion: { op: 'isTrue', field: 'isLiterate', reasonKey: 'lit' } },
      { criterion: { op: 'isFalse', field: 'isDefaulter', reasonKey: 'def' } },
    ])
    expect(evaluateRule(crit, { isLiterate: true, isDefaulter: false }).eligible).toBe(true)
    expect(evaluateRule(crit, { isLiterate: true, isDefaulter: true }).failed[0]?.reasonKey).toBe('def')
  })

  it('compares education by level order', () => {
    const crit = rule([{ criterion: { op: 'educationAtLeast', field: 'education', value: 'middle', reasonKey: 'viii' } }])
    expect(evaluateRule(crit, { education: 'secondary' }).eligible).toBe(true)
    expect(evaluateRule(crit, { education: 'middle' }).eligible).toBe(true)
    expect(evaluateRule(crit, { education: 'primary' }).eligible).toBe(false)
  })

  it('treats a missing fact as a failure rather than throwing', () => {
    const r = evaluateRule(rule([{ criterion: { op: 'eq', field: 'nope', value: 1, reasonKey: 'k' } }]), {})
    expect(r.eligible).toBe(false)
    expect(r.failed[0]?.actual).toBeUndefined()
  })

  it('only applies a criterion when its `when` guards all hold', () => {
    // PMEGP: Class VIII pass needed only for manufacturing projects above ₹10L.
    const crit = rule([
      {
        criterion: { op: 'educationAtLeast', field: 'education', value: 'middle', reasonKey: 'viii' },
        when: [
          { op: 'eq', field: 'activityCategory', value: 'manufacturing', reasonKey: '-' },
          { op: 'gt', field: 'estimatedCost', value: 1000000, reasonKey: '-' },
        ],
      },
    ])
    expect(evaluateRule(crit, { education: 'none', activityCategory: 'manufacturing', estimatedCost: 900000 }).eligible).toBe(true)
    expect(evaluateRule(crit, { education: 'none', activityCategory: 'manufacturing', estimatedCost: 1100000 }).eligible).toBe(false)
  })

  it('collects priority criteria that match without affecting eligibility', () => {
    const r = evaluateRule(
      rule(
        [{ criterion: { op: 'eq', field: 'casteCategory', value: 'SC', reasonKey: 'sc' } }],
        [
          { op: 'eq', field: 'gender', value: 'female', reasonKey: 'prio.women' },
          { op: 'isTrue', field: 'hasDisability', reasonKey: 'prio.divyang' },
          { op: 'lte', field: 'annualFamilyIncome', value: 250000, reasonKey: 'prio.lowIncome' },
        ],
      ),
      { casteCategory: 'SC', gender: 'female', hasDisability: false, annualFamilyIncome: 180000 },
    )
    expect(r.eligible).toBe(true)
    expect(r.priorityKeys).toEqual(['prio.women', 'prio.lowIncome'])
  })

  describe('near misses (numeric failures within 10% of the limit)', () => {
    const micro = rule([{ criterion: { op: 'lte', field: 'estimatedCost', value: 140000, reasonKey: 'microCap' } }])

    it('flags ₹1.45L against a ₹1.40L cap with the exact gap', () => {
      const f = evaluateRule(micro, { estimatedCost: 145000 }).failed[0]
      expect(f?.nearMiss).toEqual({ limit: 140000, gap: 5000 })
    })

    it('does not flag a failure far from the limit', () => {
      expect(evaluateRule(micro, { estimatedCost: 300000 }).failed[0]?.nearMiss).toBeUndefined()
    })

    it('flags the nearer bound of a between range', () => {
      const f = evaluateRule(rule([{ criterion: { op: 'between', field: 'age', value: [18, 50], reasonKey: 'age' } }]), {
        age: 51,
      }).failed[0]
      expect(f?.nearMiss).toEqual({ limit: 50, gap: 1 })
    })

    it('marks a rule as a near miss only when every failure is a near miss', () => {
      const two = rule([
        { criterion: { op: 'lte', field: 'estimatedCost', value: 140000, reasonKey: 'cap' } },
        { criterion: { op: 'eq', field: 'casteCategory', value: 'SC', reasonKey: 'sc' } },
      ])
      expect(evaluateRule(two, { estimatedCost: 145000, casteCategory: 'SC' }).isNearMiss).toBe(true)
      expect(evaluateRule(two, { estimatedCost: 145000, casteCategory: 'GEN' }).isNearMiss).toBe(false)
    })
  })
})
