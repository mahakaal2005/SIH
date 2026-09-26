import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { formatINR } from '@/shared/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { NearMissView } from '../domain/resultView'

export function NearMissList({ items }: { items: NearMissView[] }) {
  const { t, i18n } = useTranslation()
  if (items.length === 0) return null
  return (
    <section aria-labelledby="near-miss-title">
      <h2 id="near-miss-title" className="mb-1 text-lg font-bold">
        {t('recommender.schemes.nearMissTitle')}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">{t('recommender.schemes.nearMissHint')}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.schemeId} size="sm">
            <CardHeader>
              <CardTitle>{pick(item.name, i18n.language)}</CardTitle>
              <p className="text-muted-foreground">{pick(item.agency, i18n.language)}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t('rule.nearMiss', { gap: formatINR(item.gap), limit: formatINR(item.limit) })}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
