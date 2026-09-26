import type { Language } from '@ys/shared'
import type { User } from '../data/repositories/types'

export interface LoanTerms {
  ratePct: number
  tenureMonths: number
  moratoriumMonths: number
}

/** Selections carried between journey screens (the web equivalent of nav args / SavedStateHandle). */
export interface Journey {
  schemeId?: string
  loanTerms?: LoanTerms
  partnerBranchId?: string
}

export interface SessionState {
  language: Language | null
  user: User | null
  journey: Journey
}

const KEY = 'ys-session'
const EMPTY: SessionState = { language: null, user: null, journey: {} }

function load(storage: Storage): SessionState {
  try {
    const raw = storage.getItem(KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<SessionState>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export type SessionStore = ReturnType<typeof createSessionStore>

export function createSessionStore(storage: Storage) {
  let state = load(storage)
  const listeners = new Set<() => void>()

  const update = (next: SessionState) => {
    state = next
    storage.setItem(KEY, JSON.stringify(state))
    listeners.forEach((l) => l())
  }
  const journey = (patch: Journey) => update({ ...state, journey: { ...state.journey, ...patch } })

  return {
    get: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setLanguage: (language: Language) => update({ ...state, language }),
    setUser: (user: User | null) => update({ ...state, user, journey: user ? state.journey : {} }),
    chooseScheme(schemeId: string) {
      if (state.journey.schemeId === schemeId) return
      update({ ...state, journey: { schemeId } })
    },
    setLoanTerms: (loanTerms: LoanTerms) => journey({ loanTerms }),
    choosePartner: (partnerBranchId: string) => journey({ partnerBranchId }),
  }
}
