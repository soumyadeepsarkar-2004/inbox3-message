import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GithubCallbackPage from '../pages/GithubCallbackPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('GithubCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    // Default: no code in URL
    window.history.pushState({}, '', '/auth/github/callback')
  })

  it('shows processing state initially', () => {
    render(<GithubCallbackPage />)
    expect(screen.getByText('Authenticating')).toBeDefined()
  })

  it('shows error when no code is present', async () => {
    vi.useFakeTimers()
    render(<GithubCallbackPage />)
    expect(screen.getByText('No authorization code received. Redirecting...')).toBeDefined()
    vi.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/signup')
    vi.useRealTimers()
  })

  it('redirects on successful auth', async () => {
    window.history.pushState({}, '', '/auth/github/callback?code=abc123')
    sessionStorage.setItem('github_oauth_state', 'test_state')

    vi.useFakeTimers()
    render(<GithubCallbackPage />)
    expect(screen.getByText('GitHub authentication successful! Redirecting...')).toBeDefined()
    vi.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/profile')
    expect(sessionStorage.getItem('github_oauth_code')).toBe('abc123')
    vi.useRealTimers()
  })

  it('handles state mismatch', async () => {
    window.history.pushState({}, '', '/auth/github/callback?code=abc123&state=wrong_state')
    sessionStorage.setItem('github_oauth_state', 'expected_state')

    vi.useFakeTimers()
    render(<GithubCallbackPage />)
    expect(screen.getByText('State mismatch. Please try again.')).toBeDefined()
    vi.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/signup')
    vi.useRealTimers()
  })
})
