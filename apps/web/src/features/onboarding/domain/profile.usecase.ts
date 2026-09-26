import { applicantProfileSchema, type ApplicantProfile } from '@ys/shared'
import type { ProfileRepository } from '@/core/data/repositories/types'
import type { ProfileFormValues } from './profileForm'

export const loadProfile = (repo: ProfileRepository, userId: string) => repo.get(userId)

/** Validates on the client with the same schema the backend uses, then saves. */
export const saveProfile = (repo: ProfileRepository, userId: string, values: ProfileFormValues): Promise<ApplicantProfile> =>
  repo.save(userId, applicantProfileSchema.parse(values))
