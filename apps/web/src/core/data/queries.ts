import type { ApplicantProfile } from '@ys/shared'
import { useQuery } from '@tanstack/react-query'
import { useRepositories } from '../di/RepositoryProvider'
import type { PartnerQuery } from './repositories/types'

export const queryKeys = {
  catalog: ['catalog'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  recommendations: (userId: string) => ['recommendations', userId] as const,
  applications: (userId: string) => ['applications', userId] as const,
  partners: (query: PartnerQuery) => ['partners', query.schemeId, query.near.lat, query.near.lng] as const,
  checklist: (userId: string, schemeId: string) => ['checklist', userId, schemeId] as const,
  preflight: (userId: string) => ['preflight', userId] as const,
  application: (id: string) => ['application', id] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
}

/** Schemes, rules, districts, projects: read-mostly reference data shared by every feature. */
export function useCatalog() {
  const { catalog } = useRepositories()
  return useQuery({ queryKey: queryKeys.catalog, queryFn: () => catalog.getCatalog(), staleTime: 5 * 60_000 })
}

/** Partners authorised for a scheme, sorted by health then distance from `query.near`. */
export function usePartners(query: PartnerQuery) {
  const { partner } = useRepositories()
  return useQuery({ queryKey: queryKeys.partners(query), queryFn: () => partner.find(query) })
}

/** Which documents this citizen has already ticked off for a scheme. */
export function useChecklist(userId: string, schemeId: string) {
  const { document } = useRepositories()
  return useQuery({ queryKey: queryKeys.checklist(userId, schemeId), queryFn: () => document.getChecklistState(userId, schemeId) })
}

/** CIBIL / penny-drop / no-default pre-scrutiny simulation for this citizen. */
export function usePreflight(userId: string, profile: ApplicantProfile | null | undefined) {
  const { document } = useRepositories()
  return useQuery({
    queryKey: queryKeys.preflight(userId),
    queryFn: () => document.runPreflight(userId, profile!),
    enabled: !!profile,
  })
}

/** All of this citizen's applications, newest first. */
export function useApplications(userId: string) {
  const { application } = useRepositories()
  return useQuery({ queryKey: queryKeys.applications(userId), queryFn: () => application.listMine(userId) })
}

/** A single application by id, for the status detail screen. */
export function useApplication(id: string) {
  const { application } = useRepositories()
  return useQuery({ queryKey: queryKeys.application(id), queryFn: () => application.get(id) })
}

/** In-app preview of the SMS/WhatsApp nudges this citizen would receive. */
export function useNotifications(userId: string) {
  const { notification } = useRepositories()
  return useQuery({ queryKey: queryKeys.notifications(userId), queryFn: () => notification.list(userId) })
}
