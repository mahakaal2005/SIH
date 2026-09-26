import { financePlan, type FinancePlan, type Localized, type PmAjayProject, type Recommendation, type RecommendationResult, type Scheme } from '@ys/shared'
import { betterOddsViews, type BetterOddsView } from './oddsView'

const MAX_REASONS = 3

export interface SchemeCardView {
  schemeId: string
  agency: Localized
  name: Localized
  kind: Scheme['kind']
  financePlan: FinancePlan
  reasonKeys: string[]
  priorityKeys: string[]
  approvalRatePct?: number
  lowOdds: boolean
  betterOdds: BetterOddsView[]
  project?: PmAjayProject
}

export interface NearMissView {
  schemeId: string
  agency: Localized
  name: Localized
  failedReasonKeys: string[]
  gap: number
  limit: number
}

export interface IneligibleView {
  schemeId: string
  agency: Localized
  name: Localized
  failedReasonKeys: string[]
}

export interface ResultView {
  topMatch?: SchemeCardView
  eligible: SchemeCardView[]
  alsoAvailable: SchemeCardView[]
  nearMisses: NearMissView[]
  ineligible: IneligibleView[]
  fallbackUsed: boolean
  empty: boolean
}

function toCard(r: Recommendation, area: 'rural' | 'urban', projects: PmAjayProject[]): SchemeCardView {
  const project = r.scheme.pmajayProjectId ? projects.find((p) => p.id === r.scheme.pmajayProjectId) : undefined
  return {
    schemeId: r.scheme.id,
    agency: r.scheme.agency,
    name: r.scheme.name,
    kind: r.scheme.kind,
    financePlan: financePlan(r.scheme, { projectCost: r.projectCost, area, trainingHours: project?.trainingHours }),
    reasonKeys: r.evaluation.passedKeys.slice(0, MAX_REASONS),
    priorityKeys: r.evaluation.priorityKeys,
    ...(r.approvalRatePct !== undefined && { approvalRatePct: r.approvalRatePct }),
    lowOdds: r.lowOdds,
    betterOdds: betterOddsViews(r.betterOdds, projects),
    ...(project && { project }),
  }
}

function toNearMiss(r: Recommendation): NearMissView {
  const first = r.evaluation.failed.find((f) => f.nearMiss)!
  return {
    schemeId: r.scheme.id,
    agency: r.scheme.agency,
    name: r.scheme.name,
    failedReasonKeys: r.evaluation.failed.map((f) => f.reasonKey),
    gap: first.nearMiss!.gap,
    limit: first.nearMiss!.limit,
  }
}

function toIneligible(r: Recommendation): IneligibleView {
  return {
    schemeId: r.scheme.id,
    agency: r.scheme.agency,
    name: r.scheme.name,
    failedReasonKeys: r.evaluation.failed.map((f) => f.reasonKey),
  }
}

export function toResultView(result: RecommendationResult, area: 'rural' | 'urban', projects: PmAjayProject[]): ResultView {
  const cards = result.eligible.map((r) => toCard(r, area, projects))
  const [topMatch, ...eligible] = cards
  return {
    ...(topMatch && { topMatch }),
    eligible,
    alsoAvailable: result.alsoAvailable.map((r) => toCard(r, area, projects)),
    nearMisses: result.nearMisses.map(toNearMiss),
    ineligible: result.ineligible.map(toIneligible),
    fallbackUsed: result.fallbackUsed,
    empty: cards.length === 0 && result.alsoAvailable.length === 0 && result.nearMisses.length === 0,
  }
}
