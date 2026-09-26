import type { Application, ReceiptPayload } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import type { FullCatalog } from '../../repositories/types'
import type { MockDb } from '../MockDb'

export const DEMO_OTP = '123456'
export const OTP_TTL_MS = 5 * 60_000
export const DEFAULT_RADIUS_KM = 50
export const RECEIPT_PREFIX = 'YS1|'

export const PHONE_RE = /^[6-9]\d{9}$/
export const today = (d: Date) => d.toISOString().slice(0, 10)
export const id = (prefix: string, seq: number) => `${prefix}-${seq}`

export function staticCatalog(rules: FullCatalog['rules']): FullCatalog {
  return {
    schemes: seed.schemes,
    rules,
    activities: seed.activities,
    projects: seed.pmajayProjects,
    approvalStats: seed.approvalStats,
    districts: seed.districts,
    documents: seed.documentRequirements,
    funnel: seed.approvalFunnel,
    healthPolicy: seed.healthPolicy,
    stageDurations: seed.stageDurations,
    partnerEntities: seed.partnerEntities,
  }
}

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export function receiptPayload(a: Application): ReceiptPayload {
  return {
    receiptNo: a.receiptNo, schemeId: a.schemeId, ruleVersion: a.ruleVersion, districtId: a.districtId,
    applicantName: a.profile.fullName, loanAmount: a.loanAmount, grantAmount: a.grantAmount, submittedAt: a.submittedAt,
  }
}

export const liveCatalog = (db: MockDb) => staticCatalog(db.state.rules)
