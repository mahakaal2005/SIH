import { describe, expect, it } from 'vitest'
import { assessAffordability, computeEmi, financePlan } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { defaultLoanTerms, toCalculatorView } from './calculatorView'

const boutique = seed.schemes.find((s) => s.id === 'pmajay-boutique')!
const boutiqueProject = seed.pmajayProjects.find((p) => p.id === 'boutique')!
const microCredit = seed.schemes.find((s) => s.id === 'nsfdc-micro-credit')!

describe('toCalculatorView', () => {
  it('composes financePlan + computeEmi + assessAffordability for a GIA scheme', () => {
    const terms = defaultLoanTerms(boutique)
    const view = toCalculatorView(boutique, boutiqueProject, 120000, terms, 180000, 'rural')
    const plan = financePlan(boutique, { projectCost: 120000, area: 'rural', trainingHours: boutiqueProject.trainingHours })
    expect(view.financePlan).toEqual(plan)
    expect(view.emi).toEqual(
      computeEmi({ principal: plan.loan, annualRatePct: terms.ratePct, tenureMonths: terms.tenureMonths, moratoriumMonths: terms.moratoriumMonths }),
    )
    expect(view.affordability).toEqual(assessAffordability(view.emi.emi, 180000))
    expect(view.financePlan.gia?.grant).toBe(50000)
    expect(view.rateRange).toEqual(boutique.finance.ratePct)
  })

  it('defaults loan terms from the scheme finance ranges', () => {
    expect(defaultLoanTerms(microCredit)).toEqual({ ratePct: 15, tenureMonths: 36, moratoriumMonths: 6 })
  })

  it('flags a capped loan for an over-the-cap NSFDC project cost', () => {
    const terms = defaultLoanTerms(microCredit)
    const view = toCalculatorView(microCredit, undefined, 140000, terms, 200000, 'urban')
    expect(view.financePlan.cappedByMaxLoan).toBe(true)
    expect(view.financePlan.loan).toBe(125000)
  })

  it('recomputes the EMI when a loan term changes', () => {
    const terms = defaultLoanTerms(microCredit)
    const a = toCalculatorView(microCredit, undefined, 130000, terms, 200000, 'urban')
    const b = toCalculatorView(microCredit, undefined, 130000, { ...terms, ratePct: 9 }, 200000, 'urban')
    expect(b.emi.emi).toBeLessThan(a.emi.emi)
  })

  it('flags low income against a large EMI as unaffordable', () => {
    const terms = defaultLoanTerms(microCredit)
    const view = toCalculatorView(microCredit, undefined, 130000, terms, 24000, 'urban')
    expect(view.affordability.level).toBe('unaffordable')
  })
})
