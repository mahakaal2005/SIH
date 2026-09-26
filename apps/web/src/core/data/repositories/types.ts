import type {
  ApplicantProfile, Application, ApplicationStage, ApprovalFunnel, Catalog, District, DocumentRequirement,
  EligibilityRule, HealthAssessment, HealthPolicy, Language, PartnerBranch, PartnerEntity, RecommendationResult,
  StageDurations,
} from '@ys/shared'

export type Role = 'citizen' | 'district_officer' | 'hq_admin'

export interface User {
  id: string
  phone: string
  role: Role
  /** District officers only see their own district's queue. */
  districtId?: string
  preferredLanguage: Language
}

export interface AuthSession {
  user: User
  token: string
}

export interface AuthRepository {
  requestOtp(phone: string): Promise<{ sentTo: string; devHint: string }>
  verifyOtp(phone: string, code: string, role?: Role): Promise<AuthSession>
  currentSession(): Promise<AuthSession | null>
  logout(): Promise<void>
}

export interface FullCatalog extends Catalog {
  documents: DocumentRequirement[]
  funnel: ApprovalFunnel
  healthPolicy: HealthPolicy
  stageDurations: StageDurations
  partnerEntities: PartnerEntity[]
}

export interface CatalogRepository {
  getCatalog(): Promise<FullCatalog>
  /** Rules admin: publishes a new version; previous versions stay for audit. */
  publishRule(rule: EligibilityRule): Promise<EligibilityRule>
  ruleHistory(schemeId: string): Promise<EligibilityRule[]>
}

export interface ProfileRepository {
  get(userId: string): Promise<ApplicantProfile | null>
  save(userId: string, profile: ApplicantProfile): Promise<ApplicantProfile>
}

export interface RecommendationRepository {
  recommend(profile: ApplicantProfile): Promise<RecommendationResult>
}

export interface PartnerMatch {
  branch: PartnerBranch
  entity: PartnerEntity
  district: District
  health: HealthAssessment
  distanceKm: number
}

export interface PartnerQuery {
  schemeId: string
  near: { lat: number; lng: number }
  radiusKm?: number
}

export interface PartnerRepository {
  find(query: PartnerQuery): Promise<PartnerMatch[]>
}

export type PreflightCheckId = 'cibil' | 'penny_drop' | 'no_default'
export interface PreflightResult {
  id: PreflightCheckId
  status: 'pass' | 'warn' | 'fail'
  detailKey: string
  params?: Record<string, string | number>
}

export interface DigiLockerDocument {
  documentId: string
  issuer: string
  issuedOn: string
  verified: true
}

export interface DocumentRepository {
  runPreflight(userId: string, profile: ApplicantProfile): Promise<PreflightResult[]>
  fetchFromDigiLocker(userId: string, documentId: string): Promise<DigiLockerDocument>
  getChecklistState(userId: string, schemeId: string): Promise<Record<string, boolean>>
  setChecklistItem(userId: string, schemeId: string, documentId: string, done: boolean): Promise<void>
}

export interface SubmitApplicationInput {
  userId: string
  schemeId: string
  profile: ApplicantProfile
  partnerBranchId: string | null
  loanAmount: number
  grantAmount: number
}

export type ReceiptVerification =
  | { valid: true; application: Pick<Application, 'receiptNo' | 'schemeId' | 'districtId' | 'stage' | 'submittedAt'> }
  | { valid: false; reason: 'malformed' | 'bad_signature' | 'not_found' }

export type OfficerAction =
  | { type: 'approve_pre_scrutiny' }
  | { type: 'forward_to_bank' }
  | { type: 'sanction' }
  | { type: 'disburse' }
  | { type: 'reject'; reasonKey: string; note?: string }
  | { type: 'return_for_fix'; reasonKey: string; note?: string }

export interface ApplicationRepository {
  submit(input: SubmitApplicationInput): Promise<Application>
  listMine(userId: string): Promise<Application[]>
  get(id: string): Promise<Application | null>
  /** Accepts the text encoded in a receipt / sanction letter QR. */
  verifyReceipt(encoded: string): Promise<ReceiptVerification>
  encodeReceipt(application: Application): string
  resubmit(id: string, userId: string): Promise<Application>
  // Officer side
  queue(filter: { districtId?: string; stages?: ApplicationStage[] }): Promise<Application[]>
  act(id: string, action: OfficerAction, actorId: string): Promise<Application>
}

export interface Notification {
  id: string
  userId: string
  applicationId: string
  channel: 'sms' | 'whatsapp' | 'push'
  messageKey: string
  params: Record<string, string | number>
  at: string
  read: boolean
}

export interface NotificationRepository {
  list(userId: string): Promise<Notification[]>
  markRead(id: string): Promise<void>
}

export interface Repositories {
  auth: AuthRepository
  catalog: CatalogRepository
  profile: ProfileRepository
  recommendation: RecommendationRepository
  partner: PartnerRepository
  document: DocumentRepository
  application: ApplicationRepository
  notification: NotificationRepository
}
