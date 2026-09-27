import type { Application, ApplicationStage, Localized } from '@ys/shared'
import { useEffect, useReducer } from 'react'
import { errorKey } from '@/core/data/errors'
import { useApplications, useCatalog } from '@/core/data/queries'
import { useSession } from '@/core/session/SessionProvider'

export interface ApplicationRow {
  id: string
  receiptNo: string
  schemeName: Localized
  stage: ApplicationStage
  submittedAt: string
}

export interface State {
  status: 'loading' | 'error' | 'empty' | 'success'
  errorKey?: string
  rows?: ApplicationRow[]
}

export type Event =
  | { type: 'Loaded'; rows: ApplicationRow[] }
  | { type: 'Empty' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(_state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: 'success', rows: event.rows }
    case 'Empty':
      return { status: 'empty' }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

function toRow(app: Application, schemeName: Localized): ApplicationRow {
  return { id: app.id, receiptNo: app.receiptNo, schemeName, stage: app.stage, submittedAt: app.submittedAt }
}

export function useStatusListViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { user } = useSession()
  const userId = user!.id

  const catalog = useCatalog()
  const applications = useApplications(userId)

  useEffect(() => {
    if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (applications.isError) dispatch({ type: 'Failed', errorKey: errorKey(applications.error) })
    else if (catalog.isSuccess && applications.isSuccess) {
      if (applications.data.length === 0) {
        dispatch({ type: 'Empty' })
      } else {
        const rows = applications.data.map((app) => {
          const scheme = catalog.data.schemes.find((s) => s.id === app.schemeId)
          return toRow(app, scheme?.name ?? { en: app.schemeId, hi: app.schemeId })
        })
        dispatch({ type: 'Loaded', rows })
      }
    }
  }, [catalog.isError, catalog.error, catalog.isSuccess, catalog.data, applications.isError, applications.error, applications.isSuccess, applications.data])

  function retry() {
    dispatch({ type: 'Reset' })
    void catalog.refetch()
    void applications.refetch()
  }

  return { state, retry }
}
