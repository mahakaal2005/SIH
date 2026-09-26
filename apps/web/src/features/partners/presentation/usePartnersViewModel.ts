import { useQuery } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useCatalog, queryKeys, usePartners } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession, useSessionStore } from '@/core/session/SessionProvider'
import { toPartnersView, type PartnersView } from '../domain/partnersView'

export interface State {
  status: 'loading' | 'error' | 'notFound' | 'success'
  errorKey?: string
  view?: PartnersView
  selectedBranchId?: string
}

export type Event =
  | { type: 'Loaded'; view: PartnersView }
  | { type: 'Selected'; branchId: string }
  | { type: 'NotFound' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: 'success', view: event.view }
    case 'Selected':
      return { ...state, selectedBranchId: event.branchId }
    case 'NotFound':
      return { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function usePartnersViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { schemeId } = useParams<{ schemeId: string }>()
  const { profile: profileRepo } = useRepositories()
  const { user } = useSession()
  const userId = user!.id
  const session = useSessionStore()
  const navigate = useNavigate()

  const catalog = useCatalog()
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => profileRepo.get(userId) })

  const scheme = catalog.data?.schemes.find((s) => s.id === schemeId)
  const district = profile.data ? catalog.data?.districts.find((d) => d.id === profile.data!.districtId) : undefined
  const near = district ? { lat: district.lat, lng: district.lng } : undefined

  const partners = usePartners(schemeId && near ? { schemeId, near } : { schemeId: '', near: { lat: 0, lng: 0 } })

  useEffect(() => {
    if (profile.isError) dispatch({ type: 'Failed', errorKey: errorKey(profile.error) })
    else if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (partners.isError) dispatch({ type: 'Failed', errorKey: errorKey(partners.error) })
    else if (catalog.isSuccess && schemeId && !scheme) dispatch({ type: 'NotFound' })
    else if (catalog.isSuccess && profile.isSuccess && profile.data && !district) dispatch({ type: 'Failed', errorKey: 'errors.generic' })
    else if (catalog.isSuccess && scheme && partners.isSuccess && partners.data) {
      dispatch({ type: 'Loaded', view: toPartnersView(partners.data) })
    }
  }, [
    profile.isError, profile.error, profile.isSuccess, profile.data,
    catalog.isError, catalog.error, catalog.isSuccess, scheme, schemeId, district,
    partners.isError, partners.error, partners.isSuccess, partners.data,
  ])

  function choosePartner(branchId: string) {
    if (!schemeId) return
    dispatch({ type: 'Selected', branchId })
    session.choosePartner(branchId)
    navigate(routes.documents(schemeId))
  }

  function retry() {
    dispatch({ type: 'Reset' })
    void profile.refetch()
    void catalog.refetch()
    void partners.refetch()
  }

  return { state, choosePartner, retry }
}
