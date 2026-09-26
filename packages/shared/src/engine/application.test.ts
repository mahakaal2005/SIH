import { describe, expect, it } from 'vitest'
import * as seed from '../seed'
import { canonicalReceiptPayload, documentsForScheme, financePlan } from './application'

const scheme = (id: string) => seed.schemes.find((s) => s.id === id)!

describe('documentsForScheme', () => {
  const ids = (schemeId: string) => documentsForScheme(scheme(schemeId), seed.documentRequirements).map((d) => d.id)

  it('lists the common set first, then scheme-specific documents', () => {
    expect(ids('pmajay-boutique')).toEqual([...seed.COMMON_DOCUMENT_IDS, 'selection_letter', 'affidavit_3yr'])
  })

  it('adds livestock records for livestock projects', () => {
    expect(ids('pmajay-poultry')).toContain('livestock_bundle')
  })

  it('adds admission and fee proof for the education loan', () => {
    expect(ids('nsfdc-education-loan')).toEqual(expect.arrayContaining(['admission_proof', 'fee_structure']))
  })
})

describe('financePlan', () => {
  it('splits a PM-AJAY project per the SOP and computes training cost from hours', () => {
    const p = financePlan(scheme('pmajay-boutique'), { projectCost: 120000, area: 'rural', trainingHours: 380 })
    expect(p).toMatchObject({ kind: 'grant_plus_loan', loan: 64000, grant: 50000, ownContribution: 6000 })
    expect(p.gia?.trainingCost).toBe(13338)
  })

  it('finances 90% under NSFDC and caps at the scheme maximum', () => {
    expect(financePlan(scheme('nsfdc-micro-credit'), { projectCost: 120000, area: 'rural' })).toMatchObject({
      kind: 'loan', loan: 108000, ownContribution: 12000, grant: 0, cappedByMaxLoan: false,
    })
  })

  it('applies the PMEGP rural subsidy as a later credit, not a loan reduction', () => {
    expect(financePlan(scheme('pmegp'), { projectCost: 300000, area: 'rural' })).toMatchObject({
      kind: 'subsidy_plus_loan', loan: 285000, ownContribution: 15000, subsidy: 105000,
    })
    expect(financePlan(scheme('pmegp'), { projectCost: 300000, area: 'urban' }).subsidy).toBe(75000)
  })
})

describe('canonicalReceiptPayload', () => {
  const base = {
    receiptNo: 'YS-2026-000123', schemeId: 'pmajay-boutique', ruleVersion: 1, districtId: 'sitapur',
    applicantName: 'Sunita Devi', loanAmount: 64000, grantAmount: 50000, submittedAt: '2026-09-26T10:00:00.000Z',
  }

  it('is independent of key order', () => {
    const shuffled = Object.fromEntries(Object.entries(base).reverse()) as typeof base
    expect(canonicalReceiptPayload(shuffled)).toBe(canonicalReceiptPayload(base))
  })

  it('changes when any field changes', () => {
    expect(canonicalReceiptPayload({ ...base, loanAmount: 64001 })).not.toBe(canonicalReceiptPayload(base))
  })
})
