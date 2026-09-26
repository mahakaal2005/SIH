import { describe, expect, it } from 'vitest'
import type { ApplicantProfile, EligibilityRule } from '@ys/shared'
import { eligibilityRules } from '@ys/shared/seed'
import { MockDb } from './MockDb'
import { createMockRepositories, DEMO_OTP } from './repositories'
import { MockTransport } from './transport'

const NOW = new Date('2026-09-26T09:00:00Z')
let n = 0
async function setup() {
  const db = await MockDb.open({ storageKey: `repo-test-${++n}`, now: () => NOW })
  const transport = new MockTransport({ minLatencyMs: 0, maxLatencyMs: 0 })
  return { db, transport, repos: createMockRepositories(db, transport) }
}

const profile: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

async function citizen(repos: Awaited<ReturnType<typeof setup>>['repos'], phone = '9876543210') {
  await repos.auth.requestOtp(phone)
  return (await repos.auth.verifyOtp(phone, DEMO_OTP)).user
}

describe('auth', () => {
  it('logs a new phone number in as a citizen and remembers the session', async () => {
    const { repos } = await setup()
    const hint = await repos.auth.requestOtp('9876543210')
    expect(hint.devHint).toContain(DEMO_OTP)
    const s = await repos.auth.verifyOtp('9876543210', DEMO_OTP)
    expect(s.user.role).toBe('citizen')
    expect((await repos.auth.currentSession())?.user.id).toBe(s.user.id)
    await repos.auth.logout()
    expect(await repos.auth.currentSession()).toBeNull()
  })

  it('rejects a wrong code and an OTP that was never requested', async () => {
    const { repos } = await setup()
    await expect(repos.auth.verifyOtp('9876543210', DEMO_OTP)).rejects.toThrow(/otp/i)
    await repos.auth.requestOtp('9876543210')
    await expect(repos.auth.verifyOtp('9876543210', '000000')).rejects.toThrow(/otp/i)
  })

  it('rejects an invalid Indian mobile number', async () => {
    const { repos } = await setup()
    await expect(repos.auth.requestOtp('12345')).rejects.toThrow(/phone/i)
  })

  it('logs a known officer phone in with the officer role and district', async () => {
    const { repos, db } = await setup()
    const officer = db.state.users.find((u) => u.districtId === 'sitapur')!
    await repos.auth.requestOtp(officer.phone)
    const s = await repos.auth.verifyOtp(officer.phone, DEMO_OTP)
    expect(s.user).toMatchObject({ role: 'district_officer', districtId: 'sitapur' })
  })
})

describe('catalog + rules admin', () => {
  const bump = (patch: Partial<EligibilityRule>): EligibilityRule => ({
    ...eligibilityRules.find((r) => r.schemeId === 'nsfdc-micro-credit')!,
    version: 2,
    effectiveFrom: '2026-09-01',
    ...patch,
  })

  it('serves the seed catalog with the live rule set', async () => {
    const { repos } = await setup()
    const c = await repos.catalog.getCatalog()
    expect(c.districts).toHaveLength(75)
    expect(c.rules).toHaveLength(eligibilityRules.length)
  })

  it('publishes a new rule version that immediately changes recommendations', async () => {
    const { repos } = await setup()
    const before = await repos.recommendation.recommend({ ...profile, activityId: 'other_service', estimatedCost: 145000 })
    expect(before.eligible.map((r) => r.scheme.id)).not.toContain('nsfdc-micro-credit')

    const micro = bump({})
    micro.criteria = micro.criteria.map((c) =>
      c.criterion.reasonKey === 'rule.microCostCap' ? { criterion: { ...c.criterion, value: 150000 } as typeof c.criterion } : c,
    )
    await repos.catalog.publishRule(micro)

    const after = await repos.recommendation.recommend({ ...profile, activityId: 'other_service', estimatedCost: 145000 })
    const rec = after.eligible.find((r) => r.scheme.id === 'nsfdc-micro-credit')
    expect(rec?.evaluation.ruleVersion).toBe(2)
    expect((await repos.catalog.ruleHistory('nsfdc-micro-credit')).map((r) => r.version)).toEqual([2, 1])
  })

  it('refuses a rule that does not bump the version', async () => {
    const { repos } = await setup()
    await expect(repos.catalog.publishRule(bump({ version: 1 }))).rejects.toThrow(/version/i)
  })

  it('refuses a malformed rule', async () => {
    const { repos } = await setup()
    await expect(repos.catalog.publishRule({ ...bump({}), criteria: [] })).rejects.toThrow()
  })

  it('refuses a rule for an unknown scheme', async () => {
    const { repos } = await setup()
    await expect(repos.catalog.publishRule(bump({ schemeId: 'nope' }))).rejects.toThrow(/scheme/i)
  })
})

