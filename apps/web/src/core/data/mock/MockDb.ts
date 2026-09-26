import { createStore, del, get, set, type UseStore } from 'idb-keyval'
import type { ApplicantProfile, Application, EligibilityRule } from '@ys/shared'
import { districts, eligibilityRules } from '@ys/shared/seed'
import type { Notification, User } from '../repositories/types'
import { generateSeedApplications } from './seedApplications'
import { exportKeys, generateSigningKeys, importKeys, type ExportedKeys, type SigningKeys } from './signing'

/** Bump when the stored shape changes; older stored data is discarded and reseeded. */
export const SCHEMA_VERSION = 1
export const DEFAULT_STORAGE_KEY = 'ys-mockdb'
const SEED = 26092
const SEED_APPLICATIONS = 150

export interface DbState {
  schemaVersion: number
  rules: EligibilityRule[]
  users: User[]
  profiles: Record<string, ApplicantProfile>
  applications: Application[]
  notifications: Notification[]
  /** `${userId}:${schemeId}` → documentId → done */
  checklists: Record<string, Record<string, boolean>>
  otps: Record<string, { code: string; expiresAt: string }>
  sessionUserId: string | null
  signingKeys: ExportedKeys
  seq: number
}

export interface MockDbOptions {
  storageKey?: string
  now?: () => Date
}

let idbStore: UseStore | undefined
const store = () => (idbStore ??= createStore('yojna-sarthi', 'mockdb'))

function seedUsers(): User[] {
  const officers = districts
    .filter((d) => d.isDemoDistrict)
    .map((d, i): User => ({
      id: `officer-${d.id}`,
      phone: `90000000${String(i + 1).padStart(2, '0')}`,
      role: 'district_officer',
      districtId: d.id,
      preferredLanguage: 'hi',
    }))
  return [...officers, { id: 'hq-admin', phone: '9000000099', role: 'hq_admin', preferredLanguage: 'en' }]
}

async function freshState(now: Date): Promise<DbState> {
  const keys = await generateSigningKeys()
  const startSeq = 1
  const applications = await generateSeedApplications({ count: SEED_APPLICATIONS, seed: SEED, now, privateKey: keys.privateKey, startSeq })
  return {
    schemaVersion: SCHEMA_VERSION,
    rules: structuredClone(eligibilityRules),
    users: seedUsers(),
    profiles: {},
    applications,
    notifications: [],
    checklists: {},
    otps: {},
    sessionUserId: null,
    signingKeys: await exportKeys(keys),
    seq: startSeq + SEED_APPLICATIONS,
  }
}

export class MockDb {
  private keys?: SigningKeys
  state: DbState
  private readonly storageKey: string
  readonly now: () => Date
  private constructor(state: DbState, storageKey: string, now: () => Date) {
    this.state = state
    this.storageKey = storageKey
    this.now = now
  }

  static async open(opts: MockDbOptions = {}): Promise<MockDb> {
    const storageKey = opts.storageKey ?? DEFAULT_STORAGE_KEY
    const now = opts.now ?? (() => new Date())
    const stored = await get<DbState>(storageKey, store())
    if (stored?.schemaVersion === SCHEMA_VERSION) return new MockDb(stored, storageKey, now)
    const db = new MockDb(await freshState(now()), storageKey, now)
    await db.persist()
    return db
  }

  /** Mutations run on a copy and are swapped in only if the mutator succeeds. */
  async commit<T>(mutate: (draft: DbState) => T): Promise<T> {
    const draft = structuredClone(this.state)
    const result = mutate(draft)
    this.state = draft
    await this.persist()
    return result
  }

  async nextSeq(): Promise<number> {
    return this.commit((s) => s.seq++)
  }

  async signingKeys(): Promise<SigningKeys> {
    return (this.keys ??= await importKeys(this.state.signingKeys))
  }

  async reset(): Promise<void> {
    await del(this.storageKey, store())
    this.keys = undefined
    this.state = await freshState(this.now())
    await this.persist()
  }

  private persist() {
    return set(this.storageKey, this.state, store())
  }
}
