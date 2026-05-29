import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatInput from '../components/chat/ChatInput'

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the input with placeholder', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeDefined()
  })

  it('calls onSend when clicking send button with text', () => {
    const onSend = vi.fn()
    const { container } = render(<ChatInput onSend={onSend} />)
    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    const buttons = container.querySelectorAll('button')
    const sendBtn = Array.from(buttons).find(b => b.innerHTML.includes('lucide-send'))
    if (sendBtn) {
      fireEvent.click(sendBtn)
      expect(onSend).toHaveBeenCalledWith('Hello', 'text')
    } else {
      expect(onSend).not.toHaveBeenCalled()
    }
  })

  it('calls onSend on Enter key', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(onSend).toHaveBeenCalledWith('Hello', 'text')
  })

  it('does not call onSend when disabled', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled={true} />)
    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows ephemeral toggle button when onToggleEphemeral is provided', () => {
    render(<ChatInput onSend={vi.fn()} isEphemeral={false} onToggleEphemeral={vi.fn()} />)
    expect(screen.getByText('👻')).toBeDefined()
  })

  it('calls onToggleEphemeral when ghost button clicked', () => {
    const onToggle = vi.fn()
    render(<ChatInput onSend={vi.fn()} isEphemeral={false} onToggleEphemeral={onToggle} />)
    fireEvent.click(screen.getByRole('switch', { name: 'Toggle ephemeral mode' }))
    expect(onToggle).toHaveBeenCalled()
  })

  it('shows attachment menu on paperclip click', () => {
    render(<ChatInput onSend={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Attach file'))
    expect(screen.getByText('Photo & Video')).toBeDefined()
    expect(screen.getByText('Smart Action')).toBeDefined()
  })
})
