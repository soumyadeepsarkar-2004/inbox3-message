import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useKeylessAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restoreSession returns null when no account stored', async () => {
    const { useKeylessAuth } = await import('../hooks/useKeylessAuth')
    const { result } = renderHook(() => useKeylessAuth())
    expect(result.current.restoreSession()).toBeNull()
  })

  it('restoreSession returns stored account', async () => {
    const account = {
      address: '0x123',
      publicKey: 'pubkey',
      jwt: '',
      expiresAt: Date.now() + 3600000,
    }
    localStorage.setItem('inbox3_keyless_account', JSON.stringify(account))

    const { useKeylessAuth } = await import('../hooks/useKeylessAuth')
    const { result } = renderHook(() => useKeylessAuth())
    const restored = result.current.restoreSession()
    expect(restored).not.toBeNull()
    expect(restored!.address).toBe('0x123')
    expect(restored!.publicKey).toBe('pubkey')
  })

  it('restoreSession returns null for expired accounts', async () => {
    const account = {
      address: '0x123',
      publicKey: 'pubkey',
      jwt: '',
      expiresAt: Date.now() - 1000,
    }
    localStorage.setItem('inbox3_keyless_account', JSON.stringify(account))

    const { useKeylessAuth } = await import('../hooks/useKeylessAuth')
    const { result } = renderHook(() => useKeylessAuth())
    expect(result.current.restoreSession()).toBeNull()
    expect(localStorage.getItem('inbox3_keyless_account')).toBeNull()
  })

  it('signOut removes account from localStorage', async () => {
    const account = {
      address: '0x123',
      publicKey: 'pubkey',
      jwt: '',
      expiresAt: Date.now() + 3600000,
    }
    localStorage.setItem('inbox3_keyless_account', JSON.stringify(account))

    const { useKeylessAuth } = await import('../hooks/useKeylessAuth')
    const { result } = renderHook(() => useKeylessAuth())
    act(() => {
      result.current.signOut()
    })
    expect(localStorage.getItem('inbox3_keyless_account')).toBeNull()
  })

  it('handles corrupted localStorage', async () => {
    localStorage.setItem('inbox3_keyless_account', '{corrupted')

    const { useKeylessAuth } = await import('../hooks/useKeylessAuth')
    const { result } = renderHook(() => useKeylessAuth())
    expect(result.current.restoreSession()).toBeNull()
  })
})
