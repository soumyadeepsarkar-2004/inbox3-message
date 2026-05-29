import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'TestUser', email: 'test@test.com', walletAddress: '0xtest123' },
    logout: vi.fn(),
    finalizeProfile: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

describe('ProfilePage', () => {
  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Finalize Your Profile')).toBeDefined()
  })

  it('renders the display name input with user name as placeholder', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('TestUser')).toBeDefined()
  })

  it('renders the complete setup button', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Complete Setup')).toBeDefined()
  })
})
