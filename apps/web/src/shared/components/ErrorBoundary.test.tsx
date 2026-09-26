import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import '@/shared/i18n'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('boom')
  return <p>fine</p>
}

function Harness() {
  const [explode, setExplode] = useState(true)
  return (
    <>
      <button onClick={() => setExplode(false)}>defuse</button>
      <ErrorBoundary>
        <Bomb explode={explode} />
      </ErrorBoundary>
    </>
  )
}

describe('ErrorBoundary', () => {
  it('shows a translated error with retry instead of a blank screen, and recovers', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Harness />)
    expect(screen.getByRole('alert')).toHaveTextContent(/कुछ गड़बड़ हुई/)
    await userEvent.click(screen.getByText('defuse'))
    await userEvent.click(screen.getByRole('button', { name: 'फिर से कोशिश करें' }))
    expect(screen.getByText('fine')).toBeInTheDocument()
  })
})
