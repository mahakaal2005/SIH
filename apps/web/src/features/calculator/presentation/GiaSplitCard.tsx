import { useTranslation } from 'react-i18next'
import type { GiaSplit } from '@ys/shared'
import { formatINR } from '@/shared/lib/format'

export function GiaSplitCard({ gia }: { gia: GiaSplit }) {
  const { t } = useTranslation()
  const rows: Array<[string, number]> = [
    ['calculator.gia.totalCost', gia.totalCost],
    ['calculator.gia.contribution', gia.beneficiaryContribution],
    ['calculator.gia.grant', gia.grant],
    ['calculator.gia.training', gia.trainingCost],
    ['calculator.gia.cgtmse', gia.cgtmseFeeAnnual],
    ['calculator.gia.netLoan', gia.netLoan],
  ]
  return (
    <section className="space-y-2 rounded-xl border p-4">
      <h2 className="text-lg font-bold">{t('calculator.gia.title')}</h2>
      <dl className="space-y-1.5 text-sm">
        {rows.map(([key, amount]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t(key)}</dt>
            <dd className="figure">{formatINR(amount)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
