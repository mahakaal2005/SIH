import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { routes } from '@/core/router/routes'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { REJECT_REASONS, useOfficerApplicationViewModel } from './useOfficerApplicationViewModel'
import { StageTimeline } from './StageTimeline'

export function OfficerApplicationScreen() {
  const { t } = useTranslation()
  const { state, application, act, retry } = useOfficerApplicationViewModel()
  const [pendingAction, setPendingAction] = useState<'reject' | 'return_for_fix'>()
  const [reason, setReason] = useState('')

  if (state.status === 'loading') {
    return (
      <Screen title={t('officer.queue.title')} backTo={routes.officer}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('officer.queue.title')} backTo={routes.officer}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('officer.queue.title')} backTo={routes.officer}>
        <p role="alert">{t('errors.application.notFound')}</p>
      </Screen>
    )
  }

  const view = state.view!
  const app = application!

  function confirmReason() {
    if (!pendingAction || !reason) return
    void act(pendingAction, reason)
    setPendingAction(undefined)
    setReason('')
  }

  return (
    <Screen title={t('officer.detail.title', { receiptNo: app.receiptNo })} backTo={routes.officer} wide>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <StageTimeline steps={view.steps} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-medium">{t('officer.detail.actions.title')}</h2>
            {state.actError && <p className="text-sm text-blocked">{t(state.actError)}</p>}
            <div className="flex flex-wrap gap-2">
              {view.actions.map((action) =>
                action === 'reject' || action === 'return_for_fix' ? (
                  <Button key={action} variant="outline" disabled={!!state.acting} onClick={() => setPendingAction(action)}>
                    {t(`officer.detail.actions.${action}`)}
                  </Button>
                ) : (
                  <Button key={action} disabled={!!state.acting} onClick={() => void act(action)}>
                    {t(`officer.detail.actions.${action}`)}
                  </Button>
                ),
              )}
            </div>
            {pendingAction && (
              <div className="flex flex-wrap items-end gap-2 rounded-xl border p-3">
                <div>
                  <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium">
                    {t('officer.detail.reasonPrompt.title')}
                  </label>
                  <select
                    id="reject-reason"
                    className="h-11 w-64 rounded-md border border-input bg-card px-3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="" disabled>
                      {t('officer.detail.reasonPrompt.title')}
                    </option>
                    {REJECT_REASONS.map((key) => (
                      <option key={key} value={key}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </div>
                <Button disabled={!reason} onClick={confirmReason}>
                  {t('officer.detail.reasonPrompt.cta')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Screen>
  )
}
