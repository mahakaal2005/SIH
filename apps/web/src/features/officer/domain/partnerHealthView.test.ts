import * as seed from '@ys/shared/seed'
import { describe, expect, it } from 'vitest'
import { toPartnerHealthView } from './partnerHealthView'

describe('toPartnerHealthView', () => {
  it('produces one health assessment per seeded partner entity', () => {
    const rows = toPartnerHealthView(seed.partnerEntities, seed.healthPolicy)
    expect(rows).toHaveLength(seed.partnerEntities.length)
    expect(rows.every((r) => ['healthy', 'caution', 'blocked'].includes(r.assessment.status))).toBe(true)
  })

  it('pairs each row with the entity it was computed from', () => {
    const rows = toPartnerHealthView(seed.partnerEntities, seed.healthPolicy)
    rows.forEach((row, i) => expect(row.entity).toBe(seed.partnerEntities[i]))
  })
})
