import type { ApplicantProfile, RecommendationResult } from '@ys/shared'
import type { RecommendationRepository } from '@/core/data/repositories/types'

export const getRecommendations = (repo: RecommendationRepository, profile: ApplicantProfile): Promise<RecommendationResult> =>
  repo.recommend(profile)
