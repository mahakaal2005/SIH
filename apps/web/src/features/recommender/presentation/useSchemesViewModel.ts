import { useQuery } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { queryKeys, useCatalog } from '@/core/data/queries'
import { routes } from '@/core/router/routes'
import { useSession } from '@/core/session/SessionProvider'
import { getRecommendations } from '../domain/recommendations.usecase'
import { toResultView, type ResultView } from '../domain/resultView'

export interface State {
  status: 'loading' | 'error' | 'empty' | 'success'
  errorKey?: string
  view?: ResultView
}

export type Event = { type: 'Loaded'; view: ResultView } | { type: 'Failed'; errorKey: string } | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(_state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: event.view.empty ? 'empty' : 'success', view: event.view }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useSchemesViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { profile: profileRepo, recommendation } = useRepositories()
  const { user } = useSession()
  const userId = user!.id
  const navigate = useNavigate()

  const catalog = useCatalog()
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => profileRepo.get(userId) })
  const recs = useQuery({
    queryKey: queryKeys.recommendations(userId),
    queryFn: () => getRecommendations(recommendation, profile.data!),
    enabled: profile.isSuccess && !!profile.data,
  })

  useEffect(() => {
    if (profile.isSuccess && !profile.data) {
      navigate(routes.profile, { replace: true })
    }
  }, [profile.isSuccess, profile.data, navigate])

  useEffect(() => {
    if (profile.isError) dispatch({ type: 'Failed', errorKey: errorKey(profile.error) })
    else if (recs.isError) dispatch({ type: 'Failed', errorKey: errorKey(recs.error) })
    else if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (profile.data && recs.isSuccess && catalog.isSuccess) {
      dispatch({ type: 'Loaded', view: toResultView(recs.data, profile.data.area, catalog.data.projects) })
    }
  }, [
    profile.data, profile.isError, profile.error,
    recs.isSuccess, recs.isError, recs.error, recs.data,
    catalog.isSuccess, catalog.isError, catalog.error, catalog.data,
  ])

  function retry() {
    dispatch({ type: 'Reset' })
    void profile.refetch()
    void recs.refetch()
    void catalog.refetch()
  }

  function seeDetails(schemeId: string) {
    navigate(routes.scheme(schemeId))
  }

  return { state, retry, seeDetails }
}
