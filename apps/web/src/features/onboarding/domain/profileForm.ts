import type { ApplicantProfile, PmAjayProject } from '@ys/shared'

export type ProfileField = keyof ApplicantProfile
export type ProfileFormValues = { [K in ProfileField]: ApplicantProfile[K] | undefined }

export const PROFILE_STEPS = [
  { key: 'about', fields: ['fullName', 'age', 'gender', 'casteCategory', 'districtId', 'area', 'education', 'isLiterate'] },
  { key: 'plan', fields: ['purpose', 'activityId', 'estimatedCost', 'willingGroupOrCluster', 'isExistingBusiness'] },
  { key: 'money', fields: ['annualFamilyIncome', 'isDefaulter', 'settledViaOTS', 'alreadyFinancedElsewhere', 'hasDisability'] },
] as const satisfies readonly { key: string; fields: readonly ProfileField[] }[]

export function profileDefaults(saved?: ApplicantProfile | null): ProfileFormValues {
  return {
    fullName: '',
    age: undefined,
    gender: undefined,
    casteCategory: 'SC',
    districtId: undefined,
    area: 'rural',
    education: undefined,
    isLiterate: true,
    purpose: 'business',
    activityId: undefined,
    estimatedCost: undefined,
    willingGroupOrCluster: true,
    isExistingBusiness: false,
    annualFamilyIncome: undefined,
    isDefaulter: false,
    settledViaOTS: false,
    alreadyFinancedElsewhere: false,
    hasDisability: false,
    ...saved,
  }
}

/** The SOP fixes a per-person cost for 10 of the 16 PM-AJAY projects; offer it instead of making people guess. */
export function suggestedCost(activityId: string | undefined, projects: PmAjayProject[]): number | undefined {
  return projects.find((p) => p.id === activityId)?.costPerPerson ?? undefined
}
