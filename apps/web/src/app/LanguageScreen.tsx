import { Landmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { Language } from '@ys/shared'
import { routes } from '@/core/router/routes'
import { useSessionStore } from '@/core/session/SessionProvider'
import { LANGUAGES } from '@/shared/i18n'

/** Shown before anything else (F0.2). Each option is written in its own script, so no reading of the other language is needed. */
export function LanguageScreen() {
  const { t } = useTranslation()
  const store = useSessionStore()
  const navigate = useNavigate()

  function choose(lang: Language) {
    store.setLanguage(lang)
    navigate(routes.home, { replace: true })
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col justify-center gap-8 px-4 py-10">
      <div>
        <Landmark aria-hidden className="mb-4 size-12 text-primary" />
        <h1 className="text-4xl font-bold text-primary">{t('app.name', { lng: 'hi' })}</h1>
        <p className="mt-1 font-heading text-2xl text-muted-foreground" lang="en">
          {t('app.name', { lng: 'en' })}
        </p>
      </div>
      <div>
        <h2 className="sr-only">{t('language.title')}</h2>
        <ul className="grid gap-3">
          {LANGUAGES.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                lang={lang}
                onClick={() => choose(lang)}
                className="flex h-20 w-full items-center justify-between rounded-2xl border-2 border-border bg-card px-6 text-left text-2xl font-medium transition-colors hover:border-primary focus-visible:border-primary"
              >
                <span>{t(`language.${lang}`)}</span>
                <span aria-hidden className="font-heading text-3xl text-primary">
                  {lang === 'hi' ? 'अ' : 'A'}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-muted-foreground">
          {t('language.subtitle', { lng: 'hi' })} <span lang="en">{t('language.subtitle', { lng: 'en' })}</span>
        </p>
      </div>
    </section>
  )
}
