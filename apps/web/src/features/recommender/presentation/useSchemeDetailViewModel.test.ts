import { describe, expect, it } from 'vitest'
import type { SchemeDetailView } from '../domain/detailView'
import type { FunnelDisclosure } from '../domain/oddsView'
import { initialState, reduce } from './useSchemeDetailViewModel'

const view = {} as SchemeDetailView
const funnel = {} as FunnelDisclosure

describe('scheme detail reduce()', () => {
  it('starts loading', () => {
    expect(initialState).toEqual({ status: 'loading' })
  })

  it('goes to success with the view and funnel disclosure when found', () => {
    expect(reduce(initialState, { type: 'Loaded', view, funnel })).toEqual({ status: 'success', view, funnel })
  })

  it('goes to notFound when the scheme is not in the result', () => {
    expect(reduce(initialState, { type: 'Loaded', view: undefined, funnel })).toEqual({ status: 'notFound' })
  })

  it('goes to error with a message key on failure', () => {
    expect(reduce(initialState, { type: 'Failed', errorKey: 'errors.network' })).toEqual({ status: 'error', errorKey: 'errors.network' })
  })
})
