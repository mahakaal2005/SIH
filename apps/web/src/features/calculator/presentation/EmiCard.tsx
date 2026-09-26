import { useTranslation } from 'react-i18next'
import { formatINR } from '@/shared/lib/format'
import type { CalculatorView } from '../domain/calculatorView'

export function EmiCard({ view }: { view: CalculatorView }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-2 rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{t('calculator.emi.principal', { amount: formatINR(view.financePlan.loan) })}</p>
      <p className="figure text-3xl font-bold">{t('calculator.emi.perMonth', { amount: formatINR(view.emi.emi) })}</p>
      <p className="text-sm text-muted-foreground">{t('calculator.emi.totalInterest', { amount: formatINR(view.emi.totalInterest) })}</p>
      <p className="text-sm text-muted-foreground">{t('calculator.emi.totalPayable', { amount: formatINR(view.emi.totalPayable) })}</p>
      {view.financePlan.cappedByMaxLoan && <p className="text-sm text-caution">{t('calculator.emi.capped')}</p>}
    </section>
  )
}
