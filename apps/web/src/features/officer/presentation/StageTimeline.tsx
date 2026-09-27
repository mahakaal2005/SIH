import { Check, Circle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import type { TimelineStep } from './useOfficerApplicationViewModel'

/** Officer-side copy of the citizen status timeline visual (features may not import each other). */
export function StageTimeline({ steps }: { steps: TimelineStep[] }) {
  const { t } = useTranslation()
  return (
    <ol className="space-y-4" data-testid="officer-timeline">
      {steps.map((step) => (
        <li key={step.stage} className="flex gap-3" data-testid={`officer-timeline-step-${step.stage}`} data-status={step.status}>
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border',
              step.status === 'done' && 'border-pass bg-pass-soft text-pass',
              step.status === 'current' && 'border-primary bg-primary/10 text-primary',
              step.status === 'upcoming' && 'border-border text-muted-foreground',
            )}
          >
            {step.status === 'done' && <Check aria-hidden className="size-4" />}
            {step.status === 'current' && <Loader2 aria-hidden className="size-4 animate-spin" />}
            {step.status === 'upcoming' && <Circle aria-hidden className="size-3" />}
          </span>
          <div>
            <p className={cn('font-medium', step.status === 'upcoming' && 'text-muted-foreground')}>{t(`stage.${step.stage}`)}</p>
            <p className="text-sm text-muted-foreground">
              {step.actualAt
                ? t('officer.detail.timeline.reachedOn', { date: formatDate(step.actualAt) })
                : t('officer.detail.timeline.expected', { date: formatDate(step.expectedEnd) })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
