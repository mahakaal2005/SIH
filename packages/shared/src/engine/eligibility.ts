import { educationLevels } from '../schemas/profile'
import type { Criterion, EligibilityRule } from '../schemas/rule'

export type Facts = Record<string, unknown>

export interface NearMiss {
  limit: number
  gap: number
}

export interface FailedCriterion {
  reasonKey: string
  field: string
  actual: unknown
  criterion: Criterion
  nearMiss?: NearMiss
}

export interface RuleEvaluation {
  schemeId: string
  ruleVersion: number
  eligible: boolean
  /** True when ineligible only because of numeric limits missed by ≤ NEAR_MISS_SHARE. */
  isNearMiss: boolean
  passedKeys: string[]
  failed: FailedCriterion[]
  priorityKeys: string[]
}

const NEAR_MISS_SHARE = 0.1

function rank(level: unknown): number {
  return educationLevels.indexOf(level as (typeof educationLevels)[number])
}

export function testCriterion(c: Criterion, facts: Facts): boolean {
  const actual = facts[c.field]
  if (actual === undefined) return false
  switch (c.op) {
    case 'eq':
      return actual === c.value
    case 'neq':
      return actual !== c.value
    case 'in':
      return c.value.includes(actual as never)
    case 'notIn':
      return !c.value.includes(actual as never)
    case 'lt':
      return typeof actual === 'number' && actual < c.value
    case 'lte':
      return typeof actual === 'number' && actual <= c.value
    case 'gt':
      return typeof actual === 'number' && actual > c.value
    case 'gte':
      return typeof actual === 'number' && actual >= c.value
    case 'between':
      return typeof actual === 'number' && actual >= c.value[0] && actual <= c.value[1]
    case 'isTrue':
      return actual === true
    case 'isFalse':
      return actual === false
    case 'educationAtLeast': {
      const have = rank(actual)
      return have >= 0 && have >= rank(c.value)
    }
  }
}

function nearMissOf(c: Criterion, actual: unknown): NearMiss | undefined {
  if (typeof actual !== 'number') return undefined
  let limit: number
  if (c.op === 'lt' || c.op === 'lte' || c.op === 'gt' || c.op === 'gte') limit = c.value
  else if (c.op === 'between') limit = actual < c.value[0] ? c.value[0] : c.value[1]
  else return undefined
  const gap = Math.abs(actual - limit)
  return limit !== 0 && gap / Math.abs(limit) <= NEAR_MISS_SHARE ? { limit, gap } : undefined
}

export function evaluateRule(rule: EligibilityRule, facts: Facts): RuleEvaluation {
  const passedKeys: string[] = []
  const failed: FailedCriterion[] = []

  for (const { criterion, when } of rule.criteria) {
    if (when && !when.every((g) => testCriterion(g, facts))) continue
    if (testCriterion(criterion, facts)) {
      passedKeys.push(criterion.reasonKey)
      continue
    }
    const actual = facts[criterion.field]
    const nearMiss = nearMissOf(criterion, actual)
    failed.push({ reasonKey: criterion.reasonKey, field: criterion.field, actual, criterion, ...(nearMiss && { nearMiss }) })
  }

  return {
    schemeId: rule.schemeId,
    ruleVersion: rule.version,
    eligible: failed.length === 0,
    isNearMiss: failed.length > 0 && failed.every((f) => f.nearMiss),
    passedKeys,
    failed,
    priorityKeys: rule.priority.filter((p) => testCriterion(p, facts)).map((p) => p.reasonKey),
  }
}
