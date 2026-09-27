import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { HealthBadge } from '@/shared/components/HealthBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useOfficerPartnersViewModel } from './useOfficerPartnersViewModel'

export function OfficerPartnersScreen() {
  const { t, i18n } = useTranslation()
  const { state, retry } = useOfficerPartnersViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('officer.partners.title')}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('officer.partners.title')}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }

  return (
    <Screen title={t('officer.partners.title')} wide>
      <ul className="grid gap-3 sm:grid-cols-2" data-testid="partner-health-list">
        {state.rows!.map((row) => (
          <li key={row.entity.id}>
            <Card>
              <CardHeader>
                <CardTitle>{pick(row.entity.name, i18n.language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <HealthBadge health={row.assessment} />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
