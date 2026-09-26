import {
  financePlan,
  type EligibilityRule,
  type FinancePlan,
  type Localized,
  type PmAjayProject,
  type Recommendation,
  type RecommendationResult,
  type Scheme,
} from '@ys/shared'
import { betterOddsViews, type BetterOddsView } from './oddsView'

export interface RuleLineView {
  reasonKey: string
  passed: boolean
}

export interface SchemeDetailView {
  schemeId: string
  name: Localized
  agency: Localized
  summary: Localized
  kind: Scheme['kind']
  ruleVersion: number
  ruleEffectiveFrom: string
  lines: RuleLineView[]
  financePlan: FinancePlan
  approvalRatePct?: number
  lowOdds: boolean
  betterOdds: BetterOddsView[]
  project?: PmAjayProject
}

function findRecommendation(result: RecommendationResult, schemeId: string): Recommendation | undefined {
  return [...result.eligible, ...result.alsoAvailable, ...result.nearMisses, ...result.ineligible].find(
    (r) => r.scheme.id === schemeId,
  )
}

export function toDetailView(
  result: RecommendationResult,
  schemeId: string,
  rules: EligibilityRule[],
  area: 'rural' | 'urban',
  projects: PmAjayProject[],
): SchemeDetailView | undefined {
  const r = findRecommendation(result, schemeId)
  if (!r) return undefined

  const rule = rules.find((rl) => rl.schemeId === schemeId && rl.version === r.evaluation.ruleVersion)
  const project = r.scheme.pmajayProjectId ? projects.find((p) => p.id === r.scheme.pmajayProjectId) : undefined
  const lines: RuleLineView[] = [
    ...r.evaluation.passedKeys.map((reasonKey) => ({ reasonKey, passed: true })),
    ...r.evaluation.failed.map((f) => ({ reasonKey: f.reasonKey, passed: false })),
  ]

  return {
    schemeId: r.scheme.id,
    name: r.scheme.name,
    agency: r.scheme.agency,
    summary: r.scheme.summary,
    kind: r.scheme.kind,
    ruleVersion: r.evaluation.ruleVersion,
    ruleEffectiveFrom: rule?.effectiveFrom ?? '',
    lines,
    financePlan: financePlan(r.scheme, { projectCost: r.projectCost, area, trainingHours: project?.trainingHours }),
    ...(r.approvalRatePct !== undefined && { approvalRatePct: r.approvalRatePct }),
    lowOdds: r.lowOdds,
    betterOdds: betterOddsViews(r.betterOdds, projects),
    ...(project && { project }),
  }
}
