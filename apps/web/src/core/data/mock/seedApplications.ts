import {
  canonicalReceiptPayload, financePlan, type ApplicantProfile, type Application, type ApplicationStage, type StageEvent,
} from '@ys/shared'
import { approvalStats, districts, partnerBranches, pmajayProjects, schemes, stageDurations } from '@ys/shared/seed'
import { signText } from './signing'

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = () => number
const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)]!
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1))
const DAY = 86_400_000

const FEMALE = ['Sunita Devi', 'Rekha Kumari', 'Pooja Gautam', 'Manju Devi', 'Anita Jatav', 'Kiran Valmiki', 'Savita Devi', 'Neelam Kori', 'Rinki Pasi', 'Shanti Devi']
const MALE = ['Ramesh Kumar', 'Suresh Jatav', 'Rajkumar Pasi', 'Anil Gautam', 'Dinesh Kori', 'Manoj Valmiki', 'Santosh Kumar', 'Vijay Dhobi', 'Pradeep Kumar', 'Ashok Rawat']
export const REJECTION_REASONS = ['reject.cibil', 'reject.documents', 'reject.defaulter', 'reject.pennyDrop'] as const

const DEMO = districts.filter((d) => d.isDemoDistrict)

/** Target stage mix ≈ the UP GIA funnel: 62.9% undecided, 3.3% rejected, the rest progressed. */
const STAGE_WEIGHTS: [ApplicationStage, number][] = [
  ['submitted', 0.05], ['pre_scrutiny', 0.58], ['rejected', 0.04], ['returned', 0.02], ['dlpac', 0.08],
  ['bank', 0.05], ['sanctioned', 0.05], ['disbursed', 0.04], ['srf_lock', 0.09],
]
const CHAIN: ApplicationStage[] = ['submitted', 'pre_scrutiny', 'dlpac', 'bank', 'sanctioned', 'disbursed', 'srf_lock']

function weightedStage(rng: Rng): ApplicationStage {
  let r = rng()
  for (const [s, w] of STAGE_WEIGHTS) if ((r -= w) <= 0) return s
  return 'pre_scrutiny'
}

function weightedProject(rng: Rng) {
  const total = approvalStats.reduce((s, x) => s + x.applied, 0)
  let r = rng() * total
  for (const s of approvalStats) if ((r -= s.applied) <= 0) return pmajayProjects.find((p) => p.id === s.projectId)!
  return pmajayProjects[0]!
}

const expected = (stage: ApplicationStage) => (stageDurations as Record<string, number>)[stage] ?? 10

function buildHistory(rng: Rng, final: ApplicationStage, submittedAt: number, now: number): StageEvent[] {
  const events: StageEvent[] = [{ stage: 'submitted', at: new Date(submittedAt).toISOString(), actor: 'citizen' }]
  let t = submittedAt
  const target = final === 'rejected' || final === 'returned' ? 'pre_scrutiny' : final
  for (const stage of CHAIN.slice(1, CHAIN.indexOf(target) + 1)) {
    const prev = events.at(-1)!.stage
    t = Math.min(t + int(rng, Math.ceil(expected(prev) * 0.5), Math.ceil(expected(prev) * 1.3)) * DAY, now - DAY)
    events.push({ stage, at: new Date(t).toISOString(), actor: stage === 'bank' || stage === 'sanctioned' ? 'bank' : stage === 'pre_scrutiny' ? 'system' : 'district_officer' })
  }
  if (final === 'rejected' || final === 'returned') {
    t = Math.min(t + int(rng, 5, 40) * DAY, now - DAY)
    events.push({ stage: final, at: new Date(t).toISOString(), actor: 'district_officer', reasonKey: pick(rng, REJECTION_REASONS) })
  }
  return events
}

export async function generateSeedApplications(opts: {
  count: number
  seed: number
  now: Date
  privateKey: CryptoKey
  startSeq: number
}): Promise<Application[]> {
  const rng = mulberry32(opts.seed)
  const now = opts.now.getTime()
  const out: Application[] = []

  for (let i = 0; i < opts.count; i++) {
    const district = rng() < 0.6 ? (rng() < 0.35 ? DEMO.find((d) => d.id === 'sitapur')! : pick(rng, DEMO)) : pick(rng, districts)
    const useNsfdc = rng() < 0.2
    const project = weightedProject(rng)
    const scheme = useNsfdc ? pick(rng, schemes.filter((s) => s.id === 'nsfdc-micro-credit' || s.id === 'nsfdc-term-loan')) : schemes.find((s) => s.pmajayProjectId === project.id)!
    const female = project.womenOnly || rng() < 0.54
    const cost = scheme.id === 'nsfdc-micro-credit' ? int(rng, 40, 140) * 1000 : scheme.id === 'nsfdc-term-loan' ? int(rng, 150, 900) * 1000 : project.costPerPerson ?? int(rng, 80, 250) * 1000
    const stage = weightedStage(rng)
    const ageDays = stage === 'submitted' ? int(rng, 0, 3) : stage === 'pre_scrutiny' ? int(rng, 5, 220) : int(rng, 60, 420)
    const submittedAt = now - ageDays * DAY - int(rng, 1, 20) * 3_600_000

    const profile: ApplicantProfile = {
      fullName: pick(rng, female ? FEMALE : MALE),
      age: int(rng, 20, 48),
      gender: female ? 'female' : 'male',
      casteCategory: 'SC',
      annualFamilyIncome: int(rng, 6, 40) * 10000,
      education: pick(rng, ['primary', 'middle', 'secondary', 'higher_secondary'] as const),
      districtId: district.id,
      area: rng() < 0.81 ? 'rural' : 'urban',
      purpose: 'business',
      activityId: useNsfdc ? pick(rng, ['other_service', 'other_trade', 'other_manufacturing']) : project.id,
      estimatedCost: cost,
      isLiterate: true,
      willingGroupOrCluster: true,
      isDefaulter: false,
      settledViaOTS: false,
      alreadyFinancedElsewhere: false,
      hasDisability: rng() < 0.04,
      isExistingBusiness: false,
    }
    const plan = financePlan(scheme, { projectCost: cost, area: profile.area, trainingHours: project.trainingHours })
    const branches = partnerBranches.filter((b) => b.districtId === district.id && b.authorisedSchemeIds.includes(scheme.id))
    const seq = opts.startSeq + i
    const receiptNo = `YS-2026-${String(seq).padStart(6, '0')}`
    const history = buildHistory(rng, stage, submittedAt, now)
    const submittedIso = history[0]!.at

    const signature = await signText(
      opts.privateKey,
      canonicalReceiptPayload({
        receiptNo, schemeId: scheme.id, ruleVersion: 1, districtId: district.id, applicantName: profile.fullName,
        loanAmount: plan.loan, grantAmount: plan.grant, submittedAt: submittedIso,
      }),
    )

    out.push({
      id: `app-${seq}`,
      receiptNo,
      userId: `seed-user-${seq}`,
      schemeId: scheme.id,
      ruleVersion: 1,
      districtId: district.id,
      partnerBranchId: branches.length ? pick(rng, branches).id : null,
      profile,
      loanAmount: plan.loan,
      grantAmount: plan.grant,
      stage,
      history,
      submittedAt: submittedIso,
      signature,
      seeded: true,
    })
  }
  return out
}
