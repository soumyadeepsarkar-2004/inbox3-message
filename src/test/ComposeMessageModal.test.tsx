import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComposeMessageModal from '../components/chat/ComposeMessageModal'

describe('ComposeMessageModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <ComposeMessageModal open={false} onClose={() => {}} onSend={() => {}} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders form fields when open', () => {
    render(
      <ComposeMessageModal open={true} onClose={() => {}} onSend={() => {}} />
    )
    expect(screen.getByPlaceholderText('0x1a2b...3c4d')).toBeDefined()
    expect(screen.getByPlaceholderText('Alice')).toBeDefined()
    expect(screen.getByPlaceholderText('Type your encrypted message...')).toBeDefined()
  })

  it('shows error for invalid address on submit', () => {
    render(
      <ComposeMessageModal open={true} onClose={() => {}} onSend={() => {}} />
    )
    fireEvent.click(screen.getByText('Send Encrypted Message'))
    expect(screen.getByText('Wallet address is required')).toBeDefined()
  })

  it('shows error for invalid address format', () => {
    render(
      <ComposeMessageModal open={true} onClose={() => {}} onSend={() => {}} />
    )
    fireEvent.change(screen.getByPlaceholderText('0x1a2b...3c4d'), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByPlaceholderText('Type your encrypted message...'), { target: { value: 'hello' } })
    fireEvent.click(screen.getByText('Send Encrypted Message'))
    expect(screen.getByText(/Invalid Aptos wallet address/)).toBeDefined()
  })

  it('calls onSend with correct data on valid submit', () => {
    const onSend = vi.fn()
    render(
      <ComposeMessageModal open={true} onClose={() => {}} onSend={onSend} />
    )
    fireEvent.change(screen.getByPlaceholderText('0x1a2b...3c4d'), { target: { value: '0x1234567890abcdef' } })
    fireEvent.change(screen.getByPlaceholderText('Alice'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText('Type your encrypted message...'), { target: { value: 'Hello!' } })
    fireEvent.click(screen.getByText('Send Encrypted Message'))
    expect(onSend).toHaveBeenCalledWith('0x1234567890abcdef', 'Alice', 'Hello!', undefined)
  })
})
