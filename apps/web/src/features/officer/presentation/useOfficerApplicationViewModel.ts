import { allowedActions, estimateTimeline, type OfficerActionType } from '@ys/shared'
import { useEffect, useReducer } from 'react'
import { useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { errorKey } from '@/core/data/errors'
import { queryKeys, useApplication, useCatalog } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { useSession } from '@/core/session/SessionProvider'

export const REJECT_REASONS = ['reject.cibil', 'reject.documents', 'reject.defaulter', 'reject.pennyDrop'] as const

export interface TimelineStep {
  stage: string
  status: 'done' | 'current' | 'upcoming'
  expectedEnd: string
  actualAt?: string
}

export interface OfficerApplicationView {
  steps: TimelineStep[]
  actions: OfficerActionType[]
}

export interface State {
  status: 'loading' | 'error' | 'notFound' | 'success'
  errorKey?: string
  view?: OfficerApplicationView
  acting?: boolean
  actError?: string
}

export type Event =
  | { type: 'Loaded'; view: OfficerApplicationView }
  | { type: 'NotFound' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Acting'; acting: boolean }
  | { type: 'ActFailed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: 'success', view: event.view }
    case 'NotFound':
      return { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Acting':
      return { ...state, acting: event.acting }
    case 'ActFailed':
      return { ...state, actError: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useOfficerApplicationViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { applicationId } = useParams<{ applicationId: string }>()
  const { application: applicationRepo } = useRepositories()
  const { user } = useSession()
  const queryClient = useQueryClient()

  const catalog = useCatalog()
  const application = useApplication(applicationId ?? '')
  const app = application.data

  useEffect(() => {
    if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (application.isError) dispatch({ type: 'Failed', errorKey: errorKey(application.error) })
    else if (application.isSuccess && app === null) dispatch({ type: 'NotFound' })
    else if (catalog.isSuccess && application.isSuccess && app) {
      const steps: TimelineStep[] = estimateTimeline(app.submittedAt, catalog.data.stageDurations).map((e) => {
        const reached = app.history.find((h) => h.stage === e.stage)
        return {
          stage: e.stage,
          status: e.stage === app.stage ? 'current' : reached ? 'done' : 'upcoming',
          expectedEnd: e.expectedEnd,
          actualAt: reached?.at,
        }
      })
      dispatch({ type: 'Loaded', view: { steps, actions: allowedActions(app.stage) } })
    }
  }, [catalog.isError, catalog.error, catalog.isSuccess, catalog.data, application.isError, application.error, application.isSuccess, app])

  async function act(action: OfficerActionType, reasonKey?: string, note?: string) {
    if (!app) return
    dispatch({ type: 'Acting', acting: true })
    try {
      const payload =
        action === 'reject' || action === 'return_for_fix'
          ? { type: action, reasonKey: reasonKey!, note }
          : { type: action as Exclude<OfficerActionType, 'reject' | 'return_for_fix'> }
      await applicationRepo.act(app.id, payload, user!.id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.application(app.id) })
    } catch (e) {
      dispatch({ type: 'ActFailed', errorKey: errorKey(e) })
    } finally {
      dispatch({ type: 'Acting', acting: false })
    }
  }

  function retry() {
    dispatch({ type: 'Reset' })
    void catalog.refetch()
    void application.refetch()
  }

  return { state, application: app, act, retry }
}
