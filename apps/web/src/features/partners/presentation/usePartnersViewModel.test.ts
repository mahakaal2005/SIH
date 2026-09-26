import { describe, expect, it } from 'vitest'
import type { PartnersView } from '../domain/partnersView'
import { initialState, reduce } from './usePartnersViewModel'

const view: PartnersView = []

describe('partners reduce()', () => {
  it('starts loading', () => {
    expect(initialState).toEqual({ status: 'loading' })
  })

  it('goes to success with the loaded view', () => {
    expect(reduce(initialState, { type: 'Loaded', view })).toEqual({ status: 'success', view })
  })

  it('tracks the selected branch on top of an existing success state', () => {
    const success = reduce(initialState, { type: 'Loaded', view })
    expect(reduce(success, { type: 'Selected', branchId: 'sbi-sitapur' })).toEqual({
      status: 'success',
      view,
      selectedBranchId: 'sbi-sitapur',
    })
  })

  it('goes to notFound when the scheme id is not in the catalog', () => {
    expect(reduce(initialState, { type: 'NotFound' })).toEqual({ status: 'notFound' })
  })

  it('goes to error with a message key on failure', () => {
    expect(reduce(initialState, { type: 'Failed', errorKey: 'errors.network' })).toEqual({ status: 'error', errorKey: 'errors.network' })
  })
})
