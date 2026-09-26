import type { Repositories } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { createApplicationRepository } from './application'
import { createAuthRepository } from './auth'
import { createCatalogRepository } from './catalog'
import { createDocumentRepository } from './document'
import { createNotificationRepository } from './notification'
import { createPartnerRepository } from './partner'
import { createProfileRepository } from './profile'
import { createRecommendationRepository } from './recommendation'

export { DEMO_OTP } from './common'

export function createMockRepositories(db: MockDb, transport: MockTransport): Repositories {
  return {
    auth: createAuthRepository(db, transport),
    catalog: createCatalogRepository(db, transport),
    profile: createProfileRepository(db, transport),
    recommendation: createRecommendationRepository(db, transport),
    partner: createPartnerRepository(transport),
    document: createDocumentRepository(db, transport),
    application: createApplicationRepository(db, transport),
    notification: createNotificationRepository(db, transport),
  }
}
