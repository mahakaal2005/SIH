import {
  assessAffordability,
  computeEmi,
  financePlan,
  type AffordabilityLevel,
  type EmiResult,
  type FinancePlan,
  type PmAjayProject,
  type Range,
  type Scheme,
} from '@ys/shared'

export interface LoanTerms {
  ratePct: number
  tenureMonths: number
  moratoriumMonths: number
}

export interface CalculatorView {
  kind: Scheme['kind']
  financePlan: FinancePlan
  emi: EmiResult
  affordability: { ratio: number; level: AffordabilityLevel }
  rateRange: Range
  tenureRange: Range
  moratoriumRange: Range
}

export function defaultLoanTerms(scheme: Scheme): LoanTerms {
  return {
    ratePct: scheme.finance.ratePct.default,
    tenureMonths: scheme.finance.tenureMonths.default,
    moratoriumMonths: scheme.finance.moratoriumMonths.default,
  }
}

export function toCalculatorView(
  scheme: Scheme,
  project: PmAjayProject | undefined,
  projectCost: number,
  terms: LoanTerms,
  annualFamilyIncome: number,
  area: 'rural' | 'urban',
): CalculatorView {
  const plan = financePlan(scheme, { projectCost, area, trainingHours: project?.trainingHours })
  const emi = computeEmi({
    principal: plan.loan,
    annualRatePct: terms.ratePct,
    tenureMonths: terms.tenureMonths,
    moratoriumMonths: terms.moratoriumMonths,
  })
  return {
    kind: scheme.kind,
    financePlan: plan,
    emi,
    affordability: assessAffordability(emi.emi, annualFamilyIncome),
    rateRange: scheme.finance.ratePct,
    tenureRange: scheme.finance.tenureMonths,
    moratoriumRange: scheme.finance.moratoriumMonths,
  }
}
