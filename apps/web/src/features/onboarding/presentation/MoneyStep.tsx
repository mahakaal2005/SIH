import { LockKeyhole } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import { YesNoField } from '@/shared/components/YesNoField'
import { NumberField, useQuestion, type ProfileForm } from './fields'

const HISTORY = ['isDefaulter', 'settledViaOTS', 'alreadyFinancedElsewhere', 'hasDisability'] as const

export function MoneyStep({ form, assisted }: { form: ProfileForm; assisted: boolean }) {
  const { t } = useTranslation()
  const q = useQuestion(assisted)
  return (
    <div className="space-y-6">
      <NumberField
        form={form}
        field="annualFamilyIncome"
        prefix="₹"
        voice
        label={q('annualFamilyIncome')}
        hint={t('onboarding.profile.incomeHint')}
      />
      {HISTORY.map((name) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => <YesNoField name={name} question={q(name)} value={field.value} onChange={field.onChange} />}
        />
      ))}
      <p className="flex gap-2 rounded-xl bg-secondary p-4 text-sm">
        <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        {t('onboarding.profile.privacy')}
      </p>
    </div>
  )
}
