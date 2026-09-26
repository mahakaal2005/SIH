import { describe, expect, it } from 'vitest'
import type { ResultView } from '../domain/resultView'
import { initialState, reduce } from './useSchemesViewModel'

const view: ResultView = { eligible: [], alsoAvailable: [], nearMisses: [], ineligible: [], fallbackUsed: false, empty: false }

describe('schemes reduce()', () => {
  it('starts loading', () => {
    expect(initialState).toEqual({ status: 'loading' })
  })

  it('goes to success with the mapped view', () => {
    expect(reduce(initialState, { type: 'Loaded', view })).toEqual({ status: 'success', view })
  })

  it('goes to empty when the view has nothing at all', () => {
    const empty = { ...view, empty: true }
    expect(reduce(initialState, { type: 'Loaded', view: empty })).toEqual({ status: 'empty', view: empty })
  })

  it('goes to error with a message key on failure', () => {
    expect(reduce(initialState, { type: 'Failed', errorKey: 'errors.network' })).toEqual({ status: 'error', errorKey: 'errors.network' })
  })

  it('resets back to loading on retry', () => {
    const s = reduce(initialState, { type: 'Failed', errorKey: 'errors.network' })
    expect(reduce(s, { type: 'Reset' })).toEqual({ status: 'loading' })
  })
})