describe('profile', () => {
  it('saves and reloads a validated profile', async () => {
    const { repos } = await setup()
    const user = await citizen(repos)
    expect(await repos.profile.get(user.id)).toBeNull()
    await repos.profile.save(user.id, profile)
    expect(await repos.profile.get(user.id)).toEqual(profile)
  })

  it('rejects an invalid profile', async () => {
    const { repos } = await setup()
    await expect(repos.profile.save('u', { ...profile, age: 5 })).rejects.toThrow()
  })
})

describe('partner search', () => {
  it('returns only partners authorised for the scheme, healthy first, nearest first', async () => {
    const { repos } = await setup()
    const sitapur = { lat: 27.568, lng: 80.679 }
    const r = await repos.partner.find({ schemeId: 'pmajay-boutique', near: sitapur, radiusKm: 60 })
    expect(r.length).toBeGreaterThan(3)
    expect(r.every((m) => m.branch.authorisedSchemeIds.includes('pmajay-boutique'))).toBe(true)
    const firstBlocked = r.findIndex((m) => m.health.status === 'blocked')
    expect(firstBlocked).toBeGreaterThan(0)
    expect(r.slice(firstBlocked).every((m) => m.health.status === 'blocked')).toBe(true)
    const open = r.slice(0, firstBlocked)
    expect(open.map((m) => m.distanceKm)).toEqual([...open.map((m) => m.distanceKm)].sort((a, b) => a - b))
  })

  it('always includes the district UPSCFDC office even beyond the radius', async () => {
    const { repos } = await setup()
    const r = await repos.partner.find({ schemeId: 'nsfdc-micro-credit', near: { lat: 27.568, lng: 80.679 }, radiusKm: 1 })
    expect(r.map((m) => m.branch.id)).toContain('upscfdc-sitapur')
  })
})

describe('documents', () => {
  it('passes pre-flight for a clean profile', async () => {
    const { repos } = await setup()
    const user = await citizen(repos)
    const r = await repos.document.runPreflight(user.id, profile)
    expect(r.map((x) => [x.id, x.status])).toEqual([['cibil', 'pass'], ['penny_drop', 'pass'], ['no_default', 'pass']])
  })

  it('fails the no-default and CIBIL checks for a defaulter', async () => {
    const { repos } = await setup()
    const user = await citizen(repos)
    const r = await repos.document.runPreflight(user.id, { ...profile, isDefaulter: true })
    expect(r.find((x) => x.id === 'no_default')?.status).toBe('fail')
    expect(r.find((x) => x.id === 'cibil')?.status).toBe('fail')
  })

  it('fetches DigiLocker documents only for DigiLocker-enabled items', async () => {
    const { repos } = await setup()
    const user = await citizen(repos)
    expect(await repos.document.fetchFromDigiLocker(user.id, 'caste_certificate')).toMatchObject({ verified: true })
    await expect(repos.document.fetchFromDigiLocker(user.id, 'bank_passbook')).rejects.toThrow()
  })

  it('persists checklist ticks per user and scheme', async () => {
    const { repos } = await setup()
    await repos.document.setChecklistItem('u1', 'pmajay-boutique', 'aadhaar', true)
    expect(await repos.document.getChecklistState('u1', 'pmajay-boutique')).toEqual({ aadhaar: true })
    expect(await repos.document.getChecklistState('u1', 'nsfdc-micro-credit')).toEqual({})
  })
})

