import {
  applicantProfileSchema, assessPartnerHealth, canonicalReceiptPayload, eligibilityRuleSchema, haversineKm, nextStage,
  recommend, type Application, type ApplicationStage, type ReceiptPayload,
} from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { AppError } from '../errors'
import type {
  ApplicationRepository, AuthRepository, CatalogRepository, DocumentRepository, FullCatalog, Notification,
  NotificationRepository, OfficerAction, PartnerMatch, PartnerRepository, PreflightResult, ProfileRepository,
  ReceiptVerification, RecommendationRepository, Repositories,
} from '../repositories/types'
import type { MockDb } from './MockDb'
import { signText, verifyText } from './signing'
import type { MockTransport } from './transport'

/** Fixed demo OTP; the login screen shows it as a dev hint. */
export const DEMO_OTP = '123456'
const OTP_TTL_MS = 5 * 60_000
const DEFAULT_RADIUS_KM = 50
const RECEIPT_PREFIX = 'YS1|'

const PHONE_RE = /^[6-9]\d{9}$/
const today = (d: Date) => d.toISOString().slice(0, 10)
const id = (prefix: string, seq: number) => `${prefix}-${seq}`

function staticCatalog(rules: FullCatalog['rules']): FullCatalog {
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

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function receiptPayload(a: Application): ReceiptPayload {
  return {
    receiptNo: a.receiptNo, schemeId: a.schemeId, ruleVersion: a.ruleVersion, districtId: a.districtId,
    applicantName: a.profile.fullName, loanAmount: a.loanAmount, grantAmount: a.grantAmount, submittedAt: a.submittedAt,
  }
}

export function createMockRepositories(db: MockDb, transport: MockTransport): Repositories {
  const catalog = () => staticCatalog(db.state.rules)

  const auth: AuthRepository = {
    requestOtp: (phone) =>
      transport.call('auth', async () => {
        if (!PHONE_RE.test(phone)) throw new AppError('auth.phoneInvalid')
        await db.commit((s) => {
          s.otps[phone] = { code: DEMO_OTP, expiresAt: new Date(db.now().getTime() + OTP_TTL_MS).toISOString() }
        })
        return { sentTo: `******${phone.slice(-4)}`, devHint: DEMO_OTP }
      }),
    verifyOtp: (phone, code) =>
      transport.call('auth', async () => {
        const otp = db.state.otps[phone]
        if (!otp || otp.code !== code || Date.parse(otp.expiresAt) < db.now().getTime()) throw new AppError('auth.otpInvalid')
        const seq = await db.nextSeq()
        const user = await db.commit((s) => {
          delete s.otps[phone]
          let u = s.users.find((x) => x.phone === phone)
          if (!u) {
            u = { id: id('user', seq), phone, role: 'citizen', preferredLanguage: 'hi' }
            s.users.push(u)
          }
          s.sessionUserId = u.id
          return u
        })
        return { user, token: `mock-${user.id}-${seq}` }
      }),
    currentSession: () =>
      transport.call('auth', async () => {
        const user = db.state.users.find((u) => u.id === db.state.sessionUserId)
        return user ? { user, token: `mock-${user.id}` } : null
      }),
    logout: () =>
      transport.call('auth', async () => {
        await db.commit((s) => {
          s.sessionUserId = null
        })
      }),
  }

  const catalogRepo: CatalogRepository = {
    getCatalog: () => transport.call('catalog', async () => catalog()),
    publishRule: (input) =>
      transport.call('catalog', async () => {
        const rule = eligibilityRuleSchema.parse(input)
        if (!seed.schemes.some((s) => s.id === rule.schemeId)) throw new AppError('rules.unknownScheme')
        const latest = Math.max(0, ...db.state.rules.filter((r) => r.schemeId === rule.schemeId).map((r) => r.version))
        if (rule.version <= latest) throw new AppError('rules.versionNotIncreasing')
        await db.commit((s) => {
          s.rules.push(rule)
        })
        return rule
      }),
    ruleHistory: (schemeId) =>
      transport.call('catalog', async () =>
        db.state.rules.filter((r) => r.schemeId === schemeId).sort((a, b) => b.version - a.version),
      ),
  }

  const profile: ProfileRepository = {
    get: (userId) => transport.call('profile', async () => db.state.profiles[userId] ?? null),
    save: (userId, input) =>
      transport.call('profile', async () => {
        const p = applicantProfileSchema.parse(input)
        await db.commit((s) => {
          s.profiles[userId] = p
        })
        return p
      }),
  }

  const recommendation: RecommendationRepository = {
    recommend: (input) =>
      transport.call('recommendation', async () =>
        recommend(applicantProfileSchema.parse(input), catalog(), { ...seed.stateContext, asOf: today(db.now()) }),
      ),
  }

  const partner: PartnerRepository = {
    find: ({ schemeId, near, radiusKm = DEFAULT_RADIUS_KM }) =>
      transport.call('partner', async () => {
        const home = [...seed.districts].sort((a, b) => haversineKm(near, a) - haversineKm(near, b))[0]!
        const matches: PartnerMatch[] = []
        for (const branch of seed.partnerBranches) {
          if (!branch.authorisedSchemeIds.includes(schemeId)) continue
          const distanceKm = Math.round(haversineKm(near, branch) * 10) / 10
          if (distanceKm > radiusKm && branch.id !== `upscfdc-${home.id}`) continue
          const entity = seed.partnerEntities.find((e) => e.id === branch.entityId)!
          matches.push({
            branch,
            entity,
            district: seed.districts.find((d) => d.id === branch.districtId)!,
            health: assessPartnerHealth(entity.type, entity.health, seed.healthPolicy),
            distanceKm,
          })
        }
        const blocked = (m: PartnerMatch) => (m.health.status === 'blocked' ? 1 : 0)
        return matches.sort((a, b) => blocked(a) - blocked(b) || a.distanceKm - b.distanceKm)
      }),
  }

  const document: DocumentRepository = {
    runPreflight: (userId, p) =>
      transport.call('document', async () => {
        const defaulted = p.isDefaulter || p.settledViaOTS
        const score = defaulted ? 560 : 720 + (hash(userId) % 100)
        const results: PreflightResult[] = [
          { id: 'cibil', status: score >= 700 ? 'pass' : 'fail', detailKey: score >= 700 ? 'preflight.cibil.pass' : 'preflight.cibil.fail', params: { score } },
          { id: 'penny_drop', status: 'pass', detailKey: 'preflight.pennyDrop.pass' },
          { id: 'no_default', status: defaulted ? 'fail' : 'pass', detailKey: defaulted ? 'preflight.noDefault.fail' : 'preflight.noDefault.pass' },
        ]
        return results
      }),
    fetchFromDigiLocker: (_userId, documentId) =>
      transport.call('document', async () => {
        const doc = seed.documentRequirements.find((d) => d.id === documentId)
        if (!doc?.digiLocker) throw new AppError('digilocker.unsupported')
        return {
          documentId,
          issuer: documentId === 'aadhaar' ? 'UIDAI' : 'Revenue Department, Government of Uttar Pradesh',
          issuedOn: '2025-04-12',
          verified: true as const,
        }
      }),
    getChecklistState: (userId, schemeId) =>
      transport.call('document', async () => ({ ...(db.state.checklists[`${userId}:${schemeId}`] ?? {}) })),
    setChecklistItem: (userId, schemeId, documentId, done) =>
      transport.call('document', async () => {
        await db.commit((s) => {
          const key = `${userId}:${schemeId}`
          s.checklists[key] = { ...(s.checklists[key] ?? {}), [documentId]: done }
        })
      }),
  }

  function notify(s: typeof db.state, app: Application, messageKey: string, seq: number) {
    const note: Notification = {
      id: id('note', seq), userId: app.userId, applicationId: app.id, channel: 'sms', messageKey,
      params: { receiptNo: app.receiptNo }, at: db.now().toISOString(), read: false,
    }
    s.notifications.push(note)
  }

  async function transition(appId: string, action: OfficerAction | { type: 'resubmit' }, actor: 'district_officer' | 'bank' | 'citizen') {
    const current = db.state.applications.find((a) => a.id === appId)
    if (!current) throw new AppError('application.notFound')
    const scheme = seed.schemes.find((s) => s.id === current.schemeId)!
    let to: ApplicationStage
    try {
      to = nextStage(current.stage, action.type, scheme.kind)
    } catch {
      throw new AppError('application.illegalTransition')
    }
    const seq = await db.nextSeq()
    return db.commit((s) => {
      const app = s.applications.find((a) => a.id === appId)!
      app.stage = to
      app.history.push({
        stage: to,
        at: db.now().toISOString(),
        actor,
        ...('reasonKey' in action && { reasonKey: action.reasonKey }),
        ...('note' in action && action.note && { note: action.note }),
      })
      notify(s, app, `notify.stage.${to}`, seq)
      return app
    })
  }

  const application: ApplicationRepository = {
    submit: (input) =>
      transport.call('application', async () => {
        const p = applicantProfileSchema.parse(input.profile)
        const rule = catalog().rules.filter((r) => r.schemeId === input.schemeId).sort((a, b) => b.version - a.version)[0]
        if (!rule) throw new AppError('rules.unknownScheme')
        const seq = await db.nextSeq()
        const now = db.now().toISOString()
        const draft: Application = {
          id: id('app', seq), receiptNo: `YS-2026-${String(seq).padStart(6, '0')}`, userId: input.userId,
          schemeId: input.schemeId, ruleVersion: rule.version, districtId: p.districtId, partnerBranchId: input.partnerBranchId,
          profile: p, loanAmount: input.loanAmount, grantAmount: input.grantAmount, stage: 'pre_scrutiny',
          history: [
            { stage: 'submitted', at: now, actor: 'citizen' },
            { stage: 'pre_scrutiny', at: now, actor: 'system' },
          ],
          submittedAt: now, signature: '', seeded: false,
        }
        draft.signature = await signText((await db.signingKeys()).privateKey, canonicalReceiptPayload(receiptPayload(draft)))
        await db.commit((s) => {
          s.applications.push(draft)
          notify(s, draft, 'notify.submitted', seq)
        })
        return draft
      }),
    listMine: (userId) =>
      transport.call('application', async () =>
        db.state.applications.filter((a) => a.userId === userId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
      ),
    get: (appId) => transport.call('application', async () => db.state.applications.find((a) => a.id === appId) ?? null),
    encodeReceipt: (a) => `${RECEIPT_PREFIX}${canonicalReceiptPayload(receiptPayload(a))}|${a.signature}`,
    verifyReceipt: (encoded) =>
      transport.call('application', async (): Promise<ReceiptVerification> => {
        const text = encoded.trim()
        const cut = text.lastIndexOf('|')
        if (!text.startsWith(RECEIPT_PREFIX) || cut <= RECEIPT_PREFIX.length) return { valid: false, reason: 'malformed' }
        let payload: ReceiptPayload
        try {
          payload = Object.fromEntries(JSON.parse(text.slice(RECEIPT_PREFIX.length, cut))) as ReceiptPayload
        } catch {
          return { valid: false, reason: 'malformed' }
        }
        const ok = await verifyText((await db.signingKeys()).publicKey, canonicalReceiptPayload(payload), text.slice(cut + 1))
        if (!ok) return { valid: false, reason: 'bad_signature' }
        const app = db.state.applications.find((a) => a.receiptNo === payload.receiptNo)
        if (!app) return { valid: false, reason: 'not_found' }
        return {
          valid: true,
          application: { receiptNo: app.receiptNo, schemeId: app.schemeId, districtId: app.districtId, stage: app.stage, submittedAt: app.submittedAt },
        }
      }),
    resubmit: (appId, userId) =>
      transport.call('application', async () => {
        if (db.state.applications.find((a) => a.id === appId)?.userId !== userId) throw new AppError('application.notFound')
        return transition(appId, { type: 'resubmit' }, 'citizen')
      }),
    queue: ({ districtId, stages }) =>
      transport.call('application', async () =>
        db.state.applications
          .filter((a) => (!districtId || a.districtId === districtId) && (!stages || stages.includes(a.stage)))
          .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
      ),
    act: (appId, action) =>
      transport.call('application', () =>
        transition(appId, action, action.type === 'sanction' || action.type === 'disburse' ? 'bank' : 'district_officer'),
      ),
  }

  const notification: NotificationRepository = {
    list: (userId) =>
      transport.call('notification', async () =>
        db.state.notifications.filter((x) => x.userId === userId).sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id, undefined, { numeric: true })),
      ),
    markRead: (noteId) =>
      transport.call('notification', async () => {
        await db.commit((s) => {
          const note = s.notifications.find((x) => x.id === noteId)
          if (note) note.read = true
        })
      }),
  }

  return { auth, catalog: catalogRepo, profile, recommendation, partner, document, application, notification }
}

