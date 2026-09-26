import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChoiceCards } from './ChoiceCards'

export function YesNoField({
  name,
  question,
  hint,
  value,
  onChange,
}: {
  name: string
  question: string
  hint?: string
  value: boolean | undefined
  onChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <ChoiceCards
        name={name}
        legend={question}
        describedBy={hint ? `${name}-hint` : undefined}
        value={value === undefined ? undefined : value ? 'yes' : 'no'}
        onChange={(v) => onChange(v === 'yes')}
        choices={[
          { value: 'yes', label: t('common.yes'), icon: <Check className="size-5" /> },
          { value: 'no', label: t('common.no'), icon: <X className="size-5" /> },
        ]}
      />
      {hint && (
        <p id={`${name}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
