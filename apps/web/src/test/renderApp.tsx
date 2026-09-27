import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { ApplicantProfile, Language } from '@ys/shared'
import { appRoutes } from '@/app/router'
import { MockDb } from '@/core/data/mock/MockDb'
import { createMockRepositories, DEMO_OTP } from '@/core/data/mock/repositories'
import { MockTransport } from '@/core/data/mock/transport'
import type { Repositories, User } from '@/core/data/repositories/types'
import { RepositoryProvider } from '@/core/di/RepositoryProvider'
import { SessionProvider } from '@/core/session/SessionProvider'
import { createSessionStore } from '@/core/session/sessionStore'
import i18n from '@/shared/i18n'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { createMockLanguageService, type MockLanguageService } from './mockLanguageService'

let n = 0

/** Renders the real route table over a fresh mock backend with no latency. */
export async function renderApp(
  path: string,
  opts: {
    language?: Language | null
    citizen?: boolean
    profile?: ApplicantProfile
    languageService?: MockLanguageService
    officer?: 'district_officer' | 'hq_admin'
  } = {},
) {
  localStorage.clear()
  const db = await MockDb.open({ storageKey: `ui-test-${++n}`, now: () => new Date('2026-09-26T09:00:00Z') })
  const transport = new MockTransport({ minLatencyMs: 0, maxLatencyMs: 0 })
  const repos: Repositories = createMockRepositories(db, transport)
  const store = createSessionStore(localStorage)
  const language = opts.language === undefined ? 'en' : opts.language
  if (language) {
    store.setLanguage(language)
    await i18n.changeLanguage(language)
  }
  let user: User | null = null
  if (opts.citizen) {
    await repos.auth.requestOtp('9876543210')
    user = (await repos.auth.verifyOtp('9876543210', DEMO_OTP)).user
    store.setUser(user)
    if (opts.profile) await repos.profile.save(user.id, opts.profile)
  } else if (opts.officer) {
    user = db.state.users.find((u) => u.role === opts.officer) ?? null
    if (!user) throw new Error(`No seeded ${opts.officer} user found`)
    store.setUser(user)
  }
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const languageService = opts.languageService ?? createMockLanguageService()
  const ui = render(
    <SessionProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RepositoryProvider container={{ repos, dev: { transport, resetData: () => db.reset() }, language: languageService }}>
            <RouterProvider router={router} />
          </RepositoryProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>,
  )
  return { ...ui, router, repos, db, store, transport, user, queryClient, languageService }
}
