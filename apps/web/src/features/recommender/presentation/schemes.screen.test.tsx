import { screen, waitFor } from '@testing-library/react'
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

describe('schemes', () => {
  it('shows the PM-AJAY boutique grant as the best match for the demo persona', async () => {
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman })
    expect(await screen.findByText('Best match')).toBeInTheDocument()
    expect(screen.getByText('PM-AJAY Grant-in-Aid: Boutique (cluster)')).toBeInTheDocument()
  })

  it('shows the exact gap for a near miss', async () => {
    await renderApp('/schemes', {
      citizen: true,
      profile: { ...sitapurWoman, activityId: 'other_service', estimatedCost: 145000 },
    })
    expect(await screen.findByText('Almost eligible')).toBeInTheDocument()
    expect(screen.getByText('You miss this by ₹5,000. The limit is ₹1,40,000.')).toBeInTheDocument()
  })

  it('shows the fallback banner for a General category applicant', async () => {
    await renderApp('/schemes', {
      citizen: true,
      profile: { ...sitapurWoman, casteCategory: 'GEN', activityId: 'other_service', estimatedCost: 300000 },
    })
    expect(await screen.findByText(/No Scheduled Caste scheme fits/)).toBeInTheDocument()
  })

  it('recovers after an injected failure with retry', async () => {
    const user = userEvent.setup()
    const { transport } = await renderApp('/schemes', { citizen: true, profile: sitapurWoman })
    transport.setFailing('recommendation', true)
    await waitFor(() => expect(screen.queryByText('Best match')).not.toBeInTheDocument())
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    transport.setFailing('recommendation', false)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Best match')).toBeInTheDocument()
  })

  it('stores the chosen scheme in the journey and moves toward the cost step', async () => {
    const user = userEvent.setup()
    const { router, store } = await renderApp('/schemes', { citizen: true, profile: sitapurWoman })
    await user.click(await screen.findAllByRole('button', { name: 'See full details' }).then((btns) => btns[0]!))
    await user.click(await screen.findByRole('button', { name: 'Continue with this scheme' }))
    expect(store.get().journey.schemeId).toBe('pmajay-boutique')
    await waitFor(() => expect(router.state.location.pathname).toBe('/schemes/pmajay-boutique/cost'))
  })
})
