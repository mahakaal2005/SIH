import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { routes } from '@/core/router/routes'
import { pick } from '@/shared/i18n'
import { Screen } from '@/shared/components/Screen'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { NotificationFeed } from './NotificationFeed'
import { Timeline } from './Timeline'
import { useApplicationDetailViewModel } from './useApplicationDetailViewModel'

export function ApplicationDetailScreen() {
  const { t, i18n } = useTranslation()
  const { state, resubmit, markNotificationRead, retry } = useApplicationDetailViewModel()
  const [showReceipt, setShowReceipt] = useState(false)

  if (state.status === 'loading') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.status}>
        <LoadingBlock rows={4} />
      </Screen>
    )
  }
  if (state.status === 'error') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.status}>
        <ErrorBlock messageKey={state.errorKey!} onRetry={retry} />
      </Screen>
    )
  }
  if (state.status === 'notFound') {
    return (
      <Screen title={t('status.list.title')} backTo={routes.status}>
        <p role="alert">{t('errors.application.notFound')}</p>
      </Screen>
    )
  }

  const view = state.view!

  return (
    <Screen title={pick(view.schemeName, i18n.language)} lead={view.receiptNo} backTo={routes.status} wide>
      <div className="space-y-6">
        {view.terminal === 'rejected' && (
          <Card className="border-blocked/30 bg-blocked-soft" data-testid="terminal-banner">
            <CardContent className="space-y-2 pt-6">
              <p className="font-medium text-blocked">{t('status.detail.banner.rejected.title')}</p>
              {view.rejectionReasonKey && <p className="text-sm">{t(view.rejectionReasonKey)}</p>}
              <Button asChild variant="outline" className="h-11">
                <Link to={routes.schemes}>{t('status.detail.banner.rejected.cta')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {view.terminal === 'returned' && (
          <Card className="border-caution/30 bg-caution-soft" data-testid="terminal-banner">
            <CardContent className="space-y-2 pt-6">
              <p className="font-medium text-caution">{t('status.detail.banner.returned.title')}</p>
              {view.rejectionReasonKey && <p className="text-sm">{t(view.rejectionReasonKey)}</p>}
              {state.resubmitError && <p className="text-sm text-blocked">{t(state.resubmitError)}</p>}
              <Button className="h-11" disabled={!!state.resubmitting} onClick={resubmit}>
                {state.resubmitting ? t('status.detail.banner.returned.busy') : t('status.detail.banner.returned.cta')}
              </Button>
            </CardContent>
          </Card>
        )}
        {(view.terminal === 'disbursed' || view.terminal === 'srf_lock' || view.terminal === 'completed') && (
          <Card className="border-pass/30 bg-pass-soft" data-testid="terminal-banner">
            <CardContent className="pt-6">
              <p className="font-medium text-pass">{t('status.detail.banner.success')}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <Timeline steps={view.steps} />
          </CardContent>
        </Card>

        <NotificationFeed notifications={state.notifications ?? []} onRead={markNotificationRead} />

        <div>
          <Button variant="outline" className="h-11" onClick={() => setShowReceipt((v) => !v)}>
            {showReceipt ? t('status.detail.receipt.hide') : t('status.detail.receipt.show')}
          </Button>
          {showReceipt && (
            <Card className="mt-2">
              <CardContent className="space-y-2 pt-6">
                <code className="block break-all text-xs" data-testid="receipt-code">{view.receiptCode}</code>
                <p className="text-sm text-muted-foreground">{t('status.detail.receipt.warning')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Screen>
  )
}
