import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { Role } from '@/core/data/repositories/types'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession } from '@/core/session/SessionProvider'
import { LoadingBlock } from '@/shared/components/states'
import { entryRoute } from './entry'

export function RequireLanguage({ children }: { children: ReactNode }) {
  const { language } = useSession()
  return language ? children : <Navigate to={routes.language} replace />
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useSession()
  const location = useLocation()
  if (!user) return <Navigate to={routes.login} replace state={{ from: location.pathname }} />
  if (!roles.includes(user.role)) return <Navigate to={routes.home} replace />
  return children
}

/** `/` decides where each person lands. */
export function HomeRedirect() {
  const { language, user } = useSession()
  const repos = useRepositories()
  const isCitizen = user?.role === 'citizen'
  const profile = useQuery({ queryKey: ['profile', user?.id], queryFn: () => repos.profile.get(user!.id), enabled: isCitizen })
  const apps = useQuery({ queryKey: ['applications', user?.id], queryFn: () => repos.application.listMine(user!.id), enabled: isCitizen })

  if (isCitizen && (profile.isPending || apps.isPending)) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <LoadingBlock />
      </div>
    )
  }
  return (
    <Navigate
      replace
      to={entryRoute({ language, user, hasProfile: !!profile.data, hasApplication: (apps.data?.length ?? 0) > 0 })}
    />
  )
}
