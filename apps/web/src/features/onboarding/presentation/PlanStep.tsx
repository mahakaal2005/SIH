import { Briefcase, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Controller, useWatch } from 'react-hook-form'
import type { Activity, PmAjayProject } from '@ys/shared'
import { ChoiceCards } from '@/shared/components/ChoiceCards'
import { YesNoField } from '@/shared/components/YesNoField'
import { formatINR } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { suggestedCost } from '../domain/profileForm'
import { ActivityPicker } from './ActivityPicker'
import { fieldError, NumberField, useQuestion, type ProfileForm } from './fields'

const EDUCATION_ACTIVITY = 'higher_education'

export function PlanStep({
  form,
  assisted,
  activities,
  projects,
}: {
  form: ProfileForm
  assisted: boolean
  activities: Activity[]
  projects: PmAjayProject[]
}) {
  const { t } = useTranslation()
  const q = useQuestion(assisted)
  const [purpose, activityId, cost] = useWatch({ control: form.control, name: ['purpose', 'activityId', 'estimatedCost'] })
  const sop = suggestedCost(activityId, projects)
  const applySop = () => form.setValue('estimatedCost', sop, { shouldValidate: true })

  return (
    <div className="space-y-6">
      <Controller
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <ChoiceCards
            name="purpose"
            legend={q('purpose')}
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
              form.setValue('activityId', v === 'education' ? EDUCATION_ACTIVITY : undefined)
            }}
            choices={[
              { value: 'business', label: t('onboarding.profile.purpose.business'), icon: <Briefcase className="size-6" /> },
              { value: 'education', label: t('onboarding.profile.purpose.education'), icon: <GraduationCap className="size-6" /> },
            ]}
          />
        )}
      />

      {purpose !== 'education' && (
        <Controller
          control={form.control}
          name="activityId"
          render={({ field }) => (
            <ActivityPicker
              activities={activities}
              value={field.value}
              legend={q('activityId')}
              error={fieldError(form, 'activityId', t)}
              onChange={(id) => {
                field.onChange(id)
                const suggested = suggestedCost(id, projects)
                if (suggested && !cost) form.setValue('estimatedCost', suggested)
              }}
            />
          )}
        />
      )}

      <NumberField
        form={form}
        field="estimatedCost"
        prefix="₹"
        label={purpose === 'education' ? q('courseFee') : q('estimatedCost')}
        hint={
          purpose === 'education' ? undefined : sop ? (
            <span className="flex flex-wrap items-center gap-x-2">
              {t('onboarding.profile.sopCost', { amount: formatINR(sop) })}
              {cost !== sop && (
                <Button type="button" variant="link" className="h-auto p-0" onClick={applySop}>
                  {t('onboarding.profile.useSopCost', { amount: formatINR(sop) })}
                </Button>
              )}
            </span>
          ) : (
            t('onboarding.profile.costHint')
          )
        }
      />

      {purpose !== 'education' && (
        <>
          <Controller
            control={form.control}
            name="willingGroupOrCluster"
            render={({ field }) => (
              <YesNoField
                name="willingGroupOrCluster"
                question={q('willingGroupOrCluster')}
                hint={t('onboarding.profile.groupHint')}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="isExistingBusiness"
            render={({ field }) => (
              <YesNoField name="isExistingBusiness" question={q('isExistingBusiness')} value={field.value} onChange={field.onChange} />
            )}
          />
        </>
      )}
    </div>
  )
}
