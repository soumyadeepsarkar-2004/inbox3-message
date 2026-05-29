import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

describe('cn', () => {
  it('merges class names', async () => {
    const { cn } = await import('../lib/utils')
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('handles empty inputs', async () => {
    const { cn } = await import('../lib/utils')
    expect(cn()).toBe('')
    expect(cn('', null, undefined, false)).toBe('')
  })
})

describe('formatAddress', () => {
  it('formats aptos addresses', async () => {
    const { formatAddress } = await import('../lib/utils')
    const result = formatAddress('0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890')
    expect(result).toBe('0x1a2b...7890')
  })

  it('handles short addresses', async () => {
    const { formatAddress } = await import('../lib/utils')
    const result = formatAddress('0x1234')
    expect(result).toMatch(/\.\.\./)
  })
})

describe('formatTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" for recent timestamps', async () => {
    const { formatTimestamp } = await import('../lib/utils')
    const now = Math.floor(Date.now() / 1000)
    expect(formatTimestamp(now)).toBe('Just now')
    expect(formatTimestamp(now - 30)).toBe('Just now')
  })

  it('returns minutes ago', async () => {
    const { formatTimestamp } = await import('../lib/utils')
    expect(formatTimestamp(Math.floor((Date.now() - 300000) / 1000))).toBe('5m ago')
  })

  it('returns hours ago', async () => {
    const { formatTimestamp } = await import('../lib/utils')
    expect(formatTimestamp(Math.floor((Date.now() - 7200000) / 1000))).toBe('2h ago')
  })

  it('returns days ago', async () => {
    const { formatTimestamp } = await import('../lib/utils')
    expect(formatTimestamp(Math.floor((Date.now() - 172800000) / 1000))).toBe('2d ago')
  })

  it('returns date for older timestamps', async () => {
    const { formatTimestamp } = await import('../lib/utils')
    const oldDate = new Date('2026-01-01T00:00:00Z').getTime() / 1000
    const result = formatTimestamp(oldDate)
    expect(result).toContain('1/1/2026')
  })
})
