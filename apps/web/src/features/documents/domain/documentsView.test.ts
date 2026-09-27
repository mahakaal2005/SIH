import { financePlan, SOP_COMPONENTS } from '@ys/shared'
import * as seed from '@ys/shared/seed'
import { describe, expect, it } from 'vitest'
import type { PreflightResult } from '@/core/data/repositories/types'
import { toDocumentsView } from './documentsView'

const scheme = (id: string) => seed.schemes.find((s) => s.id === id)!
const preflight: PreflightResult[] = [
  { id: 'cibil', status: 'pass', detailKey: 'preflight.cibil.pass', params: { score: 720 } },
  { id: 'penny_drop', status: 'pass', detailKey: 'preflight.pennyDrop.pass' },
  { id: 'no_default', status: 'pass', detailKey: 'preflight.noDefault.pass' },
]

describe('toDocumentsView', () => {
  it('merges the common and scheme-specific document list with checked state', () => {
    const pmajay = scheme('pmajay-boutique')
    const plan = financePlan(pmajay, { projectCost: 120000, area: 'rural', trainingHours: 0 })
    const view = toDocumentsView(pmajay, seed.documentRequirements, { aadhaar: true }, preflight, plan)
    expect(view.items.map((i) => i.id)).toEqual([...seed.COMMON_DOCUMENT_IDS, 'selection_letter', 'affidavit_3yr'])
    expect(view.items.find((i) => i.id === 'aadhaar')?.checked).toBe(true)
    expect(view.items.find((i) => i.id === 'selection_letter')?.checked).toBe(false)
  })

  it('marks Aadhaar, caste, income and residence as DigiLocker-eligible', () => {
    const pmajay = scheme('pmajay-boutique')
    const plan = financePlan(pmajay, { projectCost: 120000, area: 'rural', trainingHours: 0 })
    const view = toDocumentsView(pmajay, seed.documentRequirements, {}, preflight, plan)
    expect(view.items.find((i) => i.id === 'aadhaar')?.digiLocker).toBe(true)
    expect(view.items.find((i) => i.id === 'bank_passbook')?.digiLocker).toBe(false)
  })

  it('is allChecked only once every listed document is checked', () => {
    const pmajay = scheme('pmajay-boutique')
    const plan = financePlan(pmajay, { projectCost: 120000, area: 'rural', trainingHours: 0 })
    const partial = toDocumentsView(pmajay, seed.documentRequirements, { aadhaar: true }, preflight, plan)
    expect(partial.allChecked).toBe(false)
    const ids = Object.fromEntries(partial.items.map((i) => [i.id, true]))
    const full = toDocumentsView(pmajay, seed.documentRequirements, ids, preflight, plan)
    expect(full.allChecked).toBe(true)
  })

  it('builds a 5-line SOP project report for a PM-AJAY (grant_plus_loan) scheme', () => {
    const pmajay = scheme('pmajay-boutique')
    const plan = financePlan(pmajay, { projectCost: 120000, area: 'rural', trainingHours: 0 })
    const view = toDocumentsView(pmajay, seed.documentRequirements, {}, preflight, plan)
    expect(view.report).not.toBeNull()
    expect(view.report!.map((l) => l.key)).toEqual([...SOP_COMPONENTS])
    expect(view.report!.find((l) => l.key === 'grant')?.amount).toBe(plan.gia!.grant)
  })

  it('has no project report for a loan-only scheme', () => {
    const loanScheme = scheme('nsfdc-education-loan')
    const plan = financePlan(loanScheme, { projectCost: 200000, area: 'rural' })
    const view = toDocumentsView(loanScheme, seed.documentRequirements, {}, preflight, plan)
    expect(view.report).toBeNull()
  })

  it('passes the preflight results through unchanged', () => {
    const pmajay = scheme('pmajay-boutique')
    const plan = financePlan(pmajay, { projectCost: 120000, area: 'rural', trainingHours: 0 })
    const failing: PreflightResult[] = [{ id: 'cibil', status: 'fail', detailKey: 'preflight.cibil.fail', params: { score: 560 } }]
    const view = toDocumentsView(pmajay, seed.documentRequirements, {}, failing, plan)
    expect(view.preflight).toBe(failing)
  })
})
