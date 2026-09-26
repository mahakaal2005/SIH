import { useQuery } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useCatalog, queryKeys } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession, useSessionStore } from '@/core/session/SessionProvider'
import { defaultLoanTerms, toCalculatorView, type CalculatorView, type LoanTerms } from '../domain/calculatorView'

export interface State {
  status: 'loading' | 'error' | 'noCost' | 'notFound' | 'success'
  errorKey?: string
  view?: CalculatorView
  terms?: LoanTerms
}

export type Event =
  | { type: 'Recomputed'; view: CalculatorView; terms: LoanTerms }
  | { type: 'NoCost' }
  | { type: 'NotFound' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(_state: State, event: Event): State {
  switch (event.type) {
    case 'Recomputed':
      return { status: 'success', view: event.view, terms: event.terms }
    case 'NoCost':
      return { status: 'noCost' }
    case 'NotFound':
      return { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useCalculatorViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { schemeId } = useParams<{ schemeId: string }>()
  const { profile: profileRepo } = useRepositories()
  const { user, journey } = useSession()
  const userId = user!.id
  const session = useSessionStore()
  const navigate = useNavigate()

  const catalog = useCatalog()
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => profileRepo.get(userId) })

  const scheme = catalog.data?.schemes.find((s) => s.id === schemeId)
  const project = scheme?.pmajayProjectId ? catalog.data?.projects.find((p) => p.id === scheme.pmajayProjectId) : undefined
  // journey.projectCost/loanTerms belong to whichever scheme was last chosen on the detail screen;
  // only trust them here when the URL's schemeId still matches, otherwise they're stale from a different scheme.
  const projectCost = journey.schemeId === schemeId ? journey.projectCost : undefined
  const loanTerms = journey.schemeId === schemeId ? journey.loanTerms : undefined

  useEffect(() => {
    if (profile.isError) dispatch({ type: 'Failed', errorKey: errorKey(profile.error) })
    else if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (catalog.isSuccess && schemeId && !scheme) dispatch({ type: 'NotFound' })
    else if (catalog.isSuccess && scheme && projectCost === undefined) dispatch({ type: 'NoCost' })
    else if (catalog.isSuccess && scheme && profile.isSuccess && profile.data && projectCost !== undefined) {
      const terms = loanTerms ?? defaultLoanTerms(scheme)
      dispatch({
        type: 'Recomputed',
        view: toCalculatorView(scheme, project, projectCost, terms, profile.data.annualFamilyIncome, profile.data.area),
        terms,
      })
    }
  }, [
    profile.isSuccess, profile.isError, profile.error, profile.data,
    catalog.isSuccess, catalog.isError, catalog.error, scheme, project, schemeId,
    projectCost, loanTerms,
  ])

  function changeTerms(patch: Partial<LoanTerms>) {
    if (!scheme || !profile.data || projectCost === undefined) return
    const terms = { ...(state.terms ?? defaultLoanTerms(scheme)), ...patch }
    dispatch({
      type: 'Recomputed',
      view: toCalculatorView(scheme, project, projectCost, terms, profile.data.annualFamilyIncome, profile.data.area),
      terms,
    })
  }

  function retry() {
    dispatch({ type: 'Reset' })
    void profile.refetch()
    void catalog.refetch()
  }

  function continuePastCalculator() {
    if (!schemeId || !state.terms) return
    session.setLoanTerms(state.terms)
    navigate(routes.partners(schemeId))
  }

  return { state, changeTerms, retry, continuePastCalculator }
}
