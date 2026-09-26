import { describe, expect, it } from 'vitest'
import { eligibilityRuleSchema } from '../schemas/rule'
import {
  activities, approvalFunnel, approvalStats, districts, documentRequirements, eligibilityRules,
  partnerBranches, partnerEntities, pmajayProjects, schemes,
} from './index'

const unique = (xs: string[]) => new Set(xs).size === xs.length

describe('seed integrity', () => {
  it('has all 75 UP districts with unique ids and the 5 demo districts', () => {
    expect(districts).toHaveLength(75)
    expect(unique(districts.map((d) => d.id))).toBe(true)
    expect(districts.filter((d) => d.isDemoDistrict).map((d) => d.id).sort()).toEqual(
      ['ghaziabad', 'hardoi', 'lucknow', 'raebareli', 'sitapur'],
    )
  })

  it('carries every renamed-district alias from docs/05 F3.6', () => {
    const aliasOf = (a: string) => districts.find((d) => d.aliases.includes(a))?.id
    expect(aliasOf('Allahabad')).toBe('prayagraj')
    expect(aliasOf('Faizabad')).toBe('ayodhya')
    expect(aliasOf('Mahamaya Nagar')).toBe('hathras')
    expect(aliasOf('Bhim Nagar')).toBe('sambhal')
    expect(aliasOf('Chhatrapati Shahuji Maharaj Nagar')).toBe('amethi')
    expect(aliasOf('Jyotiba Phule Nagar')).toBe('amroha')
    expect(aliasOf('Panchsheel Nagar')).toBe('hapur')
    expect(aliasOf('Prabuddh Nagar')).toBe('shamli')
    expect(aliasOf('Kanshiram Nagar')).toBe('kasganj')
  })

  it('has 16 PM-AJAY projects, 10 with SOP costs', () => {
    expect(pmajayProjects).toHaveLength(16)
    expect(pmajayProjects.filter((p) => p.costPerPerson !== null)).toHaveLength(10)
  })

  it('reconciles approval stats with the published funnel exactly', () => {
    expect(approvalStats.reduce((s, x) => s + x.applied, 0)).toBe(approvalFunnel.applied)
    expect(approvalStats.reduce((s, x) => s + x.approved, 0)).toBe(approvalFunnel.approved)
    expect(approvalFunnel.approved + approvalFunnel.rejected + approvalFunnel.noDecision).toBe(approvalFunnel.applied)
    expect(new Set(approvalStats.map((s) => s.projectId))).toEqual(new Set(pmajayProjects.map((p) => p.id)))
  })

  it('has exactly one valid rule per scheme', () => {
    for (const r of eligibilityRules) expect(() => eligibilityRuleSchema.parse(r)).not.toThrow()
    expect(eligibilityRules.map((r) => r.schemeId).sort()).toEqual(schemes.map((s) => s.id).sort())
  })

  it('references only documents, schemes, entities and districts that exist', () => {
    const docIds = new Set(documentRequirements.map((d) => d.id))
    for (const s of schemes) for (const d of s.extraDocumentIds) expect(docIds, `${s.id} → ${d}`).toContain(d)
    const schemeIds = new Set(schemes.map((s) => s.id))
    const entityIds = new Set(partnerEntities.map((e) => e.id))
    const districtIds = new Set(districts.map((d) => d.id))
    for (const b of partnerBranches) {
      expect(entityIds).toContain(b.entityId)
      expect(districtIds).toContain(b.districtId)
      for (const s of b.authorisedSchemeIds) expect(schemeIds).toContain(s)
    }
    for (const a of activities) if (a.pmajayProjectId) expect(pmajayProjects.map((p) => p.id)).toContain(a.pmajayProjectId)
  })

  it('gives every district a UPSCFDC office and demo districts bank branches', () => {
    for (const d of districts) {
      const here = partnerBranches.filter((b) => b.districtId === d.id)
      expect(here.some((b) => b.entityId === 'upscfdc')).toBe(true)
      if (d.isDemoDistrict) expect(here.length).toBeGreaterThan(1)
    }
  })

  it('marks every partner health record as seeded', () => {
    for (const e of partnerEntities) expect(e.health.provenance.kind).toBe('seeded')
  })

  it('uses unique ids everywhere', () => {
    expect(unique(schemes.map((s) => s.id))).toBe(true)
    expect(unique(partnerBranches.map((b) => b.id))).toBe(true)
    expect(unique(activities.map((a) => a.id))).toBe(true)
    expect(unique(documentRequirements.map((d) => d.id))).toBe(true)
  })
})
