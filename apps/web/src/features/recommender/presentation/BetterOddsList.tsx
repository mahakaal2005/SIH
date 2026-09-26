import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routes } from '@/core/router/routes'
import { pick } from '@/shared/i18n'
import { formatPct } from '@/shared/lib/format'
import type { BetterOddsView } from '../domain/oddsView'

export function BetterOddsList({ items }: { items: BetterOddsView[] }) {
  const { t, i18n } = useTranslation()
  if (items.length === 0) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{t('recommender.odds.betterTitle')}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item.schemeId}>
            <Link to={routes.scheme(item.schemeId)} className="text-primary underline-offset-4 hover:underline">
              {pick(item.name, i18n.language)} — {formatPct(item.approvalRatePct)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
