import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '@ys/shared'
import { renderApp } from '@/test/renderApp'

const boutiqueWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

const otherServiceMan: ApplicantProfile = {
  fullName: 'Ram Lal', age: 40, gender: 'male', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'urban', purpose: 'business', activityId: 'other_service',
  estimatedCost: 90000, isLiterate: true, willingGroupOrCluster: false, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

async function gotoCalculator(profile: ApplicantProfile) {
  const user = userEvent.setup()
  const rendered = await renderApp('/schemes', { citizen: true, profile })
  const [firstDetailsButton] = await screen.findAllByRole('button', { name: 'See full details' })
  await user.click(firstDetailsButton!)
  await user.click(await screen.findByRole('button', { name: 'Continue with this scheme' }))
  return { ...rendered, user }
}

describe('calculator screen', () => {
  it('shows the five-component GIA split and a plausible EMI for a grant_plus_loan scheme', async () => {
    const { router } = await gotoCalculator(boutiqueWoman)
    expect(router.state.location.pathname).toBe('/schemes/pmajay-boutique/cost')
    expect(await screen.findByText('Grant-in-Aid split')).toBeInTheDocument()
    expect(screen.getByText('₹1,20,000')).toBeInTheDocument()
    expect(screen.getByText('₹6,000')).toBeInTheDocument()
    expect(screen.getByText('₹50,000')).toBeInTheDocument()
    expect(screen.getByText(/\/ month/)).toBeInTheDocument()
  })

  it('shows a loan-only EMI card with no GIA split for an NSFDC scheme', async () => {
    await gotoCalculator(otherServiceMan)
    expect(await screen.findByText(/\/ month/)).toBeInTheDocument()
    expect(screen.queryByText('Grant-in-Aid split')).not.toBeInTheDocument()
  })

  it('recomputes the EMI when the rate slider moves', async () => {
    const { user } = await gotoCalculator(otherServiceMan)
    const before = (await screen.findByText(/\/ month/)).textContent
    const rateSlider = screen.getByRole('slider', { name: 'Interest rate' })
    rateSlider.focus()
    for (let i = 0; i < 10; i += 1) await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(screen.getByText(/\/ month/).textContent).not.toBe(before))
  })

  it('shows the affordability warning for a low income against the EMI', async () => {
    await gotoCalculator({ ...otherServiceMan, annualFamilyIncome: 24000 })
    expect(await screen.findByRole('alert', { name: '' })).toHaveTextContent(/unaffordable|stretch/i)
  })

  it('shows no warning for a comfortable income', async () => {
    await gotoCalculator({ ...otherServiceMan, annualFamilyIncome: 1200000 })
    await screen.findByText(/\/ month/)
    expect(screen.getByText('This EMI looks affordable against your stated income.')).toBeInTheDocument()
  })

  it('shows an empty state on direct navigation with no chosen project cost', async () => {
    await renderApp('/schemes/pmajay-boutique/cost', { citizen: true, profile: boutiqueWoman })
    expect(await screen.findByText('Start from your schemes list')).toBeInTheDocument()
    expect(screen.queryByText(/\/ month/)).not.toBeInTheDocument()
  })

  it('shows the empty state, not a stale cost, when the journey belongs to a different scheme', async () => {
    const { router, store } = await gotoCalculator(boutiqueWoman)
    expect(await screen.findByText('Grant-in-Aid split')).toBeInTheDocument()
    store.chooseScheme('pmajay-poultry', 130000)
    await router.navigate('/schemes/pmajay-boutique/cost')
    expect(await screen.findByText('Start from your schemes list')).toBeInTheDocument()
    expect(screen.queryByText('₹1,30,000')).not.toBeInTheDocument()
  })
})
