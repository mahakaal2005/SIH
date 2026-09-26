import { useQuery } from '@tanstack/react-query'
import { useRepositories } from '../di/RepositoryProvider'

export const queryKeys = {
  catalog: ['catalog'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  recommendations: (userId: string) => ['recommendations', userId] as const,
  applications: (userId: string) => ['applications', userId] as const,
}

/** Schemes, rules, districts, projects: read-mostly reference data shared by every feature. */
export function useCatalog() {
  const { catalog } = useRepositories()
  return useQuery({ queryKey: queryKeys.catalog, queryFn: () => catalog.getCatalog(), staleTime: 5 * 60_000 })
}
