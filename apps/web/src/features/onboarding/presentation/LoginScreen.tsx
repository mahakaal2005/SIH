import { ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { config } from '@/core/config'
import { Screen } from '@/shared/components/Screen'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useLoginViewModel } from './useLoginViewModel'

export function LoginScreen() {
  const { t } = useTranslation()
  const { state, submitPhone, submitOtp, changeNumber } = useLoginViewModel()
  const [phone, setPhone] = useState(state.phone)
  const [code, setCode] = useState('')
  const busy = state.status === 'loading' || state.status === 'success'
  const error = state.status === 'error' && state.errorKey

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (state.step === 'phone') void submitPhone(phone)
    else void submitOtp(code)
  }

  const isOtp = state.step === 'otp'
  return (
    <Screen
      title={t(isOtp ? 'onboarding.login.otpTitle' : 'onboarding.login.title')}
      lead={isOtp ? t('onboarding.login.otpLead', { sentTo: state.sentTo }) : t('onboarding.login.lead')}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {isOtp ? (
          <div className="space-y-2">
            <Label htmlFor="otp">{t('onboarding.login.otpLabel')}</Label>
            <Input
              id="otp"
              key="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
              className="figure h-14 text-center text-2xl tracking-[0.5em]"
            />
            {config.showDevTools && state.devHint && (
              <p className="text-sm text-muted-foreground">{t('onboarding.login.devHint', { code: state.devHint })}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">{t('onboarding.login.phoneLabel')}</Label>
            <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:ring-3 focus-within:ring-ring/50">
              <span aria-hidden className="figure grid place-items-center border-r bg-muted px-3 text-lg">
                +91
              </span>
              <Input
                id="phone"
                key="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                className="figure h-14 rounded-none border-0 text-xl shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        )}

        {error && (
          <p id="login-error" role="alert" className="text-blocked">
            {t(error)}
          </p>
        )}

        <Button type="submit" disabled={busy} className="h-14 w-full text-lg">
          {t(isOtp ? 'onboarding.login.verify' : 'onboarding.login.sendCode')}
        </Button>
        {isOtp && (
          <Button type="button" variant="ghost" className="h-11 w-full" onClick={changeNumber}>
            {t('onboarding.login.changeNumber')}
          </Button>
        )}
      </form>

      <p className="mt-8 flex gap-2 rounded-xl bg-pass-soft p-4 text-foreground">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-pass" />
        {t('onboarding.login.free')}
      </p>
    </Screen>
  )
}
