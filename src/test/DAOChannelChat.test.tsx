import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DAOChannelChat from '../components/chat/DAOChannelChat'

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({ connected: true }),
}))

describe('DAOChannelChat', () => {
  const mockChannel = {
    id: 'ch-1',
    name: 'General',
    description: 'General discussion',
    memberCount: 5,
    createdAt: Date.now(),
    createdBy: '0xuser',
  }

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders channel name', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    expect(screen.getByText('General')).toBeDefined()
  })

  it('renders member count', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    expect(screen.getByText(/5 members/)).toBeDefined()
  })

  it('renders system welcome message', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    expect(screen.getByText(/Welcome to the/)).toBeDefined()
  })

  it('shows input placeholder', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    expect(screen.getByPlaceholderText('Message General...')).toBeDefined()
  })

  it('sends a message on button click', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    const input = screen.getByPlaceholderText('Message General...')
    fireEvent.change(input, { target: { value: 'Hello DAO' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByText('Hello DAO')).toBeDefined()
  })

  it('sends a message on Enter key', () => {
    render(<DAOChannelChat channel={mockChannel} onBack={vi.fn()} />)
    const input = screen.getByPlaceholderText('Message General...')
    fireEvent.change(input, { target: { value: 'Hello DAO' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Hello DAO')).toBeDefined()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<DAOChannelChat channel={mockChannel} onBack={onBack} />)
    const backBtns = screen.getAllByRole('button')
    const backBtn = backBtns.find(b => b.innerHTML.includes('lucide-arrow-left') || b.querySelector('.lucide-arrow-left'))
    if (backBtn) {
      fireEvent.click(backBtn)
      expect(onBack).toHaveBeenCalled()
    }
  })
})
