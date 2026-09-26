import { useTranslation } from 'react-i18next'
import { formatPct } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'

export function OddsBadge({ approvalRatePct, lowOdds }: { approvalRatePct?: number; lowOdds: boolean }) {
  const { t } = useTranslation()
  if (approvalRatePct === undefined) return null
  return (
    <div className="space-y-1">
      <Badge variant={lowOdds ? 'destructive' : 'outline'}>{t('recommender.odds.rate', { pct: formatPct(approvalRatePct) })}</Badge>
      {lowOdds && <p className="text-sm text-blocked">{t('recommender.odds.lowWarning')}</p>}
    </div>
  )
}
