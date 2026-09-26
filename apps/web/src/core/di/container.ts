import { config } from '../config'
import { MockDb } from '../data/mock/MockDb'
import { createMockRepositories } from '../data/mock/repositories'
import { MockTransport } from '../data/mock/transport'
import type { Repositories } from '../data/repositories/types'

export interface DevTools {
  transport: MockTransport
  resetData: () => Promise<void>
}

export interface Container {
  repos: Repositories
  dev: DevTools | null
}

/** The composition root: the only place that decides which data source backs the repositories. */
export async function createContainer(): Promise<Container> {
  if (config.dataSource === 'http') throw new Error('HTTP repositories are not implemented yet') // i18n-ignore: developer error
  const db = await MockDb.open()
  const transport = new MockTransport({ minLatencyMs: config.mockLatency.min, maxLatencyMs: config.mockLatency.max })
  return { repos: createMockRepositories(db, transport), dev: config.showDevTools ? { transport, resetData: () => db.reset() } : null }
}
