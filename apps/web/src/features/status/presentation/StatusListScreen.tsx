import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { pick } from '@/shared/i18n'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { formatDate } from '@/shared/lib/format'
import { useStatusListViewModel } from './useStatusListViewModel'

export function StatusListScreen() {
  const { t, i18n } = useTranslation()
  const { state, retry } = useStatusListViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.home}>
        <LoadingBlock rows={3} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.home}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'empty') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.home}>
        <EmptyBlock title={t('status.list.empty.title')}>
          <p>{t('status.list.empty.body')}</p>
          <Button asChild className="mt-3 h-11">
            <Link to={routes.schemes}>{t('status.list.empty.cta')}</Link>
          </Button>
        </EmptyBlock>
      </Screen>
    )
  }

  return (
    <Screen title={t('status.list.title')} backTo={routes.home}>
      <ul className="space-y-3" data-testid="application-list">
        {state.rows!.map((row) => (
          <li key={row.id}>
            <Link to={routes.application(row.id)} data-testid={`application-row-${row.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{pick(row.schemeName, i18n.language)}</span>
                    <Badge variant="outline">{t(`stage.${row.stage}`)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>{row.receiptNo}</p>
                  <p>{t('status.list.submittedOn', { date: formatDate(row.submittedAt) })}</p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
