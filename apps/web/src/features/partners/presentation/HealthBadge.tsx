import { useTranslation } from 'react-i18next'
import type { HealthAssessment } from '@ys/shared'
import { cn } from '@/shared/lib/utils'

const STATUS_STYLE = {
  healthy: 'border-pass/30 bg-pass-soft text-pass',
  caution: 'border-caution/30 bg-caution-soft text-caution',
  blocked: 'border-blocked/30 bg-blocked-soft text-blocked',
} as const

export function HealthBadge({ health }: { health: HealthAssessment }) {
  const { t } = useTranslation()
  const reasonCheck = health.checks.find((c) => c.result !== 'pass')
  return (
    <div className={cn('inline-flex flex-col gap-0.5 rounded-xl border p-2 text-sm', STATUS_STYLE[health.status])}>
      <span className="font-medium">{t(`partners.health.status.${health.status}`)}</span>
      {reasonCheck && <span className="text-xs">{t(`partners.health.reason.${reasonCheck.key}`)}</span>}
    </div>
  )
}
