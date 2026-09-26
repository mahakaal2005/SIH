import {
  applicantProfileSchema, canonicalReceiptPayload, nextStage, type Application, type ApplicationStage, type ReceiptPayload,
} from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { AppError } from '../../errors'
import type { ApplicationRepository, Notification, OfficerAction, ReceiptVerification } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { signText, verifyText } from '../signing'
import { id, liveCatalog, RECEIPT_PREFIX, receiptPayload } from './common'

export function createApplicationRepository(db: MockDb, transport: MockTransport): ApplicationRepository {
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
        const rule = liveCatalog(db).rules.filter((r) => r.schemeId === input.schemeId).sort((a, b) => b.version - a.version)[0]
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
  return application
}
