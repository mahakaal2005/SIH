import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { ChecklistItem } from './ChecklistItem'
import { PreflightCard } from './PreflightCard'
import { ProjectReportCard } from './ProjectReportCard'
import { SubmitBar } from './SubmitBar'
import { useDocumentsViewModel } from './useDocumentsViewModel'

export function DocumentsScreen() {
  const { t } = useTranslation()
  const { state, submitError, toggleItem, fetchDigiLocker, submit, retry } = useDocumentsViewModel()

  if (state.status === 'loading') {
    return (
      <Screen title={t('documents.title')} backTo={routes.schemes}>
        <LoadingBlock rows={3} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('documents.title')} backTo={routes.schemes}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('documents.title')} backTo={routes.schemes}>
        <p role="alert">{t('documents.notFound')}</p>
      </Screen>
    )
  }

  const view = state.view!

  return (
    <Screen title={t('documents.title')} backTo={routes.schemes} wide>
      <div className="space-y-6">
        <PreflightCard checks={view.preflight} />
        {view.report && <ProjectReportCard report={view.report} />}
        <ul className="space-y-2" data-testid="checklist">
          {view.items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              busy={state.digiLockerBusyId === item.id}
              onToggle={(checked) => toggleItem(item.id, checked)}
              onFetchDigiLocker={() => fetchDigiLocker(item.id)}
            />
          ))}
        </ul>
        <SubmitBar allChecked={view.allChecked} submitting={!!state.submitting} errorKey={submitError} onSubmit={submit} />
      </div>
    </Screen>
  )
}
