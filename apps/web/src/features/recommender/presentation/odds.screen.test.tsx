import { screen } from '@testing-library/react'
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

describe('approval odds on the schemes list', () => {
  it("shows the boutique's real approval rate with no low-odds warning", async () => {
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman })
    expect(await screen.findByText('38.7% approved in the past')).toBeInTheDocument()
    expect(screen.queryByText('Most applicants for this project are not approved.')).not.toBeInTheDocument()
  })

  it('warns on poultry and lists better-odds alternatives, best first', async () => {
    await renderApp('/schemes', {
      citizen: true,
      profile: { ...sitapurWoman, activityId: 'poultry', estimatedCost: 130000 },
    })
    expect(await screen.findByText('7.7% approved in the past')).toBeInTheDocument()
    expect(screen.getByText('Most applicants for this project are not approved.')).toBeInTheDocument()
    expect(screen.getByText(/Women's home industry.*44\.3%/)).toBeInTheDocument()
  })

  it('shows no odds badge for an NSFDC scheme', async () => {
    await renderApp('/schemes', {
      citizen: true,
      profile: { ...sitapurWoman, activityId: 'other_service', estimatedCost: 90000 },
    })
    await screen.findByText('Your schemes')
    expect(screen.queryByText(/approved in the past/)).not.toBeInTheDocument()
  })
})

describe('approval odds on the scheme detail screen', () => {
  it('shows the funnel disclosure with the real no-decision share and leading districts', async () => {
    const user = userEvent.setup()
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman })
    const [firstDetailsButton] = await screen.findAllByRole('button', { name: 'See full details' })
    await user.click(firstDetailsButton!)
    await user.click(await screen.findByRole('button', { name: 'About these numbers' }))
    expect(
      screen.getByText('62.9% of 73,888 applications across Uttar Pradesh are still waiting for a decision.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Rampur has the most applications (2,297).')).toBeInTheDocument()
    expect(screen.getByText('Bahraich has the most approvals (1,246).')).toBeInTheDocument()
  })

  it('links a better-odds alternative to its own detail screen', async () => {
    const user = userEvent.setup()
    const { router } = await renderApp('/schemes', {
      citizen: true,
      profile: { ...sitapurWoman, activityId: 'poultry', estimatedCost: 130000 },
    })
    await user.click(await screen.findByRole('link', { name: /Women's home industry/ }))
    expect(router.state.location.pathname).toBe('/schemes/pmajay-home_industry')
    expect(await screen.findByText('PM-AJAY Grant-in-Aid: Women\'s home industry / self-employment (group)')).toBeInTheDocument()
    expect(screen.queryByText('This scheme could not be found.')).not.toBeInTheDocument()
  })
})
