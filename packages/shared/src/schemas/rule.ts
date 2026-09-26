import { z } from 'zod'

const scalar = z.union([z.string(), z.number(), z.boolean()])

export const criterionSchema = z.discriminatedUnion('op', [
  z.object({ op: z.enum(['eq', 'neq']), field: z.string(), value: scalar, reasonKey: z.string() }),
  z.object({ op: z.enum(['in', 'notIn']), field: z.string(), value: z.array(scalar).min(1), reasonKey: z.string() }),
  z.object({ op: z.enum(['lt', 'lte', 'gt', 'gte']), field: z.string(), value: z.number(), reasonKey: z.string() }),
  z.object({
    op: z.literal('between'),
    field: z.string(),
    value: z.tuple([z.number(), z.number()]),
    reasonKey: z.string(),
  }),
  z.object({ op: z.enum(['isTrue', 'isFalse']), field: z.string(), reasonKey: z.string() }),
  z.object({
    op: z.literal('educationAtLeast'),
    field: z.string(),
    value: z.string(),
    reasonKey: z.string(),
  }),
])

export const eligibilityRuleSchema = z.object({
  schemeId: z.string().min(1),
  version: z.number().int().min(1),
  effectiveFrom: z.iso.date(),
  /** Every criterion must pass. `when` guards make a criterion conditional (e.g. VIII pass only above ₹10L). */
  criteria: z
    .array(
      z.object({
        criterion: criterionSchema,
        when: z.array(criterionSchema).optional(),
      }),
    )
    .min(1),
  /** Criteria that do not gate eligibility but raise priority (PM-AJAY priority groups). */
  priority: z.array(criterionSchema).default([]),
})

export type Criterion = z.infer<typeof criterionSchema>
export type EligibilityRule = z.infer<typeof eligibilityRuleSchema>
export type RuleClause = EligibilityRule['criteria'][number]
