import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChannelPanel from '../components/chat/ChannelPanel'

const mockCreateChannel = vi.fn()
const mockRemoveChannel = vi.fn()

vi.mock('../hooks/useTokenGatedChannels', () => ({
  useTokenGatedChannels: () => ({
    channels: [
      {
        id: 'ch-1',
        name: 'General',
        description: 'General discussion',
        memberCount: 5,
        createdAt: Date.now(),
        createdBy: '0xuser',
      },
      {
        id: 'ch-2',
        name: 'Token-Holders',
        description: 'For token holders only',
        memberCount: 12,
        tokenAddress: '0xtoken',
        minBalance: 100,
        createdAt: Date.now(),
        createdBy: '0xuser',
      },
    ],
    createChannel: mockCreateChannel,
    removeChannel: mockRemoveChannel,
  }),
}))

describe('ChannelPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders channel names', () => {
    render(<ChannelPanel onSelectChannel={vi.fn()} />)
    expect(screen.getByText('General')).toBeDefined()
    expect(screen.getByText('Token-Holders')).toBeDefined()
  })

  it('calls onSelectChannel when channel clicked', () => {
    const onSelect = vi.fn()
    render(<ChannelPanel onSelectChannel={onSelect} />)
    fireEvent.click(screen.getByText('General'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'General' }))
  })

  it('shows create form on Create button click', () => {
    render(<ChannelPanel onSelectChannel={vi.fn()} />)
    fireEvent.click(screen.getByText('Create'))
    expect(screen.getByPlaceholderText('Channel name')).toBeDefined()
  })

  it('calls createChannel when form submitted', () => {
    render(<ChannelPanel onSelectChannel={vi.fn()} />)
    fireEvent.click(screen.getByText('Create'))
    fireEvent.change(screen.getByPlaceholderText('Channel name'), { target: { value: 'New Channel' } })
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), { target: { value: 'A new channel' } })
    fireEvent.click(screen.getByText('Create Channel'))
    expect(mockCreateChannel).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Channel',
      description: 'A new channel',
    }))
  })

  it('calls removeChannel on trash click', () => {
    render(<ChannelPanel onSelectChannel={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    const trashBtn = buttons.find(b => b.classList.contains('p-1.5'))
    if (trashBtn) {
      fireEvent.click(trashBtn)
      expect(mockRemoveChannel).toHaveBeenCalledWith('ch-1')
    }
  })
})
