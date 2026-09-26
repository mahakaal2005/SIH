import { describe, expect, it } from 'vitest'
import { pmajayProjects } from '@ys/shared/seed'
import { normalizePhone } from './auth.usecase'
import { PROFILE_STEPS, profileDefaults, suggestedCost } from './profileForm'

describe('normalizePhone', () => {
  it.each([
    ['9876543210', '9876543210'],
    [' 98765 43210 ', '9876543210'],
    ['+91 98765-43210', '9876543210'],
    ['091-9876543210', '9876543210'],
    ['09876543210', '9876543210'],
  ])('%j → %s', (input, out) => {
    expect(normalizePhone(input)).toBe(out)
  })

  it('leaves anything else for the backend to reject', () => {
    expect(normalizePhone('12345')).toBe('12345')
  })
})

describe('profile form model', () => {
  it('covers every profile field exactly once across the three steps', () => {
    const fields = PROFILE_STEPS.flatMap((s) => s.fields)
    expect(new Set(fields).size).toBe(fields.length)
    expect([...fields].sort()).toEqual(Object.keys(profileDefaults()).sort())
  })

  it('pre-fills from a saved profile', () => {
    const saved = { ...profileDefaults(), fullName: 'Sunita Devi', age: 32 }
    expect(profileDefaults(saved as never)).toMatchObject({ fullName: 'Sunita Devi', age: 32 })
  })

  it('defaults to a rural SC applicant starting a business, with nothing assumed about history', () => {
    expect(profileDefaults()).toMatchObject({
      casteCategory: 'SC', area: 'rural', purpose: 'business', isDefaulter: false, settledViaOTS: false,
    })
  })

  it('suggests the SOP cost for a PM-AJAY project and nothing for generic activities', () => {
    expect(suggestedCost('boutique', pmajayProjects)).toBe(120000)
    expect(suggestedCost('home_industry', pmajayProjects)).toBeUndefined()
    expect(suggestedCost('other_service', pmajayProjects)).toBeUndefined()
  })
})
