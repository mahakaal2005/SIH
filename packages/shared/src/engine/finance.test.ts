import { describe, expect, it } from 'vitest'
import { assessAffordability, computeEmi, computeGiaSplit, computeLoanFinancing } from './finance'

describe('computeEmi', () => {
  it('matches the standard amortisation formula with no moratorium', () => {
    const r = computeEmi({ principal: 100000, annualRatePct: 10, tenureMonths: 12, moratoriumMonths: 0 })
    expect(r.emi).toBe(8791.59)
    expect(r.capitalisedInterest).toBe(0)
    expect(r.totalPayable).toBe(105499.08)
    expect(r.totalInterest).toBe(5499.08)
  })

  it('capitalises simple interest accrued during the moratorium', () => {
    const r = computeEmi({ principal: 100000, annualRatePct: 10, tenureMonths: 12, moratoriumMonths: 6 })
    expect(r.capitalisedInterest).toBe(5000)
    expect(r.emi).toBe(9231.17)
    expect(r.totalInterest).toBe(10774.04)
  })

  it('splits principal evenly at zero interest', () => {
    const r = computeEmi({ principal: 60000, annualRatePct: 0, tenureMonths: 12, moratoriumMonths: 3 })
    expect(r.emi).toBe(5000)
    expect(r.totalInterest).toBe(0)
  })

  it('returns zeros for a zero principal', () => {
    expect(computeEmi({ principal: 0, annualRatePct: 8, tenureMonths: 12, moratoriumMonths: 0 }).emi).toBe(0)
  })

  it('rejects a non-positive tenure', () => {
    expect(() => computeEmi({ principal: 1000, annualRatePct: 8, tenureMonths: 0, moratoriumMonths: 0 })).toThrow()
  })
})

describe('computeLoanFinancing', () => {
  const micro = { financingShare: 0.9, maxLoan: 125000 }

  it('finances 90% of the project cost', () => {
    expect(computeLoanFinancing(120000, micro)).toEqual({ loan: 108000, ownContribution: 12000, cappedByMaxLoan: false })
  })

  it('caps the loan at the scheme maximum and raises own contribution', () => {
    expect(computeLoanFinancing(140000, micro)).toEqual({ loan: 125000, ownContribution: 15000, cappedByMaxLoan: true })
  })

  it('finances the whole cost when no share is set', () => {
    expect(computeLoanFinancing(500000, {})).toEqual({ loan: 500000, ownContribution: 0, cappedByMaxLoan: false })
  })
})

describe('computeGiaSplit (UPSCFDC SOP, 5 components)', () => {
  const base = { grant: { maxAmount: 50000, maxShareOfCost: 0.5 }, contributionShare: 0.05, cgtmseFeePct: 0.37 }

  it('computes the boutique cluster split: 5% → ₹50k grant → net loan', () => {
    const r = computeGiaSplit({ ...base, projectCost: 120000, trainingCost: 14040 })
    expect(r).toMatchObject({
      totalCost: 120000,
      beneficiaryContribution: 6000,
      grant: 50000,
      trainingCost: 14040,
      netLoan: 64000,
      cgtmseFeeAnnual: 236.8,
    })
  })

  it('limits the grant to 50% of cost for small projects', () => {
    const r = computeGiaSplit({ ...base, projectCost: 80000, trainingCost: 0 })
    expect(r.grant).toBe(40000)
    expect(r.netLoan).toBe(36000)
  })

  it('never produces a negative loan', () => {
    const r = computeGiaSplit({ ...base, projectCost: 1000, trainingCost: 0 })
    expect(r.netLoan).toBeGreaterThanOrEqual(0)
    expect(r.beneficiaryContribution + r.grant + r.netLoan).toBe(1000)
  })

  it('reports all five SOP components as present', () => {
    const r = computeGiaSplit({ ...base, projectCost: 150000, trainingCost: 20000 })
    expect(r.missingComponents).toEqual([])
  })
})

describe('assessAffordability', () => {
  it('is ok when EMI is under 35% of monthly family income', () => {
    expect(assessAffordability(3000, 180000)).toMatchObject({ level: 'ok', ratio: 0.2 })
  })
  it('is a stretch between 35% and 50%', () => {
    expect(assessAffordability(6000, 180000).level).toBe('stretch')
  })
  it('is unaffordable above 50%', () => {
    expect(assessAffordability(8000, 180000).level).toBe('unaffordable')
  })
  it('is unaffordable with zero stated income and a positive EMI', () => {
    expect(assessAffordability(1000, 0).level).toBe('unaffordable')
  })
})
