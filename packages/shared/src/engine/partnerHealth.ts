import type { HealthPolicy, PartnerHealth, PartnerType } from '../types/domain'

export type CheckResult = 'pass' | 'caution' | 'fail'
export type HealthStatus = 'healthy' | 'caution' | 'blocked'

export interface HealthCheck {
  key: 'overdue' | 'utilisation' | 'rrbNpa' | 'psbOverdue'
  result: CheckResult
  actual: number | boolean
  limit: number | boolean
}

export interface HealthAssessment {
  status: HealthStatus
  checks: HealthCheck[]
}

export function assessPartnerHealth(type: PartnerType, h: PartnerHealth, p: HealthPolicy): HealthAssessment {
  const checks: HealthCheck[] = [
    {
      key: 'overdue',
      result: h.overdueToNsfdcOver1YearRupees > p.maxOverdueOver1YearRupees ? 'fail' : 'pass',
      actual: h.overdueToNsfdcOver1YearRupees,
      limit: p.maxOverdueOver1YearRupees,
    },
    {
      key: 'utilisation',
      result:
        h.cumulativeUtilisationPct < p.minCumulativeUtilisationPct
          ? 'fail'
          : h.cumulativeUtilisationPct < p.minCumulativeUtilisationPct + p.cautionMarginPct
            ? 'caution'
            : 'pass',
      actual: h.cumulativeUtilisationPct,
      limit: p.minCumulativeUtilisationPct,
    },
  ]

  if (type === 'RRB') {
    const window = (h.netNpaPctLast6Years ?? []).slice(-p.rrbWindowYears)
    const yearsUnder = window.filter((n) => n < p.rrbMaxNetNpaPct).length
    checks.push({
      key: 'rrbNpa',
      result: yearsUnder >= p.rrbMinYearsUnderNpaLimit ? 'pass' : 'fail',
      actual: yearsUnder,
      limit: p.rrbMinYearsUnderNpaLimit,
    })
  }

  if (type === 'PSB') {
    checks.push({
      key: 'psbOverdue',
      result: h.hasOverdueAtDisbursement ? 'fail' : 'pass',
      actual: h.hasOverdueAtDisbursement ?? false,
      limit: false,
    })
  }

  const status: HealthStatus = checks.some((c) => c.result === 'fail')
    ? 'blocked'
    : checks.some((c) => c.result === 'caution')
      ? 'caution'
      : 'healthy'
  return { status, checks }
}
