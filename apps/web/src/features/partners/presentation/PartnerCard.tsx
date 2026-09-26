import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { SeededBadge } from '@/shared/components/SeededBadge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import type { PartnerListItem } from '../domain/partnersView'
import { HealthBadge } from './HealthBadge'

export function PartnerCard({
  item,
  selected,
  onSelect,
}: {
  item: PartnerListItem
  selected: boolean
  onSelect: (branchId: string) => void
}) {
  const { t, i18n } = useTranslation()
  const { match, alternative } = item

  return (
    <Card data-testid={`partner-card-${match.branch.id}`} className={selected ? 'ring-2 ring-primary' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {pick(match.branch.name, i18n.language)}
          {match.branch.provenance.kind === 'seeded' && <SeededBadge />}
        </CardTitle>
        <p className="text-muted-foreground">{t('partners.distance', { km: match.distanceKm })}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <HealthBadge health={match.health} />
        <p className="text-sm text-muted-foreground">{match.branch.address}</p>
        {match.branch.phone && <p className="text-sm text-muted-foreground">{match.branch.phone}</p>}
        {match.health.status === 'blocked' &&
          (alternative ? (
            <p className="text-sm">
              {t('partners.alternative', { name: pick(alternative.branch.name, i18n.language) })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('partners.noAlternative')}</p>
          ))}
        <Button
          className="h-11 w-full"
          variant={match.health.status === 'blocked' ? 'outline' : 'default'}
          onClick={() => onSelect(match.branch.id)}
        >
          {t('partners.select')}
        </Button>
      </CardContent>
    </Card>
  )
}
