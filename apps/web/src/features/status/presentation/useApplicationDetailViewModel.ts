import { useEffect, useReducer } from 'react'
import { useParams } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useApplication, useNotifications, useCatalog, queryKeys } from '@/core/data/queries'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { useSession } from '@/core/session/SessionProvider'
import { useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@/core/data/repositories/types'
import type { Localized } from '@ys/shared'
import { toTimelineView, type StatusDetailView } from '../domain/statusView'

export interface DetailView extends StatusDetailView {
  receiptNo: string
  schemeName: Localized
  receiptCode: string
}

export interface State {
  status: 'loading' | 'error' | 'notFound' | 'success'
  errorKey?: string
  view?: DetailView
  notifications?: Notification[]
  resubmitting?: boolean
  resubmitError?: string
}

export type Event =
  | { type: 'Loaded'; view: DetailView; notifications: Notification[] }
  | { type: 'NotFound' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Resubmitting'; resubmitting: boolean }
  | { type: 'ResubmitFailed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: 'success', view: event.view, notifications: event.notifications }
    case 'NotFound':
      return { status: 'notFound' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Resubmitting':
      return { ...state, resubmitting: event.resubmitting }
    case 'ResubmitFailed':
      return { ...state, resubmitError: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useApplicationDetailViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { applicationId } = useParams<{ applicationId: string }>()
  const { application: applicationRepo, notification } = useRepositories()
  const { user } = useSession()
  const userId = user!.id
  const queryClient = useQueryClient()

  const catalog = useCatalog()
  const application = useApplication(applicationId ?? '')
  const notifications = useNotifications(userId)

  const app = application.data
  const ownedByUser = app ? app.userId === userId : undefined

  useEffect(() => {
    if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (application.isError) dispatch({ type: 'Failed', errorKey: errorKey(application.error) })
    else if (notifications.isError) dispatch({ type: 'Failed', errorKey: errorKey(notifications.error) })
    else if (application.isSuccess && (app === null || ownedByUser === false)) dispatch({ type: 'NotFound' })
    else if (catalog.isSuccess && application.isSuccess && app && ownedByUser && notifications.isSuccess) {
      const scheme = catalog.data.schemes.find((s) => s.id === app.schemeId)
      const timeline = toTimelineView(app, catalog.data.stageDurations)
      dispatch({
        type: 'Loaded',
        view: {
          ...timeline, receiptNo: app.receiptNo, schemeName: scheme?.name ?? { en: app.schemeId, hi: app.schemeId },
          receiptCode: applicationRepo.encodeReceipt(app),
        },
        notifications: notifications.data.filter((n) => n.applicationId === app.id),
      })
    }
  }, [
    catalog.isError, catalog.error, catalog.isSuccess, catalog.data,
    application.isError, application.error, application.isSuccess, app, ownedByUser,
    notifications.isError, notifications.error, notifications.isSuccess, notifications.data,
    applicationRepo,
  ])

  async function resubmit() {
    if (!app) return
    dispatch({ type: 'Resubmitting', resubmitting: true })
    try {
      await applicationRepo.resubmit(app.id, userId)
      await queryClient.invalidateQueries({ queryKey: queryKeys.application(app.id) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications(userId) })
    } catch (e) {
      dispatch({ type: 'ResubmitFailed', errorKey: errorKey(e) })
    } finally {
      dispatch({ type: 'Resubmitting', resubmitting: false })
    }
  }

  async function markNotificationRead(id: string) {
    await notification.markRead(id)
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) })
  }

  function retry() {
    dispatch({ type: 'Reset' })
    void catalog.refetch()
    void application.refetch()
    void notifications.refetch()
  }

  return { state, resubmit, markNotificationRead, retry }
}
