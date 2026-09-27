import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '@ys/shared'
import { renderApp } from '@/test/renderApp'

const sitapurWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

describe('officer queue screen', () => {
  it('shows only the officer\'s own district for a district officer', async () => {
    const rendered = await renderApp('/officer', { officer: 'district_officer' })
    const officerDistrict = rendered.user!.districtId!
    const otherDistrict = officerDistrict === 'sitapur' ? 'hardoi' : 'sitapur'
    const mine = await rendered.repos.application.submit({
      userId: 'u1', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId: officerDistrict },
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    const other = await rendered.repos.application.submit({
      userId: 'u2', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId: otherDistrict },
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate('/officer')
    const list = await screen.findByTestId('officer-queue')
    expect(within(list).getByTestId(`queue-row-${mine.id}`)).toBeInTheDocument()
    expect(within(list).queryByTestId(`queue-row-${other.id}`)).not.toBeInTheDocument()
  })

  it('shows every district for hq_admin', async () => {
    const rendered = await renderApp('/officer', { officer: 'hq_admin' })
    const first = await rendered.repos.application.submit({
      userId: 'u1', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId: 'sitapur' },
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    const second = await rendered.repos.application.submit({
      userId: 'u2', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId: 'hardoi' },
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate('/officer')
    const list = await screen.findByTestId('officer-queue')
    expect(within(list).getByTestId(`queue-row-${first.id}`)).toBeInTheDocument()
    expect(within(list).getByTestId(`queue-row-${second.id}`)).toBeInTheDocument()
  })

  it('flags an application stuck far past its expected duration as stalled', async () => {
    const rendered = await renderApp('/officer', { officer: 'district_officer' })
    const officerDistrict = rendered.user!.districtId!
    const app = await rendered.repos.application.submit({
      userId: 'u1', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId: officerDistrict },
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    await rendered.db.commit((s) => {
      const a = s.applications.find((x) => x.id === app.id)!
      a.submittedAt = '2026-01-01T00:00:00.000Z'
      a.history = a.history.map((h) => ({ ...h, at: '2026-01-01T00:00:00.000Z' }))
    })
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate('/officer')
    const row = await screen.findByTestId(`queue-row-${app.id}`)
    expect(within(row).getByText('Stalled')).toBeInTheDocument()
  })
})
