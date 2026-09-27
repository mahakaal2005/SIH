import { assessPartnerHealth, type HealthAssessment, type HealthPolicy, type PartnerEntity } from '@ys/shared'

export interface PartnerHealthRow {
  entity: PartnerEntity
  assessment: HealthAssessment
}

export function toPartnerHealthView(entities: PartnerEntity[], policy: HealthPolicy): PartnerHealthRow[] {
  return entities.map((entity) => ({ entity, assessment: assessPartnerHealth(entity.type, entity.health, policy) }))
}
