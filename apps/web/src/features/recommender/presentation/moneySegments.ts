import type { FinancePlan } from '@ys/shared'
import type { MoneySegment } from '@/shared/components/MoneyBar'

export function moneySegments(plan: FinancePlan, t: (key: string) => string): MoneySegment[] {
  const segments: MoneySegment[] = [
    { kind: 'own', amount: plan.ownContribution, label: t('recommender.money.own') },
    { kind: 'grant', amount: plan.grant, label: t('recommender.money.grant') },
    { kind: 'subsidy', amount: plan.subsidy, label: t('recommender.money.subsidy') },
    { kind: 'loan', amount: plan.loan, label: t('recommender.money.loan') },
  ]
  return segments.filter((s) => s.amount > 0)
}
