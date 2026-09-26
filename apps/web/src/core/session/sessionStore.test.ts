import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../data/repositories/types'
import { createSessionStore } from './sessionStore'

const user: User = { id: 'u1', phone: '9876543210', role: 'citizen', preferredLanguage: 'hi' }
const terms = { ratePct: 10.5, tenureMonths: 60, moratoriumMonths: 6 }

describe('sessionStore', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no language so the picker is shown first (F0.2)', () => {
    expect(createSessionStore(localStorage).get().language).toBeNull()
  })

  it('remembers the chosen language across reloads', () => {
    createSessionStore(localStorage).setLanguage('hi')
    expect(createSessionStore(localStorage).get().language).toBe('hi')
  })

  it('notifies subscribers on change', () => {
    const s = createSessionStore(localStorage)
    const l = vi.fn()
    s.subscribe(l)
    s.setLanguage('en')
    expect(l).toHaveBeenCalledTimes(1)
  })

  it('clears downstream choices when a different scheme is chosen', () => {
    const s = createSessionStore(localStorage)
    s.chooseScheme('pmajay-boutique', 120000)
    s.setLoanTerms(terms)
    s.choosePartner('sbi-sitapur')
    s.chooseScheme('pmajay-boutique', 120000)
    expect(s.get().journey.partnerBranchId).toBe('sbi-sitapur')
    s.chooseScheme('nsfdc-micro-credit', 130000)
    expect(s.get().journey).toEqual({ schemeId: 'nsfdc-micro-credit', projectCost: 130000 })
  })

  it('persists the journey across reloads', () => {
    const s = createSessionStore(localStorage)
    s.setUser(user)
    s.chooseScheme('pmajay-boutique', 120000)
    expect(createSessionStore(localStorage).get().journey.schemeId).toBe('pmajay-boutique')
    expect(createSessionStore(localStorage).get().journey.projectCost).toBe(120000)
  })

  it('drops the journey but keeps the language on sign-out', () => {
    const s = createSessionStore(localStorage)
    s.setLanguage('hi')
    s.setUser(user)
    s.chooseScheme('pmajay-boutique', 120000)
    s.setUser(null)
    expect(s.get()).toEqual({ language: 'hi', user: null, journey: {} })
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem('ys-session', '{not json')
    expect(createSessionStore(localStorage).get()).toEqual({ language: null, user: null, journey: {} })
  })
})
