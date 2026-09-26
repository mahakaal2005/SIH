import type { Criterion, EligibilityRule, RuleClause } from '../schemas/rule'
import { pmajayProjects } from './projects'

const c = (criterion: Criterion, when?: Criterion[]): RuleClause => (when ? { criterion, when } : { criterion })
const G = (field: string, op: 'eq' | 'neq', value: string): Criterion => ({ op, field, value, reasonKey: '-' })

const sc = c({ op: 'eq', field: 'casteCategory', value: 'SC', reasonKey: 'rule.scOnly' })
const incomeCap = c({ op: 'lte', field: 'annualFamilyIncome', value: 500000, reasonKey: 'rule.incomeUpTo5L' })
const adult = c({ op: 'gte', field: 'age', value: 18, reasonKey: 'rule.adult' })
const notDefaulter = c({ op: 'isFalse', field: 'isDefaulter', reasonKey: 'rule.notDefaulter' })
const business = c({ op: 'eq', field: 'purpose', value: 'business', reasonKey: 'rule.purposeBusiness' })
const upResident = c({ op: 'isTrue', field: 'isUpResident', reasonKey: 'rule.upResident' })

/** NSFDC income ceiling ₹5L effective 07.01.2026 (docs/01). */
const NSFDC_FROM = '2026-01-07'
/** UPSCFDC SOP letter 646 dated 21.07.2025 (docs/04). */
const SOP_FROM = '2025-07-21'

const pmajayRules: EligibilityRule[] = pmajayProjects.map((p) => ({
  schemeId: `pmajay-${p.id}`,
  version: 1,
  effectiveFrom: SOP_FROM,
  criteria: [
    c({ op: 'eq', field: 'activityId', value: p.id, reasonKey: 'rule.activityMatch' }),
    sc,
    upResident,
    c({ op: 'between', field: 'age', value: [18, 50], reasonKey: 'rule.age18to50' }),
    c({ op: 'isTrue', field: 'isLiterate', reasonKey: 'rule.literate' }),
    c({ op: 'isTrue', field: 'willingGroupOrCluster', reasonKey: 'rule.groupWilling' }),
    notDefaulter,
    c({ op: 'isFalse', field: 'settledViaOTS', reasonKey: 'rule.noOTS' }),
    c({ op: 'isFalse', field: 'alreadyFinancedElsewhere', reasonKey: 'rule.notFinancedElsewhere' }),
    ...(p.womenOnly ? [c({ op: 'eq', field: 'gender', value: 'female', reasonKey: 'rule.womenOnly' })] : []),
  ],
  priority: [
    { op: 'eq', field: 'gender', value: 'female', reasonKey: 'prio.women' },
    { op: 'isTrue', field: 'hasDisability', reasonKey: 'prio.divyang' },
    { op: 'eq', field: 'gender', value: 'transgender', reasonKey: 'prio.transgender' },
    { op: 'lte', field: 'annualFamilyIncome', value: 250000, reasonKey: 'prio.lowIncome' },
  ],
}))

const nsfdcRules: EligibilityRule[] = [
  {
    schemeId: 'nsfdc-micro-credit',
    version: 1,
    effectiveFrom: NSFDC_FROM,
    criteria: [sc, incomeCap, adult, business, notDefaulter, c({ op: 'lte', field: 'estimatedCost', value: 140000, reasonKey: 'rule.microCostCap' })],
    priority: [],
  },
  {
    schemeId: 'nsfdc-term-loan',
    version: 1,
    effectiveFrom: NSFDC_FROM,
    criteria: [
      sc, incomeCap, adult, business, notDefaulter,
      c({ op: 'between', field: 'estimatedCost', value: [140001, 5000000], reasonKey: 'rule.termCostRange' }),
    ],
    priority: [],
  },
  {
    schemeId: 'nsfdc-education-loan',
    version: 1,
    effectiveFrom: NSFDC_FROM,
    criteria: [sc, incomeCap, notDefaulter, c({ op: 'eq', field: 'purpose', value: 'education', reasonKey: 'rule.purposeEducation' })],
    priority: [],
  },
  {
    schemeId: 'nsfdc-uny',
    version: 1,
    effectiveFrom: NSFDC_FROM,
    criteria: [sc, incomeCap, adult, business, notDefaulter, c({ op: 'lte', field: 'estimatedCost', value: 500000, reasonKey: 'rule.unyCostCap' })],
    priority: [],
  },
  {
    schemeId: 'nsfdc-amy',
    version: 1,
    effectiveFrom: NSFDC_FROM,
    criteria: [
      c({ op: 'isFalse', field: 'stateHasWorkingSca', reasonKey: 'rule.amyNoSca' }),
      sc, incomeCap, adult, business, notDefaulter,
    ],
    priority: [],
  },
]

const fallbackRules: EligibilityRule[] = [
  {
    schemeId: 'pmegp',
    version: 1,
    effectiveFrom: '2021-04-01',
    criteria: [
      adult,
      business,
      c({ op: 'isFalse', field: 'isExistingBusiness', reasonKey: 'rule.pmegpNewUnit' }),
      c({ op: 'lte', field: 'estimatedCost', value: 5000000, reasonKey: 'rule.pmegpMfgCap' }, [G('activityCategory', 'eq', 'manufacturing')]),
      c({ op: 'lte', field: 'estimatedCost', value: 2000000, reasonKey: 'rule.pmegpServiceCap' }, [G('activityCategory', 'neq', 'manufacturing')]),
      c({ op: 'educationAtLeast', field: 'education', value: 'middle', reasonKey: 'rule.pmegpEducationMfg' }, [
        G('activityCategory', 'eq', 'manufacturing'),
        { op: 'gt', field: 'estimatedCost', value: 1000000, reasonKey: '-' },
      ]),
      c({ op: 'educationAtLeast', field: 'education', value: 'middle', reasonKey: 'rule.pmegpEducationService' }, [
        G('activityCategory', 'neq', 'manufacturing'),
        { op: 'gt', field: 'estimatedCost', value: 500000, reasonKey: '-' },
      ]),
    ],
    priority: [],
  },
  {
    schemeId: 'mudra',
    version: 1,
    effectiveFrom: '2015-04-08',
    criteria: [adult, business, notDefaulter, c({ op: 'lte', field: 'estimatedCost', value: 2000000, reasonKey: 'rule.mudraCap' })],
    priority: [],
  },
]

export const eligibilityRules: EligibilityRule[] = [...pmajayRules, ...nsfdcRules, ...fallbackRules]
