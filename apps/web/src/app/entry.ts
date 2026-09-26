import type { Language } from '@ys/shared'
import type { User } from '@/core/data/repositories/types'
import { routes } from '@/core/router/routes'

export function entryRoute(s: { language: Language | null; user: User | null; hasProfile: boolean; hasApplication: boolean }): string {
  if (!s.language) return routes.language
  if (!s.user) return routes.login
  if (s.user.role !== 'citizen') return routes.officer
  if (!s.hasProfile) return routes.profile
  return s.hasApplication ? routes.status : routes.schemes
}

export const JOURNEY_STEPS = ['profile', 'schemes', 'cost', 'partner', 'documents'] as const

/** 1-based position in the citizen journey for the current path, or null off-journey. */
export function journeyStep(path: string): number | null {
  if (path === routes.profile) return 1
  const m = /^\/schemes(?:\/[^/]+(?:\/(cost|partners|documents))?)?$/.exec(path)
  if (!m) return null
  return m[1] === 'cost' ? 3 : m[1] === 'partners' ? 4 : m[1] === 'documents' ? 5 : 2
}
