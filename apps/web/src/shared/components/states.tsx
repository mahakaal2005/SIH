import { AlertTriangle, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  const { t } = useTranslation()
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function ErrorBlock({ messageKey, onRetry }: { messageKey: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="rounded-xl border border-blocked/30 bg-blocked-soft p-4">
      <p className="flex gap-2 text-foreground">
        <AlertTriangle aria-hidden className="mt-1 size-5 shrink-0 text-blocked" />
        <span>{t(messageKey)}</span>
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-3 h-11" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}

export function EmptyBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center">
      <Inbox aria-hidden className="mx-auto mb-2 size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-muted-foreground">{children}</div>}
    </div>
  )
}
