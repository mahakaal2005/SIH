import { assessPartnerHealth, haversineKm } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import type { PartnerMatch, PartnerRepository } from '../../repositories/types'
import type { MockTransport } from '../transport'
import { DEFAULT_RADIUS_KM } from './common'

export function createPartnerRepository(transport: MockTransport): PartnerRepository {
  const partner: PartnerRepository = {
    find: ({ schemeId, near, radiusKm = DEFAULT_RADIUS_KM }) =>
      transport.call('partner', async () => {
        const home = [...seed.districts].sort((a, b) => haversineKm(near, a) - haversineKm(near, b))[0]!
        const matches: PartnerMatch[] = []
        for (const branch of seed.partnerBranches) {
          if (!branch.authorisedSchemeIds.includes(schemeId)) continue
          const distanceKm = Math.round(haversineKm(near, branch) * 10) / 10
          if (distanceKm > radiusKm && branch.id !== `upscfdc-${home.id}`) continue
          const entity = seed.partnerEntities.find((e) => e.id === branch.entityId)!
          matches.push({
            branch,
            entity,
            district: seed.districts.find((d) => d.id === branch.districtId)!,
            health: assessPartnerHealth(entity.type, entity.health, seed.healthPolicy),
            distanceKm,
          })
        }
        const blocked = (m: PartnerMatch) => (m.health.status === 'blocked' ? 1 : 0)
        return matches.sort((a, b) => blocked(a) - blocked(b) || a.distanceKm - b.distanceKm)
      }),
  }
  return partner
}
