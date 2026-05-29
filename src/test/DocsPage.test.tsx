import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DocsPage from '../pages/DocsPage'

describe('DocsPage', () => {
  it('renders the heading', () => {
    render(<BrowserRouter><DocsPage /></BrowserRouter>)
    expect(screen.getByText('Documentation')).toBeDefined()
  })

  it('renders protocol overview section', () => {
    render(<BrowserRouter><DocsPage /></BrowserRouter>)
    expect(screen.getByText('Protocol Overview')).toBeDefined()
  })

  it('renders SDK integration section', () => {
    render(<BrowserRouter><DocsPage /></BrowserRouter>)
    expect(screen.getByText('SDK Integration')).toBeDefined()
  })

  it('renders security model section', () => {
    render(<BrowserRouter><DocsPage /></BrowserRouter>)
    expect(screen.getByText('Security Model')).toBeDefined()
  })

  it('has a back link to home', () => {
    render(<BrowserRouter><DocsPage /></BrowserRouter>)
    expect(screen.getByText('Back to Home')).toBeDefined()
  })
})
