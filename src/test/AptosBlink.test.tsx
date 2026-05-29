import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AptosBlink from '../components/AptosBlink'

vi.mock('../context/WalletProvider', () => ({
  useWallet: () => ({ connected: true, signAndSubmit: vi.fn() }),
}))

const mockActions = [
  { id: 'action1', label: 'Execute', type: 'transaction' as const, payload: {} },
]

describe('AptosBlink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and description', () => {
    render(
      <AptosBlink
        title="Test Blink"
        description="A test blink description"
        source="Inbox3"
        actions={mockActions}
        onExecute={vi.fn()}
      />
    )
    expect(screen.getByText('Test Blink')).toBeDefined()
    expect(screen.getByText('A test blink description')).toBeDefined()
  })

  it('renders source label', () => {
    render(
      <AptosBlink
        title="Test"
        description="Test"
        source="Thala"
        actions={mockActions}
        onExecute={vi.fn()}
      />
    )
    expect(screen.getByText('Thala')).toBeDefined()
  })

  it('renders action buttons', () => {
    render(
      <AptosBlink
        title="Test"
        description="Test"
        source="Inbox3"
        actions={mockActions}
        onExecute={vi.fn()}
      />
    )
    expect(screen.getByText('Execute')).toBeDefined()
  })

  it('renders image when provided', () => {
    render(
      <AptosBlink
        title="Test"
        description="Test"
        source="Inbox3"
        actions={mockActions}
        image="https://example.com/img.png"
        onExecute={vi.fn()}
      />
    )
    const img = screen.getByAltText('Test') as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('example.com')
  })

  it('calls onExecute when action button clicked', async () => {
    const onExecute = vi.fn().mockResolvedValue(true)
    render(
      <AptosBlink
        title="Test"
        description="Test"
        source="Inbox3"
        actions={mockActions}
        onExecute={onExecute}
      />
    )
    await act(async () => {
      fireEvent.click(screen.getByText('Execute'))
    })
    expect(onExecute).toHaveBeenCalledWith(mockActions[0])
  })
})
