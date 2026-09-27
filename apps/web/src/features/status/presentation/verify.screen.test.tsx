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

describe('verify screen', () => {
  it('works with no session at all', async () => {
    await renderApp('/verify')
    expect(await screen.findByRole('heading', { name: 'Check a letter' })).toBeInTheDocument()
  })

  it('validates a genuine receipt round-tripped through encodeReceipt', async () => {
    const user = userEvent.setup()
    const rendered = await renderApp('/status', { citizen: true, profile: sitapurWoman })
    const app = await rendered.repos.application.submit({
      userId: rendered.user!.id, schemeId: 'pmajay-boutique', profile: sitapurWoman,
      partnerBranchId: null, loanAmount: 63500, grantAmount: 50000,
    })
    const code = rendered.repos.application.encodeReceipt(app)

    await rendered.router.navigate('/verify')
    await user.click(await screen.findByLabelText('Paste the receipt code here'))
    await user.paste(code)
    await user.click(screen.getByRole('button', { name: 'Check' }))
    const result = await screen.findByTestId('verify-result')
    expect(result).toHaveTextContent('This is a genuine application')
    expect(result).toHaveTextContent(app.receiptNo)
  })

  it('rejects malformed text with a clear reason', async () => {
    const user = userEvent.setup()
    await renderApp('/verify')
    await user.type(screen.getByLabelText('Paste the receipt code here'), 'not a real receipt code')
    await user.click(screen.getByRole('button', { name: 'Check' }))
    const result = await screen.findByTestId('verify-result')
    expect(result).toHaveTextContent('That does not look like a Yojna Sarthi code')
  })
})
