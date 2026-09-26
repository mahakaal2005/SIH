import { useReducer } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { errorKey } from '@/core/data/errors'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSessionStore } from '@/core/session/SessionProvider'
import { requestOtp, verifyOtp } from '../domain/auth.usecase'

export interface State {
  step: 'phone' | 'otp'
  phone: string
  status: 'idle' | 'loading' | 'error' | 'success'
  errorKey?: string
  sentTo?: string
  devHint?: string
}

export type Event =
  | { type: 'PhoneSubmitted'; phone: string }
  | { type: 'OtpSent'; sentTo: string; devHint: string }
  | { type: 'OtpSubmitted' }
  | { type: 'Verified' }
  | { type: 'Failed'; errorKey: string }
  | { type: 'ChangeNumber' }

export const initialState: State = { step: 'phone', phone: '', status: 'idle' }

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'PhoneSubmitted':
      return { step: 'phone', phone: event.phone, status: 'loading' }
    case 'OtpSent':
      return { step: 'otp', phone: state.phone, status: 'idle', sentTo: event.sentTo, devHint: event.devHint }
    case 'OtpSubmitted': {
      const { errorKey: _, ...rest } = state
      return { ...rest, status: 'loading' }
    }
    case 'Verified':
      return { ...state, status: 'success' }
    case 'Failed':
      return { ...state, status: 'error', errorKey: event.errorKey }
    case 'ChangeNumber':
      return { step: 'phone', phone: state.phone, status: 'idle' }
  }
}

export function useLoginViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { auth } = useRepositories()
  const session = useSessionStore()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from

  async function submitPhone(phone: string) {
    dispatch({ type: 'PhoneSubmitted', phone })
    try {
      const r = await requestOtp(auth, phone)
      dispatch({ type: 'OtpSent', sentTo: r.sentTo, devHint: r.devHint })
    } catch (e) {
      dispatch({ type: 'Failed', errorKey: errorKey(e) })
    }
  }

  async function submitOtp(code: string) {
    dispatch({ type: 'OtpSubmitted' })
    try {
      const s = await verifyOtp(auth, state.phone, code)
      dispatch({ type: 'Verified' })
      session.setUser(s.user)
      navigate(from ?? routes.home, { replace: true })
    } catch (e) {
      dispatch({ type: 'Failed', errorKey: errorKey(e) })
    }
  }

  return { state, submitPhone, submitOtp, changeNumber: () => dispatch({ type: 'ChangeNumber' }) }
}
