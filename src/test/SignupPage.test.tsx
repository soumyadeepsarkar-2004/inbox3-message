import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from '../pages/SignupPage'

const mockSignupWithEmail = vi.fn()
const mockConnectWithGoogle = vi.fn()
const mockConnectWithGithub = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signupWithEmail: mockSignupWithEmail,
    connectWithGoogle: mockConnectWithGoogle,
    connectWithGithub: mockConnectWithGithub,
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

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Create New Profile')).toBeDefined()
  })

  it('renders all form fields', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('First name')).toBeDefined()
    expect(screen.getByPlaceholderText('Last name')).toBeDefined()
    expect(screen.getByPlaceholderText('Email')).toBeDefined()
    expect(screen.getByPlaceholderText('Password')).toBeDefined()
  })

  it('renders social signup buttons', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Google')).toBeDefined()
    expect(screen.getByText('Github')).toBeDefined()
  })

  it('shows validation errors on empty submit', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Create Account'))
    expect(screen.getByText('First name is required')).toBeDefined()
    expect(screen.getByText('Last name is required')).toBeDefined()
    expect(screen.getByText('Email is required')).toBeDefined()
  })

  it('shows invalid email error', () => {
    const { container } = render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(screen.getByText('Invalid email format')).toBeDefined()
  })

  it('calls signupWithEmail on valid submission', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Create Account'))
    expect(mockSignupWithEmail).toHaveBeenCalledWith('john@test.com', 'password123', 'John Doe')
  })

  it('shows password hint text', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Requires at least 8 symbols.')).toBeDefined()
  })

  it('renders login link', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Log in')).toBeDefined()
  })
})
