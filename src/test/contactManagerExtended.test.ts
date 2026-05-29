import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useContactManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds and retrieves contacts', async () => {
    const { useContactManager, isValidAddress } = await import('../hooks/useContactManager')

    expect(isValidAddress('0x1234567890abcdef')).toBe(true)
    expect(isValidAddress('0xGGGGGG')).toBe(false)
    expect(isValidAddress('0x')).toBe(false)

    const { result } = renderHook(() => useContactManager())
    act(() => result.current.addContact('0x1234567890abcdef1234567890abcdef12345678', 'Alice'))
    const found = result.current.getContactByAddress('0x1234567890abcdef1234567890abcdef12345678')
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Alice')
  })

  it('prevents duplicate contacts', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    act(() => result.current.addContact('0xaaaa', 'Alice'))
    act(() => result.current.addContact('0xaaaa', 'Alice Again'))
    act(() => result.current.addContact('0xaaaa', 'Still Duplicate'))
    const aliceContacts = result.current.contacts.filter(c => c.address === '0xaaaa')
    expect(aliceContacts.length).toBe(1)
  })

  it('generates avatar from name', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    act(() => result.current.addContact('0xbbbb', 'Bob'))
    const bob = result.current.getContactByAddress('0xbbbb')
    expect(bob!.avatar).toBe('BO')
  })

  it('removes contacts', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    act(() => { result.current.addContact('0xcccc', 'Charlie') })
    expect(result.current.contacts.length).toBe(1)
    act(() => result.current.removeContact(result.current.contacts[0].id))
    expect(result.current.contacts.length).toBe(0)
  })

  it('updates contacts', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    let contact: NonNullable<ReturnType<typeof result.current.addContact>>
    act(() => { contact = result.current.addContact('0xdddd', 'Diana')! })
    act(() => result.current.updateContact(contact.id, { name: 'Diana Updated', publicKey: 'pk123' }))
    const updated = result.current.getContactByAddress('0xdddd')
    expect(updated!.name).toBe('Diana Updated')
    expect(updated!.publicKey).toBe('pk123')
  })

  it('searches contacts by name', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    act(() => result.current.addContact('0x1111', 'Alice'))
    act(() => result.current.addContact('0x2222', 'Bob'))
    act(() => result.current.addContact('0x3333', 'Charlie'))
    const results = result.current.searchContacts('ali')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Alice')
  })

  it('searches contacts by address', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    act(() => result.current.addContact('0xabcdef1234567890abcdef1234567890abcdef12', 'Test'))
    const results = result.current.searchContacts('abcd')
    expect(results.length).toBe(1)
  })

  it('marks contacts as read', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    let contact: NonNullable<ReturnType<typeof result.current.addContact>>
    act(() => { contact = result.current.addContact('0xeeee', 'Eve')! })
    act(() => result.current.markRead(contact.id))
    expect(result.current.getContactByAddress('0xeeee')!.unread).toBe(0)
  })

  it('returns empty array for empty queries', async () => {
    const { useContactManager } = await import('../hooks/useContactManager')
    const { result } = renderHook(() => useContactManager())
    expect(result.current.searchContacts('').length).toBe(0)
  })
})
