import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TxStatusIndicator, MessageStatusIcon } from '../components/chat/TxStatusIndicator'

describe('TxStatusIndicator', () => {
  it('returns null when status is idle', () => {
    const { container } = render(<TxStatusIndicator status="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows signing label', () => {
    render(<TxStatusIndicator status="signing" />)
    expect(screen.getByText('Signing transaction...')).toBeDefined()
  })

  it('shows submitting label', () => {
    render(<TxStatusIndicator status="submitting" />)
    expect(screen.getByText('Submitting to Aptos Network...')).toBeDefined()
  })

  it('shows confirmed label', () => {
    render(<TxStatusIndicator status="confirmed" />)
    expect(screen.getByText('Message delivered on-chain')).toBeDefined()
  })

  it('shows View link when hash is provided and confirmed', () => {
    render(<TxStatusIndicator status="confirmed" hash="0xabc123" />)
    const link = screen.getByText('View') as HTMLAnchorElement
    expect(link).toBeDefined()
    expect(link.href).toContain('explorer.aptoslabs.com')
  })

  it('shows failed label', () => {
    render(<TxStatusIndicator status="failed" />)
    expect(screen.getByText('Transaction failed')).toBeDefined()
  })
})

describe('MessageStatusIcon', () => {
  it('renders Check for mempool', () => {
    const { container } = render(<MessageStatusIcon status="mempool" />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('renders CheckCheck for confirmed', () => {
    const { container } = render(<MessageStatusIcon status="confirmed" />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('renders AlertCircle for failed', () => {
    const { container } = render(<MessageStatusIcon status="failed" />)
    expect(container.querySelector('svg')).toBeDefined()
  })
})
