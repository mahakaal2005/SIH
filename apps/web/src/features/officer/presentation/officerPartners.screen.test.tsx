import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as seed from '@ys/shared/seed'
import { renderApp } from '@/test/renderApp'

describe('officer partners screen', () => {
  it('renders a health badge for every seeded partner entity', async () => {
    await renderApp('/officer/partners', { officer: 'hq_admin' })
    const list = await screen.findByTestId('partner-health-list')
    expect(list.querySelectorAll('li')).toHaveLength(seed.partnerEntities.length)
  })
})
