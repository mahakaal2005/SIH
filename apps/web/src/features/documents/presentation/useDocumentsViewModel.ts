import { financePlan } from '@ys/shared'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useReducer, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { queryKeys, useCatalog, useChecklist, usePreflight } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession } from '@/core/session/SessionProvider'
import { toDocumentsView, type DocumentsView } from '../domain/documentsView'

export interface State {
  status: 'loading' | 'error' | 'notFound' | 'success'
  errorKey?: string
  view?: DocumentsView
  digiLockerBusyId?: string
  submitting?: boolean
}

export type Event =
  | { type: 'Loaded'; view: DocumentsView }
  | { type: 'NotFound' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'DigiLockerBusy'; documentId: string | undefined }
  | { type: 'Submitting'; submitting: boolean }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { ...state, status: 'success', view: event.view }
    case 'NotFound':
      return { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'DigiLockerBusy':
      return { ...state, digiLockerBusyId: event.documentId }
    case 'Submitting':
      return { ...state, submitting: event.submitting }
    case 'Reset':
      return initialState
  }
}

export function useDocumentsViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const [submitError, setSubmitError] = useState<string>()
  const { schemeId } = useParams<{ schemeId: string }>()
  const { profile: profileRepo, document, application } = useRepositories()
  const { user, journey } = useSession()
  const userId = user!.id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const catalog = useCatalog()
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => profileRepo.get(userId) })
  const checklist = useChecklist(userId, schemeId ?? '')
  const preflight = usePreflight(userId, profile.data)

  const scheme = catalog.data?.schemes.find((s) => s.id === schemeId)
  const project = scheme?.pmajayProjectId ? catalog.data?.projects.find((p) => p.id === scheme.pmajayProjectId) : undefined
  const projectCost = journey.schemeId === schemeId ? journey.projectCost : undefined

  useEffect(() => {
    if (profile.isError) dispatch({ type: 'Failed', errorKey: errorKey(profile.error) })
    else if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (checklist.isError) dispatch({ type: 'Failed', errorKey: errorKey(checklist.error) })
    else if (preflight.isError) dispatch({ type: 'Failed', errorKey: errorKey(preflight.error) })
    else if (catalog.isSuccess && schemeId && !scheme) dispatch({ type: 'NotFound' })
    else if (
      catalog.isSuccess && scheme && profile.isSuccess && profile.data
      && checklist.isSuccess && preflight.isSuccess && projectCost !== undefined
    ) {
      const plan = financePlan(scheme, { projectCost, area: profile.data.area, trainingHours: project?.trainingHours })
      dispatch({ type: 'Loaded', view: toDocumentsView(scheme, catalog.data.documents, checklist.data, preflight.data, plan) })
    }
  }, [
    profile.isSuccess, profile.isError, profile.error, profile.data,
    catalog.isSuccess, catalog.isError, catalog.error, catalog.data, scheme, project, schemeId,
    checklist.isSuccess, checklist.isError, checklist.error, checklist.data,
    preflight.isSuccess, preflight.isError, preflight.error, preflight.data,
    projectCost,
  ])

  function toggleItem(documentId: string, done: boolean) {
    if (!schemeId) return
    queryClient.setQueryData(queryKeys.checklist(userId, schemeId), (prev: Record<string, boolean> | undefined) => ({
      ...prev, [documentId]: done,
    }))
    void document.setChecklistItem(userId, schemeId, documentId, done).then(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.checklist(userId, schemeId) })
    })
  }

  async function fetchDigiLocker(documentId: string) {
    dispatch({ type: 'DigiLockerBusy', documentId })
    try {
      await document.fetchFromDigiLocker(userId, documentId)
      toggleItem(documentId, true)
    } finally {
      dispatch({ type: 'DigiLockerBusy', documentId: undefined })
    }
  }

  async function submit() {
    if (!schemeId || !profile.data || !state.view) return
    const plan = financePlan(scheme!, { projectCost: projectCost!, area: profile.data.area, trainingHours: project?.trainingHours })
    dispatch({ type: 'Submitting', submitting: true })
    setSubmitError(undefined)
    try {
      const app = await application.submit({
        userId, schemeId, profile: profile.data, partnerBranchId: journey.partnerBranchId ?? null,
        loanAmount: plan.loan, grantAmount: plan.grant,
      })
      navigate(routes.application(app.id))
    } catch (e) {
      setSubmitError(errorKey(e))
    } finally {
      dispatch({ type: 'Submitting', submitting: false })
    }
  }

  function retry() {
    dispatch({ type: 'Reset' })
    void profile.refetch()
    void catalog.refetch()
    void checklist.refetch()
    void preflight.refetch()
  }

  return { state, submitError, toggleItem, fetchDigiLocker, submit, retry }
}
