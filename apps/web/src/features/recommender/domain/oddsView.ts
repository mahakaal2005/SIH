import type { ApprovalFunnel, BetterOdds, District, Localized, PmAjayProject } from '@ys/shared'

export interface BetterOddsView {
  schemeId: string
  name: Localized
  approvalRatePct: number
}

export function betterOddsViews(betterOdds: BetterOdds[], projects: PmAjayProject[]): BetterOddsView[] {
  return betterOdds.map((b) => ({
    schemeId: b.schemeId,
    name: projects.find((p) => p.id === b.projectId)!.name,
    approvalRatePct: b.approvalRatePct,
  }))
}

export interface FunnelDisclosure {
  applied: number
  noDecisionPct: number
  mostApplications: { name: Localized; count: number }
  mostApprovals: { name: Localized; count: number }
}

export function funnelDisclosure(funnel: ApprovalFunnel, districts: District[]): FunnelDisclosure {
  const nameOf = (districtId: string) => districts.find((d) => d.id === districtId)!.name
  return {
    applied: funnel.applied,
    noDecisionPct: Math.round((funnel.noDecision / funnel.applied) * 1000) / 10,
    mostApplications: { name: nameOf(funnel.mostApplicationsDistrict.districtId), count: funnel.mostApplicationsDistrict.count },
    mostApprovals: { name: nameOf(funnel.mostApprovalsDistrict.districtId), count: funnel.mostApprovalsDistrict.count },
  }
}
