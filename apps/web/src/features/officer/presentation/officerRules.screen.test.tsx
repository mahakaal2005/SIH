import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'

describe('officer rules screen', () => {
  it('shows the live rule and version history for the first scheme by default', async () => {
    await renderApp('/officer/rules', { officer: 'hq_admin' })
    expect(await screen.findByTestId('rule-history')).toBeInTheDocument()
    expect(screen.getByTestId('rule-version-1')).toBeInTheDocument()
    expect(screen.getAllByText(/rule\./).length).toBeGreaterThan(0)
  })

  it('switches to a different scheme\'s rule history when picked', async () => {
    const user = userEvent.setup()
    await renderApp('/officer/rules', { officer: 'hq_admin' })
    await screen.findByTestId('rule-history')
    await user.selectOptions(screen.getByLabelText('Scheme'), 'nsfdc-micro-credit')
    expect(await screen.findByText(/rule\.microCostCap/)).toBeInTheDocument()
  })
})
