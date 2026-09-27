import { useEffect, useReducer, useState } from 'react'
import { errorKey } from '@/core/data/errors'
import { useCatalog, useOfficerQueue } from '@/core/data/queries'
import { useSession } from '@/core/session/SessionProvider'
import { toCallList, toQueueView, type QueueRow } from '../domain/queueView'

export interface State {
  status: 'loading' | 'error' | 'empty' | 'success'
  errorKey?: string
  rows?: QueueRow[]
}

export type Event =
  | { type: 'Loaded'; rows: QueueRow[] }
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

export function useOfficerQueueViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const [showStalledOnly, setShowStalledOnly] = useState(false)
  const [showCallList, setShowCallList] = useState(false)
  const { user } = useSession()
  const districtId = user!.districtId

  const catalog = useCatalog()
  const queue = useOfficerQueue({ districtId })

  useEffect(() => {
    if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (queue.isError) dispatch({ type: 'Failed', errorKey: errorKey(queue.error) })
    else if (catalog.isSuccess && queue.isSuccess) {
      if (queue.data.length === 0) dispatch({ type: 'Empty' })
      else dispatch({ type: 'Loaded', rows: toQueueView(queue.data, catalog.data.stageDurations, new Date()) })
    }
  }, [catalog.isError, catalog.error, catalog.isSuccess, catalog.data, queue.isError, queue.error, queue.isSuccess, queue.data])

  const rows = state.rows ?? []
  const visibleRows = showStalledOnly ? rows.filter((r) => r.stalled) : rows
  const displayedRows = showCallList ? toCallList(visibleRows) : visibleRows

  function retry() {
    dispatch({ type: 'Reset' })
    void catalog.refetch()
    void queue.refetch()
  }

  return { state, displayedRows, showStalledOnly, setShowStalledOnly, showCallList, setShowCallList, retry }
}
