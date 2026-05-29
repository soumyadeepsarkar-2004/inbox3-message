import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    initialized: true,
    logout: vi.fn(),
  }),
}))

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({ connected: false, address: null, signAndSubmit: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), walletName: null }),
  Inbox3WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../pages/LandingPage', () => ({ default: () => <div>LandingPage</div> }))
vi.mock('../pages/SignupPage', () => ({ default: () => <div>SignupPage</div> }))
vi.mock('../pages/LoginPage', () => ({ default: () => <div>LoginPage</div> }))
vi.mock('../pages/WalletConnectPage', () => ({ default: () => <div>WalletConnectPage</div> }))
vi.mock('../pages/KeylessAuthPage', () => ({ default: () => <div>KeylessAuthPage</div> }))
vi.mock('../pages/ProfilePage', () => ({ default: () => <div>ProfilePage</div> }))
vi.mock('../pages/MainApp', () => ({ default: () => <div>MainApp</div> }))
vi.mock('../pages/GithubCallbackPage', () => ({ default: () => <div>GithubCallbackPage</div> }))
vi.mock('../pages/DocsPage', () => ({ default: () => <div>DocsPage</div> }))
vi.mock('../pages/PrivacyPage', () => ({ default: () => <div>PrivacyPage</div> }))
vi.mock('../pages/TermsPage', () => ({ default: () => <div>TermsPage</div> }))

describe('App', () => {
  it('renders LandingPage at root route', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText('LandingPage')).toBeDefined()
  })

  it('renders LoginPage at /login', () => {
    window.history.pushState({}, '', '/login')
    render(<App />)
    expect(screen.getByText('LoginPage')).toBeDefined()
  })

  it('renders SignupPage at /signup', () => {
    window.history.pushState({}, '', '/signup')
    render(<App />)
    expect(screen.getByText('SignupPage')).toBeDefined()
  })

  it('renders KeylessAuthPage at /keyless', () => {
    window.history.pushState({}, '', '/keyless')
    render(<App />)
    expect(screen.getByText('KeylessAuthPage')).toBeDefined()
  })

  it('renders WalletConnectPage at /wallet', () => {
    window.history.pushState({}, '', '/wallet')
    render(<App />)
    expect(screen.getByText('WalletConnectPage')).toBeDefined()
  })

  it('renders DocsPage at /docs', () => {
    window.history.pushState({}, '', '/docs')
    render(<App />)
    expect(screen.getByText('DocsPage')).toBeDefined()
  })

  it('renders PrivacyPage at /privacy', () => {
    window.history.pushState({}, '', '/privacy')
    render(<App />)
    expect(screen.getByText('PrivacyPage')).toBeDefined()
  })

  it('renders TermsPage at /terms', () => {
    window.history.pushState({}, '', '/terms')
    render(<App />)
    expect(screen.getByText('TermsPage')).toBeDefined()
  })
})
