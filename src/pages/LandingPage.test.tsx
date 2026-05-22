import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )
    expect(screen.getAllByText(/Your Messages/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Stay Yours/i).length).toBeGreaterThan(0)
  })

  it('renders the primary CTA buttons', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )
    expect(screen.getAllByText(/Join us/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Open Wallet/i).length).toBeGreaterThan(0)
  })
})
