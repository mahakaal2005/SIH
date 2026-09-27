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

async function submitApp(rendered: Awaited<ReturnType<typeof renderApp>>, districtId: string) {
  return rendered.repos.application.submit({
    userId: 'u1', schemeId: 'pmajay-boutique', profile: { ...sitapurWoman, districtId },
    partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
  })
}

describe('officer application screen', () => {
  it('approving pre-scrutiny moves the application to the next stage', async () => {
    const user = userEvent.setup()
    const rendered = await renderApp('/officer', { officer: 'district_officer' })
    const app = await submitApp(rendered, rendered.user!.districtId!)
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/officer/applications/${app.id}`)
    await screen.findByTestId('officer-timeline')
    expect(screen.getByTestId('officer-timeline-step-pre_scrutiny')).toHaveAttribute('data-status', 'current')
    await user.click(screen.getByRole('button', { name: 'Approve pre-scrutiny' }))
    await waitFor(() => expect(screen.getByTestId('officer-timeline-step-dlpac')).toHaveAttribute('data-status', 'current'))
  })

  it('requires a reason before confirming a return-for-fix', async () => {
    const user = userEvent.setup()
    const rendered = await renderApp('/officer', { officer: 'district_officer' })
    const app = await submitApp(rendered, rendered.user!.districtId!)
    await rendered.queryClient.invalidateQueries()
    await rendered.router.navigate(`/officer/applications/${app.id}`)
    await user.click(await screen.findByRole('button', { name: 'Send back for correction' }))
    const confirm = screen.getByRole('button', { name: 'Confirm' })
    expect(confirm).toBeDisabled()
    await user.selectOptions(screen.getByLabelText('Reason'), 'Some documents were missing or could not be verified.')
    expect(confirm).not.toBeDisabled()
    await user.click(confirm)
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Send back for correction' })).not.toBeInTheDocument())
  })

  it('shows not-found for an unknown application id', async () => {
    await renderApp('/officer/applications/does-not-exist', { officer: 'district_officer' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Application not found.')
  })
})
