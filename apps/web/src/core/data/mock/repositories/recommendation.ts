import { applicantProfileSchema, recommend } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import type { RecommendationRepository } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { liveCatalog, today } from './common'

export function createRecommendationRepository(db: MockDb, transport: MockTransport): RecommendationRepository {
  const recommendation: RecommendationRepository = {
    recommend: (input) =>
      transport.call('recommendation', async () =>
        recommend(applicantProfileSchema.parse(input), liveCatalog(db), { ...seed.stateContext, asOf: today(db.now()) }),
      ),
  }
  return recommendation
}
