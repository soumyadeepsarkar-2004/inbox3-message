import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PrivacyPage from '../pages/PrivacyPage'

describe('PrivacyPage', () => {
  it('renders the heading', () => {
    render(<BrowserRouter><PrivacyPage /></BrowserRouter>)
    expect(screen.getByText('Privacy Policy')).toBeDefined()
  })

  it('renders all sections', () => {
    render(<BrowserRouter><PrivacyPage /></BrowserRouter>)
    expect(screen.getByText('1. Decentralized By Design')).toBeDefined()
    expect(screen.getByText('2. What We Can\'t See')).toBeDefined()
    expect(screen.getByText('3. Public Blockchain Data')).toBeDefined()
    expect(screen.getByText('4. Ephemeral Mode')).toBeDefined()
  })

  it('has a back link to home', () => {
    render(<BrowserRouter><PrivacyPage /></BrowserRouter>)
    expect(screen.getByText('Back to Home')).toBeDefined()
  })
})
