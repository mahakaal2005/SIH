import type { ApplicantProfile } from '../schemas/profile'
import type { EligibilityRule } from '../schemas/rule'
import type { Activity, District, PmAjayProject, ProjectApprovalStat, Scheme, SchemeTrack } from '../types/domain'
import { evaluateRule, type Facts, type RuleEvaluation } from './eligibility'

export interface Catalog {
  schemes: Scheme[]
  rules: EligibilityRule[]
  activities: Activity[]
  projects: PmAjayProject[]
  approvalStats: ProjectApprovalStat[]
  districts: District[]
}

export interface RecommendContext {
  stateHasWorkingSca: boolean
  /** ISO date; rules not yet in effect are ignored. */
  asOf: string
}

export interface BetterOdds {
  projectId: string
  schemeId: string
  approvalRatePct: number
}

export interface Recommendation {
  scheme: Scheme
  evaluation: RuleEvaluation
  projectCost: number
  projectCostSource: 'sop' | 'applicant'
  approvalRatePct?: number
  lowOdds: boolean
  betterOdds: BetterOdds[]
}

export interface RecommendationResult {
  eligible: Recommendation[]
  /** Caste-neutral options the applicant also qualifies for, shown secondary when an SC scheme fits. */
  alsoAvailable: Recommendation[]
  nearMisses: Recommendation[]
  ineligible: Recommendation[]
  fallbackUsed: boolean
}

/** Below this historical approval rate we warn and suggest alternatives (docs/05 F4.3). */
export const LOW_ODDS_PCT = 20
const MAX_ALTERNATIVES = 3
const TIER: Record<SchemeTrack, number> = { pmajay_gia: 0, nsfdc: 1, fallback: 2 }

export function activeRule(rules: EligibilityRule[], schemeId: string, asOf: string): EligibilityRule | undefined {
  return rules
    .filter((r) => r.schemeId === schemeId && r.effectiveFrom <= asOf)
    .sort((a, b) => b.version - a.version)[0]
}

export function buildFacts(profile: ApplicantProfile, catalog: Catalog, ctx: RecommendContext): Facts {
  return {
    ...profile,
    activityCategory: catalog.activities.find((a) => a.id === profile.activityId)?.category,
    isUpResident: catalog.districts.some((d) => d.id === profile.districtId),
    stateHasWorkingSca: ctx.stateHasWorkingSca,
  }
}

export function approvalRate(stats: ProjectApprovalStat[], projectId: string): number | undefined {
  const s = stats.find((x) => x.projectId === projectId)
  return s && s.applied > 0 ? Math.round((s.approved / s.applied) * 1000) / 10 : undefined
}

export function recommend(profile: ApplicantProfile, catalog: Catalog, ctx: RecommendContext): RecommendationResult {
  const facts = buildFacts(profile, catalog, ctx)
  const all: Recommendation[] = []

  for (const scheme of catalog.schemes) {
    const rule = activeRule(catalog.rules, scheme.id, ctx.asOf)
    if (!rule) continue
    const evaluation = evaluateRule(rule, facts)
    // A PM-AJAY project for a different activity is noise, not a "why not".
    if (scheme.track === 'pmajay_gia' && evaluation.failed.some((f) => f.reasonKey === 'rule.activityMatch')) continue

    const project = scheme.pmajayProjectId ? catalog.projects.find((p) => p.id === scheme.pmajayProjectId) : undefined
    const sopCost = project?.costPerPerson ?? null
    const approvalRatePct = project ? approvalRate(catalog.approvalStats, project.id) : undefined
    const lowOdds = approvalRatePct !== undefined && approvalRatePct < LOW_ODDS_PCT

    all.push({
      scheme,
      evaluation,
      projectCost: sopCost ?? profile.estimatedCost,
      projectCostSource: sopCost !== null ? 'sop' : 'applicant',
      ...(approvalRatePct !== undefined && { approvalRatePct }),
      lowOdds,
      betterOdds: lowOdds && evaluation.eligible ? betterOddsFor(approvalRatePct!, facts, catalog, ctx) : [],
    })
  }

  const byRank = (a: Recommendation, b: Recommendation) =>
    TIER[a.scheme.track] - TIER[b.scheme.track] ||
    (b.approvalRatePct ?? -1) - (a.approvalRatePct ?? -1) ||
    a.scheme.finance.ratePct.default - b.scheme.finance.ratePct.default

  const eligibleAll = all.filter((r) => r.evaluation.eligible).sort(byRank)
  const scEligible = eligibleAll.filter((r) => r.scheme.track !== 'fallback')
  const fallbackEligible = eligibleAll.filter((r) => r.scheme.track === 'fallback')
  const fallbackUsed = scEligible.length === 0 && fallbackEligible.length > 0

  return {
    eligible: fallbackUsed ? fallbackEligible : scEligible,
    alsoAvailable: fallbackUsed ? [] : fallbackEligible,
    nearMisses: all.filter((r) => !r.evaluation.eligible && r.evaluation.isNearMiss).sort(byRank),
    ineligible: all.filter((r) => !r.evaluation.eligible && !r.evaluation.isNearMiss).sort(byRank),
    fallbackUsed,
  }
}

function betterOddsFor(current: number, facts: Facts, catalog: Catalog, ctx: RecommendContext): BetterOdds[] {
  const out: BetterOdds[] = []
  for (const project of catalog.projects) {
    const rate = approvalRate(catalog.approvalStats, project.id)
    const schemeId = `pmajay-${project.id}`
    const rule = activeRule(catalog.rules, schemeId, ctx.asOf)
    if (rate === undefined || rate <= current || !rule) continue
    if (evaluateRule(rule, { ...facts, activityId: project.id }).eligible) {
      out.push({ projectId: project.id, schemeId, approvalRatePct: rate })
    }
  }
  return out.sort((a, b) => b.approvalRatePct - a.approvalRatePct).slice(0, MAX_ALTERNATIVES)
}
