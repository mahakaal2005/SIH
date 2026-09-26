import { describe, expect, it } from 'vitest'
import { AppError, errorKey } from './errors'
import { MockNetworkError } from './mock/transport'

describe('errorKey', () => {
  it('maps backend error codes under errors.*', () => {
    expect(errorKey(new AppError('auth.otpInvalid'))).toBe('errors.auth.otpInvalid')
  })
  it('maps simulated and real network failures to errors.network', () => {
    expect(errorKey(new MockNetworkError('partner'))).toBe('errors.network')
    expect(errorKey(new TypeError('Failed to fetch'))).toBe('errors.network')
  })
  it('falls back to a generic message', () => {
    expect(errorKey(new Error('boom'))).toBe('errors.generic')
    expect(errorKey('weird')).toBe('errors.generic')
  })
})
