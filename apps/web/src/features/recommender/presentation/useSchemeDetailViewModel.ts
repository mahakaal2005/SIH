import { useQuery } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useCatalog, queryKeys } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession, useSessionStore } from '@/core/session/SessionProvider'
import { getRecommendations } from '../domain/recommendations.usecase'
import { toDetailView, type SchemeDetailView } from '../domain/detailView'
import { funnelDisclosure, type FunnelDisclosure } from '../domain/oddsView'

export interface State {
  status: 'loading' | 'error' | 'notFound' | 'success'
  errorKey?: string
  view?: SchemeDetailView
  funnel?: FunnelDisclosure
}

export type Event =
  | { type: 'Loaded'; view: SchemeDetailView | undefined; funnel: FunnelDisclosure }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(_state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return event.view ? { status: 'success', view: event.view, funnel: event.funnel } : { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useSchemeDetailViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { schemeId } = useParams<{ schemeId: string }>()
  const { profile: profileRepo, recommendation } = useRepositories()
  const { user } = useSession()
  const userId = user!.id
  const session = useSessionStore()
  const navigate = useNavigate()

  const catalog = useCatalog()
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => profileRepo.get(userId) })
  const recs = useQuery({
    queryKey: queryKeys.recommendations(userId),
    queryFn: () => getRecommendations(recommendation, profile.data!),
    enabled: profile.isSuccess && !!profile.data,
  })

  // A "better odds" alternative names a PM-AJAY project for a different activity than the
  // profile's own; recommend() excludes non-matching projects from every bucket (recommend.ts),
  // so that scheme never appears in `recs`. Re-run recommend() as if the applicant had picked it.
  const altProjectId = schemeId?.startsWith('pmajay-') ? schemeId.slice('pmajay-'.length) : undefined
  const primaryMiss = recs.isSuccess && !!profile.data && !!catalog.data && !!schemeId
    && !toDetailView(recs.data, schemeId, catalog.data.rules, profile.data.area, catalog.data.projects)
  const needsAlt = primaryMiss && !!altProjectId && altProjectId !== profile.data?.activityId
  const altRecs = useQuery({
    queryKey: ['recommendations-alt', userId, schemeId],
    queryFn: () => getRecommendations(recommendation, { ...profile.data!, activityId: altProjectId! }),
    enabled: needsAlt,
  })

  useEffect(() => {
    if (profile.isError) dispatch({ type: 'Failed', errorKey: errorKey(profile.error) })
    else if (recs.isError) dispatch({ type: 'Failed', errorKey: errorKey(recs.error) })
    else if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (needsAlt && altRecs.isError) dispatch({ type: 'Failed', errorKey: errorKey(altRecs.error) })
    else if (profile.data && recs.isSuccess && catalog.isSuccess && schemeId && (!needsAlt || altRecs.isSuccess)) {
      const source = needsAlt ? altRecs.data! : recs.data
      dispatch({
        type: 'Loaded',
        view: toDetailView(source, schemeId, catalog.data.rules, profile.data.area, catalog.data.projects),
        funnel: funnelDisclosure(catalog.data.funnel, catalog.data.districts),
      })
    }
  }, [
    profile.data, profile.isError, profile.error,
    recs.isSuccess, recs.isError, recs.error, recs.data,
    catalog.isSuccess, catalog.isError, catalog.error, catalog.data, schemeId,
    needsAlt, altRecs.isSuccess, altRecs.isError, altRecs.error, altRecs.data,
  ])

  function retry() {
    dispatch({ type: 'Reset' })
    void profile.refetch()
    void recs.refetch()
    void catalog.refetch()
  }

  function continueWithScheme() {
    if (!schemeId) return
    session.chooseScheme(schemeId)
    navigate(routes.cost(schemeId))
  }

  return { state, retry, continueWithScheme }
}
