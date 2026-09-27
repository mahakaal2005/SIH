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

async function submitApp(rendered: Awaited<ReturnType<typeof renderApp>>) {
  return rendered.repos.application.submit({
    userId: rendered.user!.id, schemeId: 'pmajay-boutique', profile: sitapurWoman,
    partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
  })
}

describe('application detail screen', () => {
  it('shows the timeline with the current stage highlighted', async () => {
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const app = await submitApp(rendered)
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/status/${app.id}`)
    const step = await screen.findByTestId('timeline-step-pre_scrutiny')
    expect(step).toHaveAttribute('data-status', 'current')
    expect(screen.getByTestId('timeline-step-submitted')).toHaveAttribute('data-status', 'done')
    expect(screen.getByTestId('timeline-step-dlpac')).toHaveAttribute('data-status', 'upcoming')
  })

  it('shows the reason and a resubmit button when returned, and resubmitting moves it back into the pipeline', async () => {
    const user = userEvent.setup()
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const app = await submitApp(rendered)
    await rendered.repos.application.act(app.id, { type: 'return_for_fix', reasonKey: 'reject.documents' }, 'officer-1')
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/status/${app.id}`)
    const banner = await screen.findByTestId('terminal-banner')
    expect(banner).toHaveTextContent('Sent back for correction')
    expect(banner).toHaveTextContent('Some documents were missing or could not be verified.')
    const resubmit = screen.getByRole('button', { name: 'Resubmit' })
    await user.click(resubmit)
    await waitFor(() => expect(screen.getByTestId('timeline-step-pre_scrutiny')).toHaveAttribute('data-status', 'current'))
    expect(screen.queryByTestId('terminal-banner')).not.toBeInTheDocument()
  })

  it('shows the reason and a link to start a new application when rejected, with no resubmit button', async () => {
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const app = await submitApp(rendered)
    await rendered.repos.application.act(app.id, { type: 'reject', reasonKey: 'reject.cibil' }, 'officer-1')
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/status/${app.id}`)
    const banner = await screen.findByTestId('terminal-banner')
    expect(banner).toHaveTextContent('This application was not approved')
    expect(banner).toHaveTextContent('Credit score check did not pass.')
    expect(screen.queryByRole('button', { name: 'Resubmit' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a new application' })).toBeInTheDocument()
  })

  it('marks a notification read on click', async () => {
    const user = userEvent.setup()
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const app = await submitApp(rendered)
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/status/${app.id}`)
    const feed = await screen.findByTestId('notification-feed')
    const unread = feed.querySelector('button:not([disabled])')
    expect(unread).not.toBeNull()
    await user.click(unread!)
    await waitFor(() => expect(unread).toBeDisabled())
  })
})
