import { applicantProfileSchema } from '@ys/shared'
import type { ProfileRepository } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'

export function createProfileRepository(db: MockDb, transport: MockTransport): ProfileRepository {
  const profile: ProfileRepository = {
    get: (userId) => transport.call('profile', async () => db.state.profiles[userId] ?? null),
    save: (userId, input) =>
      transport.call('profile', async () => {
        const p = applicantProfileSchema.parse(input)
        await db.commit((s) => {
          s.profiles[userId] = p
        })
        return p
      }),
  }
  return profile
}
