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

const defaulterMan: ApplicantProfile = { ...sitapurWoman, fullName: 'Ram Lal', gender: 'male', isDefaulter: true }

async function gotoDocuments(profile: ApplicantProfile, schemeId = 'pmajay-boutique', projectCost = 120000) {
  const rendered = await renderApp(`/schemes/${schemeId}/documents`, { citizen: true, profile })
  rendered.store.chooseScheme(schemeId, projectCost)
  rendered.store.choosePartner('upscfdc-sitapur')
  await rendered.router.navigate(`/schemes/${schemeId}/documents`)
  return rendered
}

describe('documents screen', () => {
  it('shows the common and scheme-specific checklist for a PM-AJAY scheme', async () => {
    await gotoDocuments(sitapurWoman)
    const list = await screen.findByTestId('checklist')
    expect(within(list).getByTestId('checklist-item-aadhaar')).toBeInTheDocument()
    expect(within(list).getByTestId('checklist-item-selection_letter')).toBeInTheDocument()
    expect(within(list).getByTestId('checklist-item-affidavit_3yr')).toBeInTheDocument()
  })

  it('shows the 5-line project report for a PM-AJAY scheme', async () => {
    await gotoDocuments(sitapurWoman)
    expect(await screen.findByText('Project report')).toBeInTheDocument()
    expect(screen.getByText('₹1,20,000')).toBeInTheDocument()
    expect(screen.getByText('₹50,000')).toBeInTheDocument()
  })

  it('shows no project report card for a loan-only NSFDC scheme', async () => {
    const otherServiceMan: ApplicantProfile = { ...sitapurWoman, activityId: 'other_service', estimatedCost: 90000 }
    await gotoDocuments(otherServiceMan, 'nsfdc-micro-credit', 90000)
    await screen.findByTestId('checklist')
    expect(screen.queryByText('Project report')).not.toBeInTheDocument()
  })

  it('persists a checklist tick across a remount', async () => {
    const user = userEvent.setup()
    const rendered = await gotoDocuments(sitapurWoman)
    const item = within(await screen.findByTestId('checklist-item-aadhaar'))
    await user.click(item.getByRole('checkbox'))
    await rendered.router.navigate(`/schemes/pmajay-boutique/documents`, { replace: true })
    await rendered.router.navigate(`/schemes/pmajay-boutique/documents`)
    const reloaded = within(await screen.findByTestId('checklist-item-aadhaar'))
    expect(reloaded.getByRole('checkbox')).toBeChecked()
  })

  it('shows a failing CIBIL check without blocking submission', async () => {
    await gotoDocuments(defaulterMan)
    expect(await screen.findByText(/likely to be rejected/)).toBeInTheDocument()
    expect(screen.getByText(/does not stop you from submitting/)).toBeInTheDocument()
  })

  it('disables submit until every document is checked, then submits and navigates', async () => {
    const user = userEvent.setup()
    const rendered = await gotoDocuments(sitapurWoman)
    const submit = await screen.findByRole('button', { name: 'Submit application' })
    expect(submit).toBeDisabled()
    const checkboxes = screen.getAllByRole('checkbox')
    for (const box of checkboxes) await user.click(box)
    expect(submit).not.toBeDisabled()
    await user.click(submit)
    await waitFor(() => expect(rendered.router.state.location.pathname).toMatch(/^\/status\//))
  })

  it('shows the not-found state for an unknown scheme id', async () => {
    await renderApp('/schemes/does-not-exist/documents', { citizen: true, profile: sitapurWoman })
    expect(await screen.findByRole('alert')).toHaveTextContent('This scheme could not be found.')
  })
})
