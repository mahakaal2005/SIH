import { describe, expect, it } from 'vitest'
import type { District } from '../types/domain'
import { haversineKm, resolveDistrict, searchDistricts } from './geo'

const d = (id: string, en: string, hi: string, aliases: string[] = []): District => ({
  id,
  name: { en, hi },
  aliases,
  officeEmail: `${id}@x`,
  lat: 0,
  lng: 0,
  isDemoDistrict: false,
  provenance: { kind: 'real', ref: 't' },
})

const districts = [
  d('prayagraj', 'Prayagraj', 'प्रयागराज', ['Allahabad']),
  d('ayodhya', 'Ayodhya', 'अयोध्या', ['Faizabad']),
  d('hathras', 'Hathras', 'हाथरस', ['Mahamaya Nagar']),
  d('sitapur', 'Sitapur', 'सीतापुर'),
  d('sant_ravidas_nagar', 'Sant Ravidas Nagar', 'संत रविदास नगर', ['Bhadohi']),
]

describe('resolveDistrict', () => {
  it('resolves the canonical English name case- and space-insensitively', () => {
    expect(resolveDistrict('  sitapur ', districts)?.id).toBe('sitapur')
  })
  it('resolves a legacy name to the renamed district', () => {
    expect(resolveDistrict('Allahabad', districts)?.id).toBe('prayagraj')
    expect(resolveDistrict('faizabad', districts)?.id).toBe('ayodhya')
  })
  it('ignores punctuation and spacing inside multi-word names', () => {
    expect(resolveDistrict('mahamaya-nagar', districts)?.id).toBe('hathras')
  })
  it('resolves the Hindi name', () => {
    expect(resolveDistrict('सीतापुर', districts)?.id).toBe('sitapur')
  })
  it('returns undefined for an unknown name', () => {
    expect(resolveDistrict('Mumbai', districts)).toBeUndefined()
  })
})

describe('searchDistricts', () => {
  it('matches by prefix and reports which alias matched', () => {
    const r = searchDistricts('alla', districts)
    expect(r).toEqual([{ district: districts[0], matchedAlias: 'Allahabad' }])
  })
  it('does not report an alias when the canonical name matched', () => {
    expect(searchDistricts('sit', districts)).toEqual([{ district: districts[3] }])
  })
  it('returns nothing for an empty query', () => {
    expect(searchDistricts('  ', districts)).toEqual([])
  })
})

describe('haversineKm', () => {
  it('measures Lucknow to Sitapur at about 84 km', () => {
    expect(haversineKm({ lat: 26.8467, lng: 80.9462 }, { lat: 27.568, lng: 80.679 })).toBeCloseTo(84.4, 0)
  })
  it('is zero for the same point', () => {
    expect(haversineKm({ lat: 1, lng: 1 }, { lat: 1, lng: 1 })).toBe(0)
  })
})
