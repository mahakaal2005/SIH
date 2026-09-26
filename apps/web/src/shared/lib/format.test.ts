import { describe, expect, it } from 'vitest'
import { formatDate, formatINR, formatPct, formatRupeesShort } from './format'

describe('formatINR', () => {
  it('groups by lakh with a rupee sign', () => {
    expect(formatINR(120000)).toBe('₹1,20,000')
    expect(formatINR(4500000)).toBe('₹45,00,000')
  })
  it('keeps paise only when asked', () => {
    expect(formatINR(9231.17)).toBe('₹9,231')
    expect(formatINR(9231.17, { paise: true })).toBe('₹9,231.17')
  })
})

describe('formatRupeesShort', () => {
  it('uses lakh and crore words in each language', () => {
    expect(formatRupeesShort(145000, 'en')).toBe('₹1.45 lakh')
    expect(formatRupeesShort(145000, 'hi')).toBe('₹1.45 लाख')
    expect(formatRupeesShort(50000000, 'en')).toBe('₹5 crore')
    expect(formatRupeesShort(78566500000, 'hi')).toBe('₹7,856.65 करोड़')
  })
  it('falls back to full figures below one lakh', () => {
    expect(formatRupeesShort(50000, 'en')).toBe('₹50,000')
  })
})

describe('formatDate', () => {
  it('renders DD-MM-YYYY', () => {
    expect(formatDate('2026-01-07')).toBe('07-01-2026')
    expect(formatDate('2026-09-26T23:30:00.000Z')).toBe('27-09-2026')
  })
})

describe('formatPct', () => {
  it('keeps one decimal', () => {
    expect(formatPct(38.7)).toBe('38.7%')
    expect(formatPct(40)).toBe('40%')
  })
})
