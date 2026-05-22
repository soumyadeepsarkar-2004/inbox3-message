import { describe, it, expect } from 'vitest'
import { isValidAddress } from '../hooks/useContactManager'

describe('isValidAddress', () => {
  it('validates correct aptos addresses', () => {
    expect(isValidAddress('0x1a2b3c4d')).toBe(true)
    expect(isValidAddress('0x' + 'a'.repeat(64))).toBe(true)
    expect(isValidAddress('0x1234567890abcdef')).toBe(true)
  })

  it('rejects invalid addresses', () => {
    expect(isValidAddress('')).toBe(false)
    expect(isValidAddress('1a2b3c4d')).toBe(false)
    expect(isValidAddress('0x')).toBe(false)
    expect(isValidAddress('0xGHIJKL')).toBe(false)
    expect(isValidAddress('not-an-address')).toBe(false)
  })
})
