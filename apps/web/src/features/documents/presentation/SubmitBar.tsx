import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'

export function SubmitBar({
  allChecked,
  submitting,
  errorKey,
  onSubmit,
}: {
  allChecked: boolean
  submitting: boolean
  errorKey?: string
  onSubmit: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      {!allChecked && <p className="text-sm text-muted-foreground">{t('documents.submit.needAll')}</p>}
      {errorKey && <p role="alert" className="text-sm text-blocked">{t(errorKey)}</p>}
      <Button className="h-11 w-full" disabled={!allChecked || submitting} onClick={onSubmit}>
        {submitting ? t('documents.submit.busy') : t('documents.submit.cta')}
      </Button>
    </div>
  )
}
