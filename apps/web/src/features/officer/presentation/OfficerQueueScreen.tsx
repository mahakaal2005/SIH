import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routes } from '@/core/router/routes'
import { pick } from '@/shared/i18n'
import { Screen } from '@/shared/components/Screen'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Switch } from '@/shared/ui/switch'
import { useCatalog } from '@/core/data/queries'
import { useOfficerQueueViewModel } from './useOfficerQueueViewModel'

export function OfficerQueueScreen() {
  const { t, i18n } = useTranslation()
  const catalog = useCatalog()
  const { state, displayedRows, showStalledOnly, setShowStalledOnly, showCallList, setShowCallList, retry } = useOfficerQueueViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('officer.queue.title')}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('officer.queue.title')}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }

  const filters = (
    <div className="mb-4 flex flex-wrap gap-6">
      <label className="flex items-center gap-2">
        <Switch checked={showStalledOnly} onCheckedChange={setShowStalledOnly} />
        {t('officer.queue.stalledOnly')}
      </label>
      <label className="flex items-center gap-2">
        <Switch checked={showCallList} onCheckedChange={setShowCallList} />
        {t('officer.queue.callList')}
      </label>
    </div>
  )

  if (state.status === 'empty') {
    return (
      <Screen title={t('officer.queue.title')} wide>
        {filters}
        <EmptyBlock title={t('officer.queue.empty.title')}>{t('officer.queue.empty.body')}</EmptyBlock>
      </Screen>
    )
  }

  return (
    <Screen title={t('officer.queue.title')} wide>
      {filters}
      <ul className="space-y-3" data-testid="officer-queue">
        {displayedRows.map((row) => {
          const scheme = catalog.data?.schemes.find((s) => s.id === row.application.schemeId)
          return (
            <li key={row.application.id}>
              <Link to={routes.officerApplication(row.application.id)} data-testid={`queue-row-${row.application.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span>{scheme ? pick(scheme.name, i18n.language) : row.application.schemeId}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{t(`stage.${row.application.stage}`)}</Badge>
                        {row.stalled && <Badge variant="destructive">{t('officer.queue.stalledBadge')}</Badge>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{row.application.receiptNo}</p>
                    <p>{t('officer.queue.daysInStage', { days: row.daysInStage })}</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
