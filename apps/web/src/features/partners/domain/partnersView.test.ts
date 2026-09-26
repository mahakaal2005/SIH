import { assessPartnerHealth } from '@ys/shared'
import { districts, healthPolicy, partnerBranches, partnerEntities } from '@ys/shared/seed'
import { describe, expect, it } from 'vitest'
import type { PartnerMatch } from '@/core/data/repositories/types'
import { toPartnersView } from './partnersView'

function matchFor(branchId: string, distanceKm: number): PartnerMatch {
  const branch = partnerBranches.find((b) => b.id === branchId)!
  const entity = partnerEntities.find((e) => e.id === branch.entityId)!
  const district = districts.find((d) => d.id === branch.districtId)!
  return { branch, entity, district, health: assessPartnerHealth(entity.type, entity.health, healthPolicy), distanceKm }
}

describe('toPartnersView', () => {
  it('returns an empty view for no matches', () => {
    expect(toPartnersView([])).toEqual([])
  })

  it('leaves healthy and caution partners without an alternative', () => {
    const sbi = matchFor('sbi-sitapur', 2)
    const view = toPartnersView([sbi])
    expect(view).toEqual([{ match: sbi }])
  })

  it('attaches the nearest non-blocked match as the alternative for a blocked partner', () => {
    const union = matchFor('union-sitapur', 1) // blocked: 72% utilisation < 80% min
    const sbi = matchFor('sbi-sitapur', 3) // healthy
    const bob = matchFor('bob-sitapur', 5) // healthy, farther than sbi
    const view = toPartnersView([union, sbi, bob])
    const unionRow = view.find((row) => row.match.branch.id === 'union-sitapur')
    expect(unionRow?.alternative?.branch.id).toBe('sbi-sitapur')
  })

  it('leaves a blocked partner without an alternative when every other match is also blocked', () => {
    const union = matchFor('union-sitapur', 1)
    const upgb = matchFor('upgb-sitapur', 2)
    const view = toPartnersView([union, upgb])
    expect(view.every((row) => row.alternative === undefined)).toBe(true)
  })
})
