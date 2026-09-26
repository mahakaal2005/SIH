import { screen, waitFor, within } from '@testing-library/react'
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

const agraMan: ApplicantProfile = {
  ...sitapurWoman, fullName: 'Ram Lal', gender: 'male', districtId: 'agra', area: 'urban',
}

async function partnerList() {
  const el = await screen.findByTestId('partner-list')
  return Object.assign(within(el), { el })
}

describe('partners screen', () => {
  it('shows the UPSCFDC office and bank branches for a demo district, sorted healthy-first then by distance', async () => {
    await renderApp('/schemes/pmajay-boutique/partners', { citizen: true, profile: sitapurWoman })
    const list = await partnerList()
    expect(list.getByTestId('partner-card-upscfdc-sitapur')).toBeInTheDocument()
    expect(list.getByTestId('partner-card-sbi-sitapur')).toBeInTheDocument()
    const ids = [...list.el.querySelectorAll('[data-testid^="partner-card-"]')].map((el) => el.getAttribute('data-testid'))
    const firstBlockedIndex = ids.findIndex((id) => id === 'partner-card-union-sitapur')
    const firstHealthyIndex = ids.findIndex((id) => id === 'partner-card-sbi-sitapur')
    expect(firstHealthyIndex).toBeLessThan(firstBlockedIndex)
  })

  it('shows only the UPSCFDC office for a non-demo district, no crash', async () => {
    await renderApp('/schemes/pmajay-boutique/partners', { citizen: true, profile: agraMan })
    const list = await partnerList()
    expect(list.getByTestId('partner-card-upscfdc-agra')).toBeInTheDocument()
    expect(list.queryByTestId(/^partner-card-sbi-/)).not.toBeInTheDocument()
  })

  it('shows a blocked partner with its health badge, reason, and a suggested alternative', async () => {
    await renderApp('/schemes/pmajay-boutique/partners', { citizen: true, profile: sitapurWoman })
    const list = await partnerList()
    const unionCard = within(list.getByTestId('partner-card-union-sitapur'))
    expect(unionCard.getByText('Blocked')).toBeInTheDocument()
    expect(unionCard.getByText(/minimum fund utilisation/)).toBeInTheDocument()
    expect(unionCard.getByText(/Suggested alternative/)).toBeInTheDocument()
  })

  it('stores the chosen partner in the session and navigates onward', async () => {
    const user = userEvent.setup()
    const { router, store } = await renderApp('/schemes/pmajay-boutique/partners', { citizen: true, profile: sitapurWoman })
    const list = await partnerList()
    const officeCard = within(list.getByTestId('partner-card-upscfdc-sitapur'))
    await user.click(officeCard.getByRole('button', { name: 'Choose this partner' }))
    await waitFor(() => expect(store.get().journey.partnerBranchId).toBe('upscfdc-sitapur'))
    expect(router.state.location.pathname).toBe('/schemes/pmajay-boutique/documents')
  })

  it('shows the not-found state for an unknown scheme id', async () => {
    await renderApp('/schemes/does-not-exist/partners', { citizen: true, profile: sitapurWoman })
    expect(await screen.findByRole('alert')).toHaveTextContent('This scheme could not be found.')
  })
})
