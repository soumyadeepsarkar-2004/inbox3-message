import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WalletConnectPage from '../pages/WalletConnectPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    connectWallet: vi.fn(),
    loading: false,
  }),
}))

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({
    connected: false,
    address: null,
    connect: vi.fn(),
    signAndSubmit: vi.fn(),
  }),
}))

vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  aptosStandardSupportedWalletList: [
    { name: 'Petra', readyState: 'Installed' },
    { name: 'Martian', readyState: 'NotDetected' },
  ],
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('WalletConnectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title', () => {
    render(
      <MemoryRouter>
        <WalletConnectPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Select Wallet')).toBeDefined()
  })

  it('renders wallet options', () => {
    render(
      <MemoryRouter>
        <WalletConnectPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Petra')).toBeDefined()
    expect(screen.getByText('Martian')).toBeDefined()
  })

  it('shows connect hint for installed wallets', () => {
    render(
      <MemoryRouter>
        <WalletConnectPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Click to connect')).toBeDefined()
  })

  it('shows install hint for non-installed wallets', () => {
    render(
      <MemoryRouter>
        <WalletConnectPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Installation required')).toBeDefined()
  })
})
