import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Landmark } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { createContainer, type Container } from '@/core/di/container'
import { RepositoryProvider } from '@/core/di/RepositoryProvider'
import { SessionProvider, useSessionStore } from '@/core/session/SessionProvider'
import { Button } from '@/shared/ui/button'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

function BootScreen({ failed }: { failed: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center" role={failed ? 'alert' : 'status'}>
      <div className="max-w-xs space-y-4">
        <Landmark aria-hidden className="mx-auto size-10 text-primary" />
        <p className="text-lg">{t(failed ? 'shell.bootFailed' : 'shell.booting')}</p>
        {failed && (
          <Button className="h-11" onClick={() => location.reload()}>
            {t('shell.reload')}
          </Button>
        )}
      </div>
    </div>
  )
}

/** Restores the backend session into the local session store once the container is ready. */
function SessionHydrator({ container, children }: { container: Container; children: ReactNode }) {
  const store = useSessionStore()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    container.repos.auth
      .currentSession()
      .then((s) => live && store.setUser(s?.user ?? null))
      .catch(() => live && store.setUser(null))
      .finally(() => live && setReady(true))
    return () => {
      live = false
    }
  }, [container, store])
  return ready ? children : <BootScreen failed={false} />
}

export function Boot({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<Container | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    createContainer().then(setContainer, () => setFailed(true))
  }, [])

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {container ? (
            <RepositoryProvider container={container}>
              <SessionHydrator container={container}>{children}</SessionHydrator>
            </RepositoryProvider>
          ) : (
            <BootScreen failed={failed} />
          )}
          <Toaster position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
