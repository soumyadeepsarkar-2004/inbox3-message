import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('useIndexerMessages', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty messages when not enabled', async () => {
    const { useIndexerMessages } = await import('../hooks/useIndexerMessages')
    const { result } = renderHook(() =>
      useIndexerMessages({ address: '0x123', enabled: false })
    )
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('fetches and parses messages from indexer', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user_events: [
            {
              indexed_type: 'inbox3_addr::inbox3::MessageSentEvent',
              account_address: '0xcontract',
              creation_number: 1,
              sequence_number: 1,
              block_height: 100,
              transaction_version: 500,
              data: {
                sender: '0xsender',
                recipient: '0xrecipient',
                message_hash: 'hash123',
                timestamp: '1700000000',
              },
            },
          ],
        },
      }),
    })

    const { useIndexerMessages } = await import('../hooks/useIndexerMessages')
    const { result } = renderHook(() =>
      useIndexerMessages({ address: '0xsender' })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].sender).toBe('0xsender')
    expect(result.current.messages[0].recipient).toBe('0xrecipient')
    expect(result.current.messages[0].message_hash).toBe('hash123')
    expect(result.current.messages[0].transaction_version).toBe(500)
  })

  it('sets error on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { useIndexerMessages } = await import('../hooks/useIndexerMessages')
    const { result } = renderHook(() =>
      useIndexerMessages({ address: '0x123' })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(result.current.messages).toEqual([])
  })

  it('returns empty for empty response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { user_events: [] } }),
    })

    const { useIndexerMessages } = await import('../hooks/useIndexerMessages')
    const { result } = renderHook(() =>
      useIndexerMessages({ address: '0x123' })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.messages).toEqual([])
  })

  it('refetch works and returns new data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { user_events: [] } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user_events: [
            {
              indexed_type: 'inbox3_addr::inbox3::MessageSentEvent',
              account_address: '0xcontract',
              creation_number: 1,
              sequence_number: 2,
              block_height: 101,
              transaction_version: 501,
              data: {
                sender: '0xsender',
                recipient: '0xrecipient',
                message_hash: 'hash456',
                timestamp: '1700000001',
              },
            },
          ],
        },
      }),
    })

    const { useIndexerMessages } = await import('../hooks/useIndexerMessages')
    const { result } = renderHook(() =>
      useIndexerMessages({ address: '0xsender' })
    )

    await waitFor(() => expect(result.current.messages).toHaveLength(0))

    await act(async () => {
      await result.current.refetch()
    })
    await waitFor(() => expect(result.current.messages).toHaveLength(1))
    expect(result.current.messages[0].message_hash).toBe('hash456')
  })
})
