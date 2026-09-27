import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '@ys/shared'
import { renderApp } from '@/test/renderApp'

const sitapurWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

describe('status list screen', () => {
  it('shows an empty state with a link to schemes when the citizen has no applications', async () => {
    await renderApp('/status', { citizen: true, profile: sitapurWoman })
    expect(await screen.findByText('No applications yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse schemes' })).toBeInTheDocument()
  })

  it('lists every application newest first, linking to its detail page', async () => {
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const submitOpts = { userId: rendered.user!.id, profile: sitapurWoman, partnerBranchId: null, loanAmount: 63500, grantAmount: 50000 }
    const first = await rendered.repos.application.submit({ ...submitOpts, schemeId: 'pmajay-boutique' })
    const second = await rendered.repos.application.submit({ ...submitOpts, schemeId: 'nsfdc-education-loan' })
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate('/status')
    const list = await screen.findByTestId('application-list')
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(list).toHaveTextContent(first.receiptNo)
    expect(list).toHaveTextContent(second.receiptNo)
    const user = userEvent.setup()
    await user.click(screen.getByTestId(`application-row-${first.id}`))
    expect(await screen.findByText(first.receiptNo)).toBeInTheDocument()
  })
})
