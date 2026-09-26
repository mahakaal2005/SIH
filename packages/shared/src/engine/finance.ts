import type { Rupees } from '../types/common'

const round2 = (n: number) => Math.round(n * 100) / 100

export interface EmiInput {
  principal: Rupees
  annualRatePct: number
  /** Repayment months after the moratorium ends. */
  tenureMonths: number
  moratoriumMonths: number
}

export interface EmiResult {
  emi: number
  capitalisedInterest: number
  totalInterest: number
  totalPayable: number
}

/**
 * Simple interest accrues during the moratorium and is capitalised into the principal,
 * which is then amortised over `tenureMonths` at a monthly-reducing rate.
 */
export function computeEmi({ principal, annualRatePct, tenureMonths, moratoriumMonths }: EmiInput): EmiResult {
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) throw new RangeError('tenureMonths must be a positive integer')
  if (moratoriumMonths < 0) throw new RangeError('moratoriumMonths must be ≥ 0')
  if (principal <= 0) return { emi: 0, capitalisedInterest: 0, totalInterest: 0, totalPayable: 0 }

  const capitalisedInterest = round2((principal * annualRatePct * moratoriumMonths) / 1200)
  const amortised = principal + capitalisedInterest
  const r = annualRatePct / 1200
  const emi = round2(r === 0 ? amortised / tenureMonths : (amortised * r) / (1 - (1 + r) ** -tenureMonths))
  const totalPayable = round2(emi * tenureMonths)
  return { emi, capitalisedInterest, totalInterest: round2(totalPayable - principal), totalPayable }
}

export function computeLoanFinancing(
  projectCost: Rupees,
  finance: { financingShare?: number; maxLoan?: Rupees },
): { loan: Rupees; ownContribution: Rupees; cappedByMaxLoan: boolean } {
  const byShare = Math.round(projectCost * (finance.financingShare ?? 1))
  const cappedByMaxLoan = finance.maxLoan !== undefined && byShare > finance.maxLoan
  const loan = cappedByMaxLoan ? finance.maxLoan! : byShare
  return { loan, ownContribution: projectCost - loan, cappedByMaxLoan }
}

export interface GiaSplitInput {
  projectCost: Rupees
  grant: { maxAmount: Rupees; maxShareOfCost: number }
  contributionShare: number
  /** Funded by the scheme, not the beneficiary; shown because the SOP project report must state it. */
  trainingCost: Rupees
  cgtmseFeePct: number
}

export interface GiaSplit {
  totalCost: Rupees
  beneficiaryContribution: Rupees
  grant: Rupees
  trainingCost: Rupees
  netLoan: Rupees
  cgtmseFeeAnnual: Rupees
  /** SOP D4 requires all five components; empty means the report is complete. */
  missingComponents: string[]
}

export const SOP_COMPONENTS = ['totalCost', 'beneficiaryContribution', 'grant', 'trainingCost', 'cgtmseFeeAnnual'] as const

export function computeGiaSplit(i: GiaSplitInput): GiaSplit {
  const beneficiaryContribution = Math.round(i.projectCost * i.contributionShare)
  const grant = Math.min(i.grant.maxAmount, Math.round(i.projectCost * i.grant.maxShareOfCost), i.projectCost - beneficiaryContribution)
  const netLoan = Math.max(0, i.projectCost - beneficiaryContribution - grant)
  const split = {
    totalCost: i.projectCost,
    beneficiaryContribution,
    grant,
    trainingCost: i.trainingCost,
    netLoan,
    cgtmseFeeAnnual: round2((netLoan * i.cgtmseFeePct) / 100),
  }
  const missingComponents = SOP_COMPONENTS.filter((k) => !Number.isFinite(split[k]) || split[k] < 0)
  return { ...split, missingComponents }
}

export type AffordabilityLevel = 'ok' | 'stretch' | 'unaffordable'

export const AFFORDABILITY_THRESHOLDS = { stretch: 0.35, unaffordable: 0.5 } as const

export function assessAffordability(emi: number, annualFamilyIncome: Rupees): { ratio: number; level: AffordabilityLevel } {
  const monthly = annualFamilyIncome / 12
  if (monthly <= 0) return { ratio: emi > 0 ? Infinity : 0, level: emi > 0 ? 'unaffordable' : 'ok' }
  const ratio = round2(emi / monthly)
  const level = ratio > AFFORDABILITY_THRESHOLDS.unaffordable ? 'unaffordable' : ratio > AFFORDABILITY_THRESHOLDS.stretch ? 'stretch' : 'ok'
  return { ratio, level }
}
