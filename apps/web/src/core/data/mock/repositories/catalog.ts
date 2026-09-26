import { eligibilityRuleSchema } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { AppError } from '../../errors'
import type { CatalogRepository } from '../../repositories/types'
import type { MockDb } from '../MockDb'
import type { MockTransport } from '../transport'
import { liveCatalog } from './common'

export function createCatalogRepository(db: MockDb, transport: MockTransport): CatalogRepository {
  const catalogRepo: CatalogRepository = {
    getCatalog: () => transport.call('catalog', async () => liveCatalog(db)),
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
  return catalogRepo
}
