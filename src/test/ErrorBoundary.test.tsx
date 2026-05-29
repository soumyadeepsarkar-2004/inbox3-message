import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error')
  return <div>OK</div>
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><div>Hello</div></ErrorBoundary>)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders fallback on error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Refresh Page')).toBeDefined()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom Error UI')).toBeDefined()
  })

  it('calls onError handler when provided', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.anything())
  })
})
