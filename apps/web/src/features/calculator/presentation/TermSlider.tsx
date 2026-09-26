import { useTranslation } from 'react-i18next'
import { Slider } from '@/shared/ui/slider'

export function TermSlider({
  labelKey,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
}: {
  labelKey: string
  value: number
  min: number
  max: number
  step?: number
  formatValue: (value: number) => string
  onChange: (value: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{t(labelKey)}</span>
        <span className="figure text-muted-foreground">{formatValue(value)}</span>
      </div>
      <Slider
        aria-label={t(labelKey)}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => v !== undefined && onChange(v)}
      />
    </div>
  )
}
