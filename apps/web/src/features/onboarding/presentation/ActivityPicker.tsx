import { useTranslation } from 'react-i18next'
import type { Activity } from '@ys/shared'
import { ChoiceCards } from '@/shared/components/ChoiceCards'
import { pick } from '@/shared/i18n'
import { ActivityIcon } from '@/shared/lib/icons'

export function ActivityPicker({
  activities,
  value,
  onChange,
  legend,
  error,
}: {
  activities: Activity[]
  value: string | undefined
  onChange: (id: string) => void
  legend: string
  error?: string
}) {
  const { i18n } = useTranslation()
  const business = activities.filter((a) => a.category !== 'education')
  return (
    <ChoiceCards
      name="activityId"
      legend={legend}
      value={value}
      onChange={onChange}
      error={error}
      choices={business.map((a) => ({
        value: a.id,
        label: pick(a.name, i18n.language),
        icon: <ActivityIcon name={a.icon} className="size-6" />,
      }))}
    />
  )
}
