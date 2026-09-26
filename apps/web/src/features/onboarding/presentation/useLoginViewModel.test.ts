import { describe, expect, it } from 'vitest'
import { initialState as initialLoginState, reduce as loginReducer, type State as LoginState } from './useLoginViewModel'

const otpStep: LoginState = { ...initialLoginState, step: 'otp', phone: '9876543210', sentTo: '******3210', devHint: '123456' }

describe('login reduce()', () => {
  it('starts on the phone step, idle', () => {
    expect(initialLoginState).toEqual({ step: 'phone', phone: '', status: 'idle' })
  })

  it('goes to loading when a phone is submitted, clearing old errors', () => {
    const s = loginReducer({ ...initialLoginState, status: 'error', errorKey: 'x' }, { type: 'PhoneSubmitted', phone: '9876543210' })
    expect(s).toEqual({ step: 'phone', phone: '9876543210', status: 'loading' })
  })

  it('moves to the OTP step once the code is sent', () => {
    const s = loginReducer({ ...initialLoginState, phone: '9876543210', status: 'loading' }, { type: 'OtpSent', sentTo: '******3210', devHint: '123456' })
    expect(s).toEqual(otpStep)
  })

  it('stays on the OTP step with an error when the code is wrong', () => {
    const loading = loginReducer(otpStep, { type: 'OtpSubmitted' })
    expect(loading.status).toBe('loading')
    const s = loginReducer(loading, { type: 'Failed', errorKey: 'errors.auth.otpInvalid' })
    expect(s).toMatchObject({ step: 'otp', status: 'error', errorKey: 'errors.auth.otpInvalid' })
  })

  it('lets the person change the number', () => {
    expect(loginReducer(otpStep, { type: 'ChangeNumber' })).toEqual({ step: 'phone', phone: '9876543210', status: 'idle' })
  })

  it('marks success once verified', () => {
    expect(loginReducer(otpStep, { type: 'Verified' }).status).toBe('success')
  })
})
