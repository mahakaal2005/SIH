import type { AuthRepository, AuthSession } from '@/core/data/repositories/types'

/** Accepts how people actually type Indian mobile numbers: spaces, dashes, +91, 091 or a leading 0. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  const m = /^(?:0?91|0)?([6-9]\d{9})$/.exec(digits)
  return m ? m[1]! : input.trim()
}

export const requestOtp = (repo: AuthRepository, phone: string) => repo.requestOtp(normalizePhone(phone))

export const verifyOtp = (repo: AuthRepository, phone: string, code: string): Promise<AuthSession> =>
  repo.verifyOtp(normalizePhone(phone), code.trim())
