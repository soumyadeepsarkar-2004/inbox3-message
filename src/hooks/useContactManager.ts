import { useState, useCallback, useEffect } from 'react'

export interface Contact {
  id: string
  address: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  addedAt: number
  publicKey?: string
}

const STORAGE_KEY = 'inbox3_contacts'

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveContacts(contacts: Contact[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch {
    // Storage not available
  }
}

function generateAvatar(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function useContactManager() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts)

  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])

  const addContact = useCallback((address: string, name?: string) => {
    if (!address) return null
    const exists = contacts.find(c => c.address.toLowerCase() === address.toLowerCase())
    if (exists) return exists

    const displayName = name || shortAddress(address)
    const contact: Contact = {
      id: crypto.randomUUID(),
      address,
      name: displayName,
      avatar: generateAvatar(displayName),
      lastMessage: '',
      timestamp: '',
      unread: 0,
      online: false,
      addedAt: Date.now(),
    }
    setContacts(prev => [contact, ...prev])
    return contact
  }, [contacts])

  const removeContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const getContactByAddress = useCallback((address: string) => {
    return contacts.find(c => c.address.toLowerCase() === address.toLowerCase()) || null
  }, [contacts])

  const searchContacts = useCallback((query: string) => {
    if (!query.trim()) return contacts
    const q = query.toLowerCase()
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    )
  }, [contacts])

  const markRead = useCallback((id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }, [])

  return {
    contacts,
    addContact,
    removeContact,
    updateContact,
    getContactByAddress,
    searchContacts,
    markRead,
  }
}

export function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{1,64}$/.test(addr)
}
