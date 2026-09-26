import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '@ys/shared'
import { renderApp } from '@/test/renderApp'

const persona: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

describe('login', () => {
  it('sends someone without a language to the language screen first', async () => {
    const { router } = await renderApp('/login', { language: null })
    await waitFor(() => expect(router.state.location.pathname).toBe('/language'))
  })

  it('logs a new number in with the OTP and continues to the profile form', async () => {
    const user = userEvent.setup()
    const { router } = await renderApp('/login')
    await user.type(await screen.findByLabelText('Mobile number'), '+91 98765 43210')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    await user.type(await screen.findByLabelText('6-digit code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/profile'))
  })

  it('keeps the person on the code step with a clear message when the code is wrong', async () => {
    const user = userEvent.setup()
    await renderApp('/login')
    await user.type(await screen.findByLabelText('Mobile number'), '9876543210')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    await user.type(await screen.findByLabelText('6-digit code'), '000000')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That code is wrong or has expired')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Enter the code')
  })

  it('rejects an invalid mobile number in the chosen language', async () => {
    const user = userEvent.setup()
    await renderApp('/login', { language: 'hi' })
    await user.type(await screen.findByLabelText('मोबाइल नंबर'), '12345')
    await user.click(screen.getByRole('button', { name: 'कोड भेजें' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('10 अंकों का मोबाइल नंबर')
  })
})

describe('profile', () => {
  it('blocks the next step until the required answers are given, with messages at the fields', async () => {
    const user = userEvent.setup()
    await renderApp('/profile', { citizen: true })
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Write the full name (at least 2 letters).')).toBeInTheDocument()
    expect(screen.getByText('Choose a district from the list.')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('finds Prayagraj when the person types the old name Allahabad', async () => {
    const user = userEvent.setup()
    await renderApp('/profile', { citizen: true })
    await user.type(await screen.findByRole('combobox', { name: 'Your district' }), 'Allahabad')
    const option = await screen.findByRole('option', { name: /Prayagraj/ })
    expect(option).toHaveTextContent('Allahabad is now called Prayagraj')
    await user.click(option)
    expect(await screen.findByText('Prayagraj')).toBeInTheDocument()
  })

  it('switches questions to third person in assisted mode', async () => {
    const user = userEvent.setup()
    await renderApp('/profile', { citizen: true })
    expect(await screen.findByLabelText('Your full name')).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: "I'm filling this in for someone else" }))
    expect(screen.getByLabelText('Their full name')).toBeInTheDocument()
  })

  it('pre-fills a saved profile and saves it on to the schemes page', async () => {
    const user = userEvent.setup()
    const { router } = await renderApp('/profile', { citizen: true, profile: persona })
    expect(await screen.findByDisplayValue('Sunita Devi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const cost = await screen.findByLabelText('How much will it cost in total?')
    expect(cost).toHaveValue(120000)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(await screen.findByRole('button', { name: 'See my schemes' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/schemes'))
  })
})
