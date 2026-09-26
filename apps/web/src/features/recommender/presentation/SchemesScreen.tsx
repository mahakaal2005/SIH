import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock, EmptyBlock } from '@/shared/components/states'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { NearMissList } from './NearMissList'
import { SchemeCard } from './SchemeCard'
import { useSchemesViewModel } from './useSchemesViewModel'
import { WhyNotList } from './WhyNotList'

export function SchemesScreen() {
  const { t } = useTranslation()
  const { state, retry, seeDetails } = useSchemesViewModel()

  return (
    <Screen title={t('recommender.schemes.title')} lead={t('recommender.schemes.lead')} backTo={routes.profile}>
      {state.status === 'loading' && <LoadingBlock rows={3} />}
      {state.status === 'error' && <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />}
      {state.status === 'empty' && (
        <EmptyBlock title={t('recommender.schemes.emptyTitle')}>{t('recommender.schemes.emptyBody')}</EmptyBlock>
      )}
      {state.status === 'success' && state.view && (
        <div className="space-y-8">
          {state.view.fallbackUsed && (
            <Alert>
              <AlertDescription>{t('recommender.schemes.alsoAvailableBanner')}</AlertDescription>
            </Alert>
          )}
          {state.view.topMatch && <SchemeCard view={state.view.topMatch} top onSeeDetails={seeDetails} />}
          {state.view.eligible.length > 0 && (
            <section aria-labelledby="other-eligible-title">
              <h2 id="other-eligible-title" className="mb-3 text-lg font-bold">
                {t('recommender.schemes.otherEligibleTitle')}
              </h2>
              <div className="space-y-3">
                {state.view.eligible.map((view) => (
                  <SchemeCard key={view.schemeId} view={view} onSeeDetails={seeDetails} />
                ))}
              </div>
            </section>
          )}
          <NearMissList items={state.view.nearMisses} />
          {!state.view.fallbackUsed && state.view.alsoAvailable.length > 0 && (
            <section aria-labelledby="also-available-title">
              <h2 id="also-available-title" className="mb-3 text-lg font-bold">
                {t('recommender.schemes.alsoAvailableTitle')}
              </h2>
              <div className="space-y-3">
                {state.view.alsoAvailable.map((view) => (
                  <SchemeCard key={view.schemeId} view={view} onSeeDetails={seeDetails} />
                ))}
              </div>
            </section>
          )}
          <WhyNotList items={state.view.ineligible} />
        </div>
      )}
    </Screen>
  )
}
