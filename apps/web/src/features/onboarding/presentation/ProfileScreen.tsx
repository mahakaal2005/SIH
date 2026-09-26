import { HandHelping } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '@/core/data/queries'
import { errorKey } from '@/core/data/errors'
import { ErrorBlock, LoadingBlock } from '@/shared/components/states'
import { Screen } from '@/shared/components/Screen'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { PROFILE_STEPS } from '../domain/profileForm'
import { AboutStep } from './AboutStep'
import { MoneyStep } from './MoneyStep'
import { PlanStep } from './PlanStep'
import { useProfileViewModel } from './useProfileViewModel'

export function ProfileScreen() {
  const { t } = useTranslation()
  const catalog = useCatalog()
  const { state, form, next, back, toggleAssisted, retryLoad, submit } = useProfileViewModel()
  const stepKey = PROFILE_STEPS[state.step]!.key
  const last = state.step === PROFILE_STEPS.length - 1

  const body = () => {
    if (state.status === 'loading' || catalog.isPending) return <LoadingBlock rows={4} />
    if (state.status === 'error') return <ErrorBlock messageKey={state.errorKey!} onRetry={retryLoad} />
    if (catalog.isError) return <ErrorBlock messageKey={errorKey(catalog.error)} onRetry={() => catalog.refetch()} />
    const c = catalog.data
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (last) void submit()
          else void next()
        }}
      >
        <h2 className="mb-4 text-xl font-bold">
          <span className="block font-sans text-sm font-normal text-muted-foreground">
            {t('onboarding.profile.stepOf', { n: state.step + 1, total: PROFILE_STEPS.length })}
          </span>
          {t(`onboarding.profile.step.${stepKey}`)}
        </h2>

        {stepKey === 'about' && <AboutStep form={form} assisted={state.assisted} districts={c.districts} />}
        {stepKey === 'plan' && <PlanStep form={form} assisted={state.assisted} activities={c.activities} projects={c.projects} />}
        {stepKey === 'money' && <MoneyStep form={form} assisted={state.assisted} />}

        {state.saveErrorKey && (
          <div className="mt-6">
            <ErrorBlock messageKey={state.saveErrorKey} />
          </div>
        )}

        <div className="sticky bottom-20 mt-8 flex gap-3 bg-background/95 py-3 backdrop-blur">
          {state.step > 0 && (
            <Button type="button" variant="outline" className="h-14 flex-1 text-lg" onClick={back}>
              {t('common.back')}
            </Button>
          )}
          <Button type="submit" className="h-14 flex-[2] text-lg" disabled={state.saving}>
            {last ? t('onboarding.profile.save') : t('common.next')}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Screen title={t('onboarding.profile.title')} lead={t('onboarding.profile.lead')}>
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <Label htmlFor="assisted" className="flex items-center gap-2 text-base font-normal">
          <HandHelping aria-hidden className="size-5 text-primary" />
          {t('onboarding.profile.assisted')}
        </Label>
        <Switch id="assisted" checked={state.assisted} onCheckedChange={toggleAssisted} />
      </div>
      {body()}
    </Screen>
  )
}
