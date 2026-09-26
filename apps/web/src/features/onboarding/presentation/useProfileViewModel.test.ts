import { describe, expect, it } from 'vitest'
import { initialState, reduce, type State } from './useProfileViewModel'

const ready: State = { ...initialState, status: 'idle' }

describe('profile reduce()', () => {
  it('starts loading the saved profile on step 0', () => {
    expect(initialState).toEqual({ status: 'loading', step: 0, assisted: false, saving: false })
  })

  it('becomes idle once loaded, or error with a key', () => {
    expect(reduce(initialState, { type: 'Loaded' }).status).toBe('idle')
    expect(reduce(initialState, { type: 'LoadFailed', errorKey: 'errors.network' })).toMatchObject({ status: 'error', errorKey: 'errors.network' })
  })

  it('moves between the three steps without going out of range', () => {
    let s = reduce(ready, { type: 'Back' })
    expect(s.step).toBe(0)
    s = reduce(reduce(reduce(s, { type: 'Next' }), { type: 'Next' }), { type: 'Next' })
    expect(s.step).toBe(2)
    expect(reduce(s, { type: 'Back' }).step).toBe(1)
  })

  it('toggles assisted mode', () => {
    expect(reduce(ready, { type: 'AssistedToggled' }).assisted).toBe(true)
  })

  it('tracks saving and keeps the step on a save error', () => {
    const onLast = { ...ready, step: 2 }
    const saving = reduce(onLast, { type: 'SaveStarted' })
    expect(saving).toMatchObject({ saving: true, step: 2 })
    const failed = reduce(saving, { type: 'SaveFailed', errorKey: 'errors.network' })
    expect(failed).toMatchObject({ saving: false, step: 2, saveErrorKey: 'errors.network', status: 'idle' })
    expect(reduce(failed, { type: 'SaveStarted' }).saveErrorKey).toBeUndefined()
  })

  it('reports success after saving', () => {
    expect(reduce({ ...ready, saving: true }, { type: 'Saved' })).toMatchObject({ saving: false, status: 'success' })
  })
})
