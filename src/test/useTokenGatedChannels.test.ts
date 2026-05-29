import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const CHANNELS_KEY = 'inbox3_channels'

describe('useTokenGatedChannels', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array initially', async () => {
    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())
    expect(result.current.channels).toEqual([])
  })

  it('creates a new channel', async () => {
    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())

    act(() => {
      result.current.createChannel({
        name: 'Test Channel',
        description: 'A test channel',
        createdBy: '0xuser',
      })
    })

    expect(result.current.channels).toHaveLength(1)
    expect(result.current.channels[0].name).toBe('Test Channel')
    expect(result.current.channels[0].memberCount).toBe(1)
    expect(result.current.channels[0].id).toBeDefined()
  })

  it('removes a channel by id', async () => {
    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())

    let channel: ReturnType<typeof result.current.createChannel>
    act(() => {
      channel = result.current.createChannel({
        name: 'To Remove',
        description: 'Will be removed',
        createdBy: '0xuser',
      })
    })

    expect(result.current.channels).toHaveLength(1)

    act(() => {
      result.current.removeChannel(channel.id)
    })

    expect(result.current.channels).toHaveLength(0)
  })

  it('loads channels from localStorage on init', async () => {
    const existing = [{
      id: 'existing-1',
      name: 'Existing',
      description: 'Pre-existing channel',
      memberCount: 3,
      createdAt: Date.now(),
      createdBy: '0xuser',
    }]
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(existing))

    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())
    expect(result.current.channels).toHaveLength(1)
    expect(result.current.channels[0].name).toBe('Existing')
  })

  it('persists channels to localStorage after creation', async () => {
    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())

    act(() => {
      result.current.createChannel({
        name: 'Persist Test',
        description: 'Testing persistence',
        createdBy: '0xuser',
      })
    })

    const saved = JSON.parse(localStorage.getItem(CHANNELS_KEY) || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Persist Test')
  })

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem(CHANNELS_KEY, '{invalid json')

    const { useTokenGatedChannels } = await import('../hooks/useTokenGatedChannels')
    const { result } = renderHook(() => useTokenGatedChannels())
    expect(result.current.channels).toEqual([])
  })
})
