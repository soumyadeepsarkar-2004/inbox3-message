import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TermsPage from '../pages/TermsPage'

describe('TermsPage', () => {
  it('renders the heading', () => {
    render(<BrowserRouter><TermsPage /></BrowserRouter>)
    expect(screen.getByText('Terms of Service')).toBeDefined()
  })

  it('renders all sections', () => {
    render(<BrowserRouter><TermsPage /></BrowserRouter>)
    expect(screen.getByText('1. Acceptance of Terms')).toBeDefined()
    expect(screen.getByText('2. Non-Custodial Nature')).toBeDefined()
    expect(screen.getByText('3. Anti-Spam Mechanics (Yield Simulation)')).toBeDefined()
    expect(screen.getByText('4. Limitation of Liability')).toBeDefined()
  })

  it('has a back link to home', () => {
    render(<BrowserRouter><TermsPage /></BrowserRouter>)
    expect(screen.getByText('Back to Home')).toBeDefined()
  })
})
