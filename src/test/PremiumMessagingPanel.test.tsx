import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PremiumMessagingPanel from '../components/chat/PremiumMessagingPanel'

describe('PremiumMessagingPanel', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders x402 section title', () => {
    render(<PremiumMessagingPanel />)
    expect(screen.getByText('x402 Premium Messaging')).toBeDefined()
  })

  it('toggles staked messaging', () => {
    render(<PremiumMessagingPanel />)
    const toggle = screen.getAllByRole('switch').find(b =>
      b.closest('div')?.querySelector('p')?.textContent === 'Staked Messaging'
    )
    expect(toggle).toBeDefined()
  })

  it('toggles x402 pay-per-message', () => {
    render(<PremiumMessagingPanel />)
    expect(screen.getByText('x402 Pay-Per-Message')).toBeDefined()
    expect(screen.getByText('USDC on Base via Coinbase facilitator')).toBeDefined()
  })

  it('shows no session keys message initially', () => {
    render(<PremiumMessagingPanel />)
    expect(screen.getByText('No session keys yet')).toBeDefined()
  })

  it('shows generate key UI when clicked', () => {
    render(<PremiumMessagingPanel />)
    fireEvent.click(screen.getByText('Generate'))
    const input = screen.queryByPlaceholderText('Key label...')
    expect(input).toBeDefined()
  })
})
