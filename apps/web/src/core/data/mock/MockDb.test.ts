import { beforeEach, describe, expect, it } from 'vitest'
import { eligibilityRules } from '@ys/shared/seed'
import { MockDb } from './MockDb'

const NOW = new Date('2026-09-26T09:00:00Z')
let key = 0
const open = (storageKey = `test-${++key}`) => MockDb.open({ storageKey, now: () => NOW })

describe('MockDb', () => {
  let storageKey: string
  beforeEach(() => {
    storageKey = `test-${++key}`
  })

  it('seeds rules, officer accounts and ~150 signed applications on first open', async () => {
    const db = await open(storageKey)
    expect(db.state.rules).toEqual(eligibilityRules)
    expect(db.state.applications.length).toBeGreaterThanOrEqual(140)
    expect(db.state.applications.every((a) => a.signature.length > 20)).toBe(true)
    expect(db.state.users.filter((u) => u.role === 'district_officer').map((u) => u.districtId).sort()).toEqual(
      ['ghaziabad', 'hardoi', 'lucknow', 'raebareli', 'sitapur'],
    )
    expect(db.state.users.some((u) => u.role === 'hq_admin')).toBe(true)
  })

  it('generates the same applications for the same seed', async () => {
    const a = await open()
    const b = await open()
    expect(a.state.applications.map((x) => x.id)).toEqual(b.state.applications.map((x) => x.id))
  })

  it('mirrors the published limbo: most seeded applications are undecided and many stalled', async () => {
    const db = await open(storageKey)
    const apps = db.state.applications
    const undecided = apps.filter((a) => ['submitted', 'pre_scrutiny'].includes(a.stage)).length / apps.length
    expect(undecided).toBeGreaterThan(0.5)
    expect(undecided).toBeLessThan(0.75)
  })

  it('persists committed changes across a reopen', async () => {
    const db = await open(storageKey)
    await db.commit((s) => {
      s.applications = s.applications.slice(0, 3)
    })
    const again = await open(storageKey)
    expect(again.state.applications).toHaveLength(3)
  })

  it('keeps the signing key across reopen so old receipts still verify', async () => {
    const db = await open(storageKey)
    const again = await open(storageKey)
    expect(again.state.signingKeys).toEqual(db.state.signingKeys)
  })

  it('restores the seed on reset', async () => {
    const db = await open(storageKey)
    await db.commit((s) => {
      s.applications = []
    })
    await db.reset()
    expect(db.state.applications.length).toBeGreaterThanOrEqual(140)
    expect((await open(storageKey)).state.applications.length).toBeGreaterThanOrEqual(140)
  })

  it('hands out increasing sequence numbers', async () => {
    const db = await open(storageKey)
    const a = await db.nextSeq()
    const b = await db.nextSeq()
    expect(b).toBe(a + 1)
  })
})
