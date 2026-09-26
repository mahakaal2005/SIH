import { describe, expect, it } from 'vitest'
import { routes } from '@/core/router/routes'
import { entryRoute, journeyStep } from './entry'

const citizen = { id: 'u', phone: '9876543210', role: 'citizen' as const, preferredLanguage: 'hi' as const }

describe('entryRoute', () => {
  it('asks for language before anything else', () => {
    expect(entryRoute({ language: null, user: null, hasProfile: false, hasApplication: false })).toBe(routes.language)
  })
  it('asks for login once language is set', () => {
    expect(entryRoute({ language: 'hi', user: null, hasProfile: false, hasApplication: false })).toBe(routes.login)
  })
  it('sends a new citizen to the profile form', () => {
    expect(entryRoute({ language: 'hi', user: citizen, hasProfile: false, hasApplication: false })).toBe(routes.profile)
  })
  it('sends a citizen with a profile to recommendations', () => {
    expect(entryRoute({ language: 'hi', user: citizen, hasProfile: true, hasApplication: false })).toBe(routes.schemes)
  })
  it('sends a citizen who has applied to their status', () => {
    expect(entryRoute({ language: 'hi', user: citizen, hasProfile: true, hasApplication: true })).toBe(routes.status)
  })
  it('sends officers and HQ to the officer desk', () => {
    for (const role of ['district_officer', 'hq_admin'] as const) {
      expect(entryRoute({ language: 'en', user: { ...citizen, role }, hasProfile: false, hasApplication: false })).toBe(routes.officer)
    }
  })
})

describe('journeyStep', () => {
  it.each([
    ['/profile', 1],
    ['/schemes', 2],
    ['/schemes/pmajay-boutique', 2],
    ['/schemes/pmajay-boutique/cost', 3],
    ['/schemes/pmajay-boutique/partners', 4],
    ['/schemes/pmajay-boutique/documents', 5],
    ['/status', null],
    ['/officer', null],
  ])('%s → %s', (path, step) => {
    expect(journeyStep(path)).toBe(step)
  })
})
