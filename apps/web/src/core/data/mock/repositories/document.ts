import * as seed from '@ys/shared/seed'
import { AppError } from '../../errors'
import type { DocumentRepository, PreflightResult } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { hash } from './common'

export function createDocumentRepository(db: MockDb, transport: MockTransport): DocumentRepository {
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
  return document
}
