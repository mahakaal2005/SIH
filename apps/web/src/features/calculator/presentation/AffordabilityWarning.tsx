import { useTranslation } from 'react-i18next'
import type { AffordabilityLevel } from '@ys/shared'
import { cn } from '@/shared/lib/utils'

export function AffordabilityWarning({ level }: { level: AffordabilityLevel }) {
  const { t } = useTranslation()
  if (level === 'ok') return <p className="text-sm text-pass">{t('calculator.affordability.ok')}</p>
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-3 text-sm',
        level === 'stretch' ? 'border-caution/30 bg-caution-soft text-caution' : 'border-blocked/30 bg-blocked-soft text-blocked',
      )}
    >
      {t(`calculator.affordability.${level}`)}
    </div>
  )
}
