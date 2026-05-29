import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContactList from '../components/chat/ContactList'

vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({ selectedContactId: null }),
}))

const mockContacts = [
  {
    id: '1',
    name: 'Alice',
    address: '0x123',
    avatar: 'A',
    lastMessage: 'Hey there!',
    timestamp: '2:30 PM',
    unread: 2,
    online: true,
    addedAt: Date.now(),
  },
  {
    id: '2',
    name: 'Bob.apt',
    address: '0x456',
    avatar: 'B',
    lastMessage: 'See you later',
    timestamp: '1:00 PM',
    unread: 0,
    online: false,
    addedAt: Date.now(),
  },
]

describe('ContactList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders contact names', () => {
    render(<ContactList contacts={mockContacts} onSelect={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob.apt')).toBeDefined()
  })

  it('shows ANS badge for .apt names', () => {
    render(<ContactList contacts={mockContacts} onSelect={vi.fn()} />)
    expect(screen.getByText('ANS')).toBeDefined()
  })

  it('shows last message preview', () => {
    render(<ContactList contacts={mockContacts} onSelect={vi.fn()} />)
    expect(screen.getByText('Hey there!')).toBeDefined()
    expect(screen.getByText('See you later')).toBeDefined()
  })

  it('shows unread badge', () => {
    render(<ContactList contacts={mockContacts} onSelect={vi.fn()} />)
    expect(screen.getByText('2')).toBeDefined()
  })

  it('calls onSelect when contact clicked', () => {
    const onSelect = vi.fn()
    render(<ContactList contacts={mockContacts} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Alice'))
    expect(onSelect).toHaveBeenCalledWith(mockContacts[0])
  })

  it('shows empty state when no contacts', () => {
    render(<ContactList contacts={[]} onSelect={vi.fn()} />)
    expect(screen.getByText('No conversations found')).toBeDefined()
  })
})
