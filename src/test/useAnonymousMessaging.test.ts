import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useAnonymousMessaging', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with anonymous disabled', async () => {
    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())
    expect(result.current.anonymousEnabled).toBe(false)
    expect(result.current.epochalKeys).toEqual([])
  })

  it('toggles anonymous mode', async () => {
    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())

    act(() => {
      result.current.toggleAnonymous()
    })

    expect(result.current.anonymousEnabled).toBe(true)

    act(() => {
      result.current.toggleAnonymous()
    })

    expect(result.current.anonymousEnabled).toBe(false)
  })

  it('generates an epochal key', async () => {
    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())

    let key!: Awaited<ReturnType<typeof result.current.generateEpochalKey>>
    await act(async () => {
      key = await result.current.generateEpochalKey()
    })

    expect(key).not.toBeNull()
    expect(key!.publicKey).toBeDefined()
    expect(key!.secretKey).toBeDefined()
    expect(key!.commitment).toBeDefined()
    expect(key!.createdAt).toBeDefined()
    expect(result.current.epochalKeys).toHaveLength(1)
  })

  it('limits epochal keys to 10', async () => {
    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())

    for (let i = 0; i < 12; i++) {
      await act(async () => {
        await result.current.generateEpochalKey()
      })
    }

    expect(result.current.epochalKeys).toHaveLength(10)
  })

  it('persists epochal keys to localStorage', async () => {
    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())

    await act(async () => {
      await result.current.generateEpochalKey()
    })

    const saved = JSON.parse(localStorage.getItem('inbox3_epochal_keys') || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].publicKey).toBeDefined()
  })

  it('loads persisted keys on init', async () => {
    const existing = [{
      publicKey: 'persisted-pub',
      secretKey: 'persisted-sec',
      createdAt: Date.now(),
      commitment: 'test-commitment',
    }]
    localStorage.setItem('inbox3_epochal_keys', JSON.stringify(existing))

    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())

    expect(result.current.epochalKeys).toHaveLength(1)
    expect(result.current.epochalKeys[0].publicKey).toBe('persisted-pub')
  })

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem('inbox3_epochal_keys', '{corrupted')

    const { useAnonymousMessaging } = await import('../hooks/useAnonymousMessaging')
    const { result } = renderHook(() => useAnonymousMessaging())
    expect(result.current.epochalKeys).toEqual([])
  })
})
