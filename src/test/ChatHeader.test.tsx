import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatHeader from '../components/chat/ChatHeader'
import type { Contact } from '../hooks/useContactManager'

const mockContact: Contact = {
  id: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Alice',
  avatar: 'AL',
  lastMessage: 'Hey there!',
  timestamp: '2m ago',
  unread: 0,
  online: true,
  addedAt: Date.now(),
}

describe('ChatHeader', () => {
  it('renders contact name and status', () => {
    render(<ChatHeader contact={mockContact} onBack={() => {}} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Online')).toBeDefined()
  })

  it('shows truncated address', () => {
    render(<ChatHeader contact={mockContact} onBack={() => {}} />)
    expect(screen.getByText(/0x1234/)).toBeDefined()
  })

  it('shows "Last seen recently" when offline', () => {
    const offlineContact = { ...mockContact, online: false }
    render(<ChatHeader contact={offlineContact} onBack={() => {}} />)
    expect(screen.getByText('Last seen recently')).toBeDefined()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<ChatHeader contact={mockContact} onBack={onBack} />)
    fireEvent.click(screen.getByTestId('back-button'))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows ANS badge for .apt names', () => {
    const ansContact = { ...mockContact, name: 'alice.apt' }
    render(<ChatHeader contact={ansContact} onBack={() => {}} />)
    expect(screen.getByText('ANS')).toBeDefined()
  })
})
