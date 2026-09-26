import type { PartnerMatch } from '@/core/data/repositories/types'

export interface PartnerListItem {
  match: PartnerMatch
  alternative?: PartnerMatch
}

export type PartnersView = PartnerListItem[]

export function toPartnersView(matches: PartnerMatch[]): PartnersView {
  const nonBlocked = matches.filter((m) => m.health.status !== 'blocked')
  return matches.map((match) => {
    if (match.health.status !== 'blocked') return { match }
    const alternative = [...nonBlocked].sort((a, b) => a.distanceKm - b.distanceKm)[0]
    return { match, alternative }
  })
}
