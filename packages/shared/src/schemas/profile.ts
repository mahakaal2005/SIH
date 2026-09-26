import { z } from 'zod'

export const genderSchema = z.enum(['female', 'male', 'transgender'])
export const casteCategorySchema = z.enum(['SC', 'ST', 'OBC', 'GEN'])
export const areaSchema = z.enum(['rural', 'urban'])
export const purposeSchema = z.enum(['business', 'education'])
/** Ordered: index comparison is meaningful (middle = Class VIII pass). */
export const educationLevels = [
  'none',
  'primary',
  'middle',
  'secondary',
  'higher_secondary',
  'graduate',
  'postgraduate',
] as const
export const educationSchema = z.enum(educationLevels)

export const applicantProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    age: z.number().int().min(14).max(100),
    gender: genderSchema,
    casteCategory: casteCategorySchema,
    annualFamilyIncome: z.number().int().min(0).max(1_00_00_000),
    education: educationSchema,
    districtId: z.string().min(1),
    area: areaSchema,
    purpose: purposeSchema,
    /** Activity catalog id, e.g. `boutique`, `kirana`, `other_service`, `higher_education`. */
    activityId: z.string().min(1),
    estimatedCost: z.number().int().min(1_000).max(5_00_00_000),
    isLiterate: z.boolean(),
    willingGroupOrCluster: z.boolean(),
    isDefaulter: z.boolean(),
    settledViaOTS: z.boolean(),
    alreadyFinancedElsewhere: z.boolean(),
    hasDisability: z.boolean(),
    isExistingBusiness: z.boolean(),
  })
  .strict()

export type ApplicantProfile = z.infer<typeof applicantProfileSchema>
export type Gender = z.infer<typeof genderSchema>
export type CasteCategory = z.infer<typeof casteCategorySchema>
export type Education = z.infer<typeof educationSchema>
export type Purpose = z.infer<typeof purposeSchema>
