import { FlaskConical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/** Marks a value that has no public source yet (docs/05 data-honesty statement). */
export function SeededBadge() {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 px-2 py-0.5 text-xs text-muted-foreground"
      >
        <FlaskConical aria-hidden className="size-3" />
        {t('common.seededData')}
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{t('common.seededDataHint')}</TooltipContent>
    </Tooltip>
  )
}
