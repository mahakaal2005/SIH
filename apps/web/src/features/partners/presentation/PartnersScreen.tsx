import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { PartnerCard } from './PartnerCard'
import { PartnersMap } from './PartnersMap'
import { usePartnersViewModel } from './usePartnersViewModel'

export function PartnersScreen() {
  const { t } = useTranslation()
  const { state, choosePartner, retry } = usePartnersViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('partners.title')} backTo={routes.schemes}>
        <LoadingBlock rows={3} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('partners.title')} backTo={routes.schemes}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('partners.title')} backTo={routes.schemes}>
        <p role="alert">{t('partners.notFound')}</p>
      </Screen>
    )
  }

  const view = state.view!
  const center = view[0]?.match.district ?? { lat: 26.85, lng: 80.95 }

  return (
    <Screen title={t('partners.title')} backTo={routes.schemes} wide>
      <div className="space-y-4">
        <PartnersMap items={view} center={center} selectedBranchId={state.selectedBranchId} onSelect={choosePartner} />
        <div className="space-y-3" data-testid="partner-list">
          {view.map((item) => (
            <PartnerCard
              key={item.match.branch.id}
              item={item}
              selected={item.match.branch.id === state.selectedBranchId}
              onSelect={choosePartner}
            />
          ))}
        </div>
      </div>
    </Screen>
  )
}
