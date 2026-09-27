import { useTranslation } from 'react-i18next'
import type { PreflightResult } from '@/core/data/repositories/types'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const STATUS_STYLE = {
  pass: 'border-pass/30 bg-pass-soft text-pass',
  warn: 'border-caution/30 bg-caution-soft text-caution',
  fail: 'border-blocked/30 bg-blocked-soft text-blocked',
} as const

export function PreflightCard({ checks }: { checks: PreflightResult[] }) {
  const { t } = useTranslation()
  const hasFailure = checks.some((c) => c.status === 'fail')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('documents.preflight.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div key={check.id} className={cn('rounded-xl border p-2 text-sm', STATUS_STYLE[check.status])}>
            {t(check.detailKey, check.params)}
          </div>
        ))}
        {hasFailure && <p className="text-sm text-muted-foreground">{t('documents.preflight.notBlocking')}</p>}
      </CardContent>
    </Card>
  )
}
