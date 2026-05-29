import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageCard from '../components/chat/MessageCard'
import type { Message } from '../components/chat/MessageCard'

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({ connected: true }),
}))

const baseMessage: Message = {
  id: '1',
  sender: 'Alice',
  senderAddress: '0x123',
  content: 'Hello world',
  timestamp: '10:30 AM',
  direction: 'received',
  status: 'confirmed',
}

describe('MessageCard', () => {
  it('renders text content', () => {
    render(<MessageCard message={baseMessage} onReact={vi.fn()} isLast={false} />)
    expect(screen.getByText('Hello world')).toBeDefined()
  })

  it('shows sender name for received messages', () => {
    render(<MessageCard message={baseMessage} onReact={vi.fn()} isLast={false} />)
    expect(screen.getByText('Alice')).toBeDefined()
  })

  it('renders sent messages on the right side', () => {
    const sent: Message = { ...baseMessage, direction: 'sent', sender: 'You' }
    const { container } = render(<MessageCard message={sent} onReact={vi.fn()} isLast={false} />)
    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain('justify-end')
  })

  it('shows CheckCheck icon for confirmed sent messages', () => {
    const sent: Message = { ...baseMessage, direction: 'sent', sender: 'You', status: 'confirmed' }
    const { container } = render(<MessageCard message={sent} onReact={vi.fn()} isLast={false} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('shows AlertCircle for failed messages', () => {
    const failed: Message = { ...baseMessage, direction: 'sent', sender: 'You', status: 'failed' }
    const { container } = render(<MessageCard message={failed} onReact={vi.fn()} isLast={false} />)
    expect(container.querySelector('.opacity-60')).toBeDefined()
  })

  it('renders reactions when present', () => {
    const withReaction: Message = {
      ...baseMessage,
      reactions: [{ emoji: '👍', count: 2, users: ['alice', 'bob'] }],
    }
    render(<MessageCard message={withReaction} onReact={vi.fn()} isLast={false} />)
    expect(screen.getByText('👍')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('shows ephemeral reveal button when message is ephemeral and not revealed', () => {
    const ephemeral: Message = { ...baseMessage, isEphemeral: true }
    render(<MessageCard message={ephemeral} onReact={vi.fn()} isLast={false} />)
    expect(screen.getByText(/Click to reveal/)).toBeDefined()
  })
})
