import { AppError } from '../../errors'
import type { AuthRepository } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { DEMO_OTP, id, OTP_TTL_MS, PHONE_RE } from './common'

export function createAuthRepository(db: MockDb, transport: MockTransport): AuthRepository {
  const auth: AuthRepository = {
    requestOtp: (phone) =>
      transport.call('auth', async () => {
        if (!PHONE_RE.test(phone)) throw new AppError('auth.phoneInvalid')
        await db.commit((s) => {
          s.otps[phone] = { code: DEMO_OTP, expiresAt: new Date(db.now().getTime() + OTP_TTL_MS).toISOString() }
        })
        return { sentTo: `******${phone.slice(-4)}`, devHint: DEMO_OTP }
      }),
    verifyOtp: (phone, code) =>
      transport.call('auth', async () => {
        const otp = db.state.otps[phone]
        if (!otp || otp.code !== code || Date.parse(otp.expiresAt) < db.now().getTime()) throw new AppError('auth.otpInvalid')
        const seq = await db.nextSeq()
        const user = await db.commit((s) => {
          delete s.otps[phone]
          let u = s.users.find((x) => x.phone === phone)
          if (!u) {
            u = { id: id('user', seq), phone, role: 'citizen', preferredLanguage: 'hi' }
            s.users.push(u)
          }
          s.sessionUserId = u.id
          return u
        })
        return { user, token: `mock-${user.id}-${seq}` }
      }),
    currentSession: () =>
      transport.call('auth', async () => {
        const user = db.state.users.find((u) => u.id === db.state.sessionUserId)
        return user ? { user, token: `mock-${user.id}` } : null
      }),
    logout: () =>
      transport.call('auth', async () => {
        await db.commit((s) => {
          s.sessionUserId = null
        })
      }),
  }
  return auth
}
