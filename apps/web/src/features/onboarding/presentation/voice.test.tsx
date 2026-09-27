import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockLanguageService } from '@/test/mockLanguageService'
import { renderApp } from '@/test/renderApp'

describe('voice intake on the profile form', () => {
  it('shows a mic button next to full name, age and district on step 1', async () => {
    await renderApp('/profile', { citizen: true })
    expect(await screen.findByTestId('mic-fullName')).toBeInTheDocument()
    expect(screen.getByTestId('mic-age')).toBeInTheDocument()
    expect(screen.getByTestId('mic-districtId')).toBeInTheDocument()
  })

  it('fills the full name field from a spoken transcript', async () => {
    const user = userEvent.setup()
    const languageService = createMockLanguageService()
    await renderApp('/profile', { citizen: true, languageService })
    const nameField = await screen.findByLabelText('Your full name')
    await user.click(screen.getByTestId('mic-fullName'))
    languageService.fireResult({ transcript: 'Sunita Devi' })
    expect(nameField).toHaveValue('Sunita Devi')
  })

  it('parses a spoken number into the age field', async () => {
    const user = userEvent.setup()
    const languageService = createMockLanguageService()
    await renderApp('/profile', { citizen: true, languageService })
    const ageField = await screen.findByLabelText('Your age')
    await user.click(screen.getByTestId('mic-age'))
    languageService.fireResult({ transcript: '32' })
    expect(ageField).toHaveValue(32)
  })

  it('feeds a spoken district name into the district search', async () => {
    const user = userEvent.setup()
    const languageService = createMockLanguageService()
    await renderApp('/profile', { citizen: true, languageService })
    await screen.findByTestId('mic-districtId')
    await user.click(screen.getByTestId('mic-districtId'))
    languageService.fireResult({ transcript: 'Sitapur' })
    expect(await screen.findByRole('option', { name: /Sitapur/ })).toBeInTheDocument()
  })

  it('hides every mic button when speech recognition is unsupported', async () => {
    const languageService = createMockLanguageService()
    languageService.sttSupported = false
    await renderApp('/profile', { citizen: true, languageService })
    await screen.findByLabelText('Your full name')
    expect(screen.queryByTestId('mic-fullName')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mic-age')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mic-districtId')).not.toBeInTheDocument()
  })
})
