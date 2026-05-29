import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useStakedMessaging', () => {
  beforeEach(() => localStorage.clear())

  it('initializes with default config', async () => {
    const { useStakedMessaging } = await import('../hooks/useStakedMessaging')
    const { result } = renderHook(() => useStakedMessaging())
    expect(result.current.config.enabled).toBe(false)
    expect(result.current.config.minStake).toBe(0.01)
    expect(result.current.config.x402Enabled).toBe(false)
    expect(result.current.config.x402Currency).toBe('USDC')
  })

  it('updates config', async () => {
    const { useStakedMessaging } = await import('../hooks/useStakedMessaging')
    const { result } = renderHook(() => useStakedMessaging())
    act(() => result.current.updateConfig({ enabled: true, x402Enabled: true }))
    expect(result.current.config.enabled).toBe(true)
    expect(result.current.config.x402Enabled).toBe(true)
  })

  it('generates session keys', async () => {
    const { useStakedMessaging } = await import('../hooks/useStakedMessaging')
    const { result } = renderHook(() => useStakedMessaging())
    let key!: Awaited<ReturnType<typeof result.current.generateSessionKey>>
    await act(async () => { key = await result.current.generateSessionKey('test-key') })
    expect(key).not.toBeNull()
    expect(key!.label).toBe('test-key')
    expect(key!.publicKey).toBeDefined()
    expect(key!.createdAt).toBeDefined()
  })

  it('revokes session keys', async () => {
    const { useStakedMessaging } = await import('../hooks/useStakedMessaging')
    const { result } = renderHook(() => useStakedMessaging())
    await act(async () => { await result.current.generateSessionKey('revoke-me') })
    expect(result.current.sessionKeys.length).toBe(1)
    act(() => result.current.revokeSessionKey(result.current.sessionKeys[0].publicKey))
    expect(result.current.sessionKeys.length).toBe(0)
  })

  it('returns existing x402 receipts', async () => {
    const { useStakedMessaging } = await import('../hooks/useStakedMessaging')
    const { result } = renderHook(() => useStakedMessaging())
    let receipt!: Awaited<ReturnType<typeof result.current.processX402Payment>>
    await act(async () => { receipt = await result.current.processX402Payment('msg-1', '0xrecipient') })
    expect(receipt).not.toBeNull()
    expect(receipt!.amount).toBe('0.01')
    expect(result.current.getX402Receipts().length).toBe(1)
  })
})

describe('useANS', () => {
  beforeEach(() => localStorage.clear())

  it('returns resolving state', async () => {
    const { useANS } = await import('../hooks/useANS')
    const { result } = renderHook(() => useANS())
    expect(result.current.resolving).toBe(false)
  })

  it('handles failed resolution gracefully', async () => {
    const { useANS } = await import('../hooks/useANS')
    const { result } = renderHook(() => useANS())
    let res!: Awaited<ReturnType<typeof result.current.resolveName>>
    await act(async () => { res = await result.current.resolveName('nonexistent.apt') })
    expect(res.error).toBe('Could not resolve .apt name')
    expect(res.address).toBeNull()
  })

  it('reverse resolves addresses', async () => {
    const { useANS } = await import('../hooks/useANS')
    const { result } = renderHook(() => useANS())
    let res!: Awaited<ReturnType<typeof result.current.reverseResolve>>
    await act(async () => { res = await result.current.reverseResolve('0x1234') })
    expect(res.address).toBe('0x1234')
  })
})
