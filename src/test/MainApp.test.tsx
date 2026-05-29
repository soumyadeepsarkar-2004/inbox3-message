import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MainApp from '../pages/MainApp'

const mockSetSelectedContactId = vi.fn()
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({ selectedContactId: null, setSelectedContactId: mockSetSelectedContactId }),
}))

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({ connected: false, address: null, signAndSubmit: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), walletName: null }),
  Inbox3WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { name: 'TestUser', email: 'test@test.com', walletAddress: '0xtest123' },
    logout: vi.fn(),
  }),
}))

vi.mock('../hooks/useContactManager', () => ({
  useContactManager: () => ({
    contacts: [],
    addContact: vi.fn(),
    searchContacts: vi.fn().mockReturnValue([]),
    markRead: vi.fn(),
    updateContact: vi.fn(),
    removeContact: vi.fn(),
    getContactByAddress: vi.fn(),
  }),
  isValidAddress: (addr: string) => /^0x[a-fA-F0-9]{1,64}$/.test(addr),
}))

vi.mock('../lib/crypto', () => ({
  EncryptionManager: vi.fn().mockImplementation(() => ({
    loadKeys: () => false,
    generateKeys: () => ({ publicKey: 'pk', secretKey: 'sk' }),
    getPublicKey: () => 'pk',
    encrypt: () => 'encrypted',
    decrypt: () => 'decrypted',
    decryptHybrid: () => 'decrypted',
    encryptHybrid: () => 'encrypted',
    hasRatchet: () => false,
    initRatchet: vi.fn(),
    clearKeys: vi.fn(),
  })),
  encryptionManager: {
    loadKeys: () => false,
    generateKeys: () => ({ publicKey: 'pk', secretKey: 'sk' }),
    getPublicKey: () => 'pk',
    encrypt: () => 'encrypted',
    decrypt: () => 'decrypted',
    decryptHybrid: () => 'decrypted',
    encryptHybrid: () => 'encrypted',
    hasRatchet: () => false,
    initRatchet: vi.fn(),
    clearKeys: vi.fn(),
  },
}))

vi.mock('../hooks/useInbox3', () => ({
  useInbox3: () => ({
    sendMessage: vi.fn(),
    fetchMessages: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('../hooks/useIrysStorage', () => ({
  useIrysStorage: () => ({
    uploadPayload: vi.fn(),
    ephemeralMode: false,
    setEphemeralMode: vi.fn(),
  }),
}))

vi.mock('../hooks/useANS', () => ({
  useANS: () => ({
    resolving: false,
    resolveName: vi.fn(),
    reverseResolve: vi.fn(),
  }),
}))

describe('MainApp', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the Inbox3 brand', async () => {
    render(
      <MemoryRouter>
        <MainApp />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Inbox3')).toBeDefined()
    })
  })

  it('renders the new message button', async () => {
    render(
      <MemoryRouter>
        <MainApp />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('New Message')).toBeDefined()
    })
  })
})
