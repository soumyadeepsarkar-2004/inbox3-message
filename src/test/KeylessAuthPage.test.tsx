import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import KeylessAuthPage from '../pages/KeylessAuthPage'

const mockConnectWithGoogle = vi.fn()
const mockConnectWithApple = vi.fn()
const mockConnectWithPasskey = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    connectWithGoogle: mockConnectWithGoogle,
    connectWithApple: mockConnectWithApple,
    connectWithPasskey: mockConnectWithPasskey,
    loading: false,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual as object,
    useNavigate: () => vi.fn(),
  }
})

describe('KeylessAuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    render(
      <MemoryRouter>
        <KeylessAuthPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Keyless Sign In')).toBeDefined()
  })

  it('renders all auth buttons', () => {
    render(
      <MemoryRouter>
        <KeylessAuthPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Continue with Google')).toBeDefined()
    expect(screen.getByText('Continue with Apple')).toBeDefined()
    expect(screen.getByText('Create Passkey')).toBeDefined()
  })

  it('calls connectWithGoogle on Google button click', () => {
    mockConnectWithGoogle.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <KeylessAuthPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Continue with Google'))
    expect(mockConnectWithGoogle).toHaveBeenCalled()
  })

  it('calls connectWithApple on Apple button click', () => {
    mockConnectWithApple.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <KeylessAuthPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Continue with Apple'))
    expect(mockConnectWithApple).toHaveBeenCalled()
  })

  it('renders link to login', () => {
    render(
      <MemoryRouter>
        <KeylessAuthPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Sign in')).toBeDefined()
  })
})
