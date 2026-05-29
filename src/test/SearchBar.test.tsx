import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar, FilterBar } from '../components/chat/SearchBar'

describe('SearchBar', () => {
  it('renders input with default placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search...')).toBeDefined()
  })

  it('renders custom placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Find contacts..." />)
    expect(screen.getByPlaceholderText('Find contacts...')).toBeDefined()
  })

  it('calls onChange on input change', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('shows clear button when value is present', () => {
    render(<SearchBar value="test" onChange={vi.fn()} />)
    const clearBtn = screen.getByText('×')
    expect(clearBtn).toBeDefined()
  })

  it('calls onChange with empty string on clear', () => {
    const onChange = vi.fn()
    render(<SearchBar value="test" onChange={onChange} />)
    fireEvent.click(screen.getByText('×'))
    expect(onChange).toHaveBeenCalledWith('')
  })
})

describe('FilterBar', () => {
  it('renders all filter buttons', () => {
    render(<FilterBar onFilter={vi.fn()} />)
    expect(screen.getByText('All')).toBeDefined()
    expect(screen.getByText('Unread')).toBeDefined()
    expect(screen.getByText('Starred')).toBeDefined()
    expect(screen.getByText('Groups')).toBeDefined()
  })

  it('highlights active filter as selected', () => {
    render(<FilterBar onFilter={vi.fn()} />)
    const allBtn = screen.getByText('All')
    expect(allBtn.className).toContain('bg-white')
  })

  it('calls onFilter when filter clicked', () => {
    const onFilter = vi.fn()
    render(<FilterBar onFilter={onFilter} />)
    fireEvent.click(screen.getByText('Unread'))
    expect(onFilter).toHaveBeenCalledWith('unread')
  })
})