describe('applications', () => {
  async function submitted() {
    const ctx = await setup()
    const user = await citizen(ctx.repos)
    const app = await ctx.repos.application.submit({
      userId: user.id, schemeId: 'pmajay-boutique', profile, partnerBranchId: 'sbi-sitapur', loanAmount: 64000, grantAmount: 50000,
    })
    return { ...ctx, user, app }
  }

  it('queues a submitted application for pre-scrutiny with a signed receipt', async () => {
    const { app, repos, user } = await submitted()
    expect(app.stage).toBe('pre_scrutiny')
    expect(app.receiptNo).toMatch(/^YS-2026-\d{6}$/)
    expect(app.history.map((h) => h.stage)).toEqual(['submitted', 'pre_scrutiny'])
    expect((await repos.application.listMine(user.id)).map((a) => a.id)).toEqual([app.id])
  })

  it('verifies a genuine receipt and rejects a tampered one', async () => {
    const { app, repos } = await submitted()
    const encoded = repos.application.encodeReceipt(app)
    expect(await repos.application.verifyReceipt(encoded)).toMatchObject({ valid: true, application: { receiptNo: app.receiptNo } })

    const tampered = encoded.replace('"loanAmount",64000', '"loanAmount",640000')
    expect(tampered).not.toBe(encoded)
    expect(await repos.application.verifyReceipt(tampered)).toEqual({ valid: false, reason: 'bad_signature' })
    expect(await repos.application.verifyReceipt('garbage')).toEqual({ valid: false, reason: 'malformed' })
  })

  it('verifies the seeded applications too', async () => {
    const { repos, db } = await setup()
    const seeded = db.state.applications[0]!
    expect((await repos.application.verifyReceipt(repos.application.encodeReceipt(seeded))).valid).toBe(true)
  })

  it('moves the application when an officer acts, and notifies the citizen', async () => {
    const { app, repos, user } = await submitted()
    const moved = await repos.application.act(app.id, { type: 'approve_pre_scrutiny' }, 'officer-sitapur')
    expect(moved.stage).toBe('dlpac')
    expect(moved.history.at(-1)).toMatchObject({ stage: 'dlpac', actor: 'district_officer' })
    expect((await repos.application.get(app.id))?.stage).toBe('dlpac')
    const notes = await repos.notification.list(user.id)
    expect(notes[0]).toMatchObject({ applicationId: app.id, messageKey: 'notify.stage.dlpac', read: false })
  })

  it('records the reason when an officer rejects', async () => {
    const { app, repos } = await submitted()
    const r = await repos.application.act(app.id, { type: 'reject', reasonKey: 'reject.cibil' }, 'officer-sitapur')
    expect(r.history.at(-1)).toMatchObject({ stage: 'rejected', reasonKey: 'reject.cibil' })
  })

  it('refuses an illegal officer action', async () => {
    const { app, repos } = await submitted()
    await expect(repos.application.act(app.id, { type: 'sanction' }, 'officer-sitapur')).rejects.toThrow()
  })

  it('lets the citizen resubmit a returned application', async () => {
    const { app, repos, user } = await submitted()
    await repos.application.act(app.id, { type: 'return_for_fix', reasonKey: 'reject.documents' }, 'officer-sitapur')
    expect((await repos.application.resubmit(app.id, user.id)).stage).toBe('pre_scrutiny')
  })

  it('lists a district queue oldest first', async () => {
    const { repos } = await setup()
    const q = await repos.application.queue({ districtId: 'sitapur', stages: ['pre_scrutiny'] })
    expect(q.length).toBeGreaterThan(5)
    expect(q.every((a) => a.districtId === 'sitapur' && a.stage === 'pre_scrutiny')).toBe(true)
    const times = q.map((a) => Date.parse(a.submittedAt))
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('marks notifications read', async () => {
    const { app, repos, user } = await submitted()
    await repos.application.act(app.id, { type: 'approve_pre_scrutiny' }, 'officer-sitapur')
    const [note] = await repos.notification.list(user.id)
    await repos.notification.markRead(note!.id)
    expect((await repos.notification.list(user.id))[0]?.read).toBe(true)
  })
})

describe('transport integration', () => {
  it('fails a repository call when that repository is marked failing', async () => {
    const { repos, transport } = await setup()
    transport.setFailing('recommendation', true)
    await expect(repos.recommendation.recommend(profile)).rejects.toThrow(/network/i)
  })
})
