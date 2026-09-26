import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { formatINR, formatPct } from '@/shared/lib/format'
import { MoneyBar } from '@/shared/components/MoneyBar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { SchemeCardView } from '../domain/resultView'
import { moneySegments } from './moneySegments'

export function SchemeCard({ view, top, onSeeDetails }: { view: SchemeCardView; top?: boolean; onSeeDetails: (schemeId: string) => void }) {
  const { t, i18n } = useTranslation()
  const segments = moneySegments(view.financePlan, t)
  const summary = t('recommender.money.summary', { total: formatINR(view.financePlan.projectCost) })

  return (
    <Card className={top ? 'ring-2 ring-primary' : undefined}>
      <CardHeader>
        {top && <Badge variant="secondary">{t('recommender.schemes.topMatch')}</Badge>}
        <CardTitle>{pick(view.name, i18n.language)}</CardTitle>
        <p className="text-muted-foreground">{pick(view.agency, i18n.language)}</p>
        <Badge variant="outline">{t(`recommender.schemes.kind.${view.kind}`)}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <MoneyBar segments={segments} summary={summary} />
        {view.reasonKeys.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('recommender.schemes.whyItFits')}</p>
            <ul className="mt-1 list-inside list-disc text-sm">
              {view.reasonKeys.map((k) => (
                <li key={k}>{t(`${k}.pass`)}</li>
              ))}
            </ul>
          </div>
        )}
        {view.priorityKeys.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {view.priorityKeys.map((k) => (
              <Badge key={k} variant="secondary">
                {t(k)}
              </Badge>
            ))}
          </div>
        )}
        {view.lowOdds && view.approvalRatePct !== undefined && (
          <p className="text-sm text-blocked">{t('recommender.schemes.lowOddsWarning', { pct: formatPct(view.approvalRatePct) })}</p>
        )}
        <Button variant="outline" className="h-11 w-full" onClick={() => onSeeDetails(view.schemeId)}>
          {t('recommender.schemes.seeDetails')}
        </Button>
      </CardContent>
    </Card>
  )
}
