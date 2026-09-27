import { useEffect, useReducer } from 'react'
import { errorKey } from '@/core/data/errors'
import { useCatalog } from '@/core/data/queries'
import { toPartnerHealthView, type PartnerHealthRow } from '../domain/partnerHealthView'

export interface State {
  status: 'loading' | 'error' | 'success'
  errorKey?: string
  rows?: PartnerHealthRow[]
}

export type Event = { type: 'Loaded'; rows: PartnerHealthRow[] } | { type: 'Failed'; errorKey: string } | { type: 'Reset' }

export const initialState: State = { status: 'loading' }

export function reduce(_state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { status: 'success', rows: event.rows }
    case 'Failed':
      return { status: 'error', errorKey: event.errorKey }
    case 'Reset':
      return initialState
  }
}

export function useOfficerPartnersViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const catalog = useCatalog()

  useEffect(() => {
    if (catalog.isError) dispatch({ type: 'Failed', errorKey: errorKey(catalog.error) })
    else if (catalog.isSuccess) dispatch({ type: 'Loaded', rows: toPartnerHealthView(catalog.data.partnerEntities, catalog.data.healthPolicy) })
  }, [catalog.isError, catalog.error, catalog.isSuccess, catalog.data])

  function retry() {
    dispatch({ type: 'Reset' })
    void catalog.refetch()
  }

  return { state, retry }
}
