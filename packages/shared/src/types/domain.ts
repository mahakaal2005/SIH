import type { Localized, Provenance, Rupees } from './common'
import type { ApplicantProfile } from '../schemas/profile'

export type SchemeTrack = 'pmajay_gia' | 'nsfdc' | 'fallback'
export type ActivityCategory = 'manufacturing' | 'service' | 'trade' | 'livestock' | 'education'

export interface Activity {
  id: string
  name: Localized
  category: ActivityCategory
  /** Set when the activity is one of the 16 UPSCFDC PM-AJAY projects. */
  pmajayProjectId?: string
  icon: string
}

export interface Range {
  min: number
  max: number
  default: number
}

export interface SchemeFinance {
  minProjectCost?: Rupees
  maxProjectCost?: Rupees
  maxLoan?: Rupees
  /** Share of project cost the lender finances, e.g. 0.9 for NSFDC. */
  financingShare?: number
  ratePct: Range
  tenureMonths: Range
  moratoriumMonths: Range
  /** PM-AJAY: grant = min(maxAmount, maxShareOfCost × cost). */
  grant?: { maxAmount: Rupees; maxShareOfCost: number }
  beneficiaryContributionShare?: number
  /** PMEGP margin-money subsidy share by area. */
  subsidyShare?: { rural: number; urban: number }
  /** CGTMSE guarantee fee, % of loan per year, borne by the beneficiary. */
  cgtmseFeePct?: number
}

export interface Scheme {
  id: string
  track: SchemeTrack
  agency: Localized
  name: Localized
  summary: Localized
  kind: 'grant_plus_loan' | 'loan' | 'subsidy_plus_loan'
  finance: SchemeFinance
  pmajayProjectId?: string
  /** Scheme-specific documents on top of the common set. */
  extraDocumentIds: string[]
  provenance: Provenance
  financeProvenance: Record<string, Provenance>
}

export interface SkillCourse {
  name: string
  code: string
}

export interface PmAjayProject {
  id: string
  number: number
  name: Localized
  structure: 'cluster' | 'group' | 'hybrid_group' | 'service_cluster'
  /** null when the SOP cost sheet has not been transcribed (projects 11–16). */
  costPerPerson: Rupees | null
  womenOnly: boolean
  skillCourses: SkillCourse[]
  conditions: Localized[]
  trainingHours: number
  provenance: Provenance
}

export interface ProjectApprovalStat {
  projectId: string
  applied: number
  approved: number
  provenance: Provenance
}

export interface ApprovalFunnel {
  applied: number
  approved: number
  rejected: number
  noDecision: number
  mostApplicationsDistrict: { districtId: string; count: number }
  mostApprovalsDistrict: { districtId: string; count: number }
  provenance: Provenance
}

export interface District {
  id: string
  name: Localized
  /** Legacy/official alternative names, e.g. Allahabad for Prayagraj. */
  aliases: string[]
  officeEmail: string
  lat: number
  lng: number
  isDemoDistrict: boolean
  provenance: Provenance
}

export type PartnerType = 'UPSCFDC_OFFICE' | 'RRB' | 'PSB'

export interface PartnerEntity {
  id: string
  name: Localized
  type: PartnerType
  health: PartnerHealth
}

export interface PartnerHealth {
  overdueToNsfdcOver1YearRupees: Rupees
  cumulativeUtilisationPct: number
  /** Net NPA % for each of the last 6 years, oldest first. RRBs only. */
  netNpaPctLast6Years?: number[]
  hasOverdueAtDisbursement?: boolean
  asOf: string
  provenance: Provenance
}

export interface PartnerBranch {
  id: string
  entityId: string
  name: Localized
  districtId: string
  address: string
  lat: number
  lng: number
  phone?: string
  email?: string
  authorisedSchemeIds: string[]
  provenance: Provenance
}

export interface HealthPolicy {
  maxOverdueOver1YearRupees: Rupees
  minCumulativeUtilisationPct: number
  rrbMaxNetNpaPct: number
  rrbMinYearsUnderNpaLimit: number
  rrbWindowYears: number
  /** Within this many points of a threshold → caution. */
  cautionMarginPct: number
  provenance: Provenance
}

export interface DocumentRequirement {
  id: string
  name: Localized
  hint: Localized
  digiLocker: boolean
  appliesTo: 'all' | 'livestock' | 'education' | 'pmajay' | 'nsfdc'
  provenance: Provenance
}

export type ApplicationStage =
  | 'submitted'
  | 'pre_scrutiny'
  | 'dlpac'
  | 'bank'
  | 'sanctioned'
  | 'disbursed'
  | 'srf_lock'
  | 'completed'
  | 'rejected'
  | 'returned'

export interface StageEvent {
  stage: ApplicationStage
  at: string
  actor: 'citizen' | 'district_officer' | 'bank' | 'system'
  note?: string
  reasonKey?: string
}

export interface Application {
  id: string
  receiptNo: string
  userId: string
  schemeId: string
  ruleVersion: number
  districtId: string
  partnerBranchId: string | null
  profile: ApplicantProfile
  loanAmount: Rupees
  grantAmount: Rupees
  stage: ApplicationStage
  history: StageEvent[]
  submittedAt: string
  /** base64 ECDSA signature over the canonical receipt payload. */
  signature: string
  seeded: boolean
}
