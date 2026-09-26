import { TRAINING_RATE_PER_HOUR } from '../seed/projects'
import type { DocumentRequirement, Scheme } from '../types/domain'
import { computeGiaSplit, computeLoanFinancing, type GiaSplit } from './finance'

export function documentsForScheme(scheme: Scheme, all: DocumentRequirement[]): DocumentRequirement[] {
  const common = all.filter((d) => d.appliesTo === 'all')
  const extra = scheme.extraDocumentIds.map((id) => all.find((d) => d.id === id)).filter((d): d is DocumentRequirement => !!d)
  return [...common, ...extra]
}

export interface FinancePlan {
  kind: Scheme['kind']
  projectCost: number
  loan: number
  grant: number
  /** PMEGP margin money, credited to the loan account after the 3-year lock-in. */
  subsidy: number
  ownContribution: number
  cappedByMaxLoan: boolean
  gia?: GiaSplit
}

export function financePlan(
  scheme: Scheme,
  input: { projectCost: number; area: 'rural' | 'urban'; trainingHours?: number },
): FinancePlan {
  const { projectCost } = input
  const f = scheme.finance

  if (scheme.kind === 'grant_plus_loan' && f.grant) {
    const gia = computeGiaSplit({
      projectCost,
      grant: f.grant,
      contributionShare: f.beneficiaryContributionShare ?? 0,
      trainingCost: Math.round((input.trainingHours ?? 0) * TRAINING_RATE_PER_HOUR),
      cgtmseFeePct: f.cgtmseFeePct ?? 0,
    })
    return {
      kind: scheme.kind, projectCost, loan: gia.netLoan, grant: gia.grant, subsidy: 0,
      ownContribution: gia.beneficiaryContribution, cappedByMaxLoan: false, gia,
    }
  }

  if (scheme.kind === 'subsidy_plus_loan') {
    const ownContribution = Math.round(projectCost * (f.beneficiaryContributionShare ?? 0))
    return {
      kind: scheme.kind, projectCost, loan: projectCost - ownContribution, grant: 0,
      subsidy: Math.round(projectCost * (f.subsidyShare?.[input.area] ?? 0)), ownContribution, cappedByMaxLoan: false,
    }
  }

  const { loan, ownContribution, cappedByMaxLoan } = computeLoanFinancing(projectCost, f)
  return { kind: scheme.kind, projectCost, loan, grant: 0, subsidy: 0, ownContribution, cappedByMaxLoan }
}

export interface ReceiptPayload {
  receiptNo: string
  schemeId: string
  ruleVersion: number
  districtId: string
  applicantName: string
  loanAmount: number
  grantAmount: number
  submittedAt: string
}

/** Stable serialisation that is signed at submission and re-derived to verify a receipt or sanction letter. */
export function canonicalReceiptPayload(p: ReceiptPayload): string {
  const keys = Object.keys(p).sort() as (keyof ReceiptPayload)[]
  return JSON.stringify(keys.map((k) => [k, p[k]]))
}
