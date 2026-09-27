import { Building2, Trees } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import { educationLevels, type District } from '@ys/shared'
import { ChoiceCards } from '@/shared/components/ChoiceCards'
import { MicButton } from '@/shared/components/MicButton'
import { YesNoField } from '@/shared/components/YesNoField'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { DistrictSearch } from './DistrictSearch'
import { fieldError, NumberField, useQuestion, type ProfileForm } from './fields'

export function AboutStep({ form, assisted, districts }: { form: ProfileForm; assisted: boolean; districts: District[] }) {
  const { t } = useTranslation()
  const q = useQuestion(assisted)
  const err = (f: Parameters<typeof fieldError>[1]) => fieldError(form, f, t)

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="field-fullName" className="mb-2 block text-base">
          {q('fullName')}
        </Label>
        <div className="flex items-stretch gap-2">
          <Input
            id="field-fullName"
            autoComplete="name"
            className="h-14 flex-1 text-lg"
            aria-invalid={!!err('fullName')}
            {...form.register('fullName')}
          />
          <MicButton
            className="h-14 w-14"
            testId="mic-fullName"
            onResult={(transcript) => form.setValue('fullName', transcript, { shouldValidate: true })}
          />
        </div>
        {err('fullName') && <p className="mt-1.5 text-sm text-blocked">{err('fullName')}</p>}
      </div>

      <NumberField form={form} field="age" label={q('age')} suffix={t('onboarding.profile.years')} voice />

      <Controller
        control={form.control}
        name="gender"
        render={({ field }) => (
          <ChoiceCards
            name="gender"
            legend={q('gender')}
            value={field.value}
            onChange={field.onChange}
            error={err('gender')}
            columns={3}
            choices={(['female', 'male', 'transgender'] as const).map((g) => ({ value: g, label: t(`onboarding.profile.gender.${g}`) }))}
          />
        )}
      />

      <Controller
        control={form.control}
        name="casteCategory"
        render={({ field }) => (
          <ChoiceCards
            name="casteCategory"
            legend={q('casteCategory')}
            value={field.value}
            onChange={field.onChange}
            error={err('casteCategory')}
            choices={(['SC', 'ST', 'OBC', 'GEN'] as const).map((c) => ({ value: c, label: t(`onboarding.profile.caste.${c}`) }))}
          />
        )}
      />

      <Controller
        control={form.control}
        name="districtId"
        render={({ field }) => (
          <DistrictSearch districts={districts} value={field.value} onChange={field.onChange} label={q('districtId')} error={err('districtId')} />
        )}
      />

      <Controller
        control={form.control}
        name="area"
        render={({ field }) => (
          <ChoiceCards
            name="area"
            legend={q('area')}
            value={field.value}
            onChange={field.onChange}
            choices={[
              { value: 'rural', label: t('onboarding.profile.area.rural'), icon: <Trees className="size-6" /> },
              { value: 'urban', label: t('onboarding.profile.area.urban'), icon: <Building2 className="size-6" /> },
            ]}
          />
        )}
      />

      <Controller
        control={form.control}
        name="education"
        render={({ field }) => (
          <ChoiceCards
            name="education"
            legend={q('education')}
            value={field.value}
            onChange={field.onChange}
            error={err('education')}
            choices={educationLevels.map((e) => ({ value: e, label: t(`onboarding.profile.educationLevel.${e}`) }))}
          />
        )}
      />

      <Controller
        control={form.control}
        name="isLiterate"
        render={({ field }) => <YesNoField name="isLiterate" question={q('isLiterate')} value={field.value} onChange={field.onChange} />}
      />
    </div>
  )
}
