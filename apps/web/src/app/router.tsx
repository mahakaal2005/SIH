import { useTranslation } from 'react-i18next'
import { createBrowserRouter, Link, useLocation, type RouteObject } from 'react-router'
import { routes } from '@/core/router/routes'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { Screen } from '@/shared/components/Screen'
import { AppShell } from './AppShell'
import { LoginScreen } from '@/features/onboarding/presentation/LoginScreen'
import { ProfileScreen } from '@/features/onboarding/presentation/ProfileScreen'
import { CalculatorScreen } from '@/features/calculator/presentation/CalculatorScreen'
import { PartnersScreen } from '@/features/partners/presentation/PartnersScreen'
import { SchemeDetailScreen } from '@/features/recommender/presentation/SchemeDetailScreen'
import { SchemesScreen } from '@/features/recommender/presentation/SchemesScreen'
import { HomeRedirect, RequireLanguage, RequireRole } from './guards'
import { LanguageScreen } from './LanguageScreen'

function NotFound() {
  const { t } = useTranslation()
  return (
    <Screen title={t('notFound.title')} lead={t('notFound.body')}>
      <Link to={routes.home} className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-primary-foreground">
        {t('notFound.home')}
      </Link>
    </Screen>
  )
}

function ShellWithBoundary() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <AppShell />
    </ErrorBoundary>
  )
}

export const appRoutes: RouteObject[] = [
  {
    element: <ShellWithBoundary />,
    children: [
      { path: routes.home, element: <HomeRedirect /> },
      { path: routes.language, element: <LanguageScreen /> },
      { path: routes.login, element: <RequireLanguage><LoginScreen /></RequireLanguage> },
      { path: routes.profile, element: <RequireLanguage><RequireRole roles={['citizen']}><ProfileScreen /></RequireRole></RequireLanguage> },
      { path: routes.schemes, element: <RequireLanguage><RequireRole roles={['citizen']}><SchemesScreen /></RequireRole></RequireLanguage> },
      { path: routes.scheme(), element: <RequireLanguage><RequireRole roles={['citizen']}><SchemeDetailScreen /></RequireRole></RequireLanguage> },
      { path: routes.cost(), element: <RequireLanguage><RequireRole roles={['citizen']}><CalculatorScreen /></RequireRole></RequireLanguage> },
      { path: routes.partners(), element: <RequireLanguage><RequireRole roles={['citizen']}><PartnersScreen /></RequireRole></RequireLanguage> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
