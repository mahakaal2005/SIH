import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { formatDate } from '@/shared/lib/format'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useOfficerRulesViewModel } from './useOfficerRulesViewModel'

export function OfficerRulesScreen() {
  const { t, i18n } = useTranslation()
  const { catalog, scheme, schemeId, setSchemeId, history } = useOfficerRulesViewModel()

  if (catalog.isLoading) {
    return (
      <Screen title={t('officer.rules.title')}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (catalog.isError) {
    return (
      <Screen title={t('officer.rules.title')}>
        <ErrorBlock messageKey="errors.generic" onRetry={() => void catalog.refetch()} />
      </Screen>
    )
  }

  return (
    <Screen title={t('officer.rules.title')} wide>
      <div className="space-y-6">
        <div className="max-w-sm">
          <label htmlFor="scheme-picker" className="mb-1 block text-sm font-medium">
            {t('officer.rules.schemePicker')}
          </label>
          <select
            id="scheme-picker"
            className="h-11 w-full rounded-md border border-input bg-card px-3"
            value={schemeId}
            onChange={(e) => setSchemeId(e.target.value)}
          >
            {catalog.data!.schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {pick(s.name, i18n.language)}
              </option>
            ))}
          </select>
        </div>

        {scheme && (
          <div className="space-y-4" data-testid="rule-history">
            {history.isLoading && <LoadingBlock rows={2} />}
            {history.isSuccess && history.data.length === 0 && <p className="text-muted-foreground">{t('officer.rules.noHistory')}</p>}
            {history.isSuccess &&
              history.data.map((rule) => (
                <Card key={rule.version} data-testid={`rule-version-${rule.version}`}>
                  <CardHeader>
                    <CardTitle>{t('officer.rules.version', { version: rule.version, date: formatDate(rule.effectiveFrom) })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">{t('officer.rules.criteriaTitle')}</p>
                      <ul className="list-inside list-disc text-sm">
                        {rule.criteria.map((clause, i) => (
                          <li key={i}>
                            {clause.criterion.field} {clause.criterion.op} {'value' in clause.criterion ? JSON.stringify(clause.criterion.value) : ''}
                            {' — '}
                            {clause.criterion.reasonKey}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {rule.priority.length > 0 && (
                      <div>
                        <p className="mb-1 text-sm font-medium text-muted-foreground">{t('officer.rules.priorityTitle')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rule.priority.map((p, i) => (
                            <Badge key={i} variant="secondary">
                              {p.reasonKey}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
