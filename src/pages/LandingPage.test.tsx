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

  it('renders the brand name in nav and footer', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )
    expect(screen.getAllByText('Inbox3').length).toBeGreaterThanOrEqual(2)
  })

  it('renders a call to action button', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Join us')).toBeDefined()
  })
})
