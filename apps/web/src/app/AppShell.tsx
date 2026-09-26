import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Landmark, LayoutList, LogOut, ScrollText, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import type { Language } from '@ys/shared'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession, useSessionStore } from '@/core/session/SessionProvider'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { DevPanel } from './DevPanel'
import { JOURNEY_STEPS, journeyStep } from './entry'

function LanguageToggle() {
  const { t } = useTranslation()
  const { language } = useSession()
  const store = useSessionStore()
  const next: Language = language === 'hi' ? 'en' : 'hi'
  return (
    <Button variant="ghost" className="h-11 px-3" onClick={() => store.setLanguage(next)} aria-label={t('language.switch')} lang={next}>
      {t(`language.${next}`)}
    </Button>
  )
}

function JourneyStepper({ step }: { step: number }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('journey.label')} className="mx-auto max-w-xl px-4 pt-3">
      <ol className="flex gap-1.5">
        {JOURNEY_STEPS.map((key, i) => {
          const n = i + 1
          const state = n < step ? 'done' : n === step ? 'current' : 'todo'
          return (
            <li key={key} className="flex-1" aria-current={state === 'current' ? 'step' : undefined}>
              <span
                className={cn(
                  'block h-1.5 rounded-full',
                  state === 'done' && 'bg-primary',
                  state === 'current' && 'bg-primary/60',
                  state === 'todo' && 'bg-border',
                )}
              />
              <span className={cn('mt-1 block truncate text-xs', state === 'current' ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                <span className="sr-only">{n}. </span>
                {t(`journey.${key}`)}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function NavItem({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-sm md:flex-row md:gap-2 md:min-h-11',
          isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const { t } = useTranslation()
  const { user } = useSession()
  const store = useSessionStore()
  const repos = useRepositories()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const step = user?.role === 'citizen' ? journeyStep(pathname) : null
  const officer = user && user.role !== 'citizen'

  async function logout() {
    await repos.auth.logout()
    store.setUser(null)
    queryClient.clear()
    navigate(routes.login)
  }

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        {t('app.skipToContent')}
      </a>
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className={cn('mx-auto flex h-14 items-center gap-2 px-4', officer ? 'max-w-6xl' : 'max-w-xl')}>
          <NavLink to={routes.home} className="mr-auto flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <Landmark aria-hidden className="size-6" />
            {t('app.name')}
          </NavLink>
          {officer && (
            <nav aria-label={t('shell.officerNav')} className="hidden gap-1 md:flex">
              <NavItem to={routes.officer} end icon={<ClipboardList aria-hidden className="size-5" />} label={t('nav.officer')} />
              <NavItem to={routes.officerPartners} icon={<ShieldCheck aria-hidden className="size-5" />} label={t('officer.nav.partners')} />
              <NavItem to={routes.officerRules} icon={<SlidersHorizontal aria-hidden className="size-5" />} label={t('officer.nav.rules')} />
            </nav>
          )}
          <DevPanel />
          {pathname !== routes.language && <LanguageToggle />}
          {user && (
            <Button variant="ghost" size="icon" className="size-11" onClick={logout} aria-label={t('nav.logout')}>
              <LogOut aria-hidden />
            </Button>
          )}
        </div>
      </header>

      {step && <JourneyStepper step={step} />}

      <main id="main">
        <Outlet />
      </main>

      {user && (
        <nav
          aria-label={officer ? t('shell.officerNav') : t('shell.citizenNav')}
          className={cn('fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur', officer && 'md:hidden')}
        >
          <div className="mx-auto flex max-w-xl gap-1 px-2 py-1">
            {officer ? (
              <>
                <NavItem to={routes.officer} end icon={<ClipboardList aria-hidden className="size-6" />} label={t('nav.officer')} />
                <NavItem to={routes.officerPartners} icon={<ShieldCheck aria-hidden className="size-6" />} label={t('officer.nav.partners')} />
                <NavItem to={routes.officerRules} icon={<SlidersHorizontal aria-hidden className="size-6" />} label={t('officer.nav.rules')} />
              </>
            ) : (
              <>
                <NavItem to={routes.schemes} icon={<Sparkles aria-hidden className="size-6" />} label={t('nav.schemes')} />
                <NavItem to={routes.status} icon={<LayoutList aria-hidden className="size-6" />} label={t('nav.status')} />
                <NavItem to={routes.verify} icon={<ScrollText aria-hidden className="size-6" />} label={t('nav.verify')} />
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
