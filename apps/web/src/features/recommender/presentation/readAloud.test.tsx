import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { ApplicantProfile } from '@ys/shared'
import { createMockLanguageService } from '@/test/mockLanguageService'
import { renderApp } from '@/test/renderApp'

const sitapurWoman: ApplicantProfile = {
  fullName: 'Sunita Devi', age: 32, gender: 'female', casteCategory: 'SC', annualFamilyIncome: 180000,
  education: 'middle', districtId: 'sitapur', area: 'rural', purpose: 'business', activityId: 'boutique',
  estimatedCost: 120000, isLiterate: true, willingGroupOrCluster: true, isDefaulter: false, settledViaOTS: false,
  alreadyFinancedElsewhere: false, hasDisability: false, isExistingBusiness: false,
}

describe('read-aloud on the schemes list', () => {
  it('speaks a summary that includes the scheme name when clicked', async () => {
    const user = userEvent.setup()
    const languageService = createMockLanguageService()
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman, languageService })
    await screen.findByText('PM-AJAY Grant-in-Aid: Boutique (cluster)')
    const [readAloud] = screen.getAllByRole('button', { name: 'Read aloud' })
    await user.click(readAloud!)
    expect(languageService.speakCalls).toHaveLength(1)
    expect(languageService.speakCalls[0]!.text).toContain('PM-AJAY Grant-in-Aid: Boutique (cluster)')
    expect(languageService.speakCalls[0]!.lang).toBe('en-IN')
  })

  it('hides the read-aloud button when speech synthesis is unsupported', async () => {
    const languageService = createMockLanguageService()
    languageService.ttsSupported = false
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman, languageService })
    await screen.findByText('PM-AJAY Grant-in-Aid: Boutique (cluster)')
    expect(screen.queryByRole('button', { name: 'Read aloud' })).not.toBeInTheDocument()
  })
})

describe('read-aloud on the scheme detail screen', () => {
  it('speaks a summary that includes the scheme name and approval odds', async () => {
    const user = userEvent.setup()
    const languageService = createMockLanguageService()
    await renderApp('/schemes', { citizen: true, profile: sitapurWoman, languageService })
    await user.click(await screen.findAllByRole('button', { name: 'See full details' }).then((btns) => btns[0]!))
    await screen.findByText('PM-AJAY Grant-in-Aid: Boutique (cluster)')
    await user.click(screen.getByRole('button', { name: 'Read aloud' }))
    expect(languageService.speakCalls).toHaveLength(1)
    expect(languageService.speakCalls[0]!.text).toContain('PM-AJAY Grant-in-Aid: Boutique (cluster)')
    expect(languageService.speakCalls[0]!.text).toContain('38.7%')
  })
})
