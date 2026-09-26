import { describe, expect, it } from 'vitest'
import { eligibilityRules } from '@ys/shared/seed'
import { REJECTION_REASONS } from '@/core/data/mock/seedApplications'
import en from './locales/en.json'
import hi from './locales/hi.json'

type Tree = { [k: string]: string | Tree }
const lookup = (tree: Tree, key: string) => key.split('.').reduce<string | Tree | undefined>((t, k) => (t && typeof t === 'object' ? t[k] : undefined), tree)
const STAGES = ['submitted', 'pre_scrutiny', 'dlpac', 'bank', 'sanctioned', 'disbursed', 'srf_lock', 'completed', 'rejected', 'returned']

describe.each([['en', en], ['hi', hi]] as const)('%s locale covers every engine key', (_lang, dict) => {
  const reasonKeys = new Set(eligibilityRules.flatMap((r) => r.criteria.map((c) => c.criterion.reasonKey)))
  const priorityKeys = new Set(eligibilityRules.flatMap((r) => r.priority.map((p) => p.reasonKey)))

  it.each([...reasonKeys])('%s has pass and fail text', (key) => {
    expect(typeof lookup(dict, `${key}.pass`)).toBe('string')
    expect(typeof lookup(dict, `${key}.fail`)).toBe('string')
  })

  it.each([...priorityKeys])('%s has text', (key) => {
    expect(typeof lookup(dict, key)).toBe('string')
  })

  it.each(STAGES)('stage %s has a label and a notification', (stage) => {
    expect(typeof lookup(dict, `stage.${stage}`)).toBe('string')
    expect(typeof lookup(dict, `notify.stage.${stage}`)).toBe('string')
  })

  it.each([...REJECTION_REASONS])('rejection reason %s has text', (key) => {
    expect(typeof lookup(dict, key)).toBe('string')
  })
})
