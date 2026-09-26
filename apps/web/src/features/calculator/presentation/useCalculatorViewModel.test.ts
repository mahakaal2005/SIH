import { describe, expect, it } from 'vitest'
import type { CalculatorView, LoanTerms } from '../domain/calculatorView'
import { initialState, reduce } from './useCalculatorViewModel'

const view = {} as CalculatorView
const terms: LoanTerms = { ratePct: 10.5, tenureMonths: 60, moratoriumMonths: 6 }

describe('calculator reduce()', () => {
  it('starts loading', () => {
    expect(initialState).toEqual({ status: 'loading' })
  })

  it('goes to success with the recomputed view and terms', () => {
    expect(reduce(initialState, { type: 'Recomputed', view, terms })).toEqual({ status: 'success', view, terms })
  })

  it('goes to noCost when the journey has no project cost', () => {
    expect(reduce(initialState, { type: 'NoCost' })).toEqual({ status: 'noCost' })
  })

  it('goes to notFound when the scheme id is not in the catalog', () => {
    expect(reduce(initialState, { type: 'NotFound' })).toEqual({ status: 'notFound' })
  })

  it('goes to error with a message key on failure', () => {
    expect(reduce(initialState, { type: 'Failed', errorKey: 'errors.network' })).toEqual({ status: 'error', errorKey: 'errors.network' })
  })

  it('resets back to loading', () => {
    expect(reduce({ status: 'success', view, terms }, { type: 'Reset' })).toEqual({ status: 'loading' })
  })
})
