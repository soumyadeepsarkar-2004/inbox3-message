import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

const mockLoginWithEmail = vi.fn()
const mockConnectWithGoogle = vi.fn()
const mockConnectWithApple = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    loginWithEmail: mockLoginWithEmail,
    connectWithGoogle: mockConnectWithGoogle,
    connectWithApple: mockConnectWithApple,
    loading: false,
    initialized: true,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual as object,
    useNavigate: () => vi.fn(),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in heading', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeDefined()
  })

  it('renders email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('john@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined()
  })

  it('renders social login buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Google')).toBeDefined()
    expect(screen.getByText('Apple')).toBeDefined()
  })

  it('renders link to signup', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Create account')).toBeDefined()
  })

  it('calls loginWithEmail on form submission', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
    fireEvent.click(screen.getAllByText('Sign In')[1])
    expect(mockLoginWithEmail).toHaveBeenCalledWith('test@test.com', 'password123')
  })

  it('renders wallet tab with links', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Wallet Extension'))
    expect(screen.getByText('Connect Petra Extension')).toBeDefined()
    expect(screen.getByText('Passkey / Biometric Auth')).toBeDefined()
  })
})
