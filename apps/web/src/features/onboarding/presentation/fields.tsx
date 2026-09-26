import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import type { ProfileField, ProfileFormValues } from '../domain/profileForm'

export type ProfileForm = UseFormReturn<ProfileFormValues>

/** Question text in first person, or third person in assisted mode (i18next `_assisted` context). */
export function useQuestion(assisted: boolean) {
  const { t } = useTranslation()
  return (field: string) => t(`onboarding.profile.q.${field}`, { context: assisted ? 'assisted' : undefined })
}

export function fieldError(form: ProfileForm, field: ProfileField, t: (k: string) => string) {
  return form.formState.errors[field] ? t(`onboarding.profile.error.${field}`) : undefined
}

export function NumberField({
  form,
  field,
  label,
  hint,
  prefix,
  suffix,
}: {
  form: ProfileForm
  field: ProfileField
  label: string
  hint?: ReactNode
  prefix?: string
  suffix?: string
}) {
  const { t } = useTranslation()
  const error = fieldError(form, field, t)
  const id = `field-${field}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-medium">
        {label}
      </label>
      <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:ring-3 focus-within:ring-ring/50">
        {prefix && <span aria-hidden className="figure grid place-items-center border-r bg-muted px-3 text-lg">{prefix}</span>}
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          aria-invalid={!!error}
          aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
          className="figure h-14 rounded-none border-0 text-xl shadow-none focus-visible:ring-0"
          {...form.register(field, { valueAsNumber: true })}
        />
        {suffix && <span aria-hidden className="grid place-items-center px-3 text-muted-foreground">{suffix}</span>}
      </div>
      {hint && (
        <div id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-blocked">
          {error}
        </p>
      )}
    </div>
  )
}
